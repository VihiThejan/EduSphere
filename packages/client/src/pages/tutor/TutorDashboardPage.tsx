import React from 'react';
import {
  Upload,
  BarChart3,
  Radio,
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/services/api/analytics.api';
import { tutorApi } from '@/services/api/tutor.api';
import { AppHeader, AppFooter, AppSidebar, AppNavItem } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { useSidebarItems } from '@/hooks/useSidebarItems';

const StatCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: string;
}> = ({ label, value, sub, icon: Icon, accent = 'bg-primary-900' }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-3 flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <div className={`flex size-9 items-center justify-center rounded-xl ${accent} text-white`}>
        <Icon size={17} />
      </div>
    </div>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
    {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
  </div>
);

const TutorDashboardPage: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [search, setSearch] = React.useState('');

  const { primaryItems, secondaryItems } = useSidebarItems();

  const userName = user?.profile.firstName ?? 'Tutor';
  const avatarUrl =
    user?.profile.avatar ??
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80';

  const headerItems: AppNavItem[] = [
    { label: 'Courses', href: '/courses' },
    { label: 'Dashboard', href: '/tutor/dashboard', active: true },
    { label: 'Analytics', href: '/tutor/analytics' },
  ];

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['tutor-analytics-overview'],
    queryFn: analyticsApi.getTutorOverview,
    enabled: isAuthenticated && !!user,
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['hosted-sessions'],
    queryFn: tutorApi.getHostedSessions,
    enabled: isAuthenticated && !!user,
    refetchInterval: 30_000,
  });

  const overview = analyticsData?.overview;
  const topCourses = (analyticsData?.courses ?? [])
    .sort((a, b) => b.stats.enrollmentCount - a.stats.enrollmentCount)
    .slice(0, 3);

  const liveSessions = sessions.filter((s) => s.status === 'live');
  const scheduledSessions = sessions.filter((s) => s.status === 'scheduled');

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <AppHeader
        navItems={headerItems}
        search={search}
        searchPlaceholder="Search..."
        onSearchChange={setSearch}
        isAuthenticated={isAuthenticated}
        userName={userName}
        userMeta="Tutor Dashboard"
        avatarUrl={avatarUrl}
        onLogout={() => void logout()}
      />

      <div className="flex flex-1">
        <AppSidebar primaryItems={primaryItems} secondaryItems={secondaryItems} streakDays={0} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Welcome */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Welcome back, {userName}!
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Here's an overview of your teaching activity.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/live"
                className="flex items-center gap-2 rounded-lg border border-primary-900 px-3 py-2 text-sm font-semibold text-primary-900 transition hover:bg-primary-900 hover:text-white"
              >
                <Radio size={15} /> Start Live Session
              </Link>
              <Link
                to="/tutor/upload"
                className="flex items-center gap-2 rounded-lg bg-primary-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-900/20 transition hover:bg-primary-800"
              >
                <Upload size={15} /> Upload Course
              </Link>
            </div>
          </div>

          {/* Stats */}
          {analyticsLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 mb-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-white border border-slate-200" />
              ))}
            </div>
          ) : (
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard label="Courses" value={overview?.totalCourses ?? 0} icon={BookOpen} sub="all statuses" />
              <StatCard
                label="Students"
                value={overview?.totalEnrollments ?? 0}
                icon={Users}
                sub="total enrolled"
                accent="bg-indigo-600"
              />
              <StatCard
                label="Completion"
                value={`${overview?.completionRate ?? 0}%`}
                icon={CheckCircle2}
                sub="avg completion rate"
                accent="bg-emerald-600"
              />
              <StatCard
                label="Avg Rating"
                value={overview?.avgRating ? `${overview.avgRating} ★` : '–'}
                icon={Star}
                sub="from reviews"
                accent="bg-yellow-500"
              />
              <StatCard
                label="Revenue"
                value={`${((overview?.totalRevenueLKR ?? 0) / 1000).toFixed(1)}k LKR`}
                icon={DollarSign}
                sub="estimated"
                accent="bg-green-600"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Top courses */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={17} className="text-primary-900" />
                    <h2 className="font-bold text-slate-900">Top Courses</h2>
                  </div>
                  <Link
                    to="/tutor/analytics"
                    className="flex items-center gap-1 text-xs font-medium text-primary-900 hover:underline"
                  >
                    View all analytics <ArrowRight size={12} />
                  </Link>
                </div>

                {analyticsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
                    ))}
                  </div>
                ) : topCourses.length === 0 ? (
                  <div className="py-8 text-center">
                    <BookOpen size={28} className="mx-auto mb-2 text-slate-200" />
                    <p className="text-sm text-slate-400">No courses yet.</p>
                    <Link
                      to="/tutor/upload"
                      className="mt-2 inline-block text-xs font-semibold text-primary-900 hover:underline"
                    >
                      Upload your first course
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topCourses.map((course, i) => (
                      <div
                        key={course._id}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-900/10 text-xs font-bold text-primary-900">
                          #{i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">{course.title}</p>
                          <p className="text-xs text-slate-400">
                            {course.stats.enrollmentCount} students · {course.completionRate}% complete
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-bold text-primary-900">
                            {course.revenueLKR.toLocaleString()} LKR
                          </p>
                          {course.stats.avgRating > 0 && (
                            <p className="text-xs text-yellow-500">★ {course.stats.avgRating.toFixed(1)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Live sessions panel */}
            <div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio size={17} className="text-primary-900" />
                    <h2 className="font-bold text-slate-900">Live Sessions</h2>
                    {liveSessions.length > 0 && (
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                        {liveSessions.length} Live
                      </span>
                    )}
                  </div>
                  <Link
                    to="/live"
                    className="text-xs font-medium text-primary-900 hover:underline"
                  >
                    Manage
                  </Link>
                </div>

                {sessionsLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                    ))}
                  </div>
                ) : liveSessions.length === 0 && scheduledSessions.length === 0 ? (
                  <div className="py-6 text-center">
                    <Radio size={24} className="mx-auto mb-2 text-slate-200" />
                    <p className="text-xs text-slate-400">No active or scheduled sessions.</p>
                    <Link
                      to="/live"
                      className="mt-2 inline-block rounded-lg bg-primary-900/5 px-4 py-1.5 text-xs font-semibold text-primary-900 hover:bg-primary-900/10 transition"
                    >
                      Start a Session
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...liveSessions, ...scheduledSessions].slice(0, 4).map((session) => (
                      <div
                        key={session._id}
                        className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              session.status === 'live'
                                ? 'bg-emerald-500 animate-pulse'
                                : 'bg-amber-400'
                            }`}
                          />
                          <p className="truncate text-xs font-medium text-slate-800 max-w-32">
                            {session.title}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                            session.status === 'live'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick links */}
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-3 font-bold text-slate-900">Quick Links</h2>
                <div className="space-y-1">
                  {[
                    { label: 'Upload Course', href: '/tutor/upload', icon: Upload },
                    { label: 'View Analytics', href: '/tutor/analytics', icon: BarChart3 },
                    { label: 'Live Sessions', href: '/live', icon: Radio },
                    { label: 'My Courses', href: '/courses', icon: BookOpen },
                  ].map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      to={href}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-primary-900/5 hover:text-primary-900"
                    >
                      <Icon size={15} />
                      {label}
                      <ArrowRight size={13} className="ml-auto text-slate-300" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AppFooter />
    </div>
  );
};

export default TutorDashboardPage;
