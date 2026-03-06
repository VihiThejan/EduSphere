import { Router } from 'express';
import { videoController } from './video.controller.js';
import { videoUpload } from './video.service.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import { USER_ROLES } from '@edusphere/shared';

const router = Router();

/**
 * @route   POST /api/v1/videos/upload
 * @desc    Upload a video file
 * @access  Private (Tutor only)
 */
router.post(
  '/upload',
  authenticate,
  authorize([USER_ROLES.TUTOR, USER_ROLES.ADMIN]),
  videoUpload.single('video'),
  videoController.uploadVideo.bind(videoController)
);

/**
 * @route   GET /api/v1/videos/:videoId
 * @desc    Get video metadata
 * @access  Private
 */
router.get('/:videoId', authenticate, videoController.getVideo.bind(videoController));

/**
 * @route   GET /api/v1/videos/:videoId/stream
 * @desc    Stream video with range support
 * @access  Private (enrolled students or owner)
 */
router.get('/:videoId/stream', authenticate, videoController.streamVideo.bind(videoController));

/**
 * @route   DELETE /api/v1/videos/:videoId
 * @desc    Delete a video
 * @access  Private (Owner only)
 */
router.delete('/:videoId', authenticate, videoController.deleteVideo.bind(videoController));

/**
 * @route   GET /api/v1/videos/my/uploads
 * @desc    Get current user's uploaded videos
 * @access  Private (Tutor only)
 */
router.get('/my/uploads', authenticate, videoController.getUserVideos.bind(videoController));

export default router;
