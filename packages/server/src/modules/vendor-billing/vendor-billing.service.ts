import Stripe from 'stripe';
import {
  VENDOR_PLAN_INTERVAL,
  VENDOR_PLAN_QUOTAS,
  VENDOR_PLAN_TIERS,
  VENDOR_SUBSCRIPTION_STATUS,
  VendorPlanTier,
  VendorSubscriptionStatus,
} from '@edusphere/shared';
import { config } from '../../config/index.js';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '../../shared/utils/errors.js';
import { logger } from '../../shared/utils/logger.js';
import { UserModel } from '../users/user.model.js';
import { MarketplaceItem } from '../marketplace/marketplace.model.js';
import { VendorPlan } from './vendor-plan.model.js';
import { VendorSubscription } from './vendor-subscription.model.js';
import { VendorWebhookEvent } from './vendor-webhook-event.model.js';

export interface VendorCheckoutResult {
  checkoutSessionId: string;
  checkoutUrl: string;
}

export interface SellerSubscriptionStatusResult {
  tier: VendorPlanTier;
  status: VendorSubscriptionStatus;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  usedListings: number;
  listingQuota: number;
  remainingListings: number;
}


export class VendorBillingService {
  private stripe: Stripe | null = null;

  private getStripeClient(): Stripe {
    if (!config.stripe.secretKey) {
      throw new ValidationError('STRIPE_SECRET_KEY is not configured');
    }

    if (!this.stripe) {
      this.stripe = new Stripe(config.stripe.secretKey);
    }

    return this.stripe;
  }

  private getPlanConfig(tier: VendorPlanTier): { amountLkr: number; listingQuota: number; label: string } {
    const amounts = {
      [VENDOR_PLAN_TIERS.STARTER]: parseInt(process.env.VENDOR_PLAN_STARTER_LKR || '1500', 10),
      [VENDOR_PLAN_TIERS.PRO]:     parseInt(process.env.VENDOR_PLAN_PRO_LKR     || '4500', 10),
      [VENDOR_PLAN_TIERS.ELITE]:   parseInt(process.env.VENDOR_PLAN_ELITE_LKR   || '9000', 10),
    };
    const labels = {
      [VENDOR_PLAN_TIERS.STARTER]: 'Starter Plan (5 listings / 30 days)',
      [VENDOR_PLAN_TIERS.PRO]:     'Pro Plan (20 listings / 30 days)',
      [VENDOR_PLAN_TIERS.ELITE]:   'Elite Plan (100 listings / 30 days)',
    };
    return {
      amountLkr: amounts[tier],
      listingQuota: VENDOR_PLAN_QUOTAS[tier],
      label: labels[tier],
    };
  }

  private async ensurePlanDocument(tier: VendorPlanTier) {
    const planConfig = this.getPlanConfig(tier);
    return VendorPlan.findOneAndUpdate(
      { tier },
      { tier, interval: VENDOR_PLAN_INTERVAL.MONTHLY, amountLkr: planConfig.amountLkr, listingQuota: planConfig.listingQuota, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  async createSubscriptionCheckout(
    sellerId: string,
    tier: VendorPlanTier,
    returnUrl?: string,
    cancelUrl?: string
  ): Promise<VendorCheckoutResult> {
    const seller = await UserModel.findById(sellerId);
    if (!seller) {
      throw new NotFoundError('Seller');
    }

    const canSell = seller.roles.includes('seller') || seller.roles.includes('tutor') || seller.roles.includes('admin');
    if (!canSell) {
      throw new AuthorizationError('Only sellers can start vendor subscription checkout');
    }

    const plan = await this.ensurePlanDocument(tier);
    const planConfig = this.getPlanConfig(tier);

    const existingSub = await VendorSubscription.findOne({ sellerId });
    if (
      existingSub &&
      existingSub.status === VENDOR_SUBSCRIPTION_STATUS.ACTIVE &&
      existingSub.currentPeriodEnd &&
      existingSub.currentPeriodEnd > new Date()
    ) {
      throw new ValidationError('Seller already has an active subscription');
    }

    const stripe = this.getStripeClient();

    // Use one-time payment with inline price_data — no pre-created Stripe Price IDs required.
    // On checkout.session.completed we activate the subscription for 30 days.
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'lkr',
            product_data: {
              name: `EduSphere Vendor — ${planConfig.label}`,
              description: `Grants ${planConfig.listingQuota} active marketplace listings for 30 days.`,
            },
            // LKR is a standard 2-decimal currency in Stripe → multiply by 100
            unit_amount: plan.amountLkr * 100,
          },
          quantity: 1,
        },
      ],
      success_url: returnUrl || `${config.cors.origin}/seller/billing?checkout=success`,
      cancel_url: cancelUrl || `${config.cors.origin}/seller/billing?checkout=cancelled`,
      metadata: {
        sellerId,
        tier,
      },
    });

    if (!session.url) {
      throw new ValidationError('Unable to create Stripe checkout URL');
    }

    await VendorSubscription.findOneAndUpdate(
      { sellerId },
      {
        sellerId,
        tier,
        interval: VENDOR_PLAN_INTERVAL.MONTHLY,
        status: VENDOR_SUBSCRIPTION_STATUS.INACTIVE,
        stripeCheckoutSessionId: session.id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return {
      checkoutSessionId: session.id,
      checkoutUrl: session.url,
    };
  }

  async getSellerSubscriptionStatus(sellerId: string): Promise<SellerSubscriptionStatusResult> {
    const sub = await VendorSubscription.findOne({ sellerId });

    const tier = sub?.tier || VENDOR_PLAN_TIERS.STARTER;
    const listingQuota = VENDOR_PLAN_QUOTAS[tier];
    const usedListings = await MarketplaceItem.countDocuments({
      sellerId,
      status: 'active',
      publishStatus: 'published',
    });

    const remainingListings = Math.max(listingQuota - usedListings, 0);

    return {
      tier,
      status: sub?.status || VENDOR_SUBSCRIPTION_STATUS.INACTIVE,
      currentPeriodEnd: sub?.currentPeriodEnd,
      cancelAtPeriodEnd: Boolean(sub?.cancelAtPeriodEnd),
      usedListings,
      listingQuota,
      remainingListings,
    };
  }

  async hasActiveSubscription(sellerId: string): Promise<boolean> {
    const sub = await VendorSubscription.findOne({ sellerId });
    if (!sub) return false;

    if (sub.status !== VENDOR_SUBSCRIPTION_STATUS.ACTIVE) {
      return false;
    }

    if (sub.currentPeriodEnd && sub.currentPeriodEnd < new Date()) {
      sub.status = VENDOR_SUBSCRIPTION_STATUS.INACTIVE;
      await sub.save();
      return false;
    }

    return true;
  }

  async canPublishAnotherListing(sellerId: string): Promise<{ allowed: boolean; reason?: string }> {
    const status = await this.getSellerSubscriptionStatus(sellerId);

    if (status.status !== VENDOR_SUBSCRIPTION_STATUS.ACTIVE) {
      return {
        allowed: false,
        reason: 'Active vendor subscription is required to publish listings',
      };
    }

    if (status.remainingListings <= 0) {
      return {
        allowed: false,
        reason: 'Listing quota reached for current subscription tier',
      };
    }

    return { allowed: true };
  }

  async verifyCheckoutSession(sessionId: string, sellerId: string): Promise<void> {
    const stripe = this.getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.sellerId !== sellerId) {
      throw new AuthorizationError('Checkout session does not belong to this seller');
    }

    if (session.payment_status !== 'paid') {
      throw new ValidationError('Payment has not been completed for this session');
    }

    // Idempotent — if subscription already active from webhook, this is a no-op
    const existingSub = await VendorSubscription.findOne({ sellerId });
    if (
      existingSub?.status === VENDOR_SUBSCRIPTION_STATUS.ACTIVE &&
      existingSub.currentPeriodEnd &&
      existingSub.currentPeriodEnd > new Date()
    ) {
      return;
    }

    await this.onCheckoutCompleted(session);
  }

  async refundVendorPayment(paymentIntentId: string, reason: string): Promise<{ refundId: string }> {
    const stripe = this.getStripeClient();
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
      metadata: {
        reason,
      },
    });

    await VendorSubscription.findOneAndUpdate(
      { latestPaymentIntentId: paymentIntentId },
      { status: VENDOR_SUBSCRIPTION_STATUS.CANCELED },
      { new: false }
    );

    return { refundId: refund.id };
  }

  async handleWebhook(payload: Buffer | string, signature?: string): Promise<void> {
    const event = this.constructWebhookEvent(payload, signature);

    const alreadyProcessed = await VendorWebhookEvent.findOne({ eventId: event.id });
    if (alreadyProcessed) {
      return;
    }

    await VendorWebhookEvent.create({
      eventId: event.id,
      eventType: event.type,
      processedAt: new Date(),
    });

    switch (event.type) {
      case 'checkout.session.completed':
        await this.onCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      default:
        logger.info('Unhandled vendor billing webhook event type', { type: event.type });
    }
  }

  private constructWebhookEvent(payload: Buffer | string, signature?: string): Stripe.Event {
    const stripe = this.getStripeClient();
    const webhookSecret = config.stripe.webhookSecret;

    if (webhookSecret && signature) {
      return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    }

    const parsed = typeof payload === 'string'
      ? JSON.parse(payload)
      : JSON.parse(payload.toString('utf-8'));

    return parsed as Stripe.Event;
  }


  private async onCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const sellerId = session.metadata?.sellerId;
    const tier = session.metadata?.tier as VendorPlanTier | undefined;

    if (!sellerId || !tier) {
      logger.warn('Invalid vendor checkout session metadata', { sessionId: session.id });
      return;
    }

    const now = new Date();
    // 30-day access window (one-time payment demo mode)
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await VendorSubscription.findOneAndUpdate(
      { sellerId },
      {
        sellerId,
        tier,
        interval: VENDOR_PLAN_INTERVAL.MONTHLY,
        status: VENDOR_SUBSCRIPTION_STATUS.ACTIVE,
        stripeCustomerId: typeof session.customer === 'string' ? session.customer : undefined,
        stripeCheckoutSessionId: session.id,
        startedAt: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Also activate the user's marketplace seller role
    await UserModel.findByIdAndUpdate(sellerId, {
      isMarketplaceSeller: true,
      marketplaceStatus: 'active',
    });
  }

}

export const vendorBillingService = new VendorBillingService();
