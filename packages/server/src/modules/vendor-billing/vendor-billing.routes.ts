import { Router } from 'express';
import {
  USER_ROLES,
  vendorRefundSchema,
  vendorSubscriptionCheckoutSchema,
} from '@edusphere/shared';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import { validateBody } from '../../shared/middleware/validate.js';
import { vendorBillingController } from './vendor-billing.controller.js';

const vendorBillingRoutes = Router();

vendorBillingRoutes.use(authenticate);

vendorBillingRoutes.post(
  '/checkout',
  authorize([USER_ROLES.SELLER, USER_ROLES.TUTOR, USER_ROLES.ADMIN]),
  validateBody(vendorSubscriptionCheckoutSchema),
  (req, res, next) => vendorBillingController.createSubscriptionCheckout(req, res, next)
);

vendorBillingRoutes.get('/me/status', (req, res, next) =>
  vendorBillingController.getMySubscriptionStatus(req, res, next)
);

vendorBillingRoutes.get('/seller/:sellerId/status', authorize([USER_ROLES.ADMIN]), (req, res, next) =>
  vendorBillingController.getSellerSubscriptionStatusByAdmin(req, res, next)
);

vendorBillingRoutes.post(
  '/refund',
  authorize([USER_ROLES.ADMIN]),
  validateBody(vendorRefundSchema),
  (req, res, next) => vendorBillingController.refundVendorPayment(req, res, next)
);

export default vendorBillingRoutes;
