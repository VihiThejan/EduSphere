import { Course, CourseListResponse } from '@edusphere/shared';
import { apiClient } from './client';
import mockCourses from '@/data/mock/courses.json';
import mockDashboard from '@/data/mock/dashboard.json';

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

export interface MyLearningEnrollment {
  enrollment: {
    _id: string;
    status: string;
    enrolledAt: string;
    completedAt?: string;
    progressPercentage: number;
    lastAccessedAt: string;
    certificateIssued: boolean;
  };
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
    instructorName?: string;
    totalLessons: number;
    category?: string;
    level?: string;
  };
  completedLessons: number;
  remainingLessons: number;
  hasStarted: boolean;
}

export interface StudentDashboardData {
  enrollments: StudentDashboardEnrollment[];
  recommendedCourses: Course[];
}

interface MockDashboardPayload {
  enrollments: StudentDashboardEnrollment[];
  recommendedCourses: string[];
}

const dashboardData = mockDashboard as MockDashboardPayload;
const courseData = mockCourses as unknown as Course[];

const getMockRecommendations = (): Course[] =>
  dashboardData.recommendedCourses
    .map((id) => courseData.find((course) => course._id === id))
    .filter((course): course is Course => !!course);

export const dashboardApi = {
  getStudentDashboardData: async (): Promise<StudentDashboardData> => {
    try {
      const [enrollmentsResponse, coursesResponse] = await Promise.all([
        apiClient.get<{ enrollments: StudentDashboardEnrollment[] }>('/enrollments/me'),
        apiClient.get<CourseListResponse>('/courses', { limit: 3 }),
      ]);

      const enrollments = enrollmentsResponse?.enrollments ?? [];
      const recommendedCourses = coursesResponse?.courses ?? [];

      return {
        enrollments,
        recommendedCourses:
          recommendedCourses.length > 0 ? recommendedCourses : getMockRecommendations(),
      };
    } catch {
      return {
        enrollments: [],
        recommendedCourses: getMockRecommendations(),
      };
    }
  },

  getMyLearning: async (status?: string): Promise<MyLearningEnrollment[]> => {
    try {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      const response = await apiClient.get<{ enrollments: MyLearningEnrollment[] }>(
        '/enrollments/my-learning',
        params
      );
      return response?.enrollments ?? [];
    } catch {
      return [];
    }
  },

  dropCourse: async (courseId: string): Promise<void> => {
    await apiClient.patch(`/enrollments/courses/${encodeURIComponent(courseId)}/drop`);
  },

  reEnrollCourse: async (courseId: string): Promise<void> => {
    await apiClient.patch(`/enrollments/courses/${encodeURIComponent(courseId)}/re-enroll`);
  },

  deleteEnrollment: async (courseId: string): Promise<void> => {
    await apiClient.delete(`/enrollments/courses/${encodeURIComponent(courseId)}`);
  },
};
