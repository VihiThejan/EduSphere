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

export const reviewsApi = {
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
};
