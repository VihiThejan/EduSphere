import { Request, Response, NextFunction } from 'express';
import { UserModel } from './user.model.js';
import { userService } from './user.service.js';
import { NotFoundError, ValidationError } from '../../shared/utils/errors.js';
import { ApiResponse, USER_ROLES } from '@edusphere/shared';

export class UserController {
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserModel.findById(req.user!.userId);
      if (!user) throw new NotFoundError('User');

      const response: ApiResponse = { success: true, data: { user } };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await userService.getUserProfile(req.user!.userId);
      const response: ApiResponse = { success: true, data: profile };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const profile = await userService.getUserProfile(userId);
      const response: ApiResponse = { success: true, data: profile };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { firstName, lastName, avatar, bio } = req.body;

      if (firstName !== undefined && (typeof firstName !== 'string' || firstName.trim().length < 2)) {
        throw new ValidationError('firstName must be at least 2 characters');
      }
      if (lastName !== undefined && (typeof lastName !== 'string' || lastName.trim().length < 2)) {
        throw new ValidationError('lastName must be at least 2 characters');
      }

      const updates: Record<string, any> = {};
      if (firstName !== undefined) updates['profile.firstName'] = firstName.trim();
      if (lastName !== undefined) updates['profile.lastName'] = lastName.trim();
      if (avatar !== undefined) updates['profile.avatar'] = avatar;
      if (bio !== undefined) updates['profile.bio'] = bio;

      const user = await UserModel.findByIdAndUpdate(
        req.user!.userId,
        { $set: updates },
        { new: true, runValidators: true }
      );
      if (!user) throw new NotFoundError('User');

      const response: ApiResponse = {
        success: true,
        data: { user },
        message: 'Profile updated successfully',
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ── Tutor Approval Workflow ────────────────────────────────────────────────

  /**
   * POST /api/v1/users/request-tutor
   * Any authenticated user (student) requests the tutor role.
   */
  async requestTutorRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await UserModel.findById(userId);
      if (!user) throw new NotFoundError('User');

      if (user.roles.includes(USER_ROLES.TUTOR)) {
        throw new ValidationError('You are already a tutor');
      }
      if (user.tutorRequestStatus === 'pending') {
        throw new ValidationError('You already have a pending tutor request');
      }

      user.tutorRequestStatus = 'pending';
      user.tutorRequestedAt = new Date();
      user.tutorRejectionReason = undefined;
      await user.save();

      const response: ApiResponse = {
        success: true,
        message: 'Tutor request submitted. An admin will review your request.',
        data: { tutorRequestStatus: user.tutorRequestStatus },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/tutor-requests?status=pending
   * Admin: list tutor requests filtered by status.
   */
  async getTutorRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = (req.query.status as string) || 'pending';
      const validStatuses = ['pending', 'approved', 'rejected', 'none'];
      const filterStatus = validStatuses.includes(status) ? status : 'pending';

      const users = await UserModel.find({ tutorRequestStatus: filterStatus })
        .select('email profile roles tutorRequestStatus tutorRequestedAt tutorApprovedAt tutorRejectionReason createdAt')
        .sort({ tutorRequestedAt: -1 })
        .lean();

      const response: ApiResponse = {
        success: true,
        data: { requests: users, total: users.length },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/users/:userId/tutor-request
   * Admin: approve or reject a tutor request.
   * Body: { action: 'approve' | 'reject', reason?: string }
   */
  async resolveTutorRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { action, reason } = req.body as { action: 'approve' | 'reject'; reason?: string };

      if (!['approve', 'reject'].includes(action)) {
        throw new ValidationError('action must be "approve" or "reject"');
      }

      const user = await UserModel.findById(userId);
      if (!user) throw new NotFoundError('User');

      if (user.tutorRequestStatus !== 'pending') {
        throw new ValidationError('No pending tutor request for this user');
      }

      if (action === 'approve') {
        user.tutorRequestStatus = 'approved';
        user.tutorApprovedAt = new Date();
        if (!user.roles.includes(USER_ROLES.TUTOR)) {
          user.roles.push(USER_ROLES.TUTOR);
        }
      } else {
        user.tutorRequestStatus = 'rejected';
        user.tutorRejectionReason = reason?.trim() || 'Request rejected by admin';
      }

      await user.save();

      const response: ApiResponse = {
        success: true,
        message: action === 'approve' ? 'Tutor role granted' : 'Request rejected',
        data: {
          userId: user._id,
          tutorRequestStatus: user.tutorRequestStatus,
          roles: user.roles,
        },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
