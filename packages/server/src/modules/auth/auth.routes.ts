import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from './auth.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';
import { validateBody } from '../../shared/middleware/validate.js';
import { userRegisterSchema, userLoginSchema } from '@edusphere/shared';

const router = Router();

// ── Rate limiters ─────────────────────────────────────────────────────────────

/** Strict limiter for login/register: 10 requests per 15 minutes per IP */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many attempts. Please try again after 15 minutes.',
      statusCode: 429,
    },
  },
});

/** Looser limiter for password reset / email verify: 5 per hour */
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests. Please try again after 1 hour.',
      statusCode: 429,
    },
  },
});

// ── Routes ─────────────────────────────────────────────────────────────────────

router.post(
  '/register',
  authLimiter,
  validateBody(userRegisterSchema),
  authController.register.bind(authController)
);

router.post(
  '/login',
  authLimiter,
  validateBody(userLoginSchema),
  authController.login.bind(authController)
);

router.post('/refresh', authController.refreshToken.bind(authController));

router.post('/logout', authenticate, authController.logout.bind(authController));

/** Log out all devices/sessions at once */
router.post('/logout-all', authenticate, authController.logoutAll.bind(authController));

router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

/** Send / resend password-reset email */
router.post(
  '/forgot-password',
  resetLimiter,
  authController.forgotPassword.bind(authController)
);

/** Set new password using token from the email */
router.post(
  '/reset-password',
  resetLimiter,
  authController.resetPassword.bind(authController)
);

/** Verify email address using token from the verification email */
router.post(
  '/verify-email',
  authController.verifyEmail.bind(authController)
);

/** Re-send email-verification link (requires auth) */
router.post(
  '/resend-verification',
  authenticate,
  resetLimiter,
  authController.resendVerificationEmail.bind(authController)
);

export default router;

