import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import { USER_ROLES } from '@edusphere/shared';

const router = Router();
const adminOnly = [authenticate, authorize([USER_ROLES.ADMIN])];

router.get('/stats', ...adminOnly, (req, res, next) => adminController.getStats(req, res, next));

router.get('/users', ...adminOnly, (req, res, next) => adminController.getUsers(req, res, next));
router.put('/users/:userId/roles', ...adminOnly, (req, res, next) => adminController.updateUserRoles(req, res, next));
router.put('/users/:userId/suspend', ...adminOnly, (req, res, next) => adminController.toggleUserSuspension(req, res, next));

router.get('/sellers', ...adminOnly, (req, res, next) => adminController.getSellers(req, res, next));
router.put('/sellers/:sellerId/verification', ...adminOnly, (req, res, next) => adminController.updateSellerVerification(req, res, next));

router.get('/listings', ...adminOnly, (req, res, next) => adminController.getListings(req, res, next));
router.delete('/listings/:listingId', ...adminOnly, (req, res, next) => adminController.removeListing(req, res, next));

router.get('/orders', ...adminOnly, (req, res, next) => adminController.getOrders(req, res, next));

export default router;
