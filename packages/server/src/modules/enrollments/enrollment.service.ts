import { EnrollmentModel, IEnrollment } from './enrollment.model.js';
import { CourseModel } from '../courses/course.model.js';
import { LessonModel } from '../courses/lesson.model.js';
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from '../../shared/utils/errors.js';
import { COURSE_STATUS, ENROLLMENT_STATUS, ERROR_CODES } from '@edusphere/shared';
import mongoose from 'mongoose';

export class EnrollmentService {
  async enrollInCourse(userId: string, courseId: string): Promise<IEnrollment> {
    // Check if course exists and is published
    const course = await CourseModel.findById(courseId);

    if (!course) {
      throw new NotFoundError('Course');
    }

    if (course.status !== COURSE_STATUS.PUBLISHED) {
      throw new ValidationError('Cannot enroll in unpublished course');
    }

    // Check if already enrolled
    const existingEnrollment = await EnrollmentModel.findOne({ userId, courseId });

    if (existingEnrollment) {
      throw new ConflictError('Already enrolled in this course');
    }

    // Create enrollment
    const enrollment = await EnrollmentModel.create({
      userId,
      courseId,
      status: ENROLLMENT_STATUS.ACTIVE,
      enrolledAt: new Date(),
    });

    // Update course enrollment count
    await CourseModel.findByIdAndUpdate(courseId, {
      $inc: { 'stats.enrollmentCount': 1 },
    });

    return enrollment;
  }

  async getUserEnrollments(userId: string) {
    const enrollments = await EnrollmentModel.find({
      userId,
      status: ENROLLMENT_STATUS.ACTIVE,
    })
      .populate('courseId', 'title thumbnail instructorName stats pricing')
      .sort({ lastAccessedAt: -1 });

    return enrollments.map((enrollment) => {
      const course = enrollment.courseId as any;
      return {
        enrollment: {
          _id: enrollment._id,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          progressPercentage: enrollment.progressPercentage,
          lastAccessedAt: enrollment.lastAccessedAt,
        },
        course: {
          _id: course._id,
          title: course.title,
          thumbnail: course.thumbnail,
          instructorName: course.instructorName,
          totalLessons: course.stats.totalLessons,
        },
        completedLessons: enrollment.completedLessons.length,
        remainingLessons: course.stats.totalLessons - enrollment.completedLessons.length,
      };
    });
  }

  async getCourseProgress(userId: string, courseId: string) {
    const enrollment = await EnrollmentModel.findOne({ userId, courseId }).populate(
      'courseId',
      'title thumbnail stats'
    );

    if (!enrollment) {
      throw new NotFoundError('Enrollment');
    }

    const course = enrollment.courseId as any;
    const lessons = await LessonModel.find({ courseId }).sort({ order: 1 });

    return {
      enrollment: {
        _id: enrollment._id,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        progressPercentage: enrollment.progressPercentage,
        completedLessons: enrollment.completedLessons,
      },
      course: {
        _id: course._id,
        title: course.title,
        thumbnail: course.thumbnail,
        totalLessons: course.stats.totalLessons,
      },
      lessons: lessons.map((lesson) => ({
        _id: lesson._id,
        title: lesson.title,
        order: lesson.order,
        duration: lesson.duration,
        isCompleted: enrollment.completedLessons.some(
          (id) => id.toString() === lesson._id.toString()
        ),
      })),
    };
  }

  async markLessonCompleted(
    userId: string,
    courseId: string,
    lessonId: string
  ): Promise<IEnrollment> {
    // Find enrollment
    const enrollment = await EnrollmentModel.findOne({ userId, courseId });

    if (!enrollment) {
      throw new NotFoundError('Enrollment');
    }

    // Verify lesson belongs to course
    const lesson = await LessonModel.findOne({ _id: lessonId, courseId });

    if (!lesson) {
      throw new NotFoundError('Lesson');
    }

    // Mark lesson as completed
    await enrollment.markLessonCompleted(new mongoose.Types.ObjectId(lessonId));

    // Recalculate progress
    const course = await CourseModel.findById(courseId);
    if (course) {
      enrollment.progressPercentage = enrollment.calculateProgress(course.stats.totalLessons);

      // Check if course is completed
      if (enrollment.progressPercentage === 100 && !enrollment.completedAt) {
        enrollment.completedAt = new Date();
        enrollment.status = ENROLLMENT_STATUS.COMPLETED;
      }

      await enrollment.save();
    }

    return enrollment;
  }

  async checkEnrollment(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await EnrollmentModel.findOne({
      userId,
      courseId,
      status: ENROLLMENT_STATUS.ACTIVE,
    });

    return !!enrollment;
  }
}

export const enrollmentService = new EnrollmentService();
