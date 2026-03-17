import mongoose, { Schema, Document } from 'mongoose';
import { SELLER_VERIFICATION_STATUS, SellerVerificationStatus } from '@edusphere/shared';

export interface ISellerProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
  shopName: string;
  shopDescription?: string;
  shopAvatar?: string;
  shopBanner?: string;
  rating: number;
  reviewCount: number;
  totalSales: number;
  responseTime?: string;
  memberSince: Date;
  verificationStatus: SellerVerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const sellerProfileSchema = new Schema<ISellerProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    shopDescription: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    shopAvatar: {
      type: String,
      trim: true,
    },
    shopBanner: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
      min: 0,
    },
    responseTime: {
      type: String,
      trim: true,
    },
    memberSince: {
      type: Date,
      default: Date.now,
    },
    verificationStatus: {
      type: String,
      enum: Object.values(SELLER_VERIFICATION_STATUS),
      default: SELLER_VERIFICATION_STATUS.UNVERIFIED,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding verified sellers
sellerProfileSchema.index({ verificationStatus: 1, rating: -1 });

export const SellerProfile = mongoose.model<ISellerProfileDocument>(
  'SellerProfile',
  sellerProfileSchema
);
