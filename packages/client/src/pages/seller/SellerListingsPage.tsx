import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppFooter, AppHeader, AppNavItem } from '@/components/common';
import { IMarketplaceItem, USER_ROLES } from '@edusphere/shared';
import { useAuthStore } from '@/store/authStore';
import { marketplaceApi } from '@/services/api/marketplace.api';

type SellerListingFilter = 'all' | 'published' | 'pending-payment' | 'draft' | 'archived';

const SellerListingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [filter, setFilter] = React.useState<SellerListingFilter>('all');
  const [notice, setNotice] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const roles = user?.roles || [];
  const canAccess = roles.includes(USER_ROLES.SELLER) || roles.includes(USER_ROLES.TUTOR) || roles.includes(USER_ROLES.ADMIN);

  const headerItems: AppNavItem[] = [
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Seller Dashboard', href: '/seller/dashboard' },
    { label: 'My Listings', href: '/seller/listings', active: true },
    { label: 'Seller Orders', href: '/seller/orders' },
    { label: 'Seller Profile', href: '/seller/profile' },
    { label: 'Create Listing', href: '/seller/listings/create' },
    { label: 'Seller Billing', href: '/seller/billing' },
  ];

  const listingsQuery = useQuery({
    queryKey: ['seller-my-listings', page],
    queryFn: () => marketplaceApi.getMyListings(page, 12),
    enabled: isAuthenticated && canAccess,
  });

  const publishMutation = useMutation({
    mutationFn: (listingId: string) => marketplaceApi.publishListing(listingId),
    onSuccess: () => {
      setNotice('Listing publish status updated.');
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['seller-my-listings'] });
    },
    onError: (mutationError: unknown) => {
      const message = mutationError instanceof Error ? mutationError.message : 'Unable to publish listing.';
      setError(message);
      setNotice(null);
      queryClient.invalidateQueries({ queryKey: ['seller-my-listings'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (listingId: string) => marketplaceApi.deleteListing(listingId),
    onSuccess: () => {
      setNotice('Listing removed successfully.');
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['seller-my-listings'] });
    },
    onError: (mutationError: unknown) => {
      const message = mutationError instanceof Error ? mutationError.message : 'Unable to delete listing.';
      setError(message);
      setNotice(null);
    },
  });

  const allListings = listingsQuery.data?.data || [];
  const totalPages = listingsQuery.data?.pagination.pages || 1;

  const filteredListings = React.useMemo(() => {
    return allListings.filter((listing: IMarketplaceItem) => {
      const matchesFilter = filter === 'all' ? true : listing.publishStatus === filter;
      const matchesSearch =
        !search.trim() ||
        listing.title.toLowerCase().includes(search.trim().toLowerCase()) ||
        listing.description.toLowerCase().includes(search.trim().toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [allListings, filter, search]);

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
        searchPlaceholder="Search my listings..."
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
              <h1 className="text-2xl font-black tracking-tight text-slate-900">My Listings</h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage publish state, retry gated items, and jump to billing when required.
              </p>
            </div>
            <div className="flex gap-2">
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
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(['all', 'published', 'pending-payment', 'draft', 'archived'] as SellerListingFilter[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  filter === value
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
          {listingsQuery.isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading listings...</div>
          ) : null}

          {!listingsQuery.isLoading && filteredListings.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              No listings found for this filter.
            </div>
          ) : null}

          {filteredListings.map((listing: IMarketplaceItem) => (
            <article key={listing._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-lg font-black text-slate-900">{listing.title}</h3>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                      {listing.publishStatus}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                      {listing.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">LKR {listing.price.toLocaleString()} | {listing.campus}</p>
                  {listing.publishGateReason ? (
                    <p className="mt-2 text-sm font-medium text-amber-700">{listing.publishGateReason}</p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {listing.publishStatus !== 'published' ? (
                    <button
                      type="button"
                      onClick={() => publishMutation.mutate(listing._id)}
                      disabled={publishMutation.isPending}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Retry Publish
                    </button>
                  ) : null}

                  <Link
                    to={`/seller/listings/${listing._id}/edit`}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                  >
                    Edit
                  </Link>

                  <Link
                    to={`/marketplace/${listing._id}`}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                  >
                    View
                  </Link>

                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(listing._id)}
                    disabled={deleteMutation.isPending}
                    className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Delete
                  </button>

                  {listing.publishGateReason ? (
                    <Link
                      to="/seller/billing"
                      className="rounded-lg bg-primary-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-primary-800"
                    >
                      Fix Billing
                    </Link>
                  ) : null}
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

export default SellerListingsPage;
