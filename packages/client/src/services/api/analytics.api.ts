import { apiClient } from './client';

export interface CourseAnalyticsSummary {
  _id: string;
  title: string;
  status: string;
  category: string;
  level: string;
  pricing: { amount: number; currency: string; discountPrice?: number };
  thumbnail?: string;
  stats: {
    enrollmentCount: number;
    avgRating: number;
    reviewCount: number;
    totalLessons: number;
    totalDuration: number;
  };
  completionRate: number;
  revenueLKR: number;
}

export interface TutorAnalyticsOverview {
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  completionRate: number;
  avgRating: number;
  totalRevenueLKR: number;
}

export interface EnrollmentTimelinePoint {
  date: string;
  count: number;
}

export interface CourseDetailAnalytics {
  course: {
    _id: string;
    title: string;
    status: string;
    stats: Record<string, number>;
    pricing: { amount: number; currency: string };
  };
  analytics: {
    totalEnrollments: number;
    completedCount: number;
    completionRate: number;
    revenueLKR: number;
    enrollmentTimeline: EnrollmentTimelinePoint[];
    statusBreakdown: Record<string, number>;
    lessonWatchStats: Array<{ _id: string; avgWatchPercentage: number; viewCount: number }>;
  };
}

export interface CertificatePayload {
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  instructorName: string;
  category: string;
  level: string;
  completedAt: string;
  issuedAt: string;
  courseId: string;
  userId: string;
}

export interface StreakData {
  streak: number;
  totalActiveDays: number;
}

export interface CourseCheckoutResult {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  courseTitle: string;
  isFree: boolean;
}

export interface TutorRequest {
  _id: string;
  email: string;
  profile: { firstName: string; lastName: string; avatar?: string; bio?: string };
  roles: string[];
  tutorRequestStatus: 'none' | 'pending' | 'approved' | 'rejected';
  tutorRequestedAt?: string;
  tutorApprovedAt?: string;
  tutorRejectionReason?: string;
  createdAt: string;
}

export const analyticsApi = {
  /** Aggregated analytics for all courses by the authenticated tutor */
  getTutorOverview: async (): Promise<{ overview: TutorAnalyticsOverview; courses: CourseAnalyticsSummary[] }> => {
    const response = await apiClient.get<{ overview: TutorAnalyticsOverview; courses: CourseAnalyticsSummary[] }>(
      '/courses/analytics/overview'
    );
    return response;
  },

  /** Per-course detailed analytics */
  getCourseAnalytics: async (courseId: string): Promise<CourseDetailAnalytics> => {
    const response = await apiClient.get<CourseDetailAnalytics>(`/courses/${courseId}/analytics`);
    return response;
  },

  /** Get current streak for the authenticated student */
  getStreak: async (): Promise<StreakData> => {
    const response = await apiClient.get<StreakData>('/enrollments/streak');
    return response;
  },

  /** Get certificate payload for a completed course */
  getCertificate: async (courseId: string): Promise<CertificatePayload> => {
    const response = await apiClient.get<{ certificate: CertificatePayload }>(
      `/courses/${courseId}/certificate`
    );
    return (response as any).certificate ?? response;
  },

  /** Initiate checkout for a course (free = auto-enroll, paid = Stripe) */
  initiateCheckout: async (courseId: string): Promise<CourseCheckoutResult> => {
    const response = await apiClient.post<CourseCheckoutResult>(
      `/enrollments/courses/${courseId}/checkout`,
      {}
    );
    return response;
  },

  /** Admin: list tutor requests */
  getTutorRequests: async (status = 'pending'): Promise<TutorRequest[]> => {
    const response = await apiClient.get<{ requests: TutorRequest[] }>(
      '/users/tutor-requests',
      { status }
    );
    return response.requests ?? [];
  },

  /** Admin: approve or reject a tutor request */
  resolveTutorRequest: async (
    userId: string,
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<void> => {
    await apiClient.patch(`/users/${userId}/tutor-request`, { action, reason });
  },

  /** Student: request to become a tutor */
  requestTutorRole: async (): Promise<{ tutorRequestStatus: string }> => {
    const response = await apiClient.post<{ tutorRequestStatus: string }>(
      '/users/request-tutor',
      {}
    );
    return response;
  },
};
