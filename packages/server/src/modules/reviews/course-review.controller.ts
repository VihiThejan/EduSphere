import { Request, Response, NextFunction } from 'express';
import { courseReviewService } from './course-review.service.js';
import { ApiResponse } from '@edusphere/shared';

export class CourseReviewController {
  async submitReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user!.userId;
      const { courseId } = req.params;
      const { rating, comment } = req.body;

      const review = await courseReviewService.submitReview(
        studentId,
        courseId,
        Number(rating),
        comment
      );

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

  async updateReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user!.userId;
      const { courseId } = req.params;
      const { rating, comment } = req.body;

      const review = await courseReviewService.updateReview(
        studentId,
        courseId,
        Number(rating),
        comment
      );

      const response: ApiResponse = {
        success: true,
        data: { review },
        message: 'Review updated successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user!.userId;
      const { courseId } = req.params;

      await courseReviewService.deleteReview(studentId, courseId);

      const response: ApiResponse = {
        success: true,
        data: null,
        message: 'Review deleted successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getMyReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.user!.userId;
      const { courseId } = req.params;

      const review = await courseReviewService.getMyReview(studentId, courseId);

      const response: ApiResponse = {
        success: true,
        data: { review },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCourseReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

      const result = await courseReviewService.getCourseReviews(courseId, page, limit);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getTutorReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instructorId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

      const result = await courseReviewService.getTutorReviews(instructorId, page, limit);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const courseReviewController = new CourseReviewController();
