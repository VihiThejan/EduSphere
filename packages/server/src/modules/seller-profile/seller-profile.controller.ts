import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../../shared/utils/errors.js';
import { sellerProfileService } from './seller-profile.service.js';

export class SellerProfileController {
  async onboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ValidationError('User authentication context missing');
      }

      const profile = await sellerProfileService.onboardSeller(userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Seller onboarding completed',
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ValidationError('User authentication context missing');
      }

      const profile = await sellerProfileService.getMyProfile(userId);

      res.status(200).json({
        success: true,
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ValidationError('User authentication context missing');
      }

      const profile = await sellerProfileService.updateMyProfile(userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Seller profile updated',
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const sellerProfileController = new SellerProfileController();
