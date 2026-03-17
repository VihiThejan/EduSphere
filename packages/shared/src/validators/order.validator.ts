import { z } from 'zod';
import { PAYMENT_METHODS, ORDER_FULFILLMENT_STATUS } from '../constants/order';

export const shippingAddressSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be at most 50 characters'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be at most 50 characters'),
  email: z.string()
    .email('Invalid email address'),
  street: z.string()
    .min(5, 'Street address must be at least 5 characters')
    .max(200, 'Street address must be at most 200 characters'),
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be at most 50 characters'),
  postal: z.string().optional(),
  phone: z.string().optional(),
});

export const cartItemSchema = z.object({
  itemId: z.string(),
  quantity: z.number().min(1).int(),
});

export const orderCreateSchema = z.object({
  items: z.array(cartItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number().min(0),
  total: z.number().min(0),
  paymentMethod: z.enum(Object.values(PAYMENT_METHODS) as any, {
    errorMap: () => ({ message: 'Invalid payment method' })
  }),
  shippingAddress: shippingAddressSchema,
});

export const orderFulfillmentUpdateSchema = z.object({
  fulfillmentStatus: z.enum(Object.values(ORDER_FULFILLMENT_STATUS) as any, {
    errorMap: () => ({ message: 'Invalid fulfillment status' })
  }),
});

export const cartAddItemSchema = z.object({
  itemId: z.string(),
  quantity: z.number().min(1).int().optional().default(1),
});

export const cartUpdateItemSchema = z.object({
  quantity: z.number().min(1).int(),
});

export const reviewSchema = z.object({
  itemId: z.string(),
  rating: z.number().min(1).max(5).int(),
  comment: z.string().max(500).optional(),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type OrderFulfillmentUpdateInput = z.infer<typeof orderFulfillmentUpdateSchema>;
export type CartAddItemInput = z.infer<typeof cartAddItemSchema>;
export type CartUpdateItemInput = z.infer<typeof cartUpdateItemSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
