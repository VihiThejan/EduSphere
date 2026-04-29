import { CourseReviewModel } from './course-review.model.js';
import { CourseModel } from '../courses/course.model.js';
import { EnrollmentModel } from '../enrollments/enrollment.model.js';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from '../../shared/utils/errors.js';
import { ENROLLMENT_STATUS } from '@edusphere/shared';
import mongoose from 'mongoose';

interface PopulatedReview {
  _id: mongoose.Types.ObjectId;
  courseId: { _id: mongoose.Types.ObjectId; title?: string } | null;
  studentId: {
    _id: mongoose.Types.ObjectId;
    profile?: { firstName?: string; lastName?: string; avatar?: string };
  } | null;
  instructorId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CourseReviewService {
  async submitReview(
    studentId: string,
    courseId: string,
    rating: number,
    comment?: string
  ) {
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw new ValidationError('Rating must be an integer between 1 and 5');
    }

    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course');
    }

    if (course.instructorId.toString() === studentId) {
      throw new ValidationError('You cannot review your own course');
    }

    const enrollment = await EnrollmentModel.findOne({
      userId: studentId,
      courseId,
      status: { $in: [ENROLLMENT_STATUS.ACTIVE, ENROLLMENT_STATUS.COMPLETED] },
    });
    if (!enrollment) {
      throw new ValidationError(
        'You must be enrolled in this course to leave a review'
      );
    }

    const existing = await CourseReviewModel.findOne({ courseId, studentId });
    if (existing) {
      throw new ConflictError('You have already reviewed this course');
    }

    const review = await CourseReviewModel.create({
      courseId,
      studentId,
      instructorId: course.instructorId,
      rating,
      comment: comment?.trim() || undefined,
    });

    await this.recalculateCourseStats(courseId);

    return review;
  }

  async updateReview(
    studentId: string,
    courseId: string,
    rating: number,
    comment?: string
  ) {
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw new ValidationError('Rating must be an integer between 1 and 5');
    }

    const review = await CourseReviewModel.findOne({ courseId, studentId });
    if (!review) {
      throw new NotFoundError('Review');
    }

    review.rating = rating;
    review.comment = comment?.trim() || undefined;
    await review.save();

    await this.recalculateCourseStats(courseId);

    return review;
  }

  async deleteReview(studentId: string, courseId: string) {
    const review = await CourseReviewModel.findOneAndDelete({ courseId, studentId });
    if (!review) {
      throw new NotFoundError('Review');
    }

    await this.recalculateCourseStats(courseId);
  }

  async getMyReview(studentId: string, courseId: string) {
    const review = await CourseReviewModel.findOne({ courseId, studentId }).lean();
    return review;
  }

  async getCourseReviews(courseId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      CourseReviewModel.find({ courseId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('studentId', 'profile')
        .lean(),
      CourseReviewModel.countDocuments({ courseId }),
    ]);

    const distribution = await CourseReviewModel.aggregate([
      { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    const ratingBreakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const d of distribution) {
      ratingBreakdown[d._id as number] = d.count as number;
    }

    const populated = reviews as unknown as PopulatedReview[];

    return {
      reviews: populated.map((r) => ({
        _id: r._id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        student: r.studentId
          ? {
              _id: r.studentId._id,
              firstName: r.studentId.profile?.firstName ?? 'Anonymous',
              lastName: r.studentId.profile?.lastName ?? '',
              avatar: r.studentId.profile?.avatar,
            }
          : { _id: null, firstName: 'Anonymous', lastName: '' },
      })),
      ratingBreakdown,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        totalItems: total,
      },
    };
  }

  async getTutorReviews(instructorId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      CourseReviewModel.find({ instructorId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('studentId', 'profile')
        .populate('courseId', 'title')
        .lean(),
      CourseReviewModel.countDocuments({ instructorId }),
    ]);

    const statsAgg = await CourseReviewModel.aggregate([
      { $match: { instructorId: new mongoose.Types.ObjectId(instructorId) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const avgRating =
      statsAgg.length > 0
        ? Math.round((statsAgg[0].avgRating as number) * 10) / 10
        : 0;
    const totalReviews = statsAgg.length > 0 ? (statsAgg[0].totalReviews as number) : 0;

    const populated = reviews as unknown as PopulatedReview[];

    return {
      reviews: populated.map((r) => ({
        _id: r._id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        courseName:
          r.courseId && typeof r.courseId === 'object' ? r.courseId.title : undefined,
        student: r.studentId
          ? {
              _id: r.studentId._id,
              firstName: r.studentId.profile?.firstName ?? 'Anonymous',
              lastName: r.studentId.profile?.lastName ?? '',
              avatar: r.studentId.profile?.avatar,
            }
          : { _id: null, firstName: 'Anonymous', lastName: '' },
      })),
      stats: { avgRating, totalReviews },
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        totalItems: total,
      },
    };
  }

  private async recalculateCourseStats(courseId: string) {
    const agg = await CourseReviewModel.aggregate([
      { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const avgRating =
      agg.length > 0 ? Math.round((agg[0].avgRating as number) * 10) / 10 : 0;
    const reviewCount = agg.length > 0 ? (agg[0].reviewCount as number) : 0;

    await CourseModel.findByIdAndUpdate(courseId, {
      'stats.avgRating': avgRating,
      'stats.reviewCount': reviewCount,
    });
  }
}

export const courseReviewService = new CourseReviewService();
