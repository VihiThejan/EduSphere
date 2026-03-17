import { apiClient } from './client';
import { PaymentMethod } from '@edusphere/shared';

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

export const ordersApi = {
  createOrder: async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
    return apiClient.post<CreateOrderResponse>('/orders', payload);
  },

  getOrder: async (orderId: string): Promise<any> => {
    return apiClient.get<any>(`/orders/${orderId}`);
  },
};
