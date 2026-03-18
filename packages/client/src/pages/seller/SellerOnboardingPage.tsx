import React from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AppFooter, AppHeader, AppNavItem } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { sellerProfileApi } from '@/services/api/seller-profile.api';
import { authApi } from '@/services/api/auth.api';

const SellerOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, setUser } = useAuthStore();
  const [search, setSearch] = React.useState('');

  const [shopName, setShopName] = React.useState('');
  const [shopDescription, setShopDescription] = React.useState('');
  const [agreeToTerms, setAgreeToTerms] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const headerItems: AppNavItem[] = [
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Seller Onboarding', href: '/seller/onboarding', active: true },
  ];

  const onboardingMutation = useMutation({
    mutationFn: () =>
      sellerProfileApi.onboard({
        shopName: shopName.trim(),
        shopDescription: shopDescription.trim() || undefined,
        agreeToTerms,
      }),
    onSuccess: async () => {
      const me = await authApi.getCurrentUser();
      setUser(me.user);
      navigate('/seller/billing');
    },
    onError: (mutationError: any) => {
      const message = mutationError?.response?.data?.error?.message || 'Unable to complete onboarding.';
      setError(message);
    },
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader
        navItems={headerItems}
        search={search}
        searchPlaceholder="Search..."
        onSearchChange={setSearch}
        isAuthenticated={isAuthenticated}
        userName={user?.profile.firstName || 'Student'}
        userMeta="Seller Setup"
        avatarUrl={user?.profile.avatar}
        onLogout={() => void logout()}
      />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-700">Become a Vendor</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Create your marketplace seller profile</h1>
          <p className="mt-2 text-sm text-slate-600">
            Finish onboarding, activate billing, then publish listings to the marketplace.
          </p>

          <form
            className="mt-8 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              setError(null);
              onboardingMutation.mutate();
            }}
          >
            <div>
              <label className="block text-sm font-bold text-slate-800">Shop Name</label>
              <input
                value={shopName}
                onChange={(event) => setShopName(event.target.value)}
                required
                minLength={3}
                maxLength={100}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-primary-500 focus:border-primary-500 focus:ring-2"
                placeholder="Campus Notes Hub"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800">Shop Description</label>
              <textarea
                value={shopDescription}
                onChange={(event) => setShopDescription(event.target.value)}
                maxLength={500}
                rows={4}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-primary-500 focus:border-primary-500 focus:ring-2"
                placeholder="What kind of study items do you sell?"
              />
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(event) => setAgreeToTerms(event.target.checked)}
                className="mt-0.5"
                required
              />
              <span>
                I agree to marketplace vendor terms, billing requirements, and listing policy.
              </span>
            </label>

            {error ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={onboardingMutation.isPending}
                className="rounded-xl bg-primary-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {onboardingMutation.isPending ? 'Saving...' : 'Complete Onboarding'}
              </button>
              <Link
                to="/marketplace"
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default SellerOnboardingPage;
