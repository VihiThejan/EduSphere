import { Course, CourseCreateInput, CourseUpdateInput, Lesson, LessonCreateInput } from '@edusphere/shared';
import { apiClient } from './client';

export interface LiveSession {
  _id: string;
  title: string;
  description?: string;
  courseId?: string;
  /** populated host object when fetched from getAllActiveSessions */
  hostId: string | {
    _id: string;
    profile: { firstName: string; lastName?: string; avatar?: string };
    email: string;
  };
  roomName: string;
  roomUrl: string;
  status: 'scheduled' | 'live' | 'ended';
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  maxParticipants: number;
  createdAt: string;
  updatedAt: string;
}

export interface LiveQuestion {
  _id: string;
  sessionId: string;
  askedBy: string;
  askerName: string;
  question: string;
  answered: boolean;
  answer?: string;
  upvotes: number;
  upvotedBy: string[];
  createdAt: string;
}

export interface UploadedVideo {
  videoId: string;
  filename: string;
  originalName: string;
  size: number;
  /** Cloudinary CDN URL – use this directly for playback */
  cloudUrl?: string;
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

  // ── Live Sessions (Daily.co) ─────────────────────────────────────────────

  /** Create a new Daily.co live session room */
  createLiveSession: async (input: {
    title: string;
    description?: string;
    courseId?: string;
    scheduledAt?: string;
    maxParticipants?: number;
  }) => {
    const response = await apiClient.post<{ session: LiveSession }>('/live-sessions', input);
    return response.session;
  },

  /** Get a Daily.co meeting token + room URL to join a session */
  joinLiveSession: async (sessionId: string, asHost = false) => {
    const response = await apiClient.get<{
      roomUrl: string;
      token: string;
      sessionId: string;
      title: string;
      status: string;
    }>(`/live-sessions/${sessionId}/join?host=${asHost}`);
    return response;
  },

  /** End a live session (host only) */
  endLiveSession: async (sessionId: string) => {
    const rawClient = apiClient.getClient();
    const response = await rawClient.patch<{ success: boolean; data: { session: LiveSession } }>(
      `/live-sessions/${sessionId}/end`
    );
    return response.data.data.session;
  },

  /** List sessions hosted by the authenticated tutor */
  getHostedSessions: async () => {
    const response = await apiClient.get<{ sessions: LiveSession[] }>('/live-sessions/my/hosted');
    return response.sessions ?? [];
  },

  /** List active sessions for a course */
  getCourseSessions: async (courseId: string) => {
    const response = await apiClient.get<{ sessions: LiveSession[] }>(
      `/live-sessions/course/${courseId}`
    );
    return response.sessions ?? [];
  },

  /** All active/scheduled sessions (for student browse) */
  getAllLiveSessions: async () => {
    const response = await apiClient.get<{ sessions: LiveSession[] }>('/live-sessions');
    return response.sessions ?? [];
  },

  // ── Q&A ────────────────────────────────────────────────────────────────

  getQuestions: async (sessionId: string): Promise<LiveQuestion[]> => {
    const response = await apiClient.get<{ questions: LiveQuestion[] }>(
      `/live-sessions/${sessionId}/questions`
    );
    return response.questions ?? [];
  },

  askQuestion: async (sessionId: string, question: string): Promise<LiveQuestion> => {
    const response = await apiClient.post<{ question: LiveQuestion }>(
      `/live-sessions/${sessionId}/questions`,
      { question }
    );
    return response.question;
  },

  answerQuestion: async (
    sessionId: string,
    questionId: string,
    answer: string
  ): Promise<LiveQuestion> => {
    const rawClient = apiClient.getClient();
    const response = await rawClient.patch<{ success: boolean; data: { question: LiveQuestion } }>(
      `/api/v1/live-sessions/${sessionId}/questions/${questionId}/answer`,
      { answer }
    );
    return response.data.data.question;
  },

  upvoteQuestion: async (sessionId: string, questionId: string): Promise<LiveQuestion> => {
    const response = await apiClient.post<{ question: LiveQuestion }>(
      `/live-sessions/${sessionId}/questions/${questionId}/upvote`,
      {}
    );
    return response.question;
  },
};
