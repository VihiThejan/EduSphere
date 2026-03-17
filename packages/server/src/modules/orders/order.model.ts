import mongoose, { Schema, Document } from 'mongoose';
import {
  ORDER_PAYMENT_STATUS,
  ORDER_FULFILLMENT_STATUS,
  PAYMENT_METHODS,
  OrderPaymentStatus,
  OrderFulfillmentStatus,
  PaymentMethod,
} from '@edusphere/shared';

export interface IOrderItemDoc {
  itemId: mongoose.Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IShippingAddressDoc {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  city: string;
  postal?: string;
  phone?: string;
}

export interface IOrderDocument extends Document {
  orderNumber: string;
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  items: IOrderItemDoc[];
  subtotal: number;
  serviceFee: number;
  total: number;
  paymentStatus: OrderPaymentStatus;
  paymentMethod: PaymentMethod;
  stripePaymentIntentId?: string;
  fulfillmentStatus: OrderFulfillmentStatus;
  shippingAddress: IShippingAddressDoc;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  deliveredAt?: Date;
}

const orderItemSchema = new Schema<IOrderItemDoc>(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: 'MarketplaceItem',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddressDoc>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    street: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    postal: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItemDoc[]) => items.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    serviceFee: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(ORDER_PAYMENT_STATUS),
      default: ORDER_PAYMENT_STATUS.PENDING,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
      trim: true,
      sparse: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: Object.values(ORDER_FULFILLMENT_STATUS),
      default: ORDER_FULFILLMENT_STATUS.PENDING_PAYMENT,
      index: true,
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    paidAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
orderSchema.index({ buyerId: 1, paymentStatus: 1 });
orderSchema.index({ sellerId: 1, fulfillmentStatus: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrderDocument>('Order', orderSchema);
