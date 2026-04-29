import mongoose, { Schema, Document } from 'mongoose';

export interface ICourseReview extends Document {
  courseId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  instructorId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const courseReviewSchema = new Schema<ICourseReview>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// One review per student per course
courseReviewSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

// Fast lookup: all reviews across a tutor's courses, newest first
courseReviewSchema.index({ instructorId: 1, createdAt: -1 });

export const CourseReviewModel = mongoose.model<ICourseReview>(
  'CourseReview',
  courseReviewSchema
);
