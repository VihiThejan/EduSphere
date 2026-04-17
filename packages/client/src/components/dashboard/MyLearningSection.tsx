import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Award,
  XCircle,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { dashboardApi, MyLearningEnrollment } from '@/services/api/dashboard.api';
import { useAuthStore } from '@/store/authStore';

type TabKey = 'all' | 'active' | 'completed' | 'dropped';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'All Courses', icon: BookOpen },
  { key: 'active', label: 'In Progress', icon: Clock },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
  { key: 'dropped', label: 'Dropped', icon: XCircle },
];

const statusBadge: Record<string, { className: string; label: string }> = {
  active: { className: 'bg-blue-100 text-blue-700', label: 'In Progress' },
  'not-started': { className: 'bg-slate-100 text-slate-600', label: 'Not Started' },
  completed: { className: 'bg-green-100 text-green-700', label: 'Completed' },
  dropped: { className: 'bg-red-100 text-red-700', label: 'Dropped' },
};

const MyLearningSection: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [confirmDropId, setConfirmDropId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [completedDeleteCourse, setCompletedDeleteCourse] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const queryClient = useQueryClient();

  const { data: enrollments = [], isLoading } = useQuery<MyLearningEnrollment[]>({
    queryKey: ['my-learning'],
    queryFn: () => dashboardApi.getMyLearning(),
    enabled: isAuthenticated && !!user,
  });

  const dropMutation = useMutation({
    mutationFn: (courseId: string) => dashboardApi.dropCourse(courseId),
    onSuccess: () => {
      setConfirmDropId(null);
      void queryClient.invalidateQueries({ queryKey: ['my-learning'] });
      void queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
    },
  });

  const reEnrollMutation = useMutation({
    mutationFn: (courseId: string) => dashboardApi.reEnrollCourse(courseId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-learning'] });
      void queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (courseId: string) => dashboardApi.deleteEnrollment(courseId),
    onSuccess: () => {
      setConfirmDeleteId(null);
      void queryClient.invalidateQueries({ queryKey: ['my-learning'] });
      void queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
    },
  });

  const filtered =
    activeTab === 'all'
      ? enrollments
      : activeTab === 'active'
        ? enrollments.filter(
            (e) => e.enrollment.status === 'active' && (e.hasStarted || e.completedLessons > 0)
          )
        : enrollments.filter((e) => e.enrollment.status === activeTab);

  const inProgressCourses = enrollments.filter(
    (e) => e.enrollment.status === 'active' && (e.hasStarted || e.completedLessons > 0)
  );
  const completedCourses = enrollments.filter((e) => e.enrollment.status === 'completed');
  const notStartedCourses = enrollments.filter(
    (e) => e.enrollment.status === 'active' && !e.hasStarted && e.completedLessons === 0
  );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <>
    <section id="my-learning" className="mt-8 scroll-mt-24">
      {/* Section Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary-900 text-white">
          <GraduationCap size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Learning</h2>
          <p className="text-sm text-slate-500">
            {enrollments.length} course{enrollments.length !== 1 ? 's' : ''} enrolled
            {' · '}
            {inProgressCourses.length} in progress
            {' · '}
            {completedCourses.length} completed
            {notStartedCourses.length > 0 && (
              <>
                {' · '}
                {notStartedCourses.length} not started
              </>
            )}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-primary-900/10 bg-white p-1">
        {TABS.map(({ key, label, icon: Icon }) => {
          const count =
            key === 'all'
              ? enrollments.length
              : key === 'active'
                ? enrollments.filter((e) => e.enrollment.status === 'active' && (e.hasStarted || e.completedLessons > 0)).length
                : enrollments.filter((e) => e.enrollment.status === key).length;

          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === key
                  ? 'bg-primary-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={15} />
              {label}
              <span
                className={`ml-1 rounded-full px-1.5 py-0.5 text-xs ${
                  activeTab === key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border border-primary-900/10 bg-white"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-primary-900/10 bg-white p-8 text-center">
          <BookOpen size={40} className="mx-auto text-slate-300" />
          <h3 className="mt-3 font-semibold text-slate-700">
            {activeTab === 'all'
              ? 'No courses enrolled yet'
              : `No ${TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} courses`}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {activeTab === 'all'
              ? 'Browse courses and start your learning journey!'
              : 'Courses will appear here as you progress.'}
          </p>
          {activeTab === 'all' && (
            <Link
              to="/courses"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800"
            >
              <BookOpen size={16} />
              Browse Courses
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const isNotStarted = item.enrollment.status === 'active' && !item.hasStarted && item.completedLessons === 0;
            const displayStatus = isNotStarted ? 'not-started' : item.enrollment.status;
            const badge = statusBadge[displayStatus] ?? statusBadge.active;

            return (
              <article
                key={item.enrollment._id}
                className="flex flex-col gap-4 rounded-xl border border-primary-900/10 bg-white p-4 transition hover:shadow-md sm:flex-row"
              >
                {/* Thumbnail */}
                <img
                  src={
                    item.course.thumbnail ||
                    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={item.course.title}
                  className="h-24 w-full rounded-lg object-cover sm:w-36"
                />

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      {item.course.category && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600">
                          {item.course.category}
                        </span>
                      )}
                      {item.course.level && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600">
                          {item.course.level}
                        </span>
                      )}
                      {item.enrollment.certificateIssued && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                          <Award size={12} />
                          Certificate
                        </span>
                      )}
                    </div>
                    <h4 className="mt-2 font-semibold text-slate-900">{item.course.title}</h4>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {item.course.instructorName || 'EduSphere Tutor'}
                    </p>
                  </div>

                  {/* Progress bar & stats */}
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                      <span>
                        {item.completedLessons} / {item.course.totalLessons} lessons
                      </span>
                      <span className="font-semibold text-slate-700">
                        {item.enrollment.progressPercentage}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          item.enrollment.status === 'completed'
                            ? 'bg-green-500'
                            : isNotStarted
                              ? 'bg-slate-300'
                              : 'bg-primary-900'
                        }`}
                        style={{ width: `${item.enrollment.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right meta + action */}
                <div className="flex flex-col items-end justify-between gap-2 sm:min-w-[140px]">
                  <div className="text-right text-xs text-slate-400">
                    <p>Enrolled {formatDate(item.enrollment.enrolledAt)}</p>
                    {item.enrollment.completedAt && (
                      <p className="mt-0.5 text-green-600">
                        Completed {formatDate(item.enrollment.completedAt)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Drop / Remove button — only shown in active/in-progress tab */}
                    {item.enrollment.status === 'active' && activeTab !== 'all' && (
                      confirmDropId === item.course._id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => dropMutation.mutate(item.course._id)}
                            disabled={dropMutation.isPending}
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                          >
                            {dropMutation.isPending ? 'Removing…' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setConfirmDropId(null)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDropId(item.course._id)}
                          className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                          title="Remove from My Learning"
                        >
                          <Trash2 size={13} />
                          Remove
                        </button>
                      )
                    )}

                    {/* Re-enroll & Remove — only shown in Dropped tab */}
                    {item.enrollment.status === 'dropped' && activeTab === 'dropped' && (
                      <>
                        {confirmDeleteId === item.course._id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => deleteMutation.mutate(item.course._id)}
                              disabled={deleteMutation.isPending}
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                            >
                              {deleteMutation.isPending ? 'Deleting…' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(item.course._id)}
                            className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                            title="Permanently remove from list"
                          >
                            <Trash2 size={13} />
                            Remove
                          </button>
                        )}
                        <button
                          onClick={() => reEnrollMutation.mutate(item.course._id)}
                          disabled={reEnrollMutation.isPending}
                          className="flex items-center gap-1 rounded-lg bg-primary-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-800 disabled:opacity-50"
                        >
                          <BookOpen size={13} />
                          {reEnrollMutation.isPending ? 'Re-enrolling…' : 'Re-enroll'}
                        </button>
                      </>
                    )}

                    {/* Remove — only shown in Completed tab */}
                    {item.enrollment.status === 'completed' && activeTab === 'completed' && (
                      <button
                        onClick={() =>
                          setCompletedDeleteCourse({
                            id: item.course._id,
                            title: item.course.title,
                          })
                        }
                        className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                        title="Remove completed course"
                      >
                        <Trash2 size={13} />
                        Remove
                      </button>
                    )}

                    <Link
                      to={`/courses/${item.course._id}`}
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                        item.enrollment.status === 'completed'
                          ? 'border-green-600 text-green-600 hover:bg-green-50'
                          : 'border-primary-900 text-primary-900 hover:bg-primary-900/5'
                      }`}
                    >
                      {item.enrollment.status === 'completed'
                        ? 'Review'
                        : item.enrollment.status === 'dropped'
                          ? 'View'
                          : isNotStarted
                            ? 'Start'
                            : 'Resume'}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>

      {/* Warning dialog for removing completed course */}
      {completedDeleteCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Remove Completed Course?</h3>
            </div>

            <p className="mt-4 text-sm text-slate-600">
              You are about to permanently remove{' '}
              <span className="font-semibold text-slate-900">
                "{completedDeleteCourse.title}"
              </span>{' '}
              from your learning history.
            </p>

            <div className="mt-3 rounded-lg bg-amber-50 p-3">
              <p className="text-xs font-medium text-amber-800">
                ⚠ This action cannot be undone. Your completion record, certificate (if any),
                and all progress data will be permanently deleted.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setCompletedDeleteCourse(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteMutation.mutate(completedDeleteCourse.id);
                  setCompletedDeleteCourse(null);
                }}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Removing…' : 'Yes, Remove Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyLearningSection;
