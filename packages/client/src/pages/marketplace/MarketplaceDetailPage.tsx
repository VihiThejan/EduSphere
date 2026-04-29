import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppFooter, AppHeader, AppNavItem } from '@/components/common';
import {
  MarketplaceCompactCard,
  MarketplaceCampus,
  MarketplaceCondition,
  MarketplaceDescriptionCard,
  MarketplaceDetailBreadcrumbs,
  MarketplaceImageGallery,
  MarketplaceItemType,
  MarketplaceListing,
  MarketplaceListingDetail,
  MarketplacePickupMap,
  MarketplaceSafetyTip,
  MarketplaceSellerPanel,
} from '@/components/marketplace';
import { useAuthStore } from '@/store/authStore';
import { marketplaceApi } from '@/services/api/marketplace.api';
import { reviewsApi, IReview } from '@/services/api/reviews.api';

const categoryDisplayMap: Record<string, string> = {
  textbooks: 'Textbooks',
  calculators: 'Calculators',
  'laptops-tech': 'Laptops & Tech',
  'course-materials': 'Textbooks',
  notes: 'Textbooks',
  'lab-equipment': 'Laptops & Tech',
  other: 'Textbooks',
};

const campusDisplayMap: Record<string, string> = {
  colombo: 'Colombo Campus',
  moratuwa: 'Moratuwa Campus',
  peradeniya: 'Peradeniya Campus',
  kelaniya: 'Kelaniya Campus',
  other: 'Colombo Campus',
};

const conditionDisplayMap: Record<string, string> = {
  new: 'New',
  'used-like-new': 'Used - Like New',
  'used-good': 'Used - Good',
  'used-fair': 'Used - Good',
};

interface ApiListing {
  _id: string;
  title: string;
  description?: string;
  price: number;
  campus: string;
  category: string;
  condition: string;
  isNegotiable: boolean;
  createdAt: string | Date;
  tags?: string[];
  images?: Array<{ url: string }>;
  seller?: {
    id?: string;
    name?: string;
    avatar?: string;
    rating?: number;
    reviewCount?: number;
  };
}

const mapListing = (item: ApiListing): MarketplaceListing => ({
  id: item._id,
  title: item.title,
  price: item.price,
  sellerName: item.seller?.name || 'Seller',
  campus: (campusDisplayMap[item.campus] || 'Colombo Campus') as MarketplaceCampus,
  imageUrl:
    item.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80',
  itemType: (categoryDisplayMap[item.category] || 'Textbooks') as MarketplaceItemType,
  condition: (conditionDisplayMap[item.condition] || 'New') as MarketplaceCondition,
  verifiedSeller: (item.seller?.reviewCount || 0) >= 5,
  negotiable: Boolean(item.isNegotiable),
  postedAt: new Date(item.createdAt).toISOString(),
});

const mapDetail = (item: ApiListing): MarketplaceListingDetail => {
  const base = mapListing(item);
  return {
    ...base,
    breadcrumbLabel: base.title,
    postedRelative: new Date(base.postedAt).toLocaleDateString(),
    description: item.description || 'No additional description available.',
    gallery:
      item.images?.map((image: { url: string }) => image.url) ||
      [
        'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80',
      ],
    relevantCourses: item.tags?.length ? item.tags : ['General Studies'],
    seller: {
      name: item.seller?.name || 'Seller',
      avatarUrl:
        item.seller?.avatar ||
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
      rating: item.seller?.rating || 4.6,
      reviewCount: item.seller?.reviewCount || 0,
    },
    mapImageUrl:
      'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80',
    similarListingIds: [],
  };
};

// ── Inline Reviews Section ───────────────────────────────────────────────────

const StarIcon: React.FC<{ filled: boolean; onClick?: () => void }> = ({ filled, onClick }) => (
  <svg
    onClick={onClick}
    className={`h-5 w-5 ${onClick ? 'cursor-pointer' : ''} ${filled ? 'text-amber-400' : 'text-slate-300'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ReviewsSection: React.FC<{ itemId: string }> = ({ itemId }) => {
  const { isAuthenticated } = useAuthStore();
  const qc = useQueryClient();
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [submitError, setSubmitError] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', itemId],
    queryFn: () => reviewsApi.getItemReviews(itemId),
    enabled: Boolean(itemId),
  });

  const createMutation = useMutation({
    mutationFn: reviewsApi.createReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', itemId] });
      setRating(0);
      setComment('');
      setSubmitError('');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSubmitError(msg || 'Failed to submit review');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: reviewsApi.deleteReview,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', itemId] }),
  });

  const reviews: IReview[] = data?.data ?? [];
  const avgRating = data?.averageRating ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setSubmitError('Please select a star rating'); return; }
    createMutation.mutate({ itemId, rating, comment: comment.trim() || undefined });
  };

  return (
    <section className="mt-12">
      <h3 className="mb-1 text-2xl font-black tracking-tight text-slate-900">Reviews</h3>
      {avgRating > 0 && (
        <div className="mb-6 flex items-center gap-2">
          <div className="flex">{[1,2,3,4,5].map(n => <StarIcon key={n} filled={n <= Math.round(avgRating)} />)}</div>
          <span className="font-semibold text-slate-700">{avgRating.toFixed(1)}</span>
          <span className="text-sm text-slate-500">({data?.pagination.total ?? 0} reviews)</span>
        </div>
      )}

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-3 font-semibold text-slate-800">Leave a review</p>
          <div className="mb-3 flex gap-1">
            {[1,2,3,4,5].map(n => (
              <StarIcon key={n} filled={n <= rating} onClick={() => setRating(n)} />
            ))}
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience (optional)"
            rows={3}
            maxLength={500}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-900"
          />
          {submitError && <p className="mt-1 text-xs text-red-600">{submitError}</p>}
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="mt-3 rounded-lg bg-primary-900 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      )}

      {isLoading && <p className="text-sm text-slate-500">Loading reviews…</p>}

      {!isLoading && reviews.length === 0 && (
        <p className="text-sm text-slate-500">No reviews yet. Be the first to review this item.</p>
      )}

      <div className="space-y-4">
        {reviews.map((r) => {
          const buyerProfile = typeof r.buyerId === 'object' ? r.buyerId.profile : null;
          const buyerId = typeof r.buyerId === 'object' ? r.buyerId._id : r.buyerId;
          return (
            <div key={r._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  {buyerProfile?.avatar ? (
                    <img src={buyerProfile.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-900">
                      {buyerProfile?.firstName?.[0] ?? '?'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {buyerProfile ? `${buyerProfile.firstName} ${buyerProfile.lastName}` : 'Buyer'}
                    </p>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(n => <StarIcon key={n} filled={n <= r.rating} />)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                  {isAuthenticated && buyerId === useAuthStore.getState().user?._id && (
                    <button
                      onClick={() => deleteMutation.mutate(r._id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              {r.comment && <p className="mt-2 text-sm text-slate-600">{r.comment}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const MarketplaceDetailPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [search, setSearch] = React.useState('');

  const headerItems: AppNavItem[] = [
    { label: 'Courses', href: '/courses' },
    { label: 'Marketplace', href: '/marketplace', active: true },
    { label: 'Community', href: '/' },
  ];

  const { data: listingResponse, isLoading, isError } = useQuery({
    queryKey: ['marketplace-detail', listingId],
    queryFn: () => marketplaceApi.getListingById(listingId as string),
    enabled: Boolean(listingId),
  });

  const listingRaw = listingResponse?.listing;
  const listing = listingRaw ? mapDetail(listingRaw) : null;

  const { data: sellerListingsResponse } = useQuery({
    queryKey: ['marketplace-seller-similar', listingRaw?.seller?.id, listingId],
    queryFn: () =>
      marketplaceApi.getSellerListingsPublic(listingRaw?.seller?.id as string, 1, 8),
    enabled: Boolean(listingRaw?.seller?.id),
  });

  const similarListings = React.useMemo(() => {
    const items = (sellerListingsResponse?.data || [])
      .filter((item: ApiListing) => item._id !== listingId)
      .slice(0, 4)
      .map(mapListing);
    return items;
  }, [sellerListingsResponse, listingId]);

  if (!listingId) {
    return <Navigate to="/marketplace" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-10 text-center text-slate-600">Loading listing...</div>
    );
  }

  if (isError || !listing) {
    return <Navigate to="/marketplace" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader
        navItems={headerItems}
        search={search}
        searchPlaceholder="Search textbooks, tech..."
        onSearchChange={setSearch}
        isAuthenticated={isAuthenticated}
        userName={user?.profile.firstName || 'Student'}
        userMeta={isAuthenticated ? 'Marketplace' : undefined}
        avatarUrl={user?.profile.avatar}
        onLogout={isAuthenticated ? () => void logout() : undefined}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <MarketplaceDetailBreadcrumbs itemType={listing.itemType} title={listing.breadcrumbLabel} />

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="space-y-8 lg:col-span-8">
            <MarketplaceImageGallery title={listing.title} images={listing.gallery} />
            <MarketplaceDescriptionCard
              description={listing.description}
              relevantCourses={listing.relevantCourses}
            />
            <MarketplaceSafetyTip />
          </div>

          <div className="mt-8 space-y-6 lg:col-span-4 lg:mt-0">
            <MarketplaceSellerPanel listing={listing} />
            <MarketplacePickupMap imageUrl={listing.mapImageUrl} />
          </div>
        </div>

        {listingId && <ReviewsSection itemId={listingId} />}

        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-2xl font-black tracking-tight text-slate-900">Similar {listing.itemType}</h3>
            <Link
              to="/marketplace"
              className="text-sm font-bold text-primary-900 transition hover:text-primary-700"
            >
              Browse all listings
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {similarListings.map((item) => (
              <MarketplaceCompactCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
};

export default MarketplaceDetailPage;
