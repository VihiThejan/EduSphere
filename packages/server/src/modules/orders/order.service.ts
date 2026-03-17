import mongoose from 'mongoose';
import { Order, IOrderDocument } from './order.model.js';
import { MarketplaceItem } from '../marketplace/marketplace.model.js';
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from '../../shared/utils/errors.js';
import {
  ORDER_PAYMENT_STATUS,
  ORDER_FULFILLMENT_STATUS,
  OrderPaymentStatus,
  OrderFulfillmentStatus,
} from '@edusphere/shared';
import { config } from '../../config/index.js';

interface CreateOrderInput {
  items: Array<{
    itemId: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  subtotal: number;
  total: number;
  paymentMethod: string;
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

interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: OrderPaymentStatus;
  fulfillmentStatus?: OrderFulfillmentStatus;
}

interface OrdersResult {
  data: IOrderDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class OrderService {
  async generateOrderNumber(): Promise<string> {
    // Format: ORD-YYYYMMDD-XXXXX (e.g., ORD-20260317-00001)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Count orders today to generate sequence
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const count = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
    });
    
    const sequence = String(count + 1).padStart(5, '0');
    return `ORD-${dateStr}-${sequence}`;
  }

  async createOrder(
    buyerId: string,
    input: CreateOrderInput,
    sellerId?: string
  ): Promise<IOrderDocument> {
    // Validate items
    if (!input.items || input.items.length === 0) {
      throw new ValidationError('Order must contain at least one item');
    }

    // If sellerId not provided, derive from first item
    let finalSellerId = sellerId;
    if (!finalSellerId && input.items.length > 0) {
      const primaryItem = await MarketplaceItem.findById(input.items[0].itemId);
      if (primaryItem) {
        finalSellerId = primaryItem.sellerId.toString();
      }
    }

    if (!finalSellerId) {
      throw new ValidationError('Unable to determine seller');
    }

    // Calculate service fee if not already in total
    const serviceFee = input.subtotal * (config.marketplace.serviceFeePercentage / 100);
    const total = input.subtotal + serviceFee;

    // Validate total matches
    if (Math.abs(total - input.total) > 0.01) {
      throw new ValidationError('Order total mismatch');
    }

    // Generate unique order number
    const orderNumber = await this.generateOrderNumber();

    // Create order
    const order = await Order.create({
      orderNumber,
      buyerId: new mongoose.Types.ObjectId(buyerId),
      sellerId: new mongoose.Types.ObjectId(finalSellerId),
      items: input.items.map((item) => ({
        itemId: new mongoose.Types.ObjectId(item.itemId),
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      subtotal: input.subtotal,
      serviceFee,
      total,
      paymentMethod: input.paymentMethod,
      fulfillmentStatus: ORDER_FULFILLMENT_STATUS.PENDING_PAYMENT,
      paymentStatus: ORDER_PAYMENT_STATUS.PENDING,
      shippingAddress: input.shippingAddress,
    });

    // Note: Don't decrement inventory here - only when payment is confirmed
    // This allows buyers to reserve items without blocking inventory

    return order;
  }

  async getOrderById(orderId: string, userId: string, isAdmin: boolean = false): Promise<IOrderDocument> {
    const order = await Order.findById(orderId)
      .populate('buyerId', 'email profile')
      .populate('sellerId', 'email profile');

    if (!order) {
      throw new NotFoundError('Order');
    }

    // Check access: buyer, seller, or admin can view
    const buyerIdStr = order.buyerId._id.toString ? order.buyerId._id.toString() : order.buyerId.toString();
    const sellerIdStr = order.sellerId._id.toString ? order.sellerId._id.toString() : order.sellerId.toString();

    if (buyerIdStr !== userId && sellerIdStr !== userId && !isAdmin) {
      throw new AuthorizationError('You cannot view this order');
    }

    return order;
  }

  async getOrdersByBuyer(
    buyerId: string,
    params: OrderQueryParams = {}
  ): Promise<OrdersResult> {
    const { page = 1, limit = 10, status, fulfillmentStatus } = params;

    const query: Record<string, any> = {
      buyerId: new mongoose.Types.ObjectId(buyerId),
    };

    if (status) query.paymentStatus = status;
    if (fulfillmentStatus) query.fulfillmentStatus = fulfillmentStatus;

    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(query);
    const pages = Math.ceil(total / limit);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sellerId', 'profile email');

    return {
      data: orders,
      pagination: { page, limit, total, pages },
    };
  }

  async getOrdersBySeller(
    sellerId: string,
    params: OrderQueryParams = {}
  ): Promise<OrdersResult> {
    const { page = 1, limit = 10, fulfillmentStatus } = params;

    const query: Record<string, any> = {
      sellerId: new mongoose.Types.ObjectId(sellerId),
    };

    if (fulfillmentStatus) query.fulfillmentStatus = fulfillmentStatus;

    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(query);
    const pages = Math.ceil(total / limit);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('buyerId', 'profile email');

    return {
      data: orders,
      pagination: { page, limit, total, pages },
    };
  }

  async confirmPayment(
    orderId: string,
    stripePaymentIntentId: string
  ): Promise<IOrderDocument> {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order');
    }

    if (order.paymentStatus !== ORDER_PAYMENT_STATUS.PENDING) {
      throw new ValidationError('Order payment already processed');
    }

    // Update order with payment confirmation
    order.paymentStatus = ORDER_PAYMENT_STATUS.COMPLETED;
    order.stripePaymentIntentId = stripePaymentIntentId;
    order.paidAt = new Date();
    order.fulfillmentStatus = ORDER_FULFILLMENT_STATUS.PROCESSING;

    // Decrement inventory for each item
    for (const item of order.items) {
      await MarketplaceItem.findByIdAndUpdate(
        item.itemId,
        {
          $inc: { quantity: -item.quantity },
        }
      );
    }

    await order.save();
    return order;
  }

  async updateFulfillmentStatus(
    orderId: string,
    sellerId: string,
    newStatus: OrderFulfillmentStatus
  ): Promise<IOrderDocument> {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order');
    }

    // Verify seller owns this order
    if (order.sellerId.toString() !== sellerId) {
      throw new AuthorizationError('You cannot update this order');
    }

    // Define status workflow progression
    const statusWorkflow: OrderFulfillmentStatus[] = [
      ORDER_FULFILLMENT_STATUS.PENDING_PAYMENT,
      ORDER_FULFILLMENT_STATUS.PROCESSING,
      ORDER_FULFILLMENT_STATUS.SHIPPED,
      ORDER_FULFILLMENT_STATUS.DELIVERED,
    ];

    const currentIndex = statusWorkflow.indexOf(order.fulfillmentStatus);
    const newIndex = statusWorkflow.indexOf(newStatus);

    // Check if status is in workflow (CANCELLED is always allowed)
    if (newIndex === -1 && newStatus !== ORDER_FULFILLMENT_STATUS.CANCELLED) {
      throw new ValidationError(`Invalid status: ${newStatus}`);
    }

    // Prevent downgrading status except to CANCELLED
    if (newIndex !== -1 && newIndex < currentIndex && newStatus !== ORDER_FULFILLMENT_STATUS.CANCELLED) {
      throw new ValidationError('Cannot downgrade order status');
    }

    order.fulfillmentStatus = newStatus;

    if (newStatus === ORDER_FULFILLMENT_STATUS.DELIVERED) {
      order.deliveredAt = new Date();
    }

    await order.save();
    return order;
  }

  async cancelOrder(
    orderId: string,
    userId: string,
    isBuyer: boolean = true
  ): Promise<IOrderDocument> {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order');
    }

    // Verify authorization
    if (isBuyer) {
      if (order.buyerId.toString() !== userId) {
        throw new AuthorizationError('You cannot cancel this order');
      }
    } else {
      if (order.sellerId.toString() !== userId) {
        throw new AuthorizationError('You cannot cancel this order');
      }
    }

    // Can only cancel if not yet shipped
    if (
      order.fulfillmentStatus === ORDER_FULFILLMENT_STATUS.SHIPPED ||
      order.fulfillmentStatus === ORDER_FULFILLMENT_STATUS.DELIVERED
    ) {
      throw new ValidationError('Cannot cancel order that has been shipped');
    }

    order.fulfillmentStatus = ORDER_FULFILLMENT_STATUS.CANCELLED;

    // If payment was completed, need to process refund
    if (order.paymentStatus === ORDER_PAYMENT_STATUS.COMPLETED) {
      order.paymentStatus = ORDER_PAYMENT_STATUS.REFUNDED;
      // TODO: Implement refund logic with Stripe
    }

    // Restore inventory if payment was completed
    if (order.paymentStatus === ORDER_PAYMENT_STATUS.REFUNDED) {
      for (const item of order.items) {
        await MarketplaceItem.findByIdAndUpdate(
          item.itemId,
          {
            $inc: { quantity: item.quantity },
          }
        );
      }
    }

    await order.save();
    return order;
  }

  async getOrderStats(userId: string, role: 'buyer' | 'seller'): Promise<{
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    totalRevenue: number;
  }> {
    const query = role === 'buyer' 
      ? { buyerId: new mongoose.Types.ObjectId(userId) }
      : { sellerId: new mongoose.Types.ObjectId(userId) };

    const total = await Order.countDocuments(query);
    const completed = await Order.countDocuments({
      ...query,
      paymentStatus: ORDER_PAYMENT_STATUS.COMPLETED,
    });
    const pending = await Order.countDocuments({
      ...query,
      paymentStatus: ORDER_PAYMENT_STATUS.PENDING,
    });

    // Calculate revenue (for sellers)
    let totalRevenue = 0;
    if (role === 'seller') {
      const orders = await Order.find({
        ...query,
        paymentStatus: ORDER_PAYMENT_STATUS.COMPLETED,
      });
      totalRevenue = orders.reduce((sum, order) => sum + order.subtotal, 0);
    }

    return {
      totalOrders: total,
      completedOrders: completed,
      pendingOrders: pending,
      totalRevenue,
    };
  }
}

export const orderService = new OrderService();
