export type CheckoutPaymentMethod = 'card' | 'mintpay' | 'bank-transfer';

export interface CheckoutOrderItem {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  imageUrl: string;
}

export interface CheckoutSummary {
  items: CheckoutOrderItem[];
  serviceFee: number;
}

export interface BillingAddressData {
  firstName: string;
  lastName: string;
  email: string;
  streetAddress: string;
}

export interface CardPaymentData {
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export interface CheckoutFieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  streetAddress?: string;
  cardholderName?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}
