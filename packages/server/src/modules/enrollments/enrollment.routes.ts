import { Router } from 'express';
import { enrollmentController } from './enrollment.controller.js';
import { enrollmentCheckoutService } from './enrollment-checkout.service.js';
import { authenticate } from '../../shared/middleware/auth.js';
import { ApiResponse } from '@edusphere/shared';
import { EnrollmentModel } from './enrollment.model.js';
import { LessonProgressModel } from './lesson-progress.model.js';

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

/**
 * @route   POST /api/v1/enrollments/courses/:courseId/checkout
 * @desc    Initiate checkout for a course (free = auto-enroll; paid = Stripe PaymentIntent)
 * @access  Private
 */
router.post('/courses/:courseId/checkout', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { courseId } = req.params;
    const result = await enrollmentCheckoutService.initiateCourseCheckout(userId, courseId);
    const response: ApiResponse = { success: true, data: result };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/enrollments/courses/:courseId/verify-payment
 * @desc    Verify a completed Stripe PaymentIntent and create enrollment.
 *          Required for local dev where webhooks don't fire automatically.
 * @access  Private
 */
router.post('/courses/:courseId/verify-payment', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { paymentIntentId } = req.body as { paymentIntentId?: string };
    if (!paymentIntentId) {
      res.status(400).json({ success: false, error: { message: 'paymentIntentId is required' } });
      return;
    }
    await enrollmentCheckoutService.handleCoursePaymentSuccess(paymentIntentId);
    const response: ApiResponse = { success: true, data: { userId } };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/enrollments/streak
 * @desc    Get the current daily study streak for the authenticated user
 * @access  Private
 */
router.get('/streak', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    // Get all enrollments for the user
    const enrollments = await EnrollmentModel.find({ userId }).select('lastAccessedAt').lean();
    const accessDates = enrollments
      .map((e) => e.lastAccessedAt)
      .filter(Boolean)
      .map((d) => {
        const date = new Date(d as Date);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      });

    // Also include any lesson watch progress days
    const progressDates = await LessonProgressModel.find({ userId })
      .select('lastWatchedAt')
      .lean();
    const watchDays = progressDates
      .map((p) => p.lastWatchedAt)
      .filter(Boolean)
      .map((d) => {
        const date = new Date(d as Date);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      });

    const uniqueDayStrings = [...new Set([...accessDates, ...watchDays])];

    // Build a sorted set of unique Date objects (midnight UTC)
    const uniqueDays = [...new Set(uniqueDayStrings)]
      .map((s) => {
        const [y, m, d] = s.split('-').map(Number);
        return new Date(y, m, d).getTime();
      })
      .sort((a, b) => b - a); // descending

    // Count consecutive days ending today or yesterday
    const MS_PER_DAY = 86_400_000;
    const today = new Date();
    const todayKey = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const yesterdayKey = todayKey - MS_PER_DAY;

    let streak = 0;
    if (uniqueDays.length > 0) {
      // Streak starts only if user was active today or yesterday
      if (uniqueDays[0] === todayKey || uniqueDays[0] === yesterdayKey) {
        streak = 1;
        let expected = uniqueDays[0] - MS_PER_DAY;
        for (let i = 1; i < uniqueDays.length; i++) {
          if (uniqueDays[i] === expected) {
            streak++;
            expected -= MS_PER_DAY;
          } else {
            break;
          }
        }
      }
    }

    const response: ApiResponse = { success: true, data: { streak, totalActiveDays: uniqueDays.length } };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
