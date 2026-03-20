import { Router } from 'express';
import { liveSessionController } from './live-session.controller.js';
import { liveQuestionController } from './live-question.controller.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import { USER_ROLES } from '@edusphere/shared';

const router = Router();

/**
 * @route   GET /api/v1/live-sessions
 * @desc    List all upcoming/live sessions (students browse)
 * @access  Private — Students & Admins only
 */
router.get(
  '/',
  authenticate,
  authorize([USER_ROLES.STUDENT, USER_ROLES.ADMIN]),
  liveSessionController.getAllActiveSessions.bind(liveSessionController)
);

/**
 * @route   GET /api/v1/live-sessions/my/hosted
 * @desc    Get sessions hosted by the authenticated tutor
 * @access  Private (Tutor / Admin)
 */
router.get(
  '/my/hosted',
  authenticate,
  authorize([USER_ROLES.TUTOR, USER_ROLES.ADMIN]),
  liveSessionController.getHostedSessions.bind(liveSessionController)
);

/**
 * @route   GET /api/v1/live-sessions/course/:courseId
 * @desc    Get active sessions for a specific course
 * @access  Private
 */
router.get(
  '/course/:courseId',
  authenticate,
  liveSessionController.getCourseSession.bind(liveSessionController)
);

/**
 * @route   POST /api/v1/live-sessions
 * @desc    Create a new live session (Daily.co room)
 * @access  Private (Tutor / Admin)
 */
router.post(
  '/',
  authenticate,
  authorize([USER_ROLES.TUTOR, USER_ROLES.ADMIN]),
  liveSessionController.createSession.bind(liveSessionController)
);

/**
 * @route   GET /api/v1/live-sessions/:sessionId/join
 * @desc    Get Daily.co token + room URL to join a session
 *          Query param: ?host=true  →  join as owner/host
 * @access  Private
 */
router.get(
  '/:sessionId/join',
  authenticate,
  liveSessionController.joinSession.bind(liveSessionController)
);

/**
 * @route   PATCH /api/v1/live-sessions/:sessionId/end
 * @desc    End a live session and delete the Daily.co room
 * @access  Private (Host only)
 */
router.patch(
  '/:sessionId/end',
  authenticate,
  liveSessionController.endSession.bind(liveSessionController)
);

// ── Q&A routes ────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/live-sessions/:sessionId/questions
 * @desc    Get all questions for a session (sorted by upvotes)
 * @access  Private
 */
router.get('/:sessionId/questions', authenticate, liveQuestionController.list.bind(liveQuestionController));

/**
 * @route   POST /api/v1/live-sessions/:sessionId/questions
 * @desc    Submit a question during a live session
 * @access  Private — Students & Admins only
 */
router.post('/:sessionId/questions', authenticate, authorize([USER_ROLES.STUDENT, USER_ROLES.ADMIN]), liveQuestionController.ask.bind(liveQuestionController));

/**
 * @route   PATCH /api/v1/live-sessions/:sessionId/questions/:questionId/answer
 * @desc    Host answers a question
 * @access  Private (Tutor / Admin)
 */
router.patch(
  '/:sessionId/questions/:questionId/answer',
  authenticate,
  authorize([USER_ROLES.TUTOR, USER_ROLES.ADMIN]),
  liveQuestionController.answer.bind(liveQuestionController)
);

/**
 * @route   POST /api/v1/live-sessions/:sessionId/questions/:questionId/upvote
 * @desc    Upvote / un-upvote a question
 * @access  Private
 */
router.post('/:sessionId/questions/:questionId/upvote', authenticate, liveQuestionController.upvote.bind(liveQuestionController));

export default router;
