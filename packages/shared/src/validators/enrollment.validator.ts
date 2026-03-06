import { z } from 'zod';

export const enrollmentCreateSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
});

export const lessonCompletionSchema = z.object({
  lessonId: z.string().min(1, 'Lesson ID is required'),
  watchTime: z.number().min(0).optional(),
});

export type EnrollmentCreateInput = z.infer<typeof enrollmentCreateSchema>;
export type LessonCompletionInput = z.infer<typeof lessonCompletionSchema>;
