import mongoose, { Schema, Document, Model } from 'mongoose';
import { EnrollmentStatus, ENROLLMENT_STATUS } from '@edusphere/shared';

export interface IEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  status: EnrollmentStatus;
  enrolledAt: Date;
  completedAt?: Date;
  completedLessons: mongoose.Types.ObjectId[];
  progressPercentage: number;
  lastAccessedAt: Date;
  certificateIssued: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  calculateProgress(totalLessons: number): number;
  markLessonCompleted(lessonId: mongoose.Types.ObjectId): Promise<void>;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(ENROLLMENT_STATUS),
      default: ENROLLMENT_STATUS.ACTIVE,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    completedLessons: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
      default: [],
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate enrollments
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Index for querying user's active enrollments
enrollmentSchema.index({ userId: 1, status: 1 });

// Index for course enrollment stats
enrollmentSchema.index({ courseId: 1, status: 1 });

// Instance methods
enrollmentSchema.methods.calculateProgress = function (totalLessons: number): number {
  if (totalLessons === 0) return 0;
  return Math.round((this.completedLessons.length / totalLessons) * 100);
};

enrollmentSchema.methods.markLessonCompleted = async function (
  lessonId: mongoose.Types.ObjectId
): Promise<void> {
  if (!this.completedLessons.includes(lessonId)) {
    this.completedLessons.push(lessonId);
    this.lastAccessedAt = new Date();
    await this.save();
  }
};

export const EnrollmentModel: Model<IEnrollment> = mongoose.model<IEnrollment>(
  'Enrollment',
  enrollmentSchema
);
