import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { ApiResponse } from '@edusphere/shared';

const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tokens } = await authService.register(req.body);

      res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTS);

      res.status(201).json({
        success: true,
        data: { user, accessToken: tokens.accessToken },
        message: 'User registered successfully',
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tokens } = await authService.login(req.body);

      res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTS);

      res.status(200).json({
        success: true,
        data: { user, accessToken: tokens.accessToken },
        message: 'Login successful',
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Refresh token not provided',
            statusCode: 401,
          },
        });
        return;
      }

      const tokens = await authService.refreshTokens(refreshToken);

      res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTS);

      res.status(200).json({
        success: true,
        data: { accessToken: tokens.accessToken },
        message: 'Token refreshed successfully',
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      const userId = req.user?.userId;

      if (refreshToken && userId) {
        await authService.logout(userId, refreshToken);
      }

      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logoutAll(req.user!.userId);
      res.clearCookie('refreshToken');
      res.status(200).json({ success: true, message: 'All sessions logged out' } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getCurrentUser(req.user!.userId);
      res.status(200).json({ success: true, data: { user } } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.forgotPassword(req.body.email);
      // Always 200 — never reveal whether the email exists
      res.status(200).json({
        success: true,
        message: 'If that email is registered, a reset link has been sent.',
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      res.clearCookie('refreshToken');
      res.status(200).json({
        success: true,
        message: 'Password reset successfully. Please log in with your new password.',
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.verifyEmail(req.body.token);
      res.status(200).json({ success: true, message: 'Email verified successfully.' } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  async resendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.resendVerificationEmail(req.user!.userId);
      res.status(200).json({
        success: true,
        message: 'Verification email sent.',
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

