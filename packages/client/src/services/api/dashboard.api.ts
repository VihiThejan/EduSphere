import { Course, CourseListResponse } from '@edusphere/shared';
import { apiClient } from './client';
import mockCourses from '@/data/mock/courses.json';
import mockDashboard from '@/data/mock/dashboard.json';
import { getMockEnrollmentIds } from './courses.api';

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

interface MockDashboardPayload {
  enrollments: StudentDashboardEnrollment[];
  recommendedCourses: string[];
}

const dashboardData = mockDashboard as MockDashboardPayload;
const courseData = mockCourses as unknown as Course[];

const toDashboardEnrollment = (course: Course): StudentDashboardEnrollment => ({
  enrollment: {
    _id: `mock-enrollment-${course._id}`,
    status: 'active',
    enrolledAt: new Date().toISOString(),
    progressPercentage: 0,
    lastAccessedAt: new Date().toISOString(),
  },
  course: {
    _id: course._id,
    title: course.title,
    thumbnail: course.thumbnail,
    instructorName: course.instructorName,
    totalLessons: course.stats.totalLessons,
  },
  completedLessons: 0,
  remainingLessons: course.stats.totalLessons,
});

const mergeUniqueEnrollments = (
  baseEnrollments: StudentDashboardEnrollment[],
  additionalEnrollments: StudentDashboardEnrollment[]
): StudentDashboardEnrollment[] => {
  const byCourseId = new Map<string, StudentDashboardEnrollment>();

  for (const enrollment of [...baseEnrollments, ...additionalEnrollments]) {
    byCourseId.set(enrollment.course._id, enrollment);
  }

  return Array.from(byCourseId.values());
};

const getLocallyEnrolledCourses = (): StudentDashboardEnrollment[] => {
  const enrolledIds = getMockEnrollmentIds();
  return enrolledIds
    .map((id) => courseData.find((course) => course._id === id))
    .filter((course): course is Course => !!course)
    .map(toDashboardEnrollment);
};

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
      const localEnrollments = getLocallyEnrolledCourses();
      const fallbackEnrollments = mergeUniqueEnrollments(dashboardData.enrollments, localEnrollments);
      const mergedServerEnrollments = mergeUniqueEnrollments(enrollments, localEnrollments);

      if (enrollments.length === 0 && recommendedCourses.length === 0) {
        return {
          enrollments: fallbackEnrollments,
          recommendedCourses: getMockRecommendations(),
        };
      }

      return {
        enrollments: enrollments.length > 0 ? mergedServerEnrollments : fallbackEnrollments,
        recommendedCourses:
          recommendedCourses.length > 0 ? recommendedCourses : getMockRecommendations(),
      };
    } catch {
      const localEnrollments = getLocallyEnrolledCourses();
      return {
        enrollments: mergeUniqueEnrollments(dashboardData.enrollments, localEnrollments),
        recommendedCourses: getMockRecommendations(),
      };
    }
  },
};
