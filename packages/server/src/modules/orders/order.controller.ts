import { Request, Response, NextFunction } from 'express';
import { orderService } from './order.service.js';
import { Cart } from '../cart/cart.model.js';
import { MarketplaceItem } from '../marketplace/marketplace.model.js';

type AuthRequest = Request & {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
};

export class OrderController {
  async createOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user!.userId;
      
      // Get buyer's cart
      const cart = await Cart.findOne({ userId: buyerId });
      if (!cart || cart.items.length === 0) {
        res.status(400).json({ message: 'Cart is empty' });
        return;
      }

      // Populate cart items with current prices and validate
      const items = [];
      let subtotal = 0;

      for (const cartItem of cart.items) {
        const marketplaceItem = await MarketplaceItem.findById(cartItem.itemId);
        if (!marketplaceItem) {
          res.status(400).json({
            message: `Item ${cartItem.itemId} no longer available`,
          });
          return;
        }

        if (marketplaceItem.quantity < cartItem.quantity) {
          res.status(400).json({
            message: `Only ${marketplaceItem.quantity} of ${marketplaceItem.title} available`,
          });
          return;
        }

        items.push({
          itemId: cartItem.itemId.toString(),
          title: marketplaceItem.title,
          price: marketplaceItem.price,
          quantity: cartItem.quantity,
          image: marketplaceItem.images[0]?.url || '',
        });

        subtotal += marketplaceItem.price * cartItem.quantity;
      }

      if (items.length === 0) {
        res.status(400).json({ message: 'No valid items in cart' });
        return;
      }

      // Validate request body
      const { paymentMethod, shippingAddress } = req.body;
      if (!paymentMethod || !shippingAddress) {
        res.status(400).json({
          message: 'paymentMethod and shippingAddress are required',
        });
        return;
      }

      // Calculate total with service fee
      const serviceFeePercentage = 5; // 5%
      const serviceFee = subtotal * (serviceFeePercentage / 100);
      const total = subtotal + serviceFee;

      // Create order
      const order = await orderService.createOrder(buyerId, {
        items,
        subtotal,
        total,
        paymentMethod,
        shippingAddress,
      });

      // Clear cart after order creation
      await Cart.updateOne({ userId: buyerId }, { items: [] });

      res.status(201).json({
        message: 'Order created successfully',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          total: order.total,
          paymentStatus: order.paymentStatus,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user!.userId;
      const { page = '1', limit = '10', status, fulfillmentStatus } = req.query;

      const result = await orderService.getOrdersByBuyer(buyerId, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as any,
        fulfillmentStatus: fulfillmentStatus as any,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSellerOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const sellerId = req.user!.userId;
      const { page = '1', limit = '10', fulfillmentStatus } = req.query;

      const result = await orderService.getOrdersBySeller(sellerId, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        fulfillmentStatus: fulfillmentStatus as any,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getOrderDetail(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;
      const userId = req.user!.userId;
      const isAdmin = req.user!.role === 'ADMIN';

      const order = await orderService.getOrderById(orderId, userId, isAdmin);

      res.json({
        message: 'Order retrieved successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateFulfillmentStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { orderId } = req.params;
      const { fulfillmentStatus } = req.body;
      const sellerId = req.user!.userId;

      if (!fulfillmentStatus) {
        res.status(400).json({
          message: 'fulfillmentStatus is required',
        });
        return;
      }

      // Validate status
      const validStatuses = [
        'PENDING_PAYMENT',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
      ];
      if (!validStatuses.includes(fulfillmentStatus)) {
        res.status(400).json({
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
        return;
      }

      const updatedOrder = await orderService.updateFulfillmentStatus(
        orderId,
        sellerId,
        fulfillmentStatus
      );

      res.json({
        message: 'Order status updated successfully',
        data: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;
      const userId = req.user!.userId;
      const isBuyer = req.query.as !== 'seller'; // Default to buyer unless specified

      const cancelledOrder = await orderService.cancelOrder(
        orderId,
        userId,
        isBuyer
      );

      res.json({
        message: 'Order cancelled successfully',
        data: cancelledOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const role = (req.query.role as string) || 'buyer';

      if (!['buyer', 'seller'].includes(role)) {
        res.status(400).json({
          message: 'role must be either buyer or seller',
        });
        return;
      }

      const stats = await orderService.getOrderStats(userId, role as 'buyer' | 'seller');

      res.json({
        message: 'Stats retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
