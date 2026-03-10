import { z } from 'zod';
import { COURSE_STATUS, COURSE_CATEGORIES, COURSE_LEVELS } from '../constants/status';

export const coursePricingSchema = z.object({
  amount: z.number().min(0, 'Price cannot be negative'),
  currency: z.string().default('LKR'),
  discountPrice: z.number().min(0).optional(),
});

export const courseCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  category: z.enum(COURSE_CATEGORIES as any),
  level: z.enum(COURSE_LEVELS as any),
  pricing: coursePricingSchema,
  thumbnail: z.string().url().optional(),
  tags: z.array(z.string()).max(10).optional(),
});

export const courseUpdateSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).max(5000).optional(),
  category: z.enum(COURSE_CATEGORIES as any).optional(),
  level: z.enum(COURSE_LEVELS as any).optional(),
  pricing: coursePricingSchema.optional(),
  thumbnail: z.string().url().optional(),
  tags: z.array(z.string()).max(10).optional(),
  status: z.enum([COURSE_STATUS.DRAFT, COURSE_STATUS.PUBLISHED, COURSE_STATUS.ARCHIVED] as any).optional(),
});

export const courseFilterSchema = z.object({
  category: z.enum(COURSE_CATEGORIES as any).optional(),
  level: z.enum(COURSE_LEVELS as any).optional(),
  search: z.string().optional(),
  instructorId: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});
