import { Request, Response, NextFunction } from 'express';
import { enrollmentService } from './enrollment.service.js';
import { ApiResponse } from '@edusphere/shared';

export class EnrollmentController {
  async enrollInCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { courseId } = req.params;

      const enrollment = await enrollmentService.enrollInCourse(userId, courseId);

      const response: ApiResponse = {
        success: true,
        data: { enrollment },
        message: 'Successfully enrolled in course',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUserEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const enrollments = await enrollmentService.getUserEnrollments(userId);

      const response: ApiResponse = {
        success: true,
        data: { enrollments },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCourseProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { courseId } = req.params;

      const progress = await enrollmentService.getCourseProgress(userId, courseId);

      const response: ApiResponse = {
        success: true,
        data: progress,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async markLessonCompleted(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { courseId, lessonId } = req.params;

      const enrollment = await enrollmentService.markLessonCompleted(userId, courseId, lessonId);

      const response: ApiResponse = {
        success: true,
        data: { enrollment },
        message: 'Lesson marked as completed',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async checkEnrollment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { courseId } = req.params;

      const isEnrolled = await enrollmentService.checkEnrollment(userId, courseId);

      const response: ApiResponse = {
        success: true,
        data: { isEnrolled },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const enrollmentController = new EnrollmentController();
