import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppFooter, AppHeader, AppNavItem } from '@/components/common';
import { IMarketplaceItem, USER_ROLES } from '@edusphere/shared';
import { useAuthStore } from '@/store/authStore';
import { vendorBillingApi } from '@/services/api/vendor-billing.api';
import { marketplaceApi } from '@/services/api/marketplace.api';
import { ordersApi } from '@/services/api/orders.api';

const SellerDashboardPage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [search, setSearch] = React.useState('');

  const roles = user?.roles || [];
  const canAccess =
    roles.includes(USER_ROLES.SELLER) ||
    roles.includes(USER_ROLES.TUTOR) ||
    roles.includes(USER_ROLES.ADMIN);

  const headerItems: AppNavItem[] = [
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Seller Dashboard', href: '/seller/dashboard', active: true },
    { label: 'My Listings', href: '/seller/listings' },
    { label: 'Seller Orders', href: '/seller/orders' },
    { label: 'Seller Profile', href: '/seller/profile' },
    { label: 'Seller Billing', href: '/seller/billing' },
  ];

  const billingQuery = useQuery({
    queryKey: ['seller-dashboard-billing'],
    queryFn: () => vendorBillingApi.getMyStatus(),
    enabled: isAuthenticated && canAccess,
  });

  const listingsQuery = useQuery({
    queryKey: ['seller-dashboard-listings'],
    queryFn: () => marketplaceApi.getMyListings(1, 50),
    enabled: isAuthenticated && canAccess,
  });

  const statsQuery = useQuery({
    queryKey: ['seller-dashboard-order-stats'],
    queryFn: () => ordersApi.getSellerOrderStats(),
    enabled: isAuthenticated && canAccess,
  });

  const recentOrdersQuery = useQuery({
    queryKey: ['seller-dashboard-recent-orders'],
    queryFn: () => ordersApi.getSellerOrders(1, 5),
    enabled: isAuthenticated && canAccess,
  });

  const listings = listingsQuery.data?.data || [];
  const listingMetrics = React.useMemo(() => {
    return listings.reduce(
      (acc, listing: IMarketplaceItem) => {
        acc.total += 1;
        if (listing.publishStatus === 'published') acc.published += 1;
        if (listing.publishStatus === 'pending-payment') acc.gated += 1;
        return acc;
      },
      { total: 0, published: 0, gated: 0 }
    );
  }, [listings]);

  const publishConversionRate =
    listingMetrics.total > 0
      ? Math.round((listingMetrics.published / listingMetrics.total) * 100)
      : 0;

  const quotaUsageRate =
    (billingQuery.data?.listingQuota || 0) > 0
      ? Math.round(((billingQuery.data?.usedListings || 0) / (billingQuery.data?.listingQuota || 1)) * 100)
      : 0;

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
        searchPlaceholder="Search..."
        onSearchChange={setSearch}
        isAuthenticated={isAuthenticated}
        userName={user?.profile.firstName || 'Seller'}
        userMeta="Vendor"
        avatarUrl={user?.profile.avatar}
        onLogout={() => void logout()}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Seller Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Overview of subscription, listing gates, and order performance.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/seller/listings/create"
              className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-800"
            >
              New Listing
            </Link>
            <Link
              to="/seller/billing"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Billing
            </Link>
            <Link
              to="/seller/orders"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Orders
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Subscription</p>
            <p className="mt-2 text-2xl font-black capitalize text-slate-900">
              {billingQuery.data?.status || 'inactive'}
            </p>
            <p className="mt-1 text-sm text-slate-600 capitalize">Tier: {billingQuery.data?.tier || 'starter'}</p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Listings</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{listingMetrics.published}/{listingMetrics.total}</p>
            <p className="mt-1 text-sm text-slate-600">Published vs total listings</p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Gated Listings</p>
            <p className="mt-2 text-2xl font-black text-amber-700">{listingMetrics.gated}</p>
            <p className="mt-1 text-sm text-slate-600">Need active billing/quota to publish</p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Seller Revenue</p>
            <p className="mt-2 text-2xl font-black text-slate-900">
              LKR {(statsQuery.data?.totalRevenue || 0).toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-slate-600">From completed orders</p>
          </article>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">Order Performance</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-100 p-3">
                <p className="text-xs uppercase text-slate-500">Total</p>
                <p className="text-xl font-black text-slate-900">{statsQuery.data?.totalOrders || 0}</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-3">
                <p className="text-xs uppercase text-slate-500">Completed</p>
                <p className="text-xl font-black text-emerald-700">{statsQuery.data?.completedOrders || 0}</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-3">
                <p className="text-xs uppercase text-slate-500">Pending</p>
                <p className="text-xl font-black text-amber-700">{statsQuery.data?.pendingOrders || 0}</p>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">Billing Capacity</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-100 p-3">
                <p className="text-xs uppercase text-slate-500">Used</p>
                <p className="text-xl font-black text-slate-900">{billingQuery.data?.usedListings || 0}</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-3">
                <p className="text-xs uppercase text-slate-500">Remaining</p>
                <p className="text-xl font-black text-slate-900">{billingQuery.data?.remainingListings || 0}</p>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">Publish Conversion</h2>
            <p className="mt-3 text-3xl font-black text-slate-900">{publishConversionRate}%</p>
            <p className="mt-1 text-sm text-slate-600">
              {listingMetrics.published} of {listingMetrics.total} listings are currently published.
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">Quota Utilization</h2>
            <p className="mt-3 text-3xl font-black text-slate-900">{quotaUsageRate}%</p>
            <p className="mt-1 text-sm text-slate-600">
              Using {billingQuery.data?.usedListings || 0} of {billingQuery.data?.listingQuota || 0} listing slots.
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Recent Seller Orders</h2>
            <Link
              to="/seller/orders"
              className="text-sm font-bold text-primary-900 transition hover:text-primary-700"
            >
              View all
            </Link>
          </div>

          {recentOrdersQuery.isLoading ? (
            <p className="text-sm text-slate-600">Loading recent orders...</p>
          ) : recentOrdersQuery.data?.data?.length ? (
            <div className="space-y-3">
              {recentOrdersQuery.data.data.map((order) => (
                <div key={order._id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900">{order.orderNumber}</p>
                    <p className="text-xs font-bold text-slate-600">{order.fulfillmentStatus}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">LKR {order.total.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">No seller orders yet.</p>
          )}
        </section>
      </main>

      <AppFooter />
    </div>
  );
};

export default SellerDashboardPage;
