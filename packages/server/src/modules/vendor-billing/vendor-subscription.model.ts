import mongoose, { Schema, Document } from 'mongoose';
import {
  VENDOR_PLAN_INTERVAL,
  VENDOR_PLAN_TIERS,
  VENDOR_SUBSCRIPTION_STATUS,
  VendorPlanInterval,
  VendorPlanTier,
  VendorSubscriptionStatus,
} from '@edusphere/shared';

export interface IVendorSubscriptionDocument extends Document {
  sellerId: mongoose.Types.ObjectId;
  tier: VendorPlanTier;
  interval: VendorPlanInterval;
  status: VendorSubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeCheckoutSessionId?: string;
  latestPaymentIntentId?: string;
  startedAt?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vendorSubscriptionSchema = new Schema<IVendorSubscriptionDocument>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    tier: {
      type: String,
      enum: Object.values(VENDOR_PLAN_TIERS),
      required: true,
    },
    interval: {
      type: String,
      enum: Object.values(VENDOR_PLAN_INTERVAL),
      required: true,
      default: VENDOR_PLAN_INTERVAL.MONTHLY,
    },
    status: {
      type: String,
      enum: Object.values(VENDOR_SUBSCRIPTION_STATUS),
      required: true,
      default: VENDOR_SUBSCRIPTION_STATUS.INACTIVE,
      index: true,
    },
    stripeCustomerId: {
      type: String,
      trim: true,
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },
    stripeCheckoutSessionId: {
      type: String,
      trim: true,
      index: true,
    },
    latestPaymentIntentId: {
      type: String,
      trim: true,
      index: true,
    },
    startedAt: {
      type: Date,
    },
    currentPeriodEnd: {
      type: Date,
      index: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const VendorSubscription = mongoose.model<IVendorSubscriptionDocument>(
  'VendorSubscription',
  vendorSubscriptionSchema
);
