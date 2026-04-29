import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import { orderController } from './order.controller.js';

const orderRoutes = Router();

// All order routes require authentication
orderRoutes.use(authenticate);

// Specific routes first (avoid wildcard matching)
// Wrap handlers to ensure proper typing for Express router
orderRoutes.get('/stats', (req, res, next) => 
  orderController.getOrderStats(req as any, res, next)
);
orderRoutes.get('/seller', (req, res, next) => 
  orderController.getSellerOrders(req as any, res, next)
);

// Create order (buyer endpoint)
orderRoutes.post('/', (req, res, next) => 
  orderController.createOrder(req as any, res, next)
);

// Get all buyer's orders
orderRoutes.get('/', (req, res, next) => 
  orderController.getMyOrders(req as any, res, next)
);

// Order detail and operations (use wildcard last)
orderRoutes.get('/:orderId', (req, res, next) => 
  orderController.getOrderDetail(req as any, res, next)
);
orderRoutes.put('/:orderId/status', (req, res, next) => 
  orderController.updateFulfillmentStatus(req as any, res, next)
);
orderRoutes.delete('/:orderId', (req, res, next) => 
  orderController.cancelOrder(req as any, res, next)
);

export default orderRoutes;
