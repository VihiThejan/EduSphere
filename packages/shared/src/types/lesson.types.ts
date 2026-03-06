export interface Lesson {
  _id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  duration: number; // in seconds
  videoId?: string;
  content?: string; // Text content or notes
  isFree: boolean; // Allow preview lessons
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonCreateInput {
  title: string;
  description?: string;
  order: number;
  videoId?: string;
  content?: string;
  isFree?: boolean;
}

export interface LessonUpdateInput {
  title?: string;
  description?: string;
  order?: number;
  videoId?: string;
  content?: string;
  isFree?: boolean;
}
