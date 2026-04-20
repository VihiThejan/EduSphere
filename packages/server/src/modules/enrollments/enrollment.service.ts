import { EnrollmentModel, IEnrollment } from './enrollment.model.js';
import { LessonProgressModel } from './lesson-progress.model.js';
import { CourseModel } from '../courses/course.model.js';
import { LessonModel } from '../courses/lesson.model.js';
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from '../../shared/utils/errors.js';
import { COURSE_STATUS, ENROLLMENT_STATUS } from '@edusphere/shared';
import mongoose from 'mongoose';

/** Auto-complete lesson when student has watched this percentage of the video */
const AUTO_COMPLETE_THRESHOLD = 90;

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
      if (existingEnrollment.status === ENROLLMENT_STATUS.DROPPED) {
        // Re-enroll: reset to fresh state
        existingEnrollment.status = ENROLLMENT_STATUS.ACTIVE;
        existingEnrollment.completedLessons = [];
        existingEnrollment.progressPercentage = 0;
        existingEnrollment.completedAt = undefined;
        existingEnrollment.enrolledAt = new Date();
        existingEnrollment.lastAccessedAt = new Date();
        await existingEnrollment.save();

        // Clear old watch progress
        await LessonProgressModel.deleteMany({ userId, courseId });

        // Increment enrollment count
        await CourseModel.findByIdAndUpdate(courseId, {
          $inc: { 'stats.enrollmentCount': 1 },
        });

        return existingEnrollment;
      }
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

  async getAllUserEnrollments(userId: string, status?: string) {
    const filter: Record<string, unknown> = { userId };
    if (status && Object.values(ENROLLMENT_STATUS).includes(status as any)) {
      filter.status = status;
    }

    const enrollments = await EnrollmentModel.find(filter)
      .populate('courseId', 'title thumbnail instructorName stats pricing category level')
      .sort({ enrolledAt: -1 });

    // Determine which courses the student has started watching (any LessonProgress record)
    const enrollmentCourseIds = enrollments
      .map((e) => (e.courseId as any)?._id)
      .filter(Boolean);
    const startedCourseIds = await LessonProgressModel.distinct('courseId', {
      userId,
      courseId: { $in: enrollmentCourseIds },
    });
    const startedSet = new Set(startedCourseIds.map((id) => id.toString()));

    return enrollments.map((enrollment) => {
      const course = enrollment.courseId as any;
      if (!course) return null;
      return {
        enrollment: {
          _id: enrollment._id,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt,
          progressPercentage: enrollment.progressPercentage,
          lastAccessedAt: enrollment.lastAccessedAt,
          certificateIssued: enrollment.certificateIssued,
        },
        course: {
          _id: course._id,
          title: course.title,
          thumbnail: course.thumbnail,
          instructorName: course.instructorName,
          totalLessons: course.stats?.totalLessons ?? 0,
          category: course.category,
          level: course.level,
        },
        completedLessons: enrollment.completedLessons.length,
        remainingLessons: Math.max(0, (course.stats?.totalLessons ?? 0) - enrollment.completedLessons.length),
        hasStarted: startedSet.has(course._id.toString()),
      };
    }).filter(Boolean);
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

    // Fetch all watch progress for this user + course in one query
    const watchProgressRecords = await LessonProgressModel.find({
      userId,
      courseId,
    });
    const watchMap = new Map(
      watchProgressRecords.map((wp) => [wp.lessonId.toString(), wp])
    );

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
      lessons: lessons.map((lesson) => {
        const wp = watchMap.get(lesson._id.toString());
        return {
          _id: lesson._id,
          title: lesson.title,
          order: lesson.order,
          duration: lesson.duration,
          isCompleted: enrollment.completedLessons.some(
            (id) => id.toString() === lesson._id.toString()
          ),
          watchProgress: wp
            ? {
                watchedPosition: wp.watchedPosition,
                totalWatchTime: wp.totalWatchTime,
                videoDuration: wp.videoDuration,
                watchPercentage: wp.watchPercentage,
                lastWatchedAt: wp.lastWatchedAt,
              }
            : null,
        };
      }),
    };
  }

  /**
   * Save video watch progress. Called periodically (~10s) by the client
   * while the student is watching a lesson video.
   *
   * Behaviour matching Udemy/Coursera:
   * - Saves current playback position so the student can resume later
   * - Tracks total accumulated watch time
   * - Calculates watch percentage
   * - Auto-completes the lesson when ≥90% of the video has been watched
   */
  async saveWatchProgress(
    userId: string,
    courseId: string,
    lessonId: string,
    watchedPosition: number,
    videoDuration: number
  ) {
    // Validate enrollment exists
    const enrollment = await EnrollmentModel.findOne({ userId, courseId });
    if (!enrollment) {
      throw new NotFoundError('Enrollment');
    }

    // Validate lesson belongs to course
    const lesson = await LessonModel.findOne({ _id: lessonId, courseId });
    if (!lesson) {
      throw new NotFoundError('Lesson');
    }

    // Clamp values
    const safeDuration = Math.max(videoDuration, 1);
    const safePosition = Math.max(0, Math.min(watchedPosition, safeDuration));
    const watchPercentage = Math.round((safePosition / safeDuration) * 100);

    // Upsert watch progress record
    const existing = await LessonProgressModel.findOne({ userId, lessonId });
    let lessonProgress;

    if (existing) {
      // Only update position forward (prevent rewinding from lowering progress)
      // But always update watchedPosition for resume
      const timeIncrement = Math.max(0, safePosition - (existing.watchedPosition || 0));
      existing.watchedPosition = safePosition;
      existing.totalWatchTime += timeIncrement > 0 ? timeIncrement : 0;
      existing.videoDuration = safeDuration;
      existing.watchPercentage = Math.max(existing.watchPercentage, watchPercentage);
      existing.lastWatchedAt = new Date();
      lessonProgress = await existing.save();
    } else {
      lessonProgress = await LessonProgressModel.create({
        userId,
        courseId,
        lessonId,
        watchedPosition: safePosition,
        totalWatchTime: safePosition,
        videoDuration: safeDuration,
        watchPercentage,
        lastWatchedAt: new Date(),
      });
    }

    // Update enrollment's lastAccessedAt
    enrollment.lastAccessedAt = new Date();
    await enrollment.save();

    // Auto-complete if threshold reached and not already completed
    let autoCompleted = false;
    const effectivePercentage = lessonProgress.watchPercentage;
    const alreadyCompleted = enrollment.completedLessons.some(
      (id) => id.toString() === lessonId
    );

    if (effectivePercentage >= AUTO_COMPLETE_THRESHOLD && !alreadyCompleted) {
      await enrollment.markLessonCompleted(new mongoose.Types.ObjectId(lessonId));

      // Recalculate course progress
      const course = await CourseModel.findById(courseId);
      if (course) {
        enrollment.progressPercentage = enrollment.calculateProgress(course.stats.totalLessons);

        if (enrollment.progressPercentage === 100 && !enrollment.completedAt) {
          enrollment.completedAt = new Date();
          enrollment.status = ENROLLMENT_STATUS.COMPLETED;
        }

        await enrollment.save();
      }

      lessonProgress.autoCompleted = true;
      await lessonProgress.save();
      autoCompleted = true;
    }

    return {
      watchedPosition: lessonProgress.watchedPosition,
      totalWatchTime: lessonProgress.totalWatchTime,
      watchPercentage: lessonProgress.watchPercentage,
      autoCompleted,
      courseProgress: enrollment.progressPercentage,
      courseStatus: enrollment.status,
    };
  }

  /**
   * Get watch progress for a single lesson (used to resume video).
   */
  async getLessonWatchProgress(userId: string, courseId: string, lessonId: string) {
    const progress = await LessonProgressModel.findOne({ userId, lessonId });

    return {
      watchedPosition: progress?.watchedPosition ?? 0,
      totalWatchTime: progress?.totalWatchTime ?? 0,
      videoDuration: progress?.videoDuration ?? 0,
      watchPercentage: progress?.watchPercentage ?? 0,
      lastWatchedAt: progress?.lastWatchedAt ?? null,
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

  async checkEnrollment(userId: string, courseId: string): Promise<{ isEnrolled: boolean; status: string | null }> {
    const enrollment = await EnrollmentModel.findOne({
      userId,
      courseId,
    });

    return {
      isEnrolled: !!enrollment,
      status: enrollment?.status ?? null,
    };
  }

  async dropEnrollment(userId: string, courseId: string): Promise<IEnrollment> {
    const enrollment = await EnrollmentModel.findOne({
      userId,
      courseId,
      status: ENROLLMENT_STATUS.ACTIVE,
    });

    if (!enrollment) {
      throw new NotFoundError('Enrollment');
    }

    enrollment.status = ENROLLMENT_STATUS.DROPPED;
    await enrollment.save();

    // Decrement course enrollment count
    await CourseModel.findByIdAndUpdate(courseId, {
      $inc: { 'stats.enrollmentCount': -1 },
    });

    return enrollment;
  }

  /**
   * Re-enroll in a previously dropped course.
   * Resets progress, clears completed lessons and watch history so the
   * student starts fresh.
   */
  async reEnroll(userId: string, courseId: string): Promise<IEnrollment> {
    const enrollment = await EnrollmentModel.findOne({
      userId,
      courseId,
      status: ENROLLMENT_STATUS.DROPPED,
    });

    if (!enrollment) {
      throw new NotFoundError('Enrollment');
    }

    // Verify course is still published
    const course = await CourseModel.findById(courseId);
    if (!course || course.status !== COURSE_STATUS.PUBLISHED) {
      throw new ValidationError('Cannot re-enroll: course is no longer available');
    }

    // Reset enrollment to fresh state
    enrollment.status = ENROLLMENT_STATUS.ACTIVE;
    enrollment.completedLessons = [];
    enrollment.progressPercentage = 0;
    enrollment.completedAt = undefined;
    enrollment.lastAccessedAt = new Date();
    await enrollment.save();

    // Clear all watch progress for this user + course
    await LessonProgressModel.deleteMany({ userId, courseId });

    // Increment course enrollment count
    await CourseModel.findByIdAndUpdate(courseId, {
      $inc: { 'stats.enrollmentCount': 1 },
    });

    return enrollment;
  }

  /**
   * Permanently delete a dropped enrollment and all associated watch history.
   */
  async deleteEnrollment(userId: string, courseId: string): Promise<void> {
    const enrollment = await EnrollmentModel.findOne({
      userId,
      courseId,
      status: { $in: [ENROLLMENT_STATUS.DROPPED, ENROLLMENT_STATUS.COMPLETED] },
    });

    if (!enrollment) {
      throw new NotFoundError('Enrollment');
    }

    // Delete all watch progress for this user + course
    await LessonProgressModel.deleteMany({ userId, courseId });

    // Delete the enrollment record
    await enrollment.deleteOne();
  }
}

export const enrollmentService = new EnrollmentService();
