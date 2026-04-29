import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewDocument extends Document {
  itemId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: 'MarketplaceItem',
      required: true,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index to ensure one review per item per buyer
reviewSchema.index(
  { itemId: 1, buyerId: 1 },
  { unique: true, sparse: true }
);

// Index for finding seller reviews
reviewSchema.index({ sellerId: 1, createdAt: -1 });

export const Review = mongoose.model<IReviewDocument>('Review', reviewSchema);
