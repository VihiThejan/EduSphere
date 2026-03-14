import { Course, CourseFilters, CourseListResponse, Lesson } from '@edusphere/shared';
import { apiClient } from './client';

export interface CourseCatalogParams extends CourseFilters {
  page?: number;
  limit?: number;
}

export const coursesApi = {
  getCourses: async (params: CourseCatalogParams): Promise<CourseListResponse> => {
    return apiClient.get<CourseListResponse>('/courses', params);
  },

  getCourse: async (courseId: string): Promise<Course> => {
    return apiClient.get<Course>(`/courses/${courseId}`);
  },

  getLessons: async (courseId: string): Promise<Lesson[]> => {
    return apiClient.get<Lesson[]>(`/courses/${courseId}/lessons`);
  },

  enrollInCourse: async (courseId: string): Promise<{ enrollment: { _id: string } }> => {
    return apiClient.post<{ enrollment: { _id: string } }>(`/enrollments/courses/${courseId}/enroll`);
  },
};
