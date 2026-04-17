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
 * @route   GET /api/v1/enrollments/my-learning
 * @desc    Get all user enrollments (active, completed, dropped) with optional ?status= filter
 * @access  Private
 */
router.get('/my-learning', authenticate, enrollmentController.getAllUserEnrollments.bind(enrollmentController));

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

/**
 * @route   PATCH /api/v1/enrollments/courses/:courseId/drop
 * @desc    Drop/remove enrollment from a course
 * @access  Private
 */
router.patch(
  '/courses/:courseId/drop',
  authenticate,
  enrollmentController.dropEnrollment.bind(enrollmentController)
);

/**
 * @route   PATCH /api/v1/enrollments/courses/:courseId/re-enroll
 * @desc    Re-enroll in a previously dropped course (resets progress)
 * @access  Private
 */
router.patch(
  '/courses/:courseId/re-enroll',
  authenticate,
  enrollmentController.reEnroll.bind(enrollmentController)
);

/**
 * @route   DELETE /api/v1/enrollments/courses/:courseId
 * @desc    Permanently delete a dropped enrollment
 * @access  Private
 */
router.delete(
  '/courses/:courseId',
  authenticate,
  enrollmentController.deleteEnrollment.bind(enrollmentController)
);

/**
 * @route   PUT /api/v1/enrollments/courses/:courseId/lessons/:lessonId/watch-progress
 * @desc    Save video watch progress (called periodically ~10s)
 * @access  Private
 */
router.put(
  '/courses/:courseId/lessons/:lessonId/watch-progress',
  authenticate,
  enrollmentController.saveWatchProgress.bind(enrollmentController)
);

/**
 * @route   GET /api/v1/enrollments/courses/:courseId/lessons/:lessonId/watch-progress
 * @desc    Get watch progress for a lesson (for resume)
 * @access  Private
 */
router.get(
  '/courses/:courseId/lessons/:lessonId/watch-progress',
  authenticate,
  enrollmentController.getLessonWatchProgress.bind(enrollmentController)
);

export default router;
