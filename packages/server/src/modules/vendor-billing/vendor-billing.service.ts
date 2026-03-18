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

type StripeSubscriptionWithPeriodEnd = Stripe.Subscription & {
  current_period_end?: number;
};

type StripeInvoiceWithSubscription = Stripe.Invoice & {
  subscription?: string | { id: string };
  payment_intent?: string;
  period_end?: number;
};

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

  private getPlanConfig(tier: VendorPlanTier): { amountLkr: number; listingQuota: number; stripePriceId: string } {
    const planEnv = {
      [VENDOR_PLAN_TIERS.STARTER]: {
        amountLkr: parseInt(process.env.VENDOR_PLAN_STARTER_LKR || '1500', 10),
        stripePriceId: process.env.STRIPE_VENDOR_STARTER_PRICE_ID || '',
      },
      [VENDOR_PLAN_TIERS.PRO]: {
        amountLkr: parseInt(process.env.VENDOR_PLAN_PRO_LKR || '4500', 10),
        stripePriceId: process.env.STRIPE_VENDOR_PRO_PRICE_ID || '',
      },
      [VENDOR_PLAN_TIERS.ELITE]: {
        amountLkr: parseInt(process.env.VENDOR_PLAN_ELITE_LKR || '9000', 10),
        stripePriceId: process.env.STRIPE_VENDOR_ELITE_PRICE_ID || '',
      },
    };

    const selected = planEnv[tier];
    if (!selected.stripePriceId) {
      throw new ValidationError(`Stripe price id is missing for vendor tier: ${tier}`);
    }

    return {
      amountLkr: selected.amountLkr,
      listingQuota: VENDOR_PLAN_QUOTAS[tier],
      stripePriceId: selected.stripePriceId,
    };
  }

  private async ensurePlanDocument(tier: VendorPlanTier) {
    const existing = await VendorPlan.findOne({ tier, interval: VENDOR_PLAN_INTERVAL.MONTHLY });
    const planConfig = this.getPlanConfig(tier);

    if (existing) {
      existing.amountLkr = planConfig.amountLkr;
      existing.listingQuota = planConfig.listingQuota;
      existing.stripePriceId = planConfig.stripePriceId;
      existing.isActive = true;
      await existing.save();
      return existing;
    }

    return VendorPlan.create({
      tier,
      interval: VENDOR_PLAN_INTERVAL.MONTHLY,
      amountLkr: planConfig.amountLkr,
      listingQuota: planConfig.listingQuota,
      stripePriceId: planConfig.stripePriceId,
      isActive: true,
    });
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
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: returnUrl || `${config.cors.origin}/seller/billing?checkout=success`,
      cancel_url: cancelUrl || `${config.cors.origin}/seller/billing?checkout=cancelled`,
      allow_promotion_codes: true,
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
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.onSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_failed':
        await this.onInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_succeeded':
        await this.onInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
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

  private mapStripeSubscriptionStatus(status: Stripe.Subscription.Status): VendorSubscriptionStatus {
    if (status === 'active' || status === 'trialing') {
      return VENDOR_SUBSCRIPTION_STATUS.ACTIVE;
    }

    if (status === 'past_due') {
      return VENDOR_SUBSCRIPTION_STATUS.PAST_DUE;
    }

    if (status === 'unpaid') {
      return VENDOR_SUBSCRIPTION_STATUS.UNPAID;
    }

    if (status === 'canceled' || status === 'incomplete_expired') {
      return VENDOR_SUBSCRIPTION_STATUS.CANCELED;
    }

    return VENDOR_SUBSCRIPTION_STATUS.INACTIVE;
  }

  private async onCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    if (session.mode !== 'subscription') {
      return;
    }

    const sellerId = session.metadata?.sellerId;
    const tier = session.metadata?.tier as VendorPlanTier | undefined;

    if (!sellerId || !tier || !session.subscription) {
      logger.warn('Invalid vendor checkout session metadata', { sessionId: session.id });
      return;
    }

    const stripeSubscriptionId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription.id;

    await VendorSubscription.findOneAndUpdate(
      { sellerId },
      {
        sellerId,
        tier,
        interval: VENDOR_PLAN_INTERVAL.MONTHLY,
        status: VENDOR_SUBSCRIPTION_STATUS.ACTIVE,
        stripeCustomerId:
          typeof session.customer === 'string' ? session.customer : undefined,
        stripeSubscriptionId,
        stripeCheckoutSessionId: session.id,
        startedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  private async onSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const mappedStatus = this.mapStripeSubscriptionStatus(subscription.status);
    const currentPeriodEndUnix = (subscription as StripeSubscriptionWithPeriodEnd).current_period_end;

    await VendorSubscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status: mappedStatus,
        currentPeriodEnd: currentPeriodEndUnix ? new Date(currentPeriodEndUnix * 1000) : undefined,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      { new: true }
    );
  }

  private async onInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionRef = (invoice as StripeInvoiceWithSubscription).subscription;
    if (!subscriptionRef) {
      return;
    }

    const stripeSubscriptionId =
      typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef.id;

    await VendorSubscription.findOneAndUpdate(
      { stripeSubscriptionId },
      {
        status: VENDOR_SUBSCRIPTION_STATUS.PAST_DUE,
      },
      { new: false }
    );
  }

  private async onInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionRef = (invoice as StripeInvoiceWithSubscription).subscription;
    if (!subscriptionRef) {
      return;
    }

    const stripeSubscriptionId =
      typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef.id;

    const paymentIntentRef = (invoice as StripeInvoiceWithSubscription).payment_intent;
    const paymentIntentId = typeof paymentIntentRef === 'string' ? paymentIntentRef : undefined;
    const periodEndUnix = (invoice as StripeInvoiceWithSubscription).period_end;

    await VendorSubscription.findOneAndUpdate(
      { stripeSubscriptionId },
      {
        status: VENDOR_SUBSCRIPTION_STATUS.ACTIVE,
        currentPeriodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : undefined,
        latestPaymentIntentId: paymentIntentId,
      },
      { new: false }
    );
  }
}

export const vendorBillingService = new VendorBillingService();
