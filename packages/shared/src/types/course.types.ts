import { CourseStatus, CourseCategory, CourseLevel } from '../constants/status';

export interface CoursePricing {
  amount: number;
  currency: string;
  discountPrice?: number;
}

export interface CourseStats {
  enrollmentCount: number;
  avgRating: number;
  reviewCount: number;
  totalLessons: number;
  totalDuration: number; // in minutes
}

export interface Course {
  _id: string;
  title: string;
  slug: string;
  instructorId: string;
  instructorName?: string; // Denormalized for display
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  pricing: CoursePricing;
  thumbnail?: string;
  status: CourseStatus;
  tags: string[];
  stats: CourseStats;
  lessonIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseCreateInput {
  title: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  pricing: CoursePricing;
  thumbnail?: string;
  tags?: string[];
}

export interface CourseUpdateInput {
  title?: string;
  description?: string;
  category?: CourseCategory;
  level?: CourseLevel;
  pricing?: CoursePricing;
  thumbnail?: string;
  tags?: string[];
  status?: CourseStatus;
}

export interface CourseFilters {
  category?: CourseCategory;
  level?: CourseLevel;
  search?: string;
  instructorId?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
}

export interface CoursePagination {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export interface CourseListResponse {
  courses: Course[];
  pagination: CoursePagination;
}
