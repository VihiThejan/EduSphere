import { Router } from 'express';
import { courseReviewController } from './course-review.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = Router();

/**
 * @route   POST /api/v1/reviews/courses/:courseId
 * @desc    Submit a review for a course (one per student)
 * @access  Private (enrolled student)
 */
router.post(
  '/courses/:courseId',
  authenticate,
  courseReviewController.submitReview.bind(courseReviewController)
);

/**
 * @route   PUT /api/v1/reviews/courses/:courseId
 * @desc    Update own review for a course
 * @access  Private
 */
router.put(
  '/courses/:courseId',
  authenticate,
  courseReviewController.updateReview.bind(courseReviewController)
);

/**
 * @route   DELETE /api/v1/reviews/courses/:courseId
 * @desc    Delete own review for a course
 * @access  Private
 */
router.delete(
  '/courses/:courseId',
  authenticate,
  courseReviewController.deleteReview.bind(courseReviewController)
);

/**
 * @route   GET /api/v1/reviews/courses/:courseId/mine
 * @desc    Get own review for a course
 * @access  Private
 */
router.get(
  '/courses/:courseId/mine',
  authenticate,
  courseReviewController.getMyReview.bind(courseReviewController)
);

/**
 * @route   GET /api/v1/reviews/courses/:courseId
 * @desc    Get all reviews for a course (public, paginated)
 * @access  Public
 */
router.get(
  '/courses/:courseId',
  courseReviewController.getCourseReviews.bind(courseReviewController)
);

/**
 * @route   GET /api/v1/reviews/tutors/:instructorId
 * @desc    Get all reviews across a tutor's courses (for profile)
 * @access  Public
 */
router.get(
  '/tutors/:instructorId',
  courseReviewController.getTutorReviews.bind(courseReviewController)
);

export default router;
