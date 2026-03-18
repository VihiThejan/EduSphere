import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AppFooter, AppHeader, AppNavItem } from '@/components/common';
import {
  CAMPUS_LOCATIONS,
  ITEM_CONDITION,
  MARKETPLACE_CATEGORIES,
  USER_ROLES,
  IMarketplaceItem,
} from '@edusphere/shared';
import { useAuthStore } from '@/store/authStore';
import { marketplaceApi } from '@/services/api/marketplace.api';
import ListingImagesField, { ListingImageInput } from '@/components/seller/ListingImagesField';

const SellerCreateListingPage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [search, setSearch] = React.useState('');

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState<(typeof MARKETPLACE_CATEGORIES)[number]>('textbooks');
  const [price, setPrice] = React.useState('');
  const [quantity, setQuantity] = React.useState('1');
  const [condition, setCondition] = React.useState<(typeof ITEM_CONDITION)[keyof typeof ITEM_CONDITION]>('new');
  const [campus, setCampus] = React.useState<(typeof CAMPUS_LOCATIONS)[number]>('colombo');
  const [images, setImages] = React.useState<ListingImageInput[]>([
    { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, url: '' },
  ]);
  const [isNegotiable, setIsNegotiable] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [createdListing, setCreatedListing] = React.useState<IMarketplaceItem | null>(null);

  const roles = user?.roles || [];
  const canAccess = roles.includes(USER_ROLES.SELLER) || roles.includes(USER_ROLES.TUTOR) || roles.includes(USER_ROLES.ADMIN);

  const headerItems: AppNavItem[] = [
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Seller Dashboard', href: '/seller/dashboard' },
    { label: 'My Listings', href: '/seller/listings' },
    { label: 'Seller Profile', href: '/seller/profile' },
    { label: 'Seller Billing', href: '/seller/billing' },
    { label: 'Create Listing', href: '/seller/listings/create', active: true },
  ];

  const createMutation = useMutation({
    mutationFn: () => {
      const normalizedImages = images
        .map((image, index) => ({ url: image.url.trim(), order: index }))
        .filter((image) => image.url.length > 0);

      if (!normalizedImages.length) {
        throw new Error('At least one image URL is required.');
      }

      return marketplaceApi.createListing({
        title: title.trim(),
        description: description.trim(),
        category,
        price: Number(price),
        quantity: Number(quantity),
        condition,
        campus,
        images: normalizedImages,
        tags: [],
        isNegotiable,
      });
    },
    onSuccess: (response) => {
      setCreatedListing(response.listing);
      setError(null);
    },
    onError: (mutationError: any) => {
      const message = mutationError?.response?.data?.error?.message || 'Unable to create listing.';
      setError(message);
    },
  });

  const publishMutation = useMutation({
    mutationFn: (listingId: string) => marketplaceApi.publishListing(listingId),
    onSuccess: (response) => {
      setCreatedListing(response.listing);
      setError(null);
    },
    onError: (mutationError: any) => {
      const message = mutationError?.response?.data?.error?.message || 'Unable to publish listing.';
      setError(message);
    },
  });

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

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Create Marketplace Listing</h1>
          <p className="mt-2 text-sm text-slate-600">
            Listings require active billing to be visible publicly.
          </p>

          <form
            className="mt-8 grid gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              setError(null);
              createMutation.mutate();
            }}
          >
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Listing title"
              required
              minLength={5}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-primary-500 focus:border-primary-500 focus:ring-2"
            />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Listing description"
              required
              minLength={10}
              rows={4}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-primary-500 focus:border-primary-500 focus:ring-2"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as (typeof MARKETPLACE_CATEGORIES)[number])}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-primary-500 focus:border-primary-500 focus:ring-2"
              >
                {MARKETPLACE_CATEGORIES.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
              <input
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="Price"
                required
                type="number"
                min="0"
                step="0.01"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-primary-500 focus:border-primary-500 focus:ring-2"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <input
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="Quantity"
                required
                type="number"
                min="1"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-primary-500 focus:border-primary-500 focus:ring-2"
              />
              <select
                value={condition}
                onChange={(event) => setCondition(event.target.value as (typeof ITEM_CONDITION)[keyof typeof ITEM_CONDITION])}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-primary-500 focus:border-primary-500 focus:ring-2"
              >
                {Object.values(ITEM_CONDITION).map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
              <select
                value={campus}
                onChange={(event) => setCampus(event.target.value as (typeof CAMPUS_LOCATIONS)[number])}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-primary-500 focus:border-primary-500 focus:ring-2"
              >
                {CAMPUS_LOCATIONS.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>

            <ListingImagesField images={images} onChange={setImages} />

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isNegotiable}
                onChange={(event) => setIsNegotiable(event.target.checked)}
              />
              Price is negotiable
            </label>

            {error ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-xl bg-primary-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createMutation.isPending ? 'Saving...' : 'Create Listing'}
            </button>
          </form>

          {createdListing ? (
            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-900">
                Listing Status: <span className="capitalize">{createdListing.publishStatus}</span>
              </p>
              {createdListing.publishGateReason ? (
                <p className="mt-2 text-sm text-amber-700">{createdListing.publishGateReason}</p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-3">
                {createdListing.publishStatus !== 'published' ? (
                  <button
                    type="button"
                    onClick={() => publishMutation.mutate(createdListing._id)}
                    disabled={publishMutation.isPending}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {publishMutation.isPending ? 'Checking...' : 'Try Publish'}
                  </button>
                ) : null}

                <Link
                  to="/seller/listings"
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
                >
                  My Listings
                </Link>

                <Link
                  to="/seller/billing"
                  className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-800"
                >
                  Go to Billing
                </Link>

                <Link
                  to={`/marketplace/${createdListing._id}`}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
                >
                  View Listing
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default SellerCreateListingPage;
