import { apiClient } from './client';

export interface CreatePaymentIntentResponse {
  orderId: string;
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  publishableKey: string;
}

export interface PaymentStatusResponse {
  orderId: string;
  orderNumber: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  stripePaymentIntentId?: string;
  stripeStatus?: string;
}

export const paymentsApi = {
  createIntent: async (orderId: string): Promise<CreatePaymentIntentResponse> => {
    return apiClient.post<CreatePaymentIntentResponse>('/payments/create-intent', { orderId });
  },

  getStatus: async (orderId: string): Promise<PaymentStatusResponse> => {
    return apiClient.get<PaymentStatusResponse>(`/payments/${orderId}/status`);
  },
};
