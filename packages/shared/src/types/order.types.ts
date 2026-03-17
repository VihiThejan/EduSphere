import { OrderPaymentStatus, OrderFulfillmentStatus, PaymentMethod } from '../constants/order';

export interface IOrderItem {
  itemId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  city: string;
  postal?: string;
  phone?: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  items: IOrderItem[];
  subtotal: number;
  serviceFee: number;
  total: number;
  paymentStatus: OrderPaymentStatus;
  paymentMethod: PaymentMethod;
  stripePaymentIntentId?: string;
  fulfillmentStatus: OrderFulfillmentStatus;
  shippingAddress: IShippingAddress;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  deliveredAt?: Date;
}

export interface IOrderInput {
  items: IOrderItem[];
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  shippingAddress: IShippingAddress;
}

export interface ICartItem {
  itemId: string;
  quantity: number;
  addedAt: Date;
}

export interface ICart {
  _id: string;
  userId: string;
  items: ICartItem[];
  expiresAt: Date;
  updatedAt: Date;
}

export interface IReview {
  _id: string;
  itemId: string;
  sellerId: string;
  buyerId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface IReviewInput {
  itemId: string;
  rating: number;
  comment?: string;
}

export interface ISellerProfile {
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
  memberSince: Date;
  verificationStatus: 'unverified' | 'verified' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface ISellerProfileInput {
  shopName: string;
  shopDescription?: string;
  shopAvatar?: string;
  shopBanner?: string;
  responseTime?: string;
}
