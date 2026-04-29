import { Request, Response, NextFunction } from 'express';
import { CourseModel } from './course.model.js';
import { EnrollmentModel } from '../enrollments/enrollment.model.js';
import { LessonProgressModel } from '../enrollments/lesson-progress.model.js';
import { ApiResponse } from '@edusphere/shared';

export class AnalyticsController {
  /**
   * GET /api/v1/courses/analytics/overview
   * Aggregated stats across ALL courses owned by the authenticated tutor.
   */
  async getTutorOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const instructorId = req.user!.userId;

      // All courses by this tutor (any status so totals include drafts)
      const courses = await CourseModel.find({ instructorId }).lean();
      const courseIds = courses.map((c) => c._id);

      const totalCourses = courses.length;
      const publishedCourses = courses.filter((c) => c.status === 'published').length;

      // Enrollment aggregations across all tutor courses
      const enrollmentAgg = await EnrollmentModel.aggregate([
        { $match: { courseId: { $in: courseIds } } },
        {
          $group: {
            _id: null,
            totalEnrollments: { $sum: 1 },
            completedEnrollments: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
          },
        },
      ]);

      const totalEnrollments = enrollmentAgg[0]?.totalEnrollments ?? 0;
      const completedEnrollments = enrollmentAgg[0]?.completedEnrollments ?? 0;
      const completionRate =
        totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

      // Avg rating across all published courses (from stats)
      const ratedCourses = courses.filter((c) => (c.stats?.reviewCount ?? 0) > 0);
      const avgRating =
        ratedCourses.length > 0
          ? Number(
              (
                ratedCourses.reduce((sum, c) => sum + (c.stats?.avgRating ?? 0), 0) /
                ratedCourses.length
              ).toFixed(1)
            )
          : 0;

      // Approximate revenue: sum(pricing.amount * enrollmentCount) for published courses
      const totalRevenueLKR = courses.reduce((sum, c) => {
        return sum + (c.pricing?.amount ?? 0) * (c.stats?.enrollmentCount ?? 0);
      }, 0);

      // Per-course summary (for the table)
      const courseSummaries = await Promise.all(
        courses.map(async (course) => {
          const enrollCount = await EnrollmentModel.countDocuments({ courseId: course._id });
          const completedCount = await EnrollmentModel.countDocuments({
            courseId: course._id,
            status: 'completed',
          });

          return {
            _id: course._id,
            title: course.title,
            status: course.status,
            category: course.category,
            level: course.level,
            pricing: course.pricing,
            thumbnail: course.thumbnail,
            stats: {
              ...course.stats,
              enrollmentCount: enrollCount,
            },
            completionRate:
              enrollCount > 0 ? Math.round((completedCount / enrollCount) * 100) : 0,
            revenueLKR: (course.pricing?.amount ?? 0) * enrollCount,
          };
        })
      );

      const response: ApiResponse = {
        success: true,
        data: {
          overview: {
            totalCourses,
            publishedCourses,
            totalEnrollments,
            completionRate,
            avgRating,
            totalRevenueLKR,
          },
          courses: courseSummaries,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/courses/:courseId/analytics
   * Detailed analytics for a single course owned by the authenticated tutor.
   */
  async getCourseAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const instructorId = req.user!.userId;
      const { courseId } = req.params;

      const course = await CourseModel.findOne({ _id: courseId, instructorId }).lean();
      if (!course) {
        res.status(404).json({ success: false, message: 'Course not found' });
        return;
      }

      // Enrollments over time (last 30 days, grouped by day)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const enrollmentTimeline = await EnrollmentModel.aggregate([
        {
          $match: {
            courseId: course._id,
            enrolledAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$enrolledAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', count: 1, _id: 0 } },
      ]);

      // Status breakdown
      const statusBreakdown = await EnrollmentModel.aggregate([
        { $match: { courseId: course._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      // Average watch percentage per lesson
      const lessonWatchStats = await LessonProgressModel.aggregate([
        { $match: { courseId: course._id } },
        {
          $group: {
            _id: '$lessonId',
            avgWatchPercentage: { $avg: '$watchPercentage' },
            viewCount: { $sum: 1 },
          },
        },
      ]);

      const totalEnrollments = await EnrollmentModel.countDocuments({ courseId: course._id });
      const completedCount = await EnrollmentModel.countDocuments({
        courseId: course._id,
        status: 'completed',
      });

      const response: ApiResponse = {
        success: true,
        data: {
          course: {
            _id: course._id,
            title: course.title,
            status: course.status,
            stats: course.stats,
            pricing: course.pricing,
          },
          analytics: {
            totalEnrollments,
            completedCount,
            completionRate:
              totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100) : 0,
            revenueLKR: (course.pricing?.amount ?? 0) * totalEnrollments,
            enrollmentTimeline,
            statusBreakdown: Object.fromEntries(
              statusBreakdown.map((s) => [s._id, s.count])
            ),
            lessonWatchStats,
          },
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
