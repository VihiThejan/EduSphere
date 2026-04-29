import { Router } from 'express';
import { userController } from './user.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';

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

export default router;
