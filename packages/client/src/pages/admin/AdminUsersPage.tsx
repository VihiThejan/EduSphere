import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ShieldCheck, ShieldOff, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { AppFooter, AppHeader, AppSidebar } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { useAdminSidebarItems } from '@/hooks/useSidebarItems';
import { adminApi, AdminUser } from '@/services/api/admin.api';

const ROLES = ['student', 'tutor', 'seller', 'admin'];
const ROLE_COLORS: Record<string, string> = {
  student: 'bg-blue-100 text-blue-700',
  tutor: 'bg-violet-100 text-violet-700',
  seller: 'bg-amber-100 text-amber-700',
  admin: 'bg-red-100 text-red-700',
};

const AdminUsersPage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { primaryItems, secondaryItems } = useAdminSidebarItems();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editingRoles, setEditingRoles] = useState<{ userId: string; roles: string[] } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: () => adminApi.getUsers(page, 20, search || undefined, roleFilter || undefined),
    enabled: isAuthenticated,
  });

  const suspendMutation = useMutation({
    mutationFn: (userId: string) => adminApi.toggleUserSuspension(userId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const rolesMutation = useMutation({
    mutationFn: ({ userId, roles }: { userId: string; roles: string[] }) =>
      adminApi.updateUserRoles(userId, roles),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingRoles(null);
    },
  });

  const isSuspended = (u: AdminUser) =>
    !!u.lockUntil && new Date(u.lockUntil) > new Date();

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
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">User Management</h1>
            <p className="mt-1 text-slate-500">
              {data?.pagination?.total ?? 0} total users
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-52">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name or email…"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-900/20"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-900 focus:outline-none"
            >
              <option value="">All Roles</option>
              {ROLES.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase text-slate-400">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Roles</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? [...Array(6)].map((_, i) => (
                        <tr key={i} className="border-b border-slate-50">
                          <td colSpan={5} className="px-4 py-3">
                            <div className="h-6 animate-pulse rounded bg-slate-100" />
                          </td>
                        </tr>
                      ))
                    : (data?.users ?? []).map((u: AdminUser) => (
                        <tr key={u._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {u.profile.avatar ? (
                                <img src={u.profile.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-900 text-xs font-bold text-white">
                                  {u.profile.firstName[0]?.toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-slate-800">
                                  {u.profile.firstName} {u.profile.lastName}
                                </p>
                                <p className="text-xs text-slate-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {editingRoles?.userId === u._id ? (
                              <div className="flex flex-wrap gap-1">
                                {ROLES.map((r) => (
                                  <label key={r} className="flex cursor-pointer items-center gap-1 text-xs">
                                    <input
                                      type="checkbox"
                                      checked={editingRoles.roles.includes(r)}
                                      onChange={(e) => {
                                        const next = e.target.checked
                                          ? [...editingRoles.roles, r]
                                          : editingRoles.roles.filter((x) => x !== r);
                                        setEditingRoles({ ...editingRoles, roles: next });
                                      }}
                                    />
                                    <span className="capitalize">{r}</span>
                                  </label>
                                ))}
                                <button
                                  onClick={() => rolesMutation.mutate({ userId: u._id, roles: editingRoles.roles })}
                                  className="ml-1 rounded bg-primary-900 px-2 py-0.5 text-xs text-white"
                                  disabled={rolesMutation.isPending}
                                >
                                  Save
                                </button>
                                <button onClick={() => setEditingRoles(null)} className="rounded border px-2 py-0.5 text-xs">
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {u.roles.map((r) => (
                                  <span key={r} className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${ROLE_COLORS[r] ?? 'bg-slate-100 text-slate-600'}`}>
                                    {r}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {isSuspended(u) ? (
                                <><XCircle size={14} className="text-red-500" /><span className="text-xs text-red-600">Suspended</span></>
                              ) : u.isEmailVerified ? (
                                <><CheckCircle size={14} className="text-green-500" /><span className="text-xs text-green-600">Verified</span></>
                              ) : (
                                <><span className="h-2 w-2 rounded-full bg-amber-400" /><span className="text-xs text-amber-600">Unverified</span></>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingRoles({ userId: u._id, roles: [...u.roles] })}
                                title="Edit roles"
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary-900 transition"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => suspendMutation.mutate(u._id)}
                                disabled={suspendMutation.isPending}
                                title={isSuspended(u) ? 'Unsuspend' : 'Suspend'}
                                className={`rounded-lg p-1.5 transition ${isSuspended(u) ? 'text-green-500 hover:bg-green-50' : 'text-red-400 hover:bg-red-50'}`}
                              >
                                {isSuspended(u) ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(data?.pagination?.totalPages ?? 1) > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                <p className="text-xs text-slate-400">
                  Page {data?.pagination?.page} of {data?.pagination?.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= (data?.pagination?.totalPages ?? 1)}
                    className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    Next
                  </button>
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

export default AdminUsersPage;
