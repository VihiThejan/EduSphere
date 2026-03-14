import React from 'react';
import {
  Activity,
  BarChart3,
  BookOpen,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  ListChecks,
  Plus,
  Settings,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AppFooter, AppHeader, AppSidebar, AppNavItem } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import ContinueLearningSection from '@/components/dashboard/ContinueLearningSection';
import KuppiSessionsPanel from '@/components/dashboard/KuppiSessionsPanel';
import StatsGrid from '@/components/dashboard/StatsGrid';
import {
  DashboardRecommendation,
  DashboardStat,
  LearningCourse,
} from '@/components/dashboard/types';
import { dashboardApi } from '@/services/api/dashboard.api';

const DashboardPage: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [search, setSearch] = React.useState('');

  const userName = user?.profile.firstName ? `${user.profile.firstName}` : 'Student';
  const avatarUrl = user?.profile.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['student-dashboard', user?._id],
    queryFn: dashboardApi.getStudentDashboardData,
    enabled: true,
  });

  const activeEnrollments = data?.enrollments ?? [];
  const recommendedCourses = data?.recommendedCourses ?? [];

  const totalCompletedLessons = activeEnrollments.reduce(
    (total, item) => total + item.completedLessons,
    0
  );
  const totalRemainingLessons = activeEnrollments.reduce(
    (total, item) => total + item.remainingLessons,
    0
  );
  const averageProgress = activeEnrollments.length
    ? Math.round(
        activeEnrollments.reduce(
          (total, item) => total + item.enrollment.progressPercentage,
          0
        ) / activeEnrollments.length
      )
    : 0;

  const headerItems: AppNavItem[] = [
    { label: 'Courses', href: '/courses' },
    { label: 'Kuppi', href: '/courses' },
    { label: 'Faculties', href: '/courses' },
    { label: 'My Learning', href: '/dashboard', active: true },
  ];

  const primaryItems: AppNavItem[] = [
    { label: 'Dashboard', href: '#', active: true, icon: LayoutDashboard },
    { label: 'Courses', href: '/courses', icon: BookOpen },
    { label: 'My Learning', href: '#', icon: Clock3 },
    { label: 'Marketplace', href: '#', icon: ShoppingBag },
    { label: 'Listings', href: '#', icon: ListChecks },
  ];

  const secondaryItems: AppNavItem[] = [
    { label: 'Analytics', href: '#', icon: BarChart3 },
    { label: 'Settings', href: '#', icon: Settings },
  ];

  const stats: DashboardStat[] = [
    {
      label: 'Active Courses',
      value: String(activeEnrollments.length),
      description: 'Current enrolled courses',
      descriptionClassName: 'text-slate-500',
      icon: BookOpen,
    },
    {
      label: 'Completed Lessons',
      value: String(totalCompletedLessons),
      description: 'Lessons finished so far',
      descriptionClassName: 'text-slate-400',
      icon: Clock3,
    },
    {
      label: 'Remaining Lessons',
      value: String(totalRemainingLessons),
      description: 'Still left to complete',
      descriptionClassName: 'text-amber-600',
      icon: ClipboardList,
    },
    {
      label: 'Avg. Progress',
      value: `${averageProgress}%`,
      description: 'Across active courses',
      descriptionClassName: 'text-green-500',
      icon: TrendingUp,
    },
  ];

  const courses: LearningCourse[] = [
    ...activeEnrollments.slice(0, 3).map((item) => ({
      id: item.course._id,
      badgeLabel: item.course.instructorName || 'Enrolled Course',
      title: item.course.title,
      progressLabel: `${item.enrollment.progressPercentage}% Complete`,
      progressPercent: item.enrollment.progressPercentage,
      imageUrl:
        item.course.thumbnail ||
        'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
    })),
  ];

  const sessions: DashboardRecommendation[] = recommendedCourses.slice(0, 3).map((course) => ({
    id: course._id,
    title: course.title,
    subtitle: `${course.instructorName || 'EduSphere Tutor'} - ${course.stats.totalLessons} lessons`,
    avatarUrl:
      course.thumbnail ||
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=240&q=80',
  }));

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <AppHeader
        navItems={headerItems}
        search={search}
        searchPlaceholder="Search courses, tutors, or sessions..."
        onSearchChange={setSearch}
        isAuthenticated={isAuthenticated}
        userName={userName}
        userMeta="Student ID: #22941"
        avatarUrl={avatarUrl}
        onLogout={() => {
          void logout();
        }}
      />

      <div className="flex flex-1">
        <AppSidebar primaryItems={primaryItems} secondaryItems={secondaryItems} streakDays={14} />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-4xl">Welcome back, {userName}!</h1>
              <p className="mt-1 text-slate-500">
                {activeEnrollments.length > 0
                  ? `You are currently learning across ${activeEnrollments.length} active course${activeEnrollments.length === 1 ? '' : 's'}.`
                  : 'Your dashboard will update as soon as you enroll in courses.'}
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800"
            >
              <Plus size={16} />
              Join New Session
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-32 animate-pulse rounded-xl border border-primary-900/10 bg-white" />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Unable to load dashboard data right now.
            </div>
          ) : (
            <StatsGrid stats={stats} />
          )}

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {isLoading ? (
              <section className="lg:col-span-2">
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="h-28 animate-pulse rounded-xl border border-primary-900/10 bg-white" />
                  ))}
                </div>
              </section>
            ) : courses.length > 0 ? (
              <ContinueLearningSection courses={courses} />
            ) : (
              <section className="lg:col-span-2">
                <div className="rounded-xl border border-primary-900/10 bg-white p-6">
                  <h3 className="text-lg font-bold text-slate-900">Continue Learning</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    You have no active enrollments yet. Browse courses to start learning.
                  </p>
                </div>
              </section>
            )}

            <KuppiSessionsPanel
              title="Recommended Courses"
              description="Published courses you can explore next"
              browseLabel="Browse All Courses"
              sessions={sessions}
            />
          </div>

          <div className="mt-8 rounded-xl border border-primary-900/10 bg-white p-4 lg:hidden">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-900">
              <Activity size={16} />
              Study Streak
            </div>
            <p className="text-lg font-bold text-slate-900">14 Days</p>
          </div>
        </main>
      </div>

      <AppFooter />
    </div>
  );
};

export default DashboardPage;
