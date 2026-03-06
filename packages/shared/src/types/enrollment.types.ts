import { EnrollmentStatus } from '../constants/status';

export interface Enrollment {
  _id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  completedAt?: Date;
  completedLessons: string[]; // Array of lesson IDs
  progressPercentage: number;
  lastAccessedAt: Date;
  certificateIssued: boolean;
}

export interface EnrollmentCreateInput {
  courseId: string;
}

export interface EnrollmentProgress {
  enrollment: Enrollment;
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
    totalLessons: number;
  };
  completedLessons: number;
  remainingLessons: number;
}

export interface LessonCompletionInput {
  lessonId: string;
  watchTime?: number; // in seconds
}
