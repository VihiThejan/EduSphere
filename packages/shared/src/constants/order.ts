// Order Payment Status
export const ORDER_PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type OrderPaymentStatus = (typeof ORDER_PAYMENT_STATUS)[keyof typeof ORDER_PAYMENT_STATUS];

// Order Fulfillment Status
export const ORDER_FULFILLMENT_STATUS = {
  PENDING_PAYMENT: 'pending-payment',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderFulfillmentStatus = (typeof ORDER_FULFILLMENT_STATUS)[keyof typeof ORDER_FULFILLMENT_STATUS];

// Payment Methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  BANK_TRANSFER: 'bank-transfer',
  INSTALLMENT: 'installment',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
