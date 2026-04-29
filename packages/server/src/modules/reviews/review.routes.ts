import { Router } from 'express';
import { reviewController } from './review.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = Router();

/**
 * @route   POST /api/v1/reviews
 * @desc    Submit a review for a purchased marketplace item
 * @access  Private (authenticated buyers only)
 */
router.post('/', authenticate, reviewController.createReview.bind(reviewController));

/**
 * @route   GET /api/v1/reviews/item/:itemId
 * @desc    Get all reviews for a marketplace item
 * @access  Public
 */
router.get('/item/:itemId', reviewController.getReviewsForItem.bind(reviewController));

/**
 * @route   DELETE /api/v1/reviews/:reviewId
 * @desc    Delete own review
 * @access  Private (review owner only)
 */
router.delete('/:reviewId', authenticate, reviewController.deleteReview.bind(reviewController));

export default router;
