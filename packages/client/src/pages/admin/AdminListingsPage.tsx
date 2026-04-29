import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppFooter, AppHeader, AppSidebar } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { useAdminSidebarItems } from '@/hooks/useSidebarItems';
import { adminApi, AdminListing } from '@/services/api/admin.api';

const PUBLISH_STATUS_STYLES: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-slate-100 text-slate-500',
  'pending-payment': 'bg-amber-100 text-amber-700',
  archived: 'bg-red-100 text-red-700',
};

const AdminListingsPage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { primaryItems, secondaryItems } = useAdminSidebarItems();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-listings', page, search, statusFilter],
    queryFn: () => adminApi.getListings(page, 20, search || undefined, statusFilter || undefined),
    enabled: isAuthenticated,
  });

  const removeMutation = useMutation({
    mutationFn: (listingId: string) => adminApi.removeListing(listingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      setConfirmRemove(null);
    },
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
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Listing Moderation</h1>
            <p className="mt-1 text-slate-500">{data?.pagination?.total ?? 0} total listings</p>
          </div>

          {/* Confirm dialog */}
          {confirmRemove && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="font-bold text-slate-900">Remove listing?</h3>
                <p className="mt-2 text-sm text-slate-500">This will archive the listing and hide it from the marketplace.</p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => removeMutation.mutate(confirmRemove)}
                    disabled={removeMutation.isPending}
                    className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {removeMutation.isPending ? 'Removing…' : 'Remove'}
                  </button>
                  <button onClick={() => setConfirmRemove(null)} className="flex-1 rounded-lg border py-2 text-sm font-semibold">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-52">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by title or category…"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-900/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-900 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="pending-payment">Pending Payment</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase text-slate-400">
                    <th className="px-4 py-3">Listing</th>
                    <th className="px-4 py-3">Seller</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Posted</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? [...Array(5)].map((_, i) => (
                        <tr key={i} className="border-b border-slate-50">
                          <td colSpan={6} className="px-4 py-3">
                            <div className="h-6 animate-pulse rounded bg-slate-100" />
                          </td>
                        </tr>
                      ))
                    : (data?.listings ?? []).map((l: AdminListing) => (
                        <tr key={l._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {l.images?.[0] ? (
                                <img src={l.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-slate-100" />
                              )}
                              <div>
                                <p className="max-w-xs truncate font-semibold text-slate-800">{l.title}</p>
                                <p className="text-xs capitalize text-slate-400">{l.category} · {l.condition ?? '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-700">
                              {l.sellerId?.profile?.firstName} {l.sellerId?.profile?.lastName}
                            </p>
                            <p className="text-xs text-slate-400">{l.sellerId?.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${PUBLISH_STATUS_STYLES[l.publishStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                              {l.publishStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-700">
                            LKR {l.price.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {new Date(l.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/marketplace/${l._id}`}
                                target="_blank"
                                title="View listing"
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary-900 transition"
                              >
                                <ExternalLink size={14} />
                              </Link>
                              {l.publishStatus !== 'archived' && (
                                <button
                                  onClick={() => setConfirmRemove(l._id)}
                                  title="Remove listing"
                                  className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 transition"
                                >
                                  <Trash2 size={14} />
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

export default AdminListingsPage;
