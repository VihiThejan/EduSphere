import { Router } from 'express';
import { marketplaceController } from './marketplace.controller.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import { validateBody } from '../../shared/middleware/validate.js';
import {
  marketplaceItemCreateSchema,
  marketplaceItemUpdateSchema,
  USER_ROLES,
} from '@edusphere/shared';

const router = Router();

/**
 * @route   GET /api/v1/marketplace/my/listings
 * @desc    Get current user's own listings (all statuses)
 * @access  Private (Seller only)
 */
router.get(
  '/my/listings',
  authenticate,
  authorize([USER_ROLES.SELLER, USER_ROLES.TUTOR, USER_ROLES.ADMIN]),
  marketplaceController.getSellerListings.bind(marketplaceController)
);

/**
 * @route   POST /api/v1/marketplace
 * @desc    Create a new marketplace listing
 * @access  Private (Seller/Instructor only)
 */
router.post(
  '/',
  authenticate,
  authorize([USER_ROLES.SELLER, USER_ROLES.TUTOR, USER_ROLES.ADMIN]),
  validateBody(marketplaceItemCreateSchema),
  marketplaceController.createListing.bind(marketplaceController)
);

/**
 * @route   GET /api/v1/marketplace
 * @desc    Get all active marketplace listings with filters
 * @access  Public
 */
router.get('/', marketplaceController.getListings.bind(marketplaceController));

/**
 * @route   GET /api/v1/marketplace/:listingId
 * @desc    Get marketplace listing detail
 * @access  Public
 */
router.get('/:listingId', marketplaceController.getListingById.bind(marketplaceController));

/**
 * @route   PUT /api/v1/marketplace/:listingId
 * @desc    Update marketplace listing
 * @access  Private (Owner only)
 */
router.put(
  '/:listingId',
  authenticate,
  authorize([USER_ROLES.SELLER, USER_ROLES.TUTOR, USER_ROLES.ADMIN]),
  validateBody(marketplaceItemUpdateSchema),
  marketplaceController.updateListing.bind(marketplaceController)
);

/**
 * @route   DELETE /api/v1/marketplace/:listingId
 * @desc    Delete marketplace listing (soft delete)
 * @access  Private (Owner only)
 */
router.delete(
  '/:listingId',
  authenticate,
  authorize([USER_ROLES.SELLER, USER_ROLES.TUTOR, USER_ROLES.ADMIN]),
  marketplaceController.deleteListing.bind(marketplaceController)
);

/**
 * @route   GET /api/v1/marketplace/seller/:sellerId
 * @desc    Get all active listings by specific seller (public view)
 * @access  Public
 */
router.get(
  '/seller/:sellerId',
  marketplaceController.getListingsBySellerPublic.bind(marketplaceController)
);

export default router;
