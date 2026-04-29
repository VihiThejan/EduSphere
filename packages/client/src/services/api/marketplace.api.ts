import { apiClient } from './client';
import { IMarketplaceItem, IMarketplaceItemInput } from '@edusphere/shared';

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

export interface SellerListingsResponse {
  data: IMarketplaceItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PublishListingResponse {
  listing: IMarketplaceItem;
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

  getMyListings: async (page = 1, limit = 10): Promise<SellerListingsResponse> => {
    return apiClient.get<SellerListingsResponse>('/marketplace/my/listings', { page, limit });
  },

  createListing: async (payload: IMarketplaceItemInput): Promise<{ listing: IMarketplaceItem }> => {
    return apiClient.post<{ listing: IMarketplaceItem }>('/marketplace', payload);
  },

  updateListing: async (
    listingId: string,
    payload: Partial<IMarketplaceItemInput>
  ): Promise<{ listing: IMarketplaceItem }> => {
    return apiClient.put<{ listing: IMarketplaceItem }>(`/marketplace/${listingId}`, payload);
  },

  publishListing: async (listingId: string): Promise<PublishListingResponse> => {
    return apiClient.post<PublishListingResponse>(`/marketplace/${listingId}/publish`);
  },

  deleteListing: async (listingId: string): Promise<void> => {
    await apiClient.delete(`/marketplace/${listingId}`);
  },
};
