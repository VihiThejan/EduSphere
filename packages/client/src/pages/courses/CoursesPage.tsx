import React, { startTransition, useDeferredValue } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Clock3,
  LayoutDashboard,
  ListChecks,
  ShoppingBag,
  BarChart3,
  Settings,
} from 'lucide-react';
import { Course, CourseCategory, CourseLevel, USER_ROLES } from '@edusphere/shared';
import { useNavigate } from 'react-router-dom';
import { AppFooter, AppHeader, AppNavItem, AppSidebar } from '@/components/common';
import {
  CatalogFilters,
  CatalogLevelChips,
  CatalogPagination,
  CatalogPromoBanner,
  CourseCatalogCard,
} from '@/components/course-catalog';
import { CatalogCourseCardData } from '@/components/course-catalog/types';
import { coursesApi } from '@/services/api/courses.api';
import { useAuthStore } from '@/store/authStore';

const PAGE_SIZE = 6;

const fallbackImages: Record<CourseCategory, string> = {
  programming:
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80',
  mathematics:
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=900&q=80',
  physics:
    'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=900&q=80',
  chemistry:
    'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=900&q=80',
  biology:
    'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&w=900&q=80',
  engineering:
    'https://images.unsplash.com/photo-1581092919535-7146ff1a5905?auto=format&fit=crop&w=900&q=80',
  business:
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
  design:
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
  languages:
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80',
  other:
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80',
};

const formatPrice = (course: Course) => {
  const amount = course.pricing.discountPrice ?? course.pricing.amount;

  if (amount <= 0) {
    return 'FREE';
  }

  return `LKR ${amount.toLocaleString()}`;
};

const formatRating = (course: Course) => {
  if (course.stats.reviewCount === 0) {
    return 'New';
  }

  return course.stats.avgRating.toFixed(1);
};

const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user, logout } = useAuthStore();

  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<CourseCategory | undefined>();
  const [selectedLevel, setSelectedLevel] = React.useState<CourseLevel | undefined>();
  const [isFree, setIsFree] = React.useState(false);
  const [isPaid, setIsPaid] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = React.useState<string[]>([]);

  const deferredSearch = useDeferredValue(search.trim());
  const canRequestCourses = isFree || isPaid;
  const isStudent = !!user?.roles.includes(USER_ROLES.STUDENT);

  const headerItems: AppNavItem[] = [
    { label: 'Courses', href: '/courses', active: true },
    { label: 'Kuppi', href: '/courses' },
    { label: 'Faculties', href: '/courses' },
    { label: 'My Learning', href: '/dashboard' },
  ];

  const sidebarPrimaryItems: AppNavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Courses', href: '/courses', icon: BookOpen, active: true },
    { label: 'My Learning', href: '#', icon: Clock3 },
    { label: 'Marketplace', href: '#', icon: ShoppingBag },
    { label: 'Listings', href: '#', icon: ListChecks },
  ];

  const sidebarSecondaryItems: AppNavItem[] = [
    { label: 'Analytics', href: '#', icon: BarChart3 },
    { label: 'Settings', href: '#', icon: Settings },
  ];

  const { data, isLoading, isError } = useQuery({
    queryKey: ['courses-catalog', deferredSearch, selectedCategory, selectedLevel, isFree, isPaid, page],
    queryFn: () =>
      coursesApi.getCourses({
        search: deferredSearch || undefined,
        category: selectedCategory,
        level: selectedLevel,
        page,
        limit: PAGE_SIZE,
        maxPrice: isFree && !isPaid ? 0 : undefined,
        minPrice: !isFree && isPaid ? 0.01 : undefined,
      }),
    enabled: canRequestCourses,
  });

  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => coursesApi.enrollInCourse(courseId),
    onSuccess: (_, courseId) => {
      setEnrolledCourseIds((current) => [...current, courseId]);
      setFeedbackMessage('Enrollment successful. The course is now in your learning dashboard.');
      void queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
    },
    onError: () => {
      setFeedbackMessage('Unable to enroll right now. Please log in as a student and try again.');
    },
  });

  const cards: CatalogCourseCardData[] = (data?.courses ?? []).map((course) => ({
    course,
    imageUrl: course.thumbnail || fallbackImages[course.category],
    priceLabel: formatPrice(course),
    ratingLabel: formatRating(course),
  }));

  const handleEnroll = (courseId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isStudent) {
      setFeedbackMessage('Only student accounts can enroll in courses.');
      return;
    }

    const selectedCourse = cards.find((item) => item.course._id === courseId)?.course;
    if (!selectedCourse) {
      setFeedbackMessage('Course details are unavailable right now. Please try again.');
      return;
    }

    const courseAmount = selectedCourse.pricing.discountPrice ?? selectedCourse.pricing.amount;
    if (courseAmount > 0) {
      navigate(`/checkout?courseId=${encodeURIComponent(courseId)}`);
      return;
    }

    enrollMutation.mutate(courseId);
  };

  const resetPage = () => setPage(1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader
        navItems={headerItems}
        search={search}
        searchPlaceholder="Search courses..."
        onSearchChange={(value) => {
          startTransition(() => {
            setSearch(value);
            resetPage();
          });
        }}
        isAuthenticated={isAuthenticated}
        userName={user?.profile.firstName}
        userMeta={isAuthenticated ? 'Student Dashboard' : undefined}
        avatarUrl={user?.profile.avatar}
        onLogout={
          isAuthenticated
            ? () => {
                void logout();
              }
            : undefined
        }
      />

      <div className="flex flex-1">
        <AppSidebar
          primaryItems={sidebarPrimaryItems}
          secondaryItems={sidebarSecondaryItems}
          streakDays={14}
        />

        <main className="flex flex-1 flex-col gap-8 px-4 py-8 md:px-8">
          <div className="flex flex-1 flex-col gap-8 lg:flex-row">
            <CatalogFilters
              selectedCategory={selectedCategory}
              selectedLevel={selectedLevel}
              isFree={isFree}
              isPaid={isPaid}
              onCategoryChange={(category) => {
                setSelectedCategory(category);
                resetPage();
              }}
              onLevelChange={(level) => {
                setSelectedLevel(level);
                resetPage();
              }}
              onStatusChange={(type, checked) => {
                if (type === 'free') {
                  setIsFree(checked);
                } else {
                  setIsPaid(checked);
                }
                resetPage();
              }}
            />

            <div className="flex-1 space-y-6">
              <CatalogPromoBanner />
              <CatalogLevelChips
                selectedLevel={selectedLevel}
                onLevelChange={(level) => {
                  setSelectedLevel(level);
                  resetPage();
                }}
              />

              {feedbackMessage ? (
                <div className="rounded-xl border border-primary-900/15 bg-primary-900/5 px-4 py-3 text-sm text-primary-900">
                  {feedbackMessage}
                </div>
              ) : null}

              {!canRequestCourses ? (
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                  Select at least one price status to view matching courses.
                </div>
              ) : isLoading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                    <div key={index} className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white" />
                  ))}
                </div>
              ) : isError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                  Unable to load courses right now.
                </div>
              ) : cards.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                  No courses matched your current filters.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {cards.map((item) => (
                      <CourseCatalogCard
                        key={item.course._id}
                        item={item}
                        canEnroll={!enrolledCourseIds.includes(item.course._id)}
                        isEnrolling={enrollMutation.isPending && enrollMutation.variables === item.course._id}
                        onEnroll={handleEnroll}
                      />
                    ))}
                  </div>

                  <CatalogPagination
                    page={data?.pagination.page ?? page}
                    totalPages={data?.pagination.totalPages ?? 1}
                    onPageChange={setPage}
                  />
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      <AppFooter />
    </div>
  );
};

export default CoursesPage;
