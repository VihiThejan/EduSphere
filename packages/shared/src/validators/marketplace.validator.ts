import { z } from 'zod';
import {
  MARKETPLACE_CATEGORIES,
  ITEM_CONDITION,
  MARKETPLACE_ITEM_STATUS,
  MARKETPLACE_LISTING_PUBLISH_STATUS,
  CAMPUS_LOCATIONS,
  VENDOR_PLAN_TIERS,
} from '../constants/marketplace';

export const marketplaceImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  order: z.number().min(0),
});

export const marketplaceItemCreateSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  category: z.enum(MARKETPLACE_CATEGORIES as any, {
    errorMap: () => ({ message: 'Invalid category' })
  }),
  price: z.number()
    .min(0, 'Price cannot be negative')
    .step(0.01, 'Price must have at most 2 decimal places'),
  originalPrice: z.number()
    .min(0, 'Original price cannot be negative')
    .step(0.01)
    .optional(),
  quantity: z.number()
    .min(1, 'Quantity must be at least 1')
    .int('Quantity must be a whole number')
    .optional()
    .default(1),
  condition: z.enum(Object.values(ITEM_CONDITION) as any, {
    errorMap: () => ({ message: 'Invalid condition' })
  }),
  campus: z.enum(CAMPUS_LOCATIONS as any, {
    errorMap: () => ({ message: 'Invalid campus' })
  }),
  images: z.array(marketplaceImageSchema)
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),
  tags: z.array(z.string().max(50)).max(10).optional(),
  isNegotiable: z.boolean().optional().default(false),
});

export const marketplaceItemUpdateSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  category: z.enum(MARKETPLACE_CATEGORIES as any).optional(),
  price: z.number().min(0).step(0.01).optional(),
  originalPrice: z.number().min(0).step(0.01).optional(),
  quantity: z.number().min(1).int().optional(),
  condition: z.enum(Object.values(ITEM_CONDITION) as any).optional(),
  campus: z.enum(CAMPUS_LOCATIONS as any).optional(),
  images: z.array(marketplaceImageSchema).min(1).max(10).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  isNegotiable: z.boolean().optional(),
  status: z.enum(Object.values(MARKETPLACE_ITEM_STATUS) as any).optional(),
  publishStatus: z.enum(Object.values(MARKETPLACE_LISTING_PUBLISH_STATUS) as any).optional(),
});

export const vendorSubscriptionCheckoutSchema = z.object({
  tier: z.enum(Object.values(VENDOR_PLAN_TIERS) as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid vendor plan tier' }),
  }),
  returnUrl: z.string().url('Invalid returnUrl').optional(),
  cancelUrl: z.string().url('Invalid cancelUrl').optional(),
});

export const vendorRefundSchema = z.object({
  paymentIntentId: z.string().min(1, 'paymentIntentId is required'),
  reason: z.string().min(3, 'Refund reason is required').max(200),
});

export const marketplaceFilterSchema = z.object({
  category: z.enum(MARKETPLACE_CATEGORIES as any).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  condition: z.enum(Object.values(ITEM_CONDITION) as any).optional(),
  campus: z.enum(CAMPUS_LOCATIONS as any).optional(),
  search: z.string().max(200).optional(),
  status: z.enum(Object.values(MARKETPLACE_ITEM_STATUS) as any).optional(),
  sellerId: z.string().optional(),
  page: z.number().min(1).int().optional(),
  limit: z.number().min(1).max(100).int().optional(),
});

export type MarketplaceItemCreateInput = z.infer<typeof marketplaceItemCreateSchema>;
export type MarketplaceItemUpdateInput = z.infer<typeof marketplaceItemUpdateSchema>;
export type MarketplaceFilterInput = z.infer<typeof marketplaceFilterSchema>;
export type VendorSubscriptionCheckoutInput = z.infer<typeof vendorSubscriptionCheckoutSchema>;
export type VendorRefundInput = z.infer<typeof vendorRefundSchema>;
