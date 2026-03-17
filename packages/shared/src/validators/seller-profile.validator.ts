import { z } from 'zod';

export const sellerProfileUpdateSchema = z.object({
  shopName: z.string()
    .min(3, 'Shop name must be at least 3 characters')
    .max(100, 'Shop name must be at most 100 characters'),
  shopDescription: z.string()
    .max(500, 'Shop description must be at most 500 characters')
    .optional(),
  shopAvatar: z.string().url('Invalid image URL').optional(),
  shopBanner: z.string().url('Invalid image URL').optional(),
  responseTime: z.string().optional(),
});

export type SellerProfileUpdateInput = z.infer<typeof sellerProfileUpdateSchema>;
