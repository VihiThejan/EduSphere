export const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type CourseStatus = (typeof COURSE_STATUS)[keyof typeof COURSE_STATUS];

export const ENROLLMENT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
} as const;

export type EnrollmentStatus = (typeof ENROLLMENT_STATUS)[keyof typeof ENROLLMENT_STATUS];

export const VIDEO_STATUS = {
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  READY: 'ready',
  FAILED: 'failed',
} as const;

export type VideoStatus = (typeof VIDEO_STATUS)[keyof typeof VIDEO_STATUS];

export const COURSE_CATEGORIES = [
  'programming',
  'mathematics',
  'physics',
  'chemistry',
  'biology',
  'engineering',
  'business',
  'design',
  'languages',
  'other',
] as const;

export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

export const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export type CourseLevel = (typeof COURSE_LEVELS)[number];
