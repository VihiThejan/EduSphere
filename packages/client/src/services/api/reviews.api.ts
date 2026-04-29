import { apiClient } from './client';

export interface IReview {
  _id: string;
  itemId: string;
  sellerId: string;
  buyerId: {
    _id: string;
    profile: { firstName: string; lastName: string; avatar?: string };
  };
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ReviewsResponse {
  data: IReview[];
  pagination: { page: number; limit: number; total: number; pages: number };
  averageRating: number;
}

// ── Course review types ───────────────────────────────────────────────────

export interface ReviewStudent {
  _id: string | null;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface CourseReview {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  student: ReviewStudent;
  courseName?: string;
}

export interface CourseReviewsResponse {
  reviews: CourseReview[];
  ratingBreakdown: Record<number, number>;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface TutorReviewsResponse {
  reviews: CourseReview[];
  stats: {
    avgRating: number;
    totalReviews: number;
  };
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface MyReviewResponse {
  review: {
    _id: string;
    rating: number;
    comment?: string;
    createdAt: string;
  } | null;
}

export const reviewsApi = {
  // ── Marketplace reviews ───────────────────────────────────────────────
  getItemReviews: (itemId: string, page = 1, limit = 10): Promise<ReviewsResponse> =>
    apiClient.get<ReviewsResponse>(`/reviews/item/${itemId}`, { page, limit }),

  createReview: (payload: {
    itemId: string;
    rating: number;
    comment?: string;
  }): Promise<{ review: IReview }> =>
    apiClient.post<{ review: IReview }>('/reviews', payload),

  deleteReview: (reviewId: string): Promise<void> =>
    apiClient.delete(`/reviews/${reviewId}`),

  // ── Course reviews ────────────────────────────────────────────────────

  submitCourseReview: (courseId: string, data: { rating: number; comment?: string }) =>
    apiClient.post(`/reviews/courses/${courseId}`, data),

  updateCourseReview: (courseId: string, data: { rating: number; comment?: string }) =>
    apiClient.put(`/reviews/courses/${courseId}`, data),

  deleteCourseReview: (courseId: string) =>
    apiClient.delete(`/reviews/courses/${courseId}`),

  getMyCourseReview: (courseId: string): Promise<MyReviewResponse> =>
    apiClient.get<MyReviewResponse>(`/reviews/courses/${courseId}/mine`),

  getCourseReviews: (
    courseId: string,
    page = 1,
    limit = 10
  ): Promise<CourseReviewsResponse> =>
    apiClient.get<CourseReviewsResponse>(`/reviews/courses/${courseId}`, {
      page,
      limit,
    }),

  getTutorReviews: (
    instructorId: string,
    page = 1,
    limit = 10
  ): Promise<TutorReviewsResponse> =>
    apiClient.get<TutorReviewsResponse>(`/reviews/tutors/${instructorId}`, {
      page,
      limit,
    }),
};

