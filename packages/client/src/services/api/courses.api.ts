import { Course, CourseFilters, CourseListResponse, Lesson } from '@edusphere/shared';
import { apiClient } from './client';
import mockCourses from '@/data/mock/courses.json';
import mockLessonsByCourse from '@/data/mock/lessons.json';

export interface CourseCatalogParams extends CourseFilters {
  page?: number;
  limit?: number;
}

export interface CourseProgressLesson {
  _id: string;
  title: string;
  order: number;
  duration: number;
  isCompleted: boolean;
  watchProgress: {
    watchedPosition: number;
    totalWatchTime: number;
    videoDuration: number;
    watchPercentage: number;
    lastWatchedAt: string;
  } | null;
}

export interface CourseProgressResponse {
  enrollment: {
    _id: string;
    status: string;
    enrolledAt: string;
    progressPercentage: number;
    completedLessons: string[];
  };
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
    totalLessons: number;
  };
  lessons: CourseProgressLesson[];
}

export interface WatchProgressResponse {
  watchedPosition: number;
  totalWatchTime: number;
  watchPercentage: number;
  autoCompleted: boolean;
  courseProgress: number;
  courseStatus: string;
}

export interface LessonWatchProgress {
  watchedPosition: number;
  totalWatchTime: number;
  videoDuration: number;
  watchPercentage: number;
  lastWatchedAt: string | null;
}

const asCourses = mockCourses as unknown as Course[];
const asLessonsByCourse = mockLessonsByCourse as unknown as Record<string, Lesson[]>;

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
      const response = await apiClient.get<{ course: Course }>(`/courses/${courseId}`);

      if (!response?.course?._id) {
        return fallback();
      }

      return response.course;
    } catch {
      return fallback();
    }
  },

  getLessons: async (courseId: string): Promise<Lesson[]> => {
    const fallback = () => [...(asLessonsByCourse[courseId] ?? [])].sort((a, b) => a.order - b.order);

    try {
      const response = await apiClient.get<{ lessons: Lesson[] }>(`/courses/${courseId}/lessons`);

      const lessons = response?.lessons;
      if (!lessons || lessons.length === 0) {
        return fallback();
      }

      return [...lessons].sort((a, b) => a.order - b.order);
    } catch {
      return fallback();
    }
  },

  enrollInCourse: async (courseId: string): Promise<{ enrollment: { _id: string } }> => {
    return apiClient.post<{ enrollment: { _id: string } }>(`/enrollments/courses/${courseId}/enroll`);
  },

  checkEnrollment: async (courseId: string): Promise<{ isEnrolled: boolean; status: string | null }> => {
    try {
      const response = await apiClient.get<{ isEnrolled: boolean; status: string | null }>(`/enrollments/courses/${courseId}/check`);
      return response ?? { isEnrolled: false, status: null };
    } catch {
      return { isEnrolled: false, status: null };
    }
  },

  getCourseProgress: async (courseId: string): Promise<CourseProgressResponse | null> => {
    try {
      const response = await apiClient.get<CourseProgressResponse>(
        `/enrollments/courses/${courseId}/progress`
      );
      return response ?? null;
    } catch {
      return null;
    }
  },

  markLessonCompleted: async (
    courseId: string,
    lessonId: string
  ): Promise<{ enrollment: { progressPercentage: number; status: string } }> => {
    return apiClient.post<{ enrollment: { progressPercentage: number; status: string } }>(
      `/enrollments/courses/${courseId}/lessons/${lessonId}/complete`
    );
  },

  saveWatchProgress: async (
    courseId: string,
    lessonId: string,
    watchedPosition: number,
    videoDuration: number
  ): Promise<WatchProgressResponse> => {
    return apiClient.put<WatchProgressResponse>(
      `/enrollments/courses/${courseId}/lessons/${lessonId}/watch-progress`,
      { watchedPosition, videoDuration }
    );
  },

  getLessonWatchProgress: async (
    courseId: string,
    lessonId: string
  ): Promise<LessonWatchProgress> => {
    try {
      const response = await apiClient.get<LessonWatchProgress>(
        `/enrollments/courses/${courseId}/lessons/${lessonId}/watch-progress`
      );
      return response ?? { watchedPosition: 0, totalWatchTime: 0, videoDuration: 0, watchPercentage: 0, lastWatchedAt: null };
    } catch {
      return { watchedPosition: 0, totalWatchTime: 0, videoDuration: 0, watchPercentage: 0, lastWatchedAt: null };
    }
  },
};
