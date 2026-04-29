import { UserModel } from './user.model.js';
import { CourseModel } from '../courses/course.model.js';
import { EnrollmentModel } from '../enrollments/enrollment.model.js';
import { CourseReviewModel } from '../reviews/course-review.model.js';
import { NotFoundError } from '../../shared/utils/errors.js';
import { COURSE_STATUS, ENROLLMENT_STATUS } from '@edusphere/shared';
import mongoose from 'mongoose';

export class UserService {
  /**
   * Get a public profile for any user by ID.
   */
  async getUserProfile(userId: string) {
    const user = await UserModel.findById(userId).select(
      'profile roles email createdAt isMarketplaceSeller'
    );

    if (!user) {
      throw new NotFoundError('User');
    }

    const isTutor = user.roles.includes('tutor');

    let totalStudents = 0;
    let totalCourses = 0;
    let avgRating = 0;
    let totalReviews = 0;
    let courses: Array<Record<string, unknown>> = [];

    if (isTutor) {
      const tutorCourses = await CourseModel.find({
        instructorId: userId,
        status: COURSE_STATUS.PUBLISHED,
      })
        .select('title slug thumbnail category level pricing stats tags createdAt')
        .sort({ createdAt: -1 })
        .lean();

      courses = tutorCourses;
      totalCourses = tutorCourses.length;

      for (const c of tutorCourses) {
        totalStudents += (c.stats as any)?.enrollmentCount ?? 0;
      }

      // Aggregate tutor-wide rating
      const ratingAgg = await CourseReviewModel.aggregate([
        { $match: { instructorId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ]);

      if (ratingAgg.length > 0) {
        avgRating = Math.round((ratingAgg[0].avgRating as number) * 10) / 10;
        totalReviews = ratingAgg[0].count as number;
      }
    } else {
      totalCourses = await EnrollmentModel.countDocuments({
        userId,
        status: { $in: [ENROLLMENT_STATUS.ACTIVE, ENROLLMENT_STATUS.COMPLETED] },
      });
    }

    return {
      user: {
        _id: user._id,
        email: user.email,
        profile: user.profile,
        roles: user.roles,
        createdAt: user.createdAt,
        isMarketplaceSeller: user.isMarketplaceSeller,
      },
      stats: {
        totalStudents,
        totalCourses,
        avgRating,
        totalReviews,
      },
      courses,
    };
  }

  /**
   * Update own profile fields.
   */
  async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; bio?: string; avatar?: string }
  ) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    if (data.firstName !== undefined) user.profile.firstName = data.firstName;
    if (data.lastName !== undefined) user.profile.lastName = data.lastName;
    if (data.bio !== undefined) user.profile.bio = data.bio;
    if (data.avatar !== undefined) user.profile.avatar = data.avatar;

    await user.save();

    return {
      _id: user._id,
      email: user.email,
      profile: user.profile,
      roles: user.roles,
      createdAt: user.createdAt,
    };
  }
}

export const userService = new UserService();
