import { Course, CourseListResponse } from '@edusphere/shared';
import { apiClient } from './client';

export interface StudentDashboardEnrollment {
  enrollment: {
    _id: string;
    status: string;
    enrolledAt: string;
    progressPercentage: number;
    lastAccessedAt: string;
  };
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
    instructorName?: string;
    totalLessons: number;
  };
  completedLessons: number;
  remainingLessons: number;
}

export interface StudentDashboardData {
  enrollments: StudentDashboardEnrollment[];
  recommendedCourses: Course[];
}

export const dashboardApi = {
  getStudentDashboardData: async (): Promise<StudentDashboardData> => {
    const [enrollmentsResponse, coursesResponse] = await Promise.all([
      apiClient.get<{ enrollments: StudentDashboardEnrollment[] }>('/enrollments/me'),
      apiClient.get<CourseListResponse>('/courses', { limit: 3 }),
    ]);

    return {
      enrollments: enrollmentsResponse.enrollments,
      recommendedCourses: coursesResponse.courses,
    };
  },
};
