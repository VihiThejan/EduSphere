import mongoose, { Schema, Document } from 'mongoose';
import {
  MARKETPLACE_CATEGORIES,
  ITEM_CONDITION,
  MARKETPLACE_ITEM_STATUS,
  CAMPUS_LOCATIONS,
  MarketplaceCategory,
  ItemCondition,
  MarketplaceItemStatus,
  CampusLocation,
} from '@edusphere/shared';

export interface IMarketplaceImage {
  url: string;
  order: number;
}

export interface IMarketplaceSellerInfo {
  id: mongoose.Types.ObjectId;
  name: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
}

export interface IMarketplaceStats {
  views: number;
  favorites: number;
  inquiries: number;
}

export interface IMarketplaceItemDocument extends Document {
  title: string;
  description: string;
  sellerId: mongoose.Types.ObjectId;
  category: MarketplaceCategory;
  price: number;
  originalPrice?: number;
  quantity: number;
  condition: ItemCondition;
  campus: CampusLocation;
  images: IMarketplaceImage[];
  tags: string[];
  status: MarketplaceItemStatus;
  isNegotiable: boolean;
  seller: IMarketplaceSellerInfo;
  stats: IMarketplaceStats;
  createdAt: Date;
  updatedAt: Date;
}

const imageSchema = new Schema<IMarketplaceImage>(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const sellerInfoSchema = new Schema<IMarketplaceSellerInfo>(
  {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
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
  },
  { _id: false }
);

const statsSchema = new Schema<IMarketplaceStats>(
  {
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    favorites: {
      type: Number,
      default: 0,
      min: 0,
    },
    inquiries: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const marketplaceItemSchema = new Schema<IMarketplaceItemDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: MARKETPLACE_CATEGORIES,
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },
    condition: {
      type: String,
      enum: Object.values(ITEM_CONDITION),
      required: true,
    },
    campus: {
      type: String,
      enum: CAMPUS_LOCATIONS,
      required: true,
      index: true,
    },
    images: {
      type: [imageSchema],
      required: true,
      validate: {
        validator: (images: IMarketplaceImage[]) => images.length > 0,
        message: 'At least one image is required',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(MARKETPLACE_ITEM_STATUS),
      default: MARKETPLACE_ITEM_STATUS.ACTIVE,
      index: true,
    },
    isNegotiable: {
      type: Boolean,
      default: false,
    },
    seller: {
      type: sellerInfoSchema,
      required: true,
    },
    stats: {
      type: statsSchema,
      default: () => ({ views: 0, favorites: 0, inquiries: 0 }),
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for full-text search
marketplaceItemSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Compound index for filtering
marketplaceItemSchema.index({ category: 1, price: 1, campus: 1 });
marketplaceItemSchema.index({ sellerId: 1, status: 1 });

export const MarketplaceItem = mongoose.model<IMarketplaceItemDocument>(
  'MarketplaceItem',
  marketplaceItemSchema
);
