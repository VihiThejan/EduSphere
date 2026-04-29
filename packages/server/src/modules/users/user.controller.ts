import { Request, Response, NextFunction } from 'express';
import { UserModel } from './user.model.js';
import { NotFoundError, ValidationError } from '../../shared/utils/errors.js';
import { ApiResponse } from '@edusphere/shared';

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
}

export const userController = new UserController();
