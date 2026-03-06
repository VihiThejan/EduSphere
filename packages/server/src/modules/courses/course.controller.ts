import { Request, Response, NextFunction } from 'express';
import { courseService } from './course.service.js';
import { ApiResponse } from '@edusphere/shared';

export class CourseController {
  async createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const instructorId = req.user!.userId;
      const course = await courseService.createCourse(instructorId, req.body);

      const response: ApiResponse = {
        success: true,
        data: { course },
        message: 'Course created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        category: req.query.category as any,
        level: req.query.level as any,
        search: req.query.search as string,
        instructorId: req.query.instructorId as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await courseService.getCourses(filters);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;

      const course = await courseService.getCourseById(courseId, userId);

      const response: ApiResponse = {
        success: true,
        data: { course },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;
      const instructorId = req.user!.userId;

      const course = await courseService.updateCourse(courseId, instructorId, req.body);

      const response: ApiResponse = {
        success: true,
        data: { course },
        message: 'Course updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;
      const instructorId = req.user!.userId;

      await courseService.deleteCourse(courseId, instructorId);

      const response: ApiResponse = {
        success: true,
        message: 'Course deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCourseLessons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;

      const lessons = await courseService.getCourseLessons(courseId, userId);

      const response: ApiResponse = {
        success: true,
        data: { lessons },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async addLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;
      const instructorId = req.user!.userId;

      const lesson = await courseService.addLesson(courseId, instructorId, req.body);

      const response: ApiResponse = {
        success: true,
        data: { lesson },
        message: 'Lesson added successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const courseController = new CourseController();
