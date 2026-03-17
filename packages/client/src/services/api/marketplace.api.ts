import { apiClient } from './client';
import { IMarketplaceItem } from '@edusphere/shared';

export interface MarketplaceListParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  campus?: string;
  page?: number;
  limit?: number;
}

export interface MarketplaceListResponse {
  data: IMarketplaceItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const marketplaceApi = {
  getListings: async (params: MarketplaceListParams): Promise<MarketplaceListResponse> => {
    return apiClient.get<MarketplaceListResponse>('/marketplace', params);
  },

  getListingById: async (listingId: string): Promise<{ listing: IMarketplaceItem }> => {
    return apiClient.get<{ listing: IMarketplaceItem }>(`/marketplace/${listingId}`);
  },

  getSellerListingsPublic: async (
    sellerId: string,
    page = 1,
    limit = 6
  ): Promise<MarketplaceListResponse> => {
    return apiClient.get<MarketplaceListResponse>(`/marketplace/seller/${sellerId}`, {
      page,
      limit,
    });
  },
};
