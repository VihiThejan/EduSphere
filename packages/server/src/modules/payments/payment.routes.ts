import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.js';
import { paymentController } from './payment.controller.js';

const paymentRoutes = Router();

paymentRoutes.post('/create-intent', authenticate, (req, res, next) =>
  paymentController.createPaymentIntent(req, res, next)
);

paymentRoutes.get('/:orderId/status', authenticate, (req, res, next) =>
  paymentController.getPaymentStatus(req, res, next)
);

export default paymentRoutes;
