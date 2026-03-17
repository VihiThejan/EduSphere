import Stripe from 'stripe';
import { Order } from '../orders/order.model.js';
import { orderService } from '../orders/order.service.js';
import { config } from '../../config/index.js';
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from '../../shared/utils/errors.js';
import {
  ORDER_PAYMENT_STATUS,
  ORDER_FULFILLMENT_STATUS,
} from '@edusphere/shared';
import { logger } from '../../shared/utils/logger.js';

export interface PaymentIntentResult {
  orderId: string;
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  publishableKey: string;
}

export class PaymentService {
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

  async createPaymentIntent(orderId: string, buyerId: string): Promise<PaymentIntentResult> {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order');
    }

    if (order.buyerId.toString() !== buyerId) {
      throw new AuthorizationError('You cannot pay for this order');
    }

    if (order.paymentStatus !== ORDER_PAYMENT_STATUS.PENDING) {
      throw new ValidationError('Order payment has already been processed');
    }

    const amount = Math.round(order.total * 100);
    if (amount <= 0) {
      throw new ValidationError('Invalid order total for payment');
    }

    let paymentIntent: Stripe.PaymentIntent;
    const stripe = this.getStripeClient();

    if (order.stripePaymentIntentId) {
      try {
        const existingIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);

        if (
          existingIntent.status === 'requires_payment_method' ||
          existingIntent.status === 'requires_confirmation' ||
          existingIntent.status === 'requires_action' ||
          existingIntent.status === 'processing'
        ) {
          paymentIntent = existingIntent;
        } else {
          paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            metadata: {
              orderId: order._id.toString(),
              buyerId,
              orderNumber: order.orderNumber,
            },
            automatic_payment_methods: {
              enabled: true,
            },
          });
        }
      } catch {
        paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency: 'usd',
          metadata: {
            orderId: order._id.toString(),
            buyerId,
            orderNumber: order.orderNumber,
          },
          automatic_payment_methods: {
            enabled: true,
          },
        });
      }
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: {
          orderId: order._id.toString(),
          buyerId,
          orderNumber: order.orderNumber,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
    }

    if (!paymentIntent.client_secret) {
      throw new ValidationError('Unable to create payment intent client secret');
    }

    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    return {
      orderId: order._id.toString(),
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      publishableKey: config.stripe.publishableKey,
    };
  }

  async getPaymentStatus(orderId: string, userId: string, isAdmin: boolean): Promise<{
    orderId: string;
    orderNumber: string;
    paymentStatus: string;
    fulfillmentStatus: string;
    stripePaymentIntentId?: string;
    stripeStatus?: string;
  }> {
    const order = await orderService.getOrderById(orderId, userId, isAdmin);

    let stripeStatus: string | undefined;
    const stripe = this.getStripeClient();
    if (order.stripePaymentIntentId) {
      try {
        const intent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
        stripeStatus = intent.status;
      } catch (error) {
        logger.warn('Unable to fetch Stripe payment intent status', {
          orderId,
          paymentIntentId: order.stripePaymentIntentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      stripePaymentIntentId: order.stripePaymentIntentId,
      stripeStatus,
    };
  }

  async handleWebhook(payload: Buffer | string, signature?: string): Promise<void> {
    const event = this.constructWebhookEvent(payload, signature);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.onPaymentSucceeded(paymentIntent.id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.onPaymentFailed(paymentIntent.id);
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent && typeof charge.payment_intent === 'string') {
          await this.onPaymentRefunded(charge.payment_intent);
        }
        break;
      }
      default:
        logger.info('Unhandled Stripe webhook event type', { type: event.type });
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

  private async onPaymentSucceeded(paymentIntentId: string): Promise<void> {
    const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!order) {
      logger.warn('Order not found for successful payment intent', { paymentIntentId });
      return;
    }

    if (order.paymentStatus === ORDER_PAYMENT_STATUS.COMPLETED) {
      return;
    }

    await orderService.confirmPayment(order._id.toString(), paymentIntentId);
  }

  private async onPaymentFailed(paymentIntentId: string): Promise<void> {
    const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!order) {
      logger.warn('Order not found for failed payment intent', { paymentIntentId });
      return;
    }

    order.paymentStatus = ORDER_PAYMENT_STATUS.FAILED;
    order.fulfillmentStatus = ORDER_FULFILLMENT_STATUS.PENDING_PAYMENT;
    await order.save();
  }

  private async onPaymentRefunded(paymentIntentId: string): Promise<void> {
    const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!order) {
      logger.warn('Order not found for refunded payment intent', { paymentIntentId });
      return;
    }

    order.paymentStatus = ORDER_PAYMENT_STATUS.REFUNDED;
    order.fulfillmentStatus = ORDER_FULFILLMENT_STATUS.CANCELLED;
    await order.save();
  }
}

export const paymentService = new PaymentService();
