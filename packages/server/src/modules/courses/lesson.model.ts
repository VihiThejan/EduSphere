import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILesson extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  duration: number;
  videoId?: mongoose.Types.ObjectId;
  content?: string;
  isFree: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    duration: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
    },
    content: {
      type: String,
      trim: true,
      maxlength: 10000,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for course and order
lessonSchema.index({ courseId: 1, order: 1 }, { unique: true });

export const LessonModel: Model<ILesson> = mongoose.model<ILesson>('Lesson', lessonSchema);
