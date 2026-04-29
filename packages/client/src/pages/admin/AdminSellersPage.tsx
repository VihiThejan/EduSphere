import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ShieldCheck, ShieldOff, BadgeCheck } from 'lucide-react';
import { AppFooter, AppHeader, AppSidebar } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { useAdminSidebarItems } from '@/hooks/useSidebarItems';
import { adminApi, AdminSeller } from '@/services/api/admin.api';

const STATUS_STYLES: Record<string, string> = {
  verified: 'bg-green-100 text-green-700',
  unverified: 'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
};

const AdminSellersPage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { primaryItems, secondaryItems } = useAdminSidebarItems();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-sellers', page, search, statusFilter],
    queryFn: () => adminApi.getSellers(page, 20, search || undefined, statusFilter || undefined),
    enabled: isAuthenticated,
  });

  const verifyMutation = useMutation({
    mutationFn: ({ sellerId, status }: { sellerId: string; status: 'unverified' | 'verified' | 'suspended' }) =>
      adminApi.updateSellerVerification(sellerId, status),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin-sellers'] }),
  });

  const headerNavItems = [
    { label: 'Admin Panel', href: '/admin/dashboard' },
    { label: 'Back to Site', href: '/dashboard' },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <AppHeader
        navItems={headerNavItems}
        isAuthenticated={isAuthenticated}
        userName={user?.profile.firstName || 'Admin'}
        userMeta="Administrator"
        avatarUrl={user?.profile.avatar}
        onLogout={isAuthenticated ? () => void logout() : undefined}
      />

      <div className="flex flex-1">
        <AppSidebar primaryItems={primaryItems} secondaryItems={secondaryItems} />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Seller Management</h1>
            <p className="mt-1 text-slate-500">{data?.pagination?.total ?? 0} seller profiles</p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-52">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by shop name or email…"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-900/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-900 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="unverified">Unverified</option>
              <option value="verified">Verified</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase text-slate-400">
                    <th className="px-4 py-3">Shop</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Sales</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Member Since</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? [...Array(5)].map((_, i) => (
                        <tr key={i} className="border-b border-slate-50">
                          <td colSpan={7} className="px-4 py-3">
                            <div className="h-6 animate-pulse rounded bg-slate-100" />
                          </td>
                        </tr>
                      ))
                    : (data?.sellers ?? []).map((s: AdminSeller) => (
                        <tr key={s._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {s.shopAvatar ? (
                                <img src={s.shopAvatar} alt="" className="h-9 w-9 rounded-lg object-cover" />
                              ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-sm font-bold text-violet-700">
                                  {s.shopName[0]?.toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-slate-800">{s.shopName}</p>
                                {s.shopDescription && (
                                  <p className="max-w-xs truncate text-xs text-slate-400">{s.shopDescription}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-700">
                              {s.userId?.profile?.firstName} {s.userId?.profile?.lastName}
                            </p>
                            <p className="text-xs text-slate-400">{s.userId?.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[s.verificationStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                              {s.verificationStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-700">{s.totalSales}</td>
                          <td className="px-4 py-3 text-slate-700">
                            {s.reviewCount > 0 ? `${s.rating.toFixed(1)} (${s.reviewCount})` : '—'}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {new Date(s.memberSince).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              {s.verificationStatus !== 'verified' && (
                                <button
                                  onClick={() => verifyMutation.mutate({ sellerId: s._id, status: 'verified' })}
                                  disabled={verifyMutation.isPending}
                                  title="Verify seller"
                                  className="rounded-lg p-1.5 text-green-500 hover:bg-green-50 transition"
                                >
                                  <BadgeCheck size={16} />
                                </button>
                              )}
                              {s.verificationStatus !== 'suspended' ? (
                                <button
                                  onClick={() => verifyMutation.mutate({ sellerId: s._id, status: 'suspended' })}
                                  disabled={verifyMutation.isPending}
                                  title="Suspend seller"
                                  className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 transition"
                                >
                                  <ShieldOff size={16} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => verifyMutation.mutate({ sellerId: s._id, status: 'unverified' })}
                                  disabled={verifyMutation.isPending}
                                  title="Unsuspend seller"
                                  className="rounded-lg p-1.5 text-green-500 hover:bg-green-50 transition"
                                >
                                  <ShieldCheck size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            {(data?.pagination?.totalPages ?? 1) > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                <p className="text-xs text-slate-400">
                  Page {data?.pagination?.page} of {data?.pagination?.totalPages}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40">Previous</button>
                  <button onClick={() => setPage((p) => p + 1)} disabled={page >= (data?.pagination?.totalPages ?? 1)} className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <AppFooter />
    </div>
  );
};

export default AdminSellersPage;
