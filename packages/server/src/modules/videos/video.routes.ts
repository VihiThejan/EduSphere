import { Router } from 'express';
import { videoController } from './video.controller.js';
import { videoUpload } from './video.service.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import { USER_ROLES } from '@edusphere/shared';

const router = Router();

/**
 * @route   GET /api/v1/videos/my/uploads
 * @desc    Get current user's uploaded videos
 * @access  Private (Tutor only)
 * NOTE: Must be registered before /:videoId to avoid Express matching "my" as a videoId
 */
router.get('/my/uploads', authenticate, videoController.getUserVideos.bind(videoController));

/**
 * @route   POST /api/v1/videos/upload
 * @desc    Upload a single video file
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
 * @route   POST /api/v1/videos/upload/bulk
 * @desc    Upload multiple video files at once (max 10)
 * @access  Private (Tutor only)
 */
router.post(
  '/upload/bulk',
  authenticate,
  authorize([USER_ROLES.TUTOR, USER_ROLES.ADMIN]),
  videoUpload.array('videos', 10),
  videoController.uploadBulkVideos.bind(videoController)
);

/**
 * @route   GET /api/v1/videos/sign-upload
 * @desc    Return a Cloudinary signed upload signature for direct browser upload
 * @access  Private (Tutor / Admin)
 * NOTE: Must be before /:videoId
 */
router.get(
  '/sign-upload',
  authenticate,
  authorize([USER_ROLES.TUTOR, USER_ROLES.ADMIN]),
  videoController.signUpload.bind(videoController)
);

/**
 * @route   POST /api/v1/videos/confirm
 * @desc    Save Cloudinary metadata after a successful direct browser upload
 * @access  Private (Tutor / Admin)
 * NOTE: Must be before /:videoId
 */
router.post(
  '/confirm',
  authenticate,
  authorize([USER_ROLES.TUTOR, USER_ROLES.ADMIN]),
  videoController.confirmUpload.bind(videoController)
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

export default router;
