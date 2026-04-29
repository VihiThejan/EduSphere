import { NextFunction, Request, Response } from 'express';
import {
  USER_ROLES,
  VendorPlanTier,
  VendorSubscriptionCheckoutInput,
  VendorRefundInput,
} from '@edusphere/shared';
import { ValidationError, AuthorizationError } from '../../shared/utils/errors.js';
import { vendorBillingService } from './vendor-billing.service.js';

export class VendorBillingController {
  async createSubscriptionCheckout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sellerId = req.user?.userId;
      if (!sellerId) {
        throw new ValidationError('User authentication context missing');
      }

      const input = req.body as VendorSubscriptionCheckoutInput;
      const tier = input.tier as VendorPlanTier;
      const result = await vendorBillingService.createSubscriptionCheckout(
        sellerId,
        tier,
        input.returnUrl,
        input.cancelUrl
      );

      res.status(200).json({
        success: true,
        message: 'Vendor subscription checkout session created',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMySubscriptionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sellerId = req.user?.userId;
      if (!sellerId) {
        throw new ValidationError('User authentication context missing');
      }

      const data = await vendorBillingService.getSellerSubscriptionStatus(sellerId);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSellerSubscriptionStatusByAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const roles = req.user?.roles || [];
      if (!roles.includes(USER_ROLES.ADMIN)) {
        throw new AuthorizationError('Only admins can access seller subscription by id');
      }

      const { sellerId } = req.params;
      const data = await vendorBillingService.getSellerSubscriptionStatus(sellerId);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async refundVendorPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roles = req.user?.roles || [];
      if (!roles.includes(USER_ROLES.ADMIN)) {
        throw new AuthorizationError('Only admins can issue vendor refunds');
      }

      const { paymentIntentId, reason } = req.body as VendorRefundInput;
      const data = await vendorBillingService.refundVendorPayment(paymentIntentId, reason);

      res.status(200).json({
        success: true,
        message: 'Vendor payment refunded successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const vendorBillingController = new VendorBillingController();
