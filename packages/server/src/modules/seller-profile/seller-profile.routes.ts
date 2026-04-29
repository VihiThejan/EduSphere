import { Router } from 'express';
import {
  sellerOnboardingSchema,
  sellerProfileUpdateSchema,
  USER_ROLES,
} from '@edusphere/shared';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import { validateBody } from '../../shared/middleware/validate.js';
import { sellerProfileController } from './seller-profile.controller.js';

const sellerProfileRoutes = Router();

sellerProfileRoutes.use(authenticate);

sellerProfileRoutes.post(
  '/onboard',
  validateBody(sellerOnboardingSchema),
  (req, res, next) => sellerProfileController.onboard(req, res, next)
);

sellerProfileRoutes.get(
  '/me',
  authorize([USER_ROLES.SELLER, USER_ROLES.TUTOR, USER_ROLES.ADMIN]),
  (req, res, next) => sellerProfileController.getMyProfile(req, res, next)
);

sellerProfileRoutes.put(
  '/me',
  authorize([USER_ROLES.SELLER, USER_ROLES.TUTOR, USER_ROLES.ADMIN]),
  validateBody(sellerProfileUpdateSchema),
  (req, res, next) => sellerProfileController.updateMyProfile(req, res, next)
);

export default sellerProfileRoutes;
