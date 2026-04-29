import { apiClient } from './client';

// ── Types ────────────────────────────────────────────────────────────────

export interface ProfileUser {
  _id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
  };
  roles: string[];
  createdAt: string;
  isMarketplaceSeller?: boolean;
}

export interface ProfileStats {
  totalStudents: number;
  totalCourses: number;
  avgRating: number;
  totalReviews: number;
}

export interface ProfileCourse {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  category: string;
  level: string;
  pricing: {
    amount: number;
    currency: string;
    discountPrice?: number;
  };
  stats: {
    enrollmentCount: number;
    avgRating: number;
    reviewCount: number;
    totalLessons: number;
    totalDuration: number;
  };
  tags: string[];
  createdAt: string;
}

export interface UserProfileData {
  user: ProfileUser;
  stats: ProfileStats;
  courses: ProfileCourse[];
}

// ── API ──────────────────────────────────────────────────────────────────

export const profileApi = {
  getUserProfile: async (userId: string): Promise<UserProfileData> => {
    return apiClient.get<UserProfileData>(`/users/${userId}/profile`);
  },

  getMyProfile: async (): Promise<UserProfileData> => {
    return apiClient.get<UserProfileData>('/users/me/profile');
  },

  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatar?: string;
  }) => {
    return apiClient.put<{ user: ProfileUser }>('/users/me/profile', data);
  },
};
