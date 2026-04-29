import { Request, Response, NextFunction } from 'express';
import { reviewService } from './review.service.js';
import { ApiResponse } from '@edusphere/shared';

export class ReviewController {
  async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user!.userId;
      const review = await reviewService.createReview(buyerId, req.body);

      const response: ApiResponse = {
        success: true,
        data: { review },
        message: 'Review submitted successfully',
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getReviewsForItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { itemId } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const result = await reviewService.getReviewsForItem(itemId, page, limit);

      const response: ApiResponse = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user!.userId;
      const { reviewId } = req.params;

      await reviewService.deleteReview(reviewId, buyerId);

      const response: ApiResponse = {
        success: true,
        message: 'Review deleted successfully',
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const reviewController = new ReviewController();
