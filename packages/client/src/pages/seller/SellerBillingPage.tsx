import React from 'react';
import { Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AppFooter, AppHeader, AppNavItem } from '@/components/common';
import { USER_ROLES, VENDOR_PLAN_QUOTAS, VENDOR_PLAN_TIERS, VendorPlanTier } from '@edusphere/shared';
import { useAuthStore } from '@/store/authStore';
import { vendorBillingApi } from '@/services/api/vendor-billing.api';

const planDescriptions: Record<VendorPlanTier, string> = {
  [VENDOR_PLAN_TIERS.STARTER]: 'Best for getting started with marketplace selling.',
  [VENDOR_PLAN_TIERS.PRO]: 'For active sellers who need more listing capacity.',
  [VENDOR_PLAN_TIERS.ELITE]: 'For high-volume stores and premium marketplace visibility.',
};

const SellerBillingPage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [search, setSearch] = React.useState('');

  const headerItems: AppNavItem[] = [
    { label: 'Courses', href: '/courses' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Seller Dashboard', href: '/seller/dashboard' },
    { label: 'My Listings', href: '/seller/listings' },
    { label: 'Seller Orders', href: '/seller/orders' },
    { label: 'Seller Profile', href: '/seller/profile' },
    { label: 'Seller Billing', href: '/seller/billing', active: true },
  ];

  const roles = user?.roles || [];
  const canAccess = roles.includes(USER_ROLES.SELLER) || roles.includes(USER_ROLES.TUTOR) || roles.includes(USER_ROLES.ADMIN);

  const statusQuery = useQuery({
    queryKey: ['vendor-billing-status'],
    queryFn: () => vendorBillingApi.getMyStatus(),
    enabled: isAuthenticated && canAccess,
  });

  const checkoutMutation = useMutation({
    mutationFn: (tier: VendorPlanTier) =>
      vendorBillingApi.createCheckout({
        tier,
        returnUrl: `${window.location.origin}/seller/billing?checkout=success`,
        cancelUrl: `${window.location.origin}/seller/billing?checkout=cancelled`,
      }),
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccess) {
    return <Navigate to="/dashboard" replace />;
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
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Seller Billing</h1>
          <p className="mt-2 text-sm text-slate-600">
            An active subscription is required before listings can be published.
          </p>

          {statusQuery.data ? (
            <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-slate-100 p-3">
                <p className="text-xs uppercase text-slate-500">Current Tier</p>
                <p className="font-bold capitalize">{statusQuery.data.tier}</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-3">
                <p className="text-xs uppercase text-slate-500">Status</p>
                <p className="font-bold capitalize">{statusQuery.data.status}</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-3">
                <p className="text-xs uppercase text-slate-500">Used Listings</p>
                <p className="font-bold">{statusQuery.data.usedListings}</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-3">
                <p className="text-xs uppercase text-slate-500">Remaining</p>
                <p className="font-bold">{statusQuery.data.remainingListings}</p>
              </div>
            </div>
          ) : null}
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          {(Object.values(VENDOR_PLAN_TIERS) as VendorPlanTier[]).map((tier) => (
            <article key={tier} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-primary-700">{tier}</p>
              <h2 className="mt-2 text-xl font-black text-slate-900">
                {VENDOR_PLAN_QUOTAS[tier]} listings / month
              </h2>
              <p className="mt-3 text-sm text-slate-600">{planDescriptions[tier]}</p>

              <button
                type="button"
                onClick={() => checkoutMutation.mutate(tier)}
                disabled={checkoutMutation.isPending}
                className="mt-5 w-full rounded-xl bg-primary-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkoutMutation.isPending ? 'Redirecting...' : `Choose ${tier}`}
              </button>
            </article>
          ))}
        </section>

        <div className="mt-6 flex justify-end">
          <div className="flex gap-2">
            <Link
              to="/seller/listings"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Manage My Listings
            </Link>
            <Link
              to="/seller/orders"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Seller Orders
            </Link>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default SellerBillingPage;
