import { NextFunction, Request, Response } from 'express';
import { paymentService } from './payment.service.js';
import { vendorBillingService } from '../vendor-billing/vendor-billing.service.js';
import { ValidationError } from '../../shared/utils/errors.js';
import { USER_ROLES } from '@edusphere/shared';

export class PaymentController {
  async createPaymentIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { orderId } = req.body as { orderId?: string };

      if (!userId) {
        throw new ValidationError('User authentication context missing');
      }

      if (!orderId) {
        throw new ValidationError('orderId is required');
      }

      const result = await paymentService.createPaymentIntent(orderId, userId);

      res.status(200).json({
        message: 'Payment intent created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const roles = req.user?.roles || [];
      const { orderId } = req.params;

      if (!userId) {
        throw new ValidationError('User authentication context missing');
      }

      const isAdmin = roles.includes(USER_ROLES.ADMIN);
      const result = await paymentService.getPaymentStatus(orderId, userId, isAdmin);

      res.status(200).json({
        message: 'Payment status fetched successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'];
      const payload = req.body as Buffer | string;

      await paymentService.handleWebhook(
        payload,
        typeof signature === 'string' ? signature : undefined
      );

      await vendorBillingService.handleWebhook(
        payload,
        typeof signature === 'string' ? signature : undefined
      );

      res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
