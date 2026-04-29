import { apiClient } from './client';

export interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  totalCourses: number;
  totalListings: number;
  totalOrders: number;
  totalEnrollments: number;
  totalRevenue: number;
  recentUsers: AdminUser[];
}

export interface AdminUser {
  _id: string;
  email: string;
  profile: { firstName: string; lastName: string; avatar?: string };
  roles: string[];
  isEmailVerified: boolean;
  isMarketplaceSeller: boolean;
  tutorRequestStatus: string;
  createdAt: string;
  loginAttempts: number;
  lockUntil?: string;
}

export interface AdminSeller {
  _id: string;
  shopName: string;
  shopDescription?: string;
  shopAvatar?: string;
  verificationStatus: 'unverified' | 'verified' | 'suspended';
  totalSales: number;
  rating: number;
  reviewCount: number;
  memberSince: string;
  userId: AdminUser;
}

export interface AdminListing {
  _id: string;
  title: string;
  category: string;
  price: number;
  publishStatus: string;
  condition?: string;
  campus?: string;
  images: string[];
  createdAt: string;
  sellerId: AdminUser;
}

export interface AdminOrder {
  _id: string;
  orderNumber: string;
  total: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
  buyerId: AdminUser;
  sellerId: AdminUser;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const adminApi = {
  getStats: () => apiClient.get<AdminStats>('/admin/stats'),

  getUsers: (page = 1, limit = 20, search?: string, role?: string) =>
    apiClient.get<{ users: AdminUser[]; pagination: PaginationMeta }>(
      '/admin/users', { page, limit, ...(search && { search }), ...(role && { role }) }
    ),

  updateUserRoles: (userId: string, roles: string[]) =>
    apiClient.put<{ user: AdminUser }>(`/admin/users/${userId}/roles`, { roles }),

  toggleUserSuspension: (userId: string) =>
    apiClient.put<{ suspended: boolean; userId: string }>(`/admin/users/${userId}/suspend`, {}),

  getSellers: (page = 1, limit = 20, search?: string, status?: string) =>
    apiClient.get<{ sellers: AdminSeller[]; pagination: PaginationMeta }>(
      '/admin/sellers', { page, limit, ...(search && { search }), ...(status && { status }) }
    ),

  updateSellerVerification: (sellerId: string, status: 'unverified' | 'verified' | 'suspended') =>
    apiClient.put<{ profile: AdminSeller }>(`/admin/sellers/${sellerId}/verification`, { status }),

  getListings: (page = 1, limit = 20, search?: string, publishStatus?: string) =>
    apiClient.get<{ listings: AdminListing[]; pagination: PaginationMeta }>(
      '/admin/listings', { page, limit, ...(search && { search }), ...(publishStatus && { publishStatus }) }
    ),

  removeListing: (listingId: string) =>
    apiClient.delete<void>(`/admin/listings/${listingId}`),

  getOrders: (page = 1, limit = 20) =>
    apiClient.get<{ orders: AdminOrder[]; pagination: PaginationMeta }>(
      '/admin/orders', { page, limit }
    ),
};
