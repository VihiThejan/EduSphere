import { Request, Response, NextFunction } from 'express';
import { CourseModel } from './course.model.js';
import { EnrollmentModel } from '../enrollments/enrollment.model.js';
import { UserModel } from '../users/user.model.js';
import { ApiResponse } from '@edusphere/shared';
import { NotFoundError, ValidationError } from '../../shared/utils/errors.js';

export class CertificateController {
  /**
   * GET /api/v1/courses/:courseId/certificate
   * Returns a signed certificate payload for a completed course.
   * The client renders/generates the PDF from this payload.
   */
  async getCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { courseId } = req.params;

      const [enrollment, course, user] = await Promise.all([
        EnrollmentModel.findOne({ userId, courseId }),
        CourseModel.findById(courseId).select('title instructorName category level'),
        UserModel.findById(userId).select('profile email'),
      ]);

      if (!enrollment) throw new NotFoundError('Enrollment');
      if (!course) throw new NotFoundError('Course');
      if (!user) throw new NotFoundError('User');

      if (enrollment.progressPercentage < 100) {
        throw new ValidationError(
          `Course not yet completed (${enrollment.progressPercentage}% progress)`
        );
      }

      const completedAt = enrollment.completedAt ?? enrollment.updatedAt ?? new Date();

      const response: ApiResponse = {
        success: true,
        data: {
          certificate: {
            studentName: `${user.profile.firstName} ${user.profile.lastName}`,
            studentEmail: user.email,
            courseTitle: course.title,
            instructorName: course.instructorName,
            category: course.category,
            level: course.level,
            completedAt: completedAt.toISOString(),
            issuedAt: new Date().toISOString(),
            courseId: course._id,
            userId: user._id,
          },
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const certificateController = new CertificateController();
