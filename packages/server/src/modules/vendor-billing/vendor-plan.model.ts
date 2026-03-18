import mongoose, { Schema, Document } from 'mongoose';
import {
  VENDOR_PLAN_INTERVAL,
  VENDOR_PLAN_TIERS,
  VendorPlanInterval,
  VendorPlanTier,
} from '@edusphere/shared';

export interface IVendorPlanDocument extends Document {
  tier: VendorPlanTier;
  interval: VendorPlanInterval;
  amountLkr: number;
  listingQuota: number;
  stripePriceId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vendorPlanSchema = new Schema<IVendorPlanDocument>(
  {
    tier: {
      type: String,
      enum: Object.values(VENDOR_PLAN_TIERS),
      required: true,
      unique: true,
      index: true,
    },
    interval: {
      type: String,
      enum: Object.values(VENDOR_PLAN_INTERVAL),
      required: true,
      default: VENDOR_PLAN_INTERVAL.MONTHLY,
    },
    amountLkr: {
      type: Number,
      required: true,
      min: 0,
    },
    listingQuota: {
      type: Number,
      required: true,
      min: 1,
    },
    stripePriceId: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const VendorPlan = mongoose.model<IVendorPlanDocument>('VendorPlan', vendorPlanSchema);
