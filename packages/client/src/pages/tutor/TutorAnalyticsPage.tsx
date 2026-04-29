import React, { useState } from 'react';
import {
  BarChart3,
  BookOpen,
  TrendingUp,
  Users,
  Award,
  DollarSign,
  ChevronRight,
  ArrowLeft,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, CourseAnalyticsSummary, CourseDetailAnalytics } from '@/services/api/analytics.api';
import { AppHeader, AppFooter, AppSidebar, AppNavItem } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { useSidebarItems } from '@/hooks/useSidebarItems';

// ── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon: Icon, accent = 'bg-primary-900' }) => (
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

// ── Course Row ────────────────────────────────────────────────────────────────
interface CourseRowProps {
  course: CourseAnalyticsSummary;
  onSelect: (id: string) => void;
  selected: boolean;
}

const CourseRow: React.FC<CourseRowProps> = ({ course, onSelect, selected }) => (
  <button
    onClick={() => onSelect(course._id)}
    className={`w-full rounded-xl border p-4 text-left transition ${
      selected
        ? 'border-primary-900/40 bg-primary-900/5 shadow-sm'
        : 'border-slate-200 bg-white hover:border-primary-900/30 hover:bg-slate-50'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen size={20} className="text-slate-300" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{course.title}</p>
        <p className="text-xs text-slate-400">{course.category} · {course.level}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-slate-800">{course.stats.enrollmentCount} students</p>
        <p className="text-xs text-slate-400">{course.completionRate}% completion</p>
      </div>
      <ChevronRight size={16} className={`shrink-0 transition ${selected ? 'text-primary-900' : 'text-slate-300'}`} />
    </div>

    {/* Progress bar */}
    <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-primary-900 transition-all"
        style={{ width: `${course.completionRate}%` }}
      />
    </div>
  </button>
);

// ── Detail Panel ─────────────────────────────────────────────────────────────
const CourseDetailPanel: React.FC<{ courseId: string; onClose: () => void }> = ({ courseId, onClose }) => {
  const { data, isLoading } = useQuery<CourseDetailAnalytics>({
    queryKey: ['course-analytics', courseId],
    queryFn: () => analyticsApi.getCourseAnalytics(courseId),
    enabled: !!courseId,
  });

  return (
    <div className="rounded-2xl border border-primary-900/20 bg-white p-6 shadow-md">
      <button
        onClick={onClose}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={15} /> Back to all courses
      </button>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : !data ? (
        <p className="text-sm text-slate-400">Could not load course analytics.</p>
      ) : (
        <>
          <h3 className="mb-4 text-lg font-bold text-slate-900">{data.course.title}</h3>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
              <p className="text-xl font-bold text-slate-900">{data.analytics.totalEnrollments}</p>
              <p className="text-xs text-slate-400">Enrollments</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
              <p className="text-xl font-bold text-emerald-600">{data.analytics.completionRate}%</p>
              <p className="text-xs text-slate-400">Completion Rate</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
              <p className="text-xl font-bold text-slate-900">{data.analytics.completedCount}</p>
              <p className="text-xs text-slate-400">Completed</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
              <p className="text-xl font-bold text-primary-900">
                {data.analytics.revenueLKR.toLocaleString()} LKR
              </p>
              <p className="text-xs text-slate-400">Revenue</p>
            </div>
          </div>

          {/* Enrollment timeline */}
          {data.analytics.enrollmentTimeline.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Enrollments (last 30 days)
              </p>
              <div className="flex h-20 items-end gap-1">
                {data.analytics.enrollmentTimeline.map((point) => {
                  const max = Math.max(...data.analytics.enrollmentTimeline.map((p) => p.count), 1);
                  const height = Math.max((point.count / max) * 100, 4);
                  return (
                    <div
                      key={point.date}
                      title={`${point.date}: ${point.count} enrollments`}
                      className="flex-1 rounded-t-sm bg-primary-900/70 transition-all hover:bg-primary-900"
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Status breakdown */}
          {Object.keys(data.analytics.statusBreakdown).length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Enrollment Status
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(data.analytics.statusBreakdown).map(([status, count]) => (
                  <span
                    key={status}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium capitalize text-slate-700"
                  >
                    {status}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const TutorAnalyticsPage: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [search, setSearch] = React.useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const { primaryItems, secondaryItems } = useSidebarItems();

  const userName = user?.profile.firstName ?? 'Tutor';
  const avatarUrl =
    user?.profile.avatar ??
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80';

  const headerItems: AppNavItem[] = [
    { label: 'Courses', href: '/courses' },
    { label: 'My Learning', href: '/dashboard' },
    { label: 'Analytics', href: '/tutor/analytics', active: true },
  ];

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tutor-analytics-overview'],
    queryFn: analyticsApi.getTutorOverview,
    enabled: isAuthenticated && !!user,
  });

  const overview = data?.overview;
  const courses = data?.courses ?? [];

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <AppHeader
        navItems={headerItems}
        search={search}
        searchPlaceholder="Search courses..."
        onSearchChange={setSearch}
        isAuthenticated={isAuthenticated}
        userName={userName}
        userMeta="Tutor"
        avatarUrl={avatarUrl}
        onLogout={() => void logout()}
      />

      <div className="flex flex-1">
        <AppSidebar primaryItems={primaryItems} secondaryItems={secondaryItems} streakDays={0} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Link to="/dashboard" className="hover:text-primary-900">Dashboard</Link>
              <ChevronRight size={14} />
              <span className="text-slate-700">Analytics</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
              Course Analytics
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track your students, completions, and revenue across all courses.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-white border border-slate-200" />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Could not load analytics. Make sure you have published at least one course.
            </div>
          ) : (
            <>
              {/* Overview cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6 mb-8">
                <StatCard label="Total Courses" value={overview?.totalCourses ?? 0} icon={BookOpen} sub="all statuses" />
                <StatCard label="Published" value={overview?.publishedCourses ?? 0} icon={CheckCircle2} accent="bg-emerald-600" sub="live courses" />
                <StatCard label="Students" value={overview?.totalEnrollments ?? 0} icon={Users} sub="total enrollments" />
                <StatCard
                  label="Completion Rate"
                  value={`${overview?.completionRate ?? 0}%`}
                  icon={TrendingUp}
                  accent="bg-amber-500"
                  sub="across all courses"
                />
                <StatCard
                  label="Avg. Rating"
                  value={overview?.avgRating ? `${overview.avgRating} ★` : '–'}
                  icon={Star}
                  accent="bg-yellow-500"
                  sub="student reviews"
                />
                <StatCard
                  label="Revenue"
                  value={`${(overview?.totalRevenueLKR ?? 0).toLocaleString()} LKR`}
                  icon={DollarSign}
                  accent="bg-green-600"
                  sub="estimated"
                />
              </div>

              {/* Two-column layout: course list + detail */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Course list */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <BarChart3 size={17} className="text-primary-900" />
                    <h2 className="text-base font-bold text-slate-900">Your Courses</h2>
                    <span className="ml-auto text-xs text-slate-400">{courses.length} total</span>
                  </div>

                  {filteredCourses.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
                      <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-sm text-slate-400">No courses yet.</p>
                      <Link
                        to="/tutor/upload"
                        className="mt-3 inline-block rounded-lg bg-primary-900 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-800"
                      >
                        Upload Your First Course
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredCourses.map((course) => (
                        <CourseRow
                          key={course._id}
                          course={course}
                          onSelect={(id) =>
                            setSelectedCourseId((prev) => (prev === id ? null : id))
                          }
                          selected={selectedCourseId === course._id}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Detail panel */}
                <div>
                  {selectedCourseId ? (
                    <CourseDetailPanel
                      courseId={selectedCourseId}
                      onClose={() => setSelectedCourseId(null)}
                    />
                  ) : (
                    <div className="flex h-full min-h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
                      <div>
                        <BarChart3 size={36} className="mx-auto mb-2 text-slate-200" />
                        <p className="text-sm text-slate-400">Select a course to see detailed analytics</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <AppFooter />
    </div>
  );
};

export default TutorAnalyticsPage;
