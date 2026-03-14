import { Course, CourseCategory, CourseLevel } from '@edusphere/shared';

export interface CatalogFilterState {
  search: string;
  category?: CourseCategory;
  level?: CourseLevel;
  isFree: boolean;
  isPaid: boolean;
  page: number;
}

export interface CatalogCourseCardData {
  course: Course;
  imageUrl: string;
  priceLabel: string;
  ratingLabel: string;
}
