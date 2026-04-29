import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  ChevronRight,
  BadgeCheck,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi, TutorRequest } from '@/services/api/analytics.api';
import { AppHeader, AppFooter, AppSidebar, AppNavItem } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { useSidebarItems } from '@/hooks/useSidebarItems';

const STATUS_TABS = ['pending', 'approved', 'rejected'] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const StatusBadge: React.FC<{ status: TutorRequest['tutorRequestStatus'] }> = ({ status }) => {
  const map = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    none: 'bg-slate-50 text-slate-500 border-slate-200',
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status]}`}>
      {status}
    </span>
  );
};

const AdminTutorRequestsPage: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<StatusTab>('pending');
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { primaryItems, secondaryItems } = useSidebarItems();

  const userName = user?.profile.firstName ?? 'Admin';
  const avatarUrl =
    user?.profile.avatar ??
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80';

  const headerItems: AppNavItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Tutor Requests', href: '/admin/tutor-requests', active: true },
  ];

  const { data: requests = [], isLoading, isError } = useQuery<TutorRequest[]>({
    queryKey: ['tutor-requests', tab],
    queryFn: () => analyticsApi.getTutorRequests(tab),
    enabled: isAuthenticated,
  });

  const approveMutation = useMutation({
    mutationFn: (userId: string) => analyticsApi.resolveTutorRequest(userId, 'approve'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutor-requests'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      analyticsApi.resolveTutorRequest(userId, 'reject', reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutor-requests'] });
      setRejectingId(null);
    },
  });

  const filtered = requests.filter(
    (r) =>
      r.profile.firstName.toLowerCase().includes(search.toLowerCase()) ||
      r.profile.lastName.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <AppHeader
        navItems={headerItems}
        search={search}
        searchPlaceholder="Search by name or email..."
        onSearchChange={setSearch}
        isAuthenticated={isAuthenticated}
        userName={userName}
        userMeta="Admin"
        avatarUrl={avatarUrl}
        onLogout={() => void logout()}
      />

      <div className="flex flex-1">
        <AppSidebar primaryItems={primaryItems} secondaryItems={secondaryItems} streakDays={0} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Link to="/dashboard" className="hover:text-primary-900">Dashboard</Link>
              <ChevronRight size={14} />
              <span className="text-slate-700">Tutor Requests</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
              Tutor Approval Requests
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review and action student requests to become tutors.
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-slate-200">
            {STATUS_TABS.map((s) => (
              <button
                key={s}
                onClick={() => setTab(s)}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                  tab === s
                    ? 'border-primary-900 text-primary-900'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                {s === 'pending' && <Clock3 size={14} />}
                {s === 'approved' && <CheckCircle2 size={14} />}
                {s === 'rejected' && <XCircle size={14} />}
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-white border border-slate-200" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={16} /> Failed to load tutor requests.
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <Users size={36} className="text-slate-200" />
              <p className="text-sm text-slate-400">
                No {tab} requests{search ? ` matching "${search}"` : ''}.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((req) => (
                <div
                  key={req._id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* User info */}
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-900/10 text-sm font-bold text-primary-900">
                        {req.profile.firstName[0]}
                        {req.profile.lastName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {req.profile.firstName} {req.profile.lastName}
                        </p>
                        <p className="text-xs text-slate-400">{req.email}</p>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={req.tutorRequestStatus} />
                      {req.tutorRequestedAt && (
                        <span className="text-xs text-slate-400">
                          Requested {new Date(req.tutorRequestedAt).toLocaleDateString()}
                        </span>
                      )}
                      {req.tutorRejectionReason && (
                        <span className="max-w-xs truncate text-xs text-red-500" title={req.tutorRejectionReason}>
                          Reason: {req.tutorRejectionReason}
                        </span>
                      )}
                    </div>

                    {/* Actions — only for pending */}
                    {tab === 'pending' && (
                      <div className="flex shrink-0 items-center gap-2">
                        {rejectingId === req._id ? (
                          <div className="flex items-center gap-2">
                            <input
                              value={rejectReason[req._id] ?? ''}
                              onChange={(e) =>
                                setRejectReason((prev) => ({ ...prev, [req._id]: e.target.value }))
                              }
                              placeholder="Rejection reason (optional)"
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-primary-900 focus:outline-none"
                            />
                            <button
                              onClick={() =>
                                rejectMutation.mutate({
                                  userId: req._id,
                                  reason: rejectReason[req._id],
                                })
                              }
                              disabled={rejectMutation.isPending}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              Confirm Reject
                            </button>
                            <button
                              onClick={() => setRejectingId(null)}
                              className="text-xs text-slate-400 hover:text-slate-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => approveMutation.mutate(req._id)}
                              disabled={approveMutation.isPending}
                              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <BadgeCheck size={13} /> Approve
                            </button>
                            <button
                              onClick={() => setRejectingId(req._id)}
                              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filter hint */}
          {filtered.length > 0 && (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
              <Filter size={12} /> Showing {filtered.length} of {requests.length} requests
            </p>
          )}
        </main>
      </div>

      <AppFooter />
    </div>
  );
};

export default AdminTutorRequestsPage;
