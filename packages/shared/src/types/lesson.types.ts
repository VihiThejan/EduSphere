export interface LessonVideo {
  _id: string;
  originalName: string;
  cloudUrl?: string;
  duration?: number;
}

export interface LessonDocument {
  _id: string;
  originalName: string;
  mimetype: string;
  size: number;
}

export interface Lesson {
  _id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  duration: number; // in seconds
  videoId?: string;
  video?: LessonVideo; // Populated video data
  documentIds?: string[];
  documents?: LessonDocument[]; // Populated document data
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
  documentIds?: string[];
  content?: string;
  isFree?: boolean;
}

export interface LessonUpdateInput {
  title?: string;
  description?: string;
  order?: number;
  videoId?: string;
  documentIds?: string[];
  content?: string;
  isFree?: boolean;
}
