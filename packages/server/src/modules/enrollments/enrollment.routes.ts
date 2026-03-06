import { Router } from 'express';
import { enrollmentController } from './enrollment.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = Router();

/**
 * @route   POST /api/v1/enrollments/courses/:courseId/enroll
 * @desc    Enroll in a course
 * @access  Private (Student)
 */
router.post(
  '/courses/:courseId/enroll',
  authenticate,
  enrollmentController.enrollInCourse.bind(enrollmentController)
);

/**
 * @route   GET /api/v1/enrollments/me
 * @desc    Get current user's enrollments
 * @access  Private
 */
router.get('/me', authenticate, enrollmentController.getUserEnrollments.bind(enrollmentController));

/**
 * @route   GET /api/v1/enrollments/courses/:courseId/progress
 * @desc    Get progress for a specific course
 * @access  Private
 */
router.get(
  '/courses/:courseId/progress',
  authenticate,
  enrollmentController.getCourseProgress.bind(enrollmentController)
);

/**
 * @route   POST /api/v1/enrollments/courses/:courseId/lessons/:lessonId/complete
 * @desc    Mark a lesson as completed
 * @access  Private
 */
router.post(
  '/courses/:courseId/lessons/:lessonId/complete',
  authenticate,
  enrollmentController.markLessonCompleted.bind(enrollmentController)
);

/**
 * @route   GET /api/v1/enrollments/courses/:courseId/check
 * @desc    Check if user is enrolled in a course
 * @access  Private
 */
router.get(
  '/courses/:courseId/check',
  authenticate,
  enrollmentController.checkEnrollment.bind(enrollmentController)
);

export default router;
