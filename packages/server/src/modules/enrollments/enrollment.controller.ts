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

      const result = await enrollmentService.checkEnrollment(userId, courseId);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAllUserEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const status = req.query.status as string | undefined;
      const enrollments = await enrollmentService.getAllUserEnrollments(userId, status);

      const response: ApiResponse = {
        success: true,
        data: { enrollments },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async dropEnrollment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { courseId } = req.params;

      const enrollment = await enrollmentService.dropEnrollment(userId, courseId);

      const response: ApiResponse = {
        success: true,
        data: { enrollment },
        message: 'Course removed from your learning list',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async saveWatchProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { courseId, lessonId } = req.params;
      const { watchedPosition, videoDuration } = req.body;

      if (typeof watchedPosition !== 'number' || typeof videoDuration !== 'number') {
        res.status(400).json({
          success: false,
          message: 'watchedPosition and videoDuration are required numbers',
        });
        return;
      }

      const result = await enrollmentService.saveWatchProgress(
        userId,
        courseId,
        lessonId,
        watchedPosition,
        videoDuration
      );

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getLessonWatchProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { courseId, lessonId } = req.params;

      const progress = await enrollmentService.getLessonWatchProgress(userId, courseId, lessonId);

      const response: ApiResponse = {
        success: true,
        data: progress,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async reEnroll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { courseId } = req.params;

      const enrollment = await enrollmentService.reEnroll(userId, courseId);

      const response: ApiResponse = {
        success: true,
        data: { enrollment },
        message: 'Successfully re-enrolled in course',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteEnrollment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { courseId } = req.params;

      await enrollmentService.deleteEnrollment(userId, courseId);

      const response: ApiResponse = {
        success: true,
        data: null,
        message: 'Enrollment permanently removed',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const enrollmentController = new EnrollmentController();
