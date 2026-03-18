import mongoose, { Schema, Document } from 'mongoose';

export interface IVendorWebhookEventDocument extends Document {
  eventId: string;
  eventType: string;
  processedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const vendorWebhookEventSchema = new Schema<IVendorWebhookEventDocument>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      trim: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const VendorWebhookEvent = mongoose.model<IVendorWebhookEventDocument>(
  'VendorWebhookEvent',
  vendorWebhookEventSchema
);
