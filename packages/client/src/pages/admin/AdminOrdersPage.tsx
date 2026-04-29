import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppFooter, AppHeader, AppSidebar } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { useAdminSidebarItems } from '@/hooks/useSidebarItems';
import { adminApi, AdminOrder } from '@/services/api/admin.api';

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-slate-100 text-slate-500',
};

const FULFILLMENT_STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-violet-100 text-violet-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const AdminOrdersPage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { primaryItems, secondaryItems } = useAdminSidebarItems();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: () => adminApi.getOrders(page, 20),
    enabled: isAuthenticated,
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
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Order Management</h1>
            <p className="mt-1 text-slate-500">{data?.pagination?.total ?? 0} total orders</p>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase text-slate-400">
                    <th className="px-4 py-3">Order #</th>
                    <th className="px-4 py-3">Buyer</th>
                    <th className="px-4 py-3">Seller</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Fulfillment</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? [...Array(6)].map((_, i) => (
                        <tr key={i} className="border-b border-slate-50">
                          <td colSpan={7} className="px-4 py-3">
                            <div className="h-6 animate-pulse rounded bg-slate-100" />
                          </td>
                        </tr>
                      ))
                    : (data?.orders ?? []).map((o: AdminOrder) => (
                        <tr key={o._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{o.orderNumber}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-700">
                              {o.buyerId?.profile?.firstName} {o.buyerId?.profile?.lastName}
                            </p>
                            <p className="text-xs text-slate-400">{o.buyerId?.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-700">
                              {o.sellerId?.profile?.firstName} {o.sellerId?.profile?.lastName}
                            </p>
                            <p className="text-xs text-slate-400">{o.sellerId?.email}</p>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-800">
                            LKR {o.total.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PAYMENT_STATUS_STYLES[o.paymentStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                              {o.paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${FULFILLMENT_STATUS_STYLES[o.fulfillmentStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                              {o.fulfillmentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {new Date(o.createdAt).toLocaleDateString()}
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

export default AdminOrdersPage;
