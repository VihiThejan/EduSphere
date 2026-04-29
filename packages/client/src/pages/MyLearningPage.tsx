import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  CheckCircle,
  Clock,
  GraduationCap,
  LayoutDashboard,
  Clock3,
  ShoppingBag,
  ListChecks,
  Radio,
  Upload,
  BarChart3,
  Settings,
} from 'lucide-react';
import { AppFooter, AppHeader, AppSidebar, AppNavItem } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { coursesApi, MyLearningItem } from '@/services/api/courses.api';

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Dropped', value: 'DROPPED' },
];

const ProgressBar: React.FC<{ pct: number }> = ({ pct }) => (
  <div className="h-2 w-full rounded-full bg-slate-100">
    <div
      className="h-2 rounded-full bg-primary-900 transition-all"
      style={{ width: `${Math.min(100, pct)}%` }}
    />
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { label: string; cls: string }> = {
    ACTIVE: { label: 'Active', cls: 'bg-blue-100 text-blue-700' },
    COMPLETED: { label: 'Completed', cls: 'bg-green-100 text-green-700' },
    DROPPED: { label: 'Dropped', cls: 'bg-slate-100 text-slate-500' },
  };
  const { label, cls } = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-500' };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>
  );
};

const CourseCard: React.FC<{ item: MyLearningItem }> = ({ item }) => {
  const { enrollment, course } = item;
  const pct = enrollment.progressPercentage;

  return (
    <Link
      to={`/courses/${course._id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-12 w-12 text-slate-300" />
          </div>
        )}
        <div className="absolute right-2 top-2">
          <StatusBadge status={enrollment.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1 font-bold leading-snug text-slate-900 line-clamp-2">{course.title}</h3>
        {course.instructorName && (
          <p className="mb-3 text-xs text-slate-500">{course.instructorName}</p>
        )}

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              {item.completedLessons} / {course.totalLessons} lessons
            </span>
            <span className="font-semibold text-primary-900">{pct}%</span>
          </div>
          <ProgressBar pct={pct} />
          <p className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            Last accessed {new Date(enrollment.lastAccessedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
};

const MyLearningPage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');

  const isTutor = user?.roles?.includes('tutor') || user?.roles?.includes('admin');

  const headerNavItems: AppNavItem[] = [
    { label: 'Courses', href: '/courses' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Community', href: '/' },
  ];

  const primaryItems: AppNavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Courses', href: '/courses', icon: BookOpen },
    { label: 'My Learning', href: '/my-learning', active: true, icon: Clock3 },
    { label: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
    { label: 'Listings', href: '/seller/listings', icon: ListChecks },
    { label: 'Live Sessions', href: '/live', icon: Radio },
    ...(isTutor ? [{ label: 'Upload Course', href: '/tutor/upload', icon: Upload }] : []),
  ];

  const secondaryItems: AppNavItem[] = [
    { label: 'Analytics', href: '#', icon: BarChart3 },
    { label: 'Settings', href: '#', icon: Settings },
  ];

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['my-learning', statusFilter],
    queryFn: () => coursesApi.getMyLearning(statusFilter || undefined),
    enabled: isAuthenticated,
  });

  const filtered = items.filter((item) =>
    item.course.title.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: items.length,
    active: items.filter((i) => i.enrollment.status === 'ACTIVE').length,
    completed: items.filter((i) => i.enrollment.status === 'COMPLETED').length,
    avgProgress:
      items.length > 0
        ? Math.round(items.reduce((s, i) => s + i.enrollment.progressPercentage, 0) / items.length)
        : 0,
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <AppHeader
        navItems={headerNavItems}
        search={search}
        searchPlaceholder="Search your courses…"
        onSearchChange={setSearch}
        isAuthenticated={isAuthenticated}
        userName={user?.profile.firstName || 'Student'}
        avatarUrl={user?.profile.avatar}
        onLogout={isAuthenticated ? () => void logout() : undefined}
      />

      <div className="flex flex-1">
        <AppSidebar primaryItems={primaryItems} secondaryItems={secondaryItems} streakDays={14} />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
          {/* Page title */}
          <div className="mb-8 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary-900" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">My Learning</h1>
              <p className="mt-0.5 text-slate-500">Track your enrolled courses and progress</p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Enrolled', value: stats.total, icon: BookOpen },
              { label: 'Active', value: stats.active, icon: Clock },
              { label: 'Completed', value: stats.completed, icon: CheckCircle },
              { label: 'Avg Progress', value: `${stats.avgProgress}%`, icon: GraduationCap },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <Icon className="mb-2 h-5 w-5 text-primary-900" />
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  statusFilter === f.value
                    ? 'bg-primary-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Course grid */}
          {isLoading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-200" />
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <BookOpen className="mb-4 h-14 w-14 text-slate-300" />
              <p className="text-lg font-semibold text-slate-600">
                {search ? 'No courses match your search' : 'No courses found'}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {search
                  ? 'Try a different search term'
                  : 'Enroll in a course to start learning'}
              </p>
              {!search && (
                <Link
                  to="/courses"
                  className="mt-6 rounded-lg bg-primary-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-800"
                >
                  Browse Courses
                </Link>
              )}
            </div>
          )}

          {!isLoading && filtered.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <CourseCard key={item.enrollment._id} item={item} />
              ))}
            </div>
          )}
        </main>
      </div>

      <AppFooter />
    </div>
  );
};

export default MyLearningPage;
