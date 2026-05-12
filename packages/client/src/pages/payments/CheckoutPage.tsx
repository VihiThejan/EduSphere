import React from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CreditCard, Lock, ShieldCheck } from 'lucide-react';
import { coursesApi } from '@/services/api/courses.api';
import { useAuthStore } from '@/store/authStore';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();

  const courseId = searchParams.get('courseId');

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.getCourse(courseId!),
    enabled: !!courseId,
  });

  const payAndEnrollMutation = useMutation({
    mutationFn: async () => {
      // Simulate payment gateway authorization, then finalize enrollment.
      await new Promise((resolve) => setTimeout(resolve, 900));
      return coursesApi.enrollInCourse(courseId!);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['student-dashboard', user?._id] });
      void queryClient.invalidateQueries({ queryKey: ['course-enrollment-status', courseId, user?._id] });
      navigate('/dashboard');
    },
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!courseId) {
    return <Navigate to="/courses" replace />;
  }

  if (isLoading || !course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-xl animate-pulse rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="mt-4 h-4 w-full rounded bg-slate-200" />
          <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
          <div className="mt-8 h-12 w-full rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  const amount = course.pricing.discountPrice ?? course.pricing.amount;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#f1f5f9_20%,_#ffffff_65%)] px-4 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          to={`/courses/${courseId}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to course
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                <CreditCard size={18} />
              </div>
              <div>
                <h1 className="text-xl font-bold sm:text-2xl">Payment Gateway</h1>
                <p className="text-sm text-slate-500">Complete your payment to unlock this course.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Card holder
                </label>
                <input
                  type="text"
                  value={`${user?.profile.firstName ?? ''} ${user?.profile.lastName ?? ''}`.trim()}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Card number
                </label>
                <input
                  type="text"
                  value="4242 4242 4242 4242"
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Expiry
                  </label>
                  <input
                    type="text"
                    value="12/29"
                    readOnly
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    CVC
                  </label>
                  <input
                    type="text"
                    value="123"
                    readOnly
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => payAndEnrollMutation.mutate()}
              disabled={payAndEnrollMutation.isPending}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {payAndEnrollMutation.isPending ? 'Processing payment...' : `Pay LKR ${amount.toLocaleString()} & Enroll`}
            </button>

            {payAndEnrollMutation.isError && (
              <p className="mt-3 text-sm text-red-600">Payment failed. Please try again.</p>
            )}
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-bold">Order Summary</h2>
            <p className="mt-2 text-sm text-slate-500">{course.title}</p>

            <div className="mt-6 space-y-3 border-t border-slate-200 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Course Price</span>
                <span className="font-semibold text-slate-900">LKR {amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Platform Fee</span>
                <span className="font-semibold text-slate-900">LKR 0</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base">
                <span className="font-semibold text-slate-700">Total</span>
                <span className="font-extrabold text-slate-900">LKR {amount.toLocaleString()}</span>
              </div>
            </div>

            <ul className="mt-6 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-emerald-600" />
                Secure payment encryption
              </li>
              <li className="flex items-center gap-2">
                <Lock size={15} className="text-emerald-600" />
                Instant enrollment after payment
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
