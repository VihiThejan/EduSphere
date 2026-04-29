import { Router } from 'express';
import { userController } from './user.controller.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import { USER_ROLES } from '@edusphere/shared';

const router = Router();

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/me', authenticate, userController.getMe.bind(userController));

/**
 * @route   PUT /api/v1/users/me
 * @desc    Update current user's profile (firstName, lastName, avatar, bio)
 * @access  Private
 */
router.put('/me', authenticate, userController.updateMe.bind(userController));

/**
 * @route   GET /api/v1/users/me/profile
 * @desc    Get current user's full profile (with stats & courses)
 * @access  Private
 */
router.get('/me/profile', authenticate, userController.getMyProfile.bind(userController));

/**
 * @route   PUT /api/v1/users/me/profile
 * @desc    Update current user's profile fields
 * @access  Private
 */
router.put('/me/profile', authenticate, userController.updateMe.bind(userController));

// ── Tutor Approval Workflow ────────────────────────────────────────────────

/**
 * @route   POST /api/v1/users/request-tutor
 * @desc    Student submits a request to become a tutor
 * @access  Private (any authenticated user)
 */
router.post(
  '/request-tutor',
  authenticate,
  userController.requestTutorRole.bind(userController)
);

/**
 * @route   GET /api/v1/users/tutor-requests
 * @desc    Admin: list tutor requests (query ?status=pending|approved|rejected)
 * @access  Private (Admin only)
 */
router.get(
  '/tutor-requests',
  authenticate,
  authorize([USER_ROLES.ADMIN]),
  userController.getTutorRequests.bind(userController)
);

/**
 * @route   GET /api/v1/users/:userId/profile
 * @desc    Get any user's public profile (with stats & courses)
 * @access  Public
 */
router.get('/:userId/profile', userController.getUserProfile.bind(userController));

/**
 * @route   PATCH /api/v1/users/:userId/tutor-request
 * @desc    Admin: approve or reject a tutor request
 * @access  Private (Admin only)
 */
router.patch(
  '/:userId/tutor-request',
  authenticate,
  authorize([USER_ROLES.ADMIN]),
  userController.resolveTutorRequest.bind(userController)
);

export default router;
