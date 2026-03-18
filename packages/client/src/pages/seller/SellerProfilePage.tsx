import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AppFooter, AppHeader, AppNavItem } from '@/components/common';
import { USER_ROLES } from '@edusphere/shared';
import { useAuthStore } from '@/store/authStore';
import { sellerProfileApi } from '@/services/api/seller-profile.api';

const SellerProfilePage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [search, setSearch] = React.useState('');
  const [shopName, setShopName] = React.useState('');
  const [shopDescription, setShopDescription] = React.useState('');
  const [shopAvatar, setShopAvatar] = React.useState('');
  const [shopBanner, setShopBanner] = React.useState('');
  const [responseTime, setResponseTime] = React.useState('');
  const [notice, setNotice] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const roles = user?.roles || [];
  const canAccess =
    roles.includes(USER_ROLES.SELLER) ||
    roles.includes(USER_ROLES.TUTOR) ||
    roles.includes(USER_ROLES.ADMIN);

  const headerItems: AppNavItem[] = [
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Seller Dashboard', href: '/seller/dashboard' },
    { label: 'My Listings', href: '/seller/listings' },
    { label: 'Seller Orders', href: '/seller/orders' },
    { label: 'Seller Profile', href: '/seller/profile', active: true },
    { label: 'Seller Billing', href: '/seller/billing' },
  ];

  const profileQuery = useQuery({
    queryKey: ['seller-profile'],
    queryFn: () => sellerProfileApi.getMyProfile(),
    enabled: isAuthenticated && canAccess,
  });

  React.useEffect(() => {
    const profile = profileQuery.data?.profile;
    if (!profile) return;

    setShopName(profile.shopName || '');
    setShopDescription(profile.shopDescription || '');
    setShopAvatar(profile.shopAvatar || '');
    setShopBanner(profile.shopBanner || '');
    setResponseTime(profile.responseTime || '');
  }, [profileQuery.data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      sellerProfileApi.updateMyProfile({
        shopName: shopName.trim(),
        shopDescription: shopDescription.trim() || undefined,
        shopAvatar: shopAvatar.trim() || undefined,
        shopBanner: shopBanner.trim() || undefined,
        responseTime: responseTime.trim() || undefined,
      }),
    onSuccess: () => {
      setNotice('Seller profile updated.');
      setError(null);
    },
    onError: (mutationError: unknown) => {
      const message = mutationError instanceof Error ? mutationError.message : 'Unable to update profile.';
      setError(message);
      setNotice(null);
    },
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccess) {
    return <Navigate to="/seller/onboarding" replace />;
  }

  if (!profileQuery.isLoading && !profileQuery.data?.profile) {
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

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Seller Profile</h1>
          <p className="mt-2 text-sm text-slate-600">Manage your shop identity and response expectations.</p>

          <form
            className="mt-8 grid gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              setError(null);
              setNotice(null);
              updateMutation.mutate();
            }}
          >
            <input
              value={shopName}
              onChange={(event) => setShopName(event.target.value)}
              placeholder="Shop name"
              required
              minLength={3}
              maxLength={100}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-primary-500 focus:border-primary-500 focus:ring-2"
            />
            <textarea
              value={shopDescription}
              onChange={(event) => setShopDescription(event.target.value)}
              placeholder="Shop description"
              maxLength={500}
              rows={4}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-primary-500 focus:border-primary-500 focus:ring-2"
            />
            <input
              value={shopAvatar}
              onChange={(event) => setShopAvatar(event.target.value)}
              placeholder="Avatar URL"
              type="url"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-primary-500 focus:border-primary-500 focus:ring-2"
            />
            <input
              value={shopBanner}
              onChange={(event) => setShopBanner(event.target.value)}
              placeholder="Banner URL"
              type="url"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-primary-500 focus:border-primary-500 focus:ring-2"
            />
            <input
              value={responseTime}
              onChange={(event) => setResponseTime(event.target.value)}
              placeholder="Response time (e.g. within 2 hours)"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-primary-500 focus:border-primary-500 focus:ring-2"
            />

            {notice ? (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{notice}</p>
            ) : null}
            {error ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="rounded-xl bg-primary-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Profile'}
              </button>
              <Link
                to="/seller/dashboard"
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Seller Dashboard
              </Link>
            </div>
          </form>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default SellerProfilePage;
