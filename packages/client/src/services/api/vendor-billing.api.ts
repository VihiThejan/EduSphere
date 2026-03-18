import { apiClient } from './client';
import { VendorPlanTier, VendorSubscriptionStatus } from '@edusphere/shared';

export interface VendorBillingCheckoutPayload {
  tier: VendorPlanTier;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface VendorCheckoutResponse {
  checkoutSessionId: string;
  checkoutUrl: string;
}

export interface VendorSubscriptionStatusResponse {
  tier: VendorPlanTier;
  status: VendorSubscriptionStatus;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  usedListings: number;
  listingQuota: number;
  remainingListings: number;
}

export interface VendorRefundResponse {
  refundId: string;
}

export const vendorBillingApi = {
  createCheckout: async (
    payload: VendorBillingCheckoutPayload
  ): Promise<VendorCheckoutResponse> => {
    return apiClient.post<VendorCheckoutResponse>('/vendor-billing/checkout', payload);
  },

  getMyStatus: async (): Promise<VendorSubscriptionStatusResponse> => {
    return apiClient.get<VendorSubscriptionStatusResponse>('/vendor-billing/me/status');
  },

  getSellerStatusByAdmin: async (
    sellerId: string
  ): Promise<VendorSubscriptionStatusResponse> => {
    return apiClient.get<VendorSubscriptionStatusResponse>(`/vendor-billing/seller/${sellerId}/status`);
  },

  refundPaymentByAdmin: async (
    paymentIntentId: string,
    reason: string
  ): Promise<VendorRefundResponse> => {
    return apiClient.post<VendorRefundResponse>('/vendor-billing/refund', {
      paymentIntentId,
      reason,
    });
  },
};
