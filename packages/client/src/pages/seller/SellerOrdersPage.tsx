import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ORDER_FULFILLMENT_STATUS,
  OrderFulfillmentStatus,
  USER_ROLES,
  IOrder,
} from '@edusphere/shared';
import { AppFooter, AppHeader, AppNavItem } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { ordersApi } from '@/services/api/orders.api';

const statusOptions: OrderFulfillmentStatus[] = [
  ORDER_FULFILLMENT_STATUS.PROCESSING,
  ORDER_FULFILLMENT_STATUS.SHIPPED,
  ORDER_FULFILLMENT_STATUS.DELIVERED,
  ORDER_FULFILLMENT_STATUS.CANCELLED,
];

const SellerOrdersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [fulfillmentFilter, setFulfillmentFilter] = React.useState<OrderFulfillmentStatus | 'all'>('all');
  const [notice, setNotice] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const roles = user?.roles || [];
  const canAccess = roles.includes(USER_ROLES.SELLER) || roles.includes(USER_ROLES.TUTOR) || roles.includes(USER_ROLES.ADMIN);

  const headerItems: AppNavItem[] = [
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Seller Dashboard', href: '/seller/dashboard' },
    { label: 'My Listings', href: '/seller/listings' },
    { label: 'Seller Orders', href: '/seller/orders', active: true },
    { label: 'Seller Profile', href: '/seller/profile' },
    { label: 'Seller Billing', href: '/seller/billing' },
  ];

  const ordersQuery = useQuery({
    queryKey: ['seller-orders', page, fulfillmentFilter],
    queryFn: () =>
      ordersApi.getSellerOrders(
        page,
        10,
        fulfillmentFilter === 'all' ? undefined : fulfillmentFilter
      ),
    enabled: isAuthenticated && canAccess,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderFulfillmentStatus }) =>
      ordersApi.updateFulfillmentStatus(orderId, status),
    onSuccess: () => {
      setNotice('Order status updated.');
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
    },
    onError: (mutationError: unknown) => {
      const message = mutationError instanceof Error ? mutationError.message : 'Unable to update order status.';
      setError(message);
      setNotice(null);
    },
  });

  const allOrders = ordersQuery.data?.data || [];
  const totalPages = ordersQuery.data?.pagination.pages || 1;

  const visibleOrders = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return allOrders;
    }

    return allOrders.filter((order: IOrder) => {
      return (
        order.orderNumber.toLowerCase().includes(term) ||
        order.items.some((item) => item.title.toLowerCase().includes(term))
      );
    });
  }, [allOrders, search]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccess) {
    return <Navigate to="/seller/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader
        navItems={headerItems}
        search={search}
        searchPlaceholder="Search by order number or item..."
        onSearchChange={setSearch}
        isAuthenticated={isAuthenticated}
        userName={user?.profile.firstName || 'Seller'}
        userMeta="Vendor"
        avatarUrl={user?.profile.avatar}
        onLogout={() => void logout()}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Seller Orders</h1>
              <p className="mt-1 text-sm text-slate-600">
                Update fulfillment statuses and track incoming marketplace sales.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/seller/listings"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                My Listings
              </Link>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFulfillmentFilter('all')}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                fulfillmentFilter === 'all'
                  ? 'bg-primary-900 text-white'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              all
            </button>
            {Object.values(ORDER_FULFILLMENT_STATUS).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFulfillmentFilter(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  fulfillmentFilter === value
                    ? 'bg-primary-900 text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          {notice ? (
            <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{notice}</p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>
          ) : null}
        </section>

        <section className="mt-6 grid gap-4">
          {ordersQuery.isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading seller orders...</div>
          ) : null}

          {!ordersQuery.isLoading && visibleOrders.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              No orders found for this filter.
            </div>
          ) : null}

          {visibleOrders.map((order: IOrder) => (
            <article key={order._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">{order.orderNumber}</h3>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                      {order.fulfillmentStatus}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                      {order.paymentStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {order.items.length} item(s) | Total LKR {order.total.toLocaleString()}
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {order.items.map((item) => (
                      <li key={`${order._id}-${item.itemId}`}>{item.title} x {item.quantity}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={`${order._id}-${status}`}
                      type="button"
                      onClick={() => updateStatusMutation.mutate({ orderId: order._id, status })}
                      disabled={updateStatusMutation.isPending || order.fulfillmentStatus === status}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Mark {status}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <p className="text-sm font-medium text-slate-600">Page {page} of {Math.max(totalPages, 1)}</p>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default SellerOrdersPage;
