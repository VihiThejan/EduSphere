import { apiClient } from './client';

export interface SellerProfile {
  _id: string;
  userId: string;
  shopName: string;
  shopDescription?: string;
  shopAvatar?: string;
  shopBanner?: string;
  rating: number;
  reviewCount: number;
  totalSales: number;
  responseTime?: string;
  verificationStatus: 'unverified' | 'verified' | 'suspended';
  memberSince: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerOnboardingPayload {
  shopName: string;
  shopDescription?: string;
  agreeToTerms: boolean;
}

export const sellerProfileApi = {
  onboard: async (payload: SellerOnboardingPayload): Promise<{ profile: SellerProfile }> => {
    return apiClient.post<{ profile: SellerProfile }>('/seller-profile/onboard', payload);
  },

  getMyProfile: async (): Promise<{ profile: SellerProfile | null }> => {
    return apiClient.get<{ profile: SellerProfile | null }>('/seller-profile/me');
  },

  updateMyProfile: async (payload: {
    shopName: string;
    shopDescription?: string;
    shopAvatar?: string;
    shopBanner?: string;
    responseTime?: string;
  }): Promise<{ profile: SellerProfile }> => {
    return apiClient.put<{ profile: SellerProfile }>('/seller-profile/me', payload);
  },
};
