import { z } from 'zod';

export const lessonCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(1000).optional(),
  order: z.number().int().min(1, 'Order must be at least 1'),
  videoId: z.string().optional(),
  content: z.string().max(10000).optional(),
  isFree: z.boolean().default(false),
});

export const lessonUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(1000).optional(),
  order: z.number().int().min(1).optional(),
  videoId: z.string().optional(),
  content: z.string().max(10000).optional(),
  isFree: z.boolean().optional(),
});

export type LessonCreateInput = z.infer<typeof lessonCreateSchema>;
export type LessonUpdateInput = z.infer<typeof lessonUpdateSchema>;
