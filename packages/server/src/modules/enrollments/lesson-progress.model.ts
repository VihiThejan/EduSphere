import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILessonProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
  /** Last playback position in seconds */
  watchedPosition: number;
  /** Total accumulated watch time in seconds */
  totalWatchTime: number;
  /** Video duration in seconds (cached from lesson) */
  videoDuration: number;
  /** Percentage of video watched (0-100) */
  watchPercentage: number;
  /** Whether this lesson has been auto-completed via watch threshold */
  autoCompleted: boolean;
  lastWatchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const lessonProgressSchema = new Schema<ILessonProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    watchedPosition: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalWatchTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    videoDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
    watchPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    autoCompleted: {
      type: Boolean,
      default: false,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// One progress entry per user+lesson
lessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

// Fast lookup: all lessons for a user in a course
lessonProgressSchema.index({ userId: 1, courseId: 1 });

export const LessonProgressModel: Model<ILessonProgress> = mongoose.model<ILessonProgress>(
  'LessonProgress',
  lessonProgressSchema
);
