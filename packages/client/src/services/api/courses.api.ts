import { Course, CourseFilters, CourseListResponse, Lesson } from '@edusphere/shared';
import { apiClient } from './client';
import mockCourses from '@/data/mock/courses.json';
import mockLessonsByCourse from '@/data/mock/lessons.json';

export interface CourseCatalogParams extends CourseFilters {
  page?: number;
  limit?: number;
}

interface CourseEnrollmentStatus {
  isEnrolled: boolean;
}

const asCourses = mockCourses as unknown as Course[];
const asLessonsByCourse = mockLessonsByCourse as unknown as Record<string, Lesson[]>;
export const MOCK_ENROLLMENTS_STORAGE_KEY = 'mock-course-enrollments';

export const isMongoObjectId = (value: string): boolean => /^[a-f\d]{24}$/i.test(value);

export const getMockEnrollmentIds = (): string[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(MOCK_ENROLLMENTS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

export const setMockEnrollmentIds = (ids: string[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(MOCK_ENROLLMENTS_STORAGE_KEY, JSON.stringify(ids));
};

export const isMockCourseId = (courseId: string): boolean => {
  return !isMongoObjectId(courseId) || asCourses.some((course) => course._id === courseId);
};

const applyFilters = (courses: Course[], params: CourseCatalogParams): Course[] => {
  return courses.filter((course) => {
    const matchesSearch =
      !params.search ||
      course.title.toLowerCase().includes(params.search.toLowerCase()) ||
      course.description.toLowerCase().includes(params.search.toLowerCase());

    const matchesCategory = !params.category || course.category === params.category;
    const matchesLevel = !params.level || course.level === params.level;

    const effectivePrice = course.pricing.discountPrice ?? course.pricing.amount;
    const matchesMinPrice = params.minPrice == null || effectivePrice >= params.minPrice;
    const matchesMaxPrice = params.maxPrice == null || effectivePrice <= params.maxPrice;

    return (
      course.status === 'published' &&
      matchesSearch &&
      matchesCategory &&
      matchesLevel &&
      matchesMinPrice &&
      matchesMaxPrice
    );
  });
};

const paginateCourses = (courses: Course[], page = 1, limit = 10): CourseListResponse => {
  const safeLimit = Math.max(1, limit);
  const safePage = Math.max(1, page);
  const totalItems = courses.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));
  const currentPage = Math.min(safePage, totalPages);
  const start = (currentPage - 1) * safeLimit;

  return {
    courses: courses.slice(start, start + safeLimit),
    pagination: {
      page: currentPage,
      limit: safeLimit,
      totalPages,
      totalItems,
    },
  };
};

export const coursesApi = {
  getCourses: async (params: CourseCatalogParams): Promise<CourseListResponse> => {
    const fallback = () => paginateCourses(applyFilters(asCourses, params), params.page, params.limit);

    try {
      const response = await apiClient.get<CourseListResponse>('/courses', params);

      if (!response?.courses || response.courses.length === 0) {
        return fallback();
      }

      return response;
    } catch {
      return fallback();
    }
  },

  getCourse: async (courseId: string): Promise<Course> => {
    const fallback = () => {
      const course = asCourses.find((item) => item._id === courseId);
      if (!course) {
        throw new Error('Course not found');
      }
      return course;
    };

    try {
      const response = await apiClient.get<Course>(`/courses/${courseId}`);

      if (!response?._id) {
        return fallback();
      }

      return response;
    } catch {
      return fallback();
    }
  },

  getLessons: async (courseId: string): Promise<Lesson[]> => {
    const fallback = () => [...(asLessonsByCourse[courseId] ?? [])].sort((a, b) => a.order - b.order);

    try {
      const response = await apiClient.get<Lesson[]>(`/courses/${courseId}/lessons`);

      if (!response || response.length === 0) {
        return fallback();
      }

      return [...response].sort((a, b) => a.order - b.order);
    } catch {
      return fallback();
    }
  },

  enrollInCourse: async (courseId: string): Promise<{ enrollment: { _id: string } }> => {
    if (isMockCourseId(courseId)) {
      const ids = getMockEnrollmentIds();

      if (!ids.includes(courseId)) {
        ids.push(courseId);
        setMockEnrollmentIds(ids);
      }

      return {
        enrollment: {
          _id: `mock-enrollment-${courseId}`,
        },
      };
    }

    return apiClient.post<{ enrollment: { _id: string } }>(`/enrollments/courses/${courseId}/enroll`);
  },

  checkEnrollment: async (courseId: string): Promise<CourseEnrollmentStatus> => {
    if (isMockCourseId(courseId)) {
      return {
        isEnrolled: getMockEnrollmentIds().includes(courseId),
      };
    }

    return apiClient.get<CourseEnrollmentStatus>(`/enrollments/courses/${courseId}/check`);
  },
};
