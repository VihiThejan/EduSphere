import { z } from 'zod';

export const sellerOnboardingSchema = z.object({
  shopName: z.string()
    .min(3, 'Shop name must be at least 3 characters')
    .max(100, 'Shop name must be at most 100 characters'),
  shopDescription: z.string()
    .max(500, 'Shop description must be at most 500 characters')
    .optional(),
  agreeToTerms: z.boolean().refine((value) => value === true, {
    message: 'You must agree to marketplace vendor terms',
  }),
});

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
export type SellerOnboardingInput = z.infer<typeof sellerOnboardingSchema>;
