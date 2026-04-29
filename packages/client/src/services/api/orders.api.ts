import { apiClient } from './client';
import { IOrder, OrderFulfillmentStatus, PaymentMethod } from '@edusphere/shared';

export interface CreateOrderPayload {
  paymentMethod: PaymentMethod;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    street: string;
    city: string;
    postal?: string;
    phone?: string;
  };
}

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  total: number;
  paymentStatus: string;
}

export interface OrdersListResponse {
  data: IOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SellerOrderStatsResponse {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

export const ordersApi = {
  createOrder: async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
    return apiClient.post<CreateOrderResponse>('/orders', payload);
  },

  getOrder: async (orderId: string): Promise<IOrder> => {
    return apiClient.get<IOrder>(`/orders/${orderId}`);
  },

  getMyOrders: async (page = 1, limit = 10): Promise<OrdersListResponse> => {
    return apiClient.get<OrdersListResponse>('/orders', { page, limit });
  },

  getSellerOrders: async (
    page = 1,
    limit = 10,
    fulfillmentStatus?: OrderFulfillmentStatus
  ): Promise<OrdersListResponse> => {
    return apiClient.get<OrdersListResponse>('/orders/seller', {
      page,
      limit,
      fulfillmentStatus,
    });
  },

  getSellerOrderStats: async (): Promise<SellerOrderStatsResponse> => {
    return apiClient.get<SellerOrderStatsResponse>('/orders/stats', { role: 'seller' });
  },

  updateFulfillmentStatus: async (
    orderId: string,
    status: OrderFulfillmentStatus
  ): Promise<IOrder> => {
    return apiClient.put<IOrder>(`/orders/${orderId}/status`, { fulfillmentStatus: status });
  },
};
