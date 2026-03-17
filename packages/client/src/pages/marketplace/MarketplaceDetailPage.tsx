import React from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { cartApi } from '@/services/api/cart.api';

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

const MarketplaceDetailPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
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

  const addToCartMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.addItem(itemId, 1),
    onSuccess: () => {
      navigate('/checkout');
    },
  });

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
            <MarketplaceSellerPanel
              listing={listing}
              onAddToCart={() => addToCartMutation.mutate(listing.id)}
              isAddingToCart={addToCartMutation.isPending}
            />
            <MarketplacePickupMap imageUrl={listing.mapImageUrl} />
          </div>
        </div>

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
