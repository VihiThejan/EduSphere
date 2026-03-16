import { Course, CourseCreateInput, CourseUpdateInput, Lesson, LessonCreateInput } from '@edusphere/shared';
import { apiClient } from './client';

export interface UploadedVideo {
  videoId: string;
  filename: string;
  originalName: string;
  size: number;
  status: string;
}

export interface UploadedDocument {
  documentId: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const tutorApi = {
  /** Fetch all courses belonging to the authenticated tutor */
  getTutorCourses: async (): Promise<Course[]> => {
    const response = await apiClient.get<{ courses: Course[] }>('/courses/my/courses');
    return response.courses ?? [];
  },

  /** Create a new draft course */
  createCourse: async (input: CourseCreateInput): Promise<Course> => {
    const response = await apiClient.post<{ course: Course }>('/courses', input);
    return response.course;
  },

  /** Update an existing course (pricing, status, description, etc.) */
  updateCourse: async (courseId: string, input: CourseUpdateInput): Promise<Course> => {
    const response = await apiClient.put<{ course: Course }>(`/courses/${courseId}`, input);
    return response.course;
  },

  /** Add a lesson to a course */
  addLesson: async (courseId: string, input: LessonCreateInput): Promise<Lesson> => {
    const response = await apiClient.post<{ lesson: Lesson }>(
      `/courses/${courseId}/lessons`,
      input
    );
    return response.lesson;
  },

  /**
   * Upload a single video file with progress tracking.
   * Uses the raw axios client so we can attach an onUploadProgress handler.
   */
  uploadVideo: async (
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedVideo> => {
    const formData = new FormData();
    formData.append('video', file);

    const rawClient = apiClient.getClient();
    const response = await rawClient.post<{ success: boolean; data: UploadedVideo }>(
      '/videos/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress({
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded * 100) / event.total),
            });
          }
        },
      }
    );

    return response.data.data;
  },

  /**
   * Upload multiple video files in a single request with combined progress tracking.
   */
  uploadVideosBulk: async (
    files: File[],
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedVideo[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('videos', file));

    const rawClient = apiClient.getClient();
    const response = await rawClient.post<{
      success: boolean;
      data: { videos: UploadedVideo[]; count: number };
    }>('/videos/upload/bulk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded * 100) / event.total),
          });
        }
      },
    });

    return response.data.data.videos;
  },

  /**
   * Upload a PDF/Word document with progress tracking.
   */
  uploadDocument: async (
    file: File,
    courseId?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedDocument> => {
    const formData = new FormData();
    formData.append('document', file);
    if (courseId) {
      formData.append('courseId', courseId);
    }

    const rawClient = apiClient.getClient();
    const response = await rawClient.post<{ success: boolean; data: UploadedDocument }>(
      '/documents/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress({
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded * 100) / event.total),
            });
          }
        },
      }
    );

    return response.data.data;
  },

  /** Delete a video by ID */
  deleteVideo: async (videoId: string): Promise<void> => {
    await apiClient.delete(`/videos/${videoId}`);
  },

  /** Delete a document by ID */
  deleteDocument: async (documentId: string): Promise<void> => {
    await apiClient.delete(`/documents/${documentId}`);
  },
};
