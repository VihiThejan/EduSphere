import React from 'react';
import {
  Activity,
  BarChart3,
  BookOpen,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  ListChecks,
  Settings,
  ShoppingBag,
  TrendingUp,
  Upload,
  BookPlus,
  ArrowRight,
  Radio,
  Video,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tutorApi, LiveSession } from '@/services/api/tutor.api';
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

  const isTutor = user?.roles?.includes('tutor') || user?.roles?.includes('admin');

  const primaryItems: AppNavItem[] = [
    { label: 'Dashboard', href: '#', active: true, icon: LayoutDashboard },
    { label: 'Courses', href: '/courses', icon: BookOpen },
    { label: 'My Learning', href: '#', icon: Clock3 },
    { label: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
    { label: 'Listings', href: '#', icon: ListChecks },
    { label: 'Live Sessions', href: '/live', icon: Radio },
    ...(isTutor ? [{ label: 'Upload Course', href: '/tutor/upload', icon: Upload }] : []),
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

            {isTutor ? (
              <Link
                to="/tutor/upload"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800"
              >
                <Upload size={16} />
                Upload Course
              </Link>
            ) : (
              <Link
                to="/live"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800"
              >
                <Radio size={16} />
                Join Live Session
              </Link>
            )}
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

          {/* Live Sessions Widget */}
          <LiveSessionsWidget isTutor={!!isTutor} />

          {/* Tutor Portal Banner — visible only to tutors */}
          {isTutor && (
            <div className="mt-8 rounded-xl border border-primary-900/20 bg-primary-900/5 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-900 text-white">
                    <BookPlus size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Tutor Portal</h3>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Upload video lessons, reading materials, set pricing, and publish your courses.
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    to="/live"
                    className="inline-flex items-center gap-2 rounded-lg border border-primary-900 px-4 py-2 text-sm font-semibold text-primary-900 transition hover:bg-primary-900 hover:text-white"
                  >
                    <Radio size={15} /> Start Live Session
                  </Link>
                  <Link
                    to="/tutor/upload"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-900/20 transition hover:bg-primary-800"
                  >
                    Upload Course Content
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          )}

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

// ── Live Sessions Widget ──────────────────────────────────────────────────────
interface LiveSessionsWidgetProps { isTutor: boolean }
const LiveSessionsWidget: React.FC<LiveSessionsWidgetProps> = ({ isTutor }) => {
  // Students see all sessions; tutors see their own hosted sessions
  const { data: sessions = [], isLoading } = useQuery<LiveSession[]>({
    queryKey: isTutor ? ['hosted-sessions'] : ['live-sessions-widget'],
    queryFn: isTutor ? tutorApi.getHostedSessions : tutorApi.getAllLiveSessions,
    refetchInterval: 30_000,
  });
  const liveSessions = sessions.filter((s) => s.status === 'live');

  return (
    <div className="mt-8 rounded-xl border border-primary-900/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video size={17} className="text-primary-900" />
          <h3 className="font-bold text-slate-900">Live Sessions</h3>
          {liveSessions.length > 0 && (
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
              {liveSessions.length} Live
            </span>
          )}
        </div>
        <Link to="/live" className="flex items-center gap-1 text-xs font-medium text-primary-900 hover:underline">
          {isTutor ? 'Manage Sessions' : 'View All'} <ArrowRight size={12} />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />)}
        </div>
      ) : liveSessions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <Radio size={28} className="text-slate-300" />
          <p className="text-sm text-slate-400">
            {isTutor ? 'No active sessions. Start one from Live Sessions.' : 'No sessions are live right now. Check back later!'}
          </p>
          <Link to="/live" className="mt-1 rounded-lg bg-primary-900/5 px-4 py-1.5 text-xs font-semibold text-primary-900 hover:bg-primary-900/10 transition">
            {isTutor ? 'Start a Session' : 'Browse Scheduled Sessions'}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {liveSessions.slice(0, 3).map((session) => {
            const hostObj = typeof session.hostId === 'object' && session.hostId !== null
              ? (session.hostId as { profile: { firstName: string; lastName?: string; avatar?: string }; email: string })
              : null;
            const hostName = hostObj
              ? `${hostObj.profile.firstName} ${hostObj.profile.lastName ?? ''}`.trim()
              : 'Tutor';
            return (
              <div key={session._id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800 truncate max-w-xs">{session.title}</p>
                    <p className="text-xs text-slate-400">by {hostName}</p>
                  </div>
                </div>
                <Link
                  to="/live"
                  className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                >
                  Join
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
