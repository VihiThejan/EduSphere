import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  CourseStatus,
  CourseCategory,
  CourseLevel,
  COURSE_STATUS,
  COURSE_CATEGORIES,
  COURSE_LEVELS,
} from '@edusphere/shared';

export interface ICoursePricing {
  amount: number;
  currency: string;
  discountPrice?: number;
}

export interface ICourseStats {
  enrollmentCount: number;
  avgRating: number;
  reviewCount: number;
  totalLessons: number;
  totalDuration: number;
}

export interface ICourse extends Document {
  title: string;
  slug: string;
  instructorId: mongoose.Types.ObjectId;
  instructorName: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  pricing: ICoursePricing;
  thumbnail?: string;
  status: CourseStatus;
  tags: string[];
  stats: ICourseStats;
  lessonIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const coursePricingSchema = new Schema<ICoursePricing>(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'LKR',
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

const courseStatsSchema = new Schema<ICourseStats>(
  {
    enrollmentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalLessons: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    instructorName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 5000,
    },
    category: {
      type: String,
      required: true,
      enum: COURSE_CATEGORIES,
      index: true,
    },
    level: {
      type: String,
      required: true,
      enum: COURSE_LEVELS,
    },
    pricing: {
      type: coursePricingSchema,
      required: true,
    },
    thumbnail: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(COURSE_STATUS),
      default: COURSE_STATUS.DRAFT,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: [(val: string[]) => val.length <= 10, 'Maximum 10 tags allowed'],
    },
    stats: {
      type: courseStatsSchema,
      default: () => ({}),
    },
    lessonIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ instructorId: 1, status: 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for instructor populated
courseSchema.virtual('instructor', {
  ref: 'User',
  localField: 'instructorId',
  foreignField: '_id',
  justOne: true,
});

export const CourseModel: Model<ICourse> = mongoose.model<ICourse>('Course', courseSchema);
