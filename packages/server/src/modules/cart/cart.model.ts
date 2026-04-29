import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItemDoc {
  itemId: mongoose.Types.ObjectId;
  quantity: number;
  addedAt: Date;
}

export interface ICartDocument extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItemDoc[];
  expiresAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItemDoc>(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: 'MarketplaceItem',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const cartSchema = new Schema<ICartDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  {
    timestamps: false,
  }
);

// TTL index to automatically delete carts after expiration
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Cart = mongoose.model<ICartDocument>('Cart', cartSchema);
