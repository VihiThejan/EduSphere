import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import marketplaceDetailsJson from '@/data/mock/marketplace-details.json';
import listingsJson from '@/data/mock/marketplace-listings.json';
import { AppFooter, AppHeader, AppNavItem } from '@/components/common';
import {
  MarketplaceCompactCard,
  MarketplaceDescriptionCard,
  MarketplaceDetailBreadcrumbs,
  MarketplaceImageGallery,
  MarketplaceListing,
  MarketplaceListingDetail,
  MarketplacePickupMap,
  MarketplaceSafetyTip,
  MarketplaceSellerPanel,
} from '@/components/marketplace';
import { useAuthStore } from '@/store/authStore';

const listingDetails = marketplaceDetailsJson as unknown as MarketplaceListingDetail[];
const listings = listingsJson as unknown as MarketplaceListing[];

const MarketplaceDetailPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [search, setSearch] = React.useState('');

  const headerItems: AppNavItem[] = [
    { label: 'Courses', href: '/courses' },
    { label: 'Marketplace', href: '/marketplace', active: true },
    { label: 'Community', href: '/' },
  ];

  const listing = listingDetails.find((item) => item.id === listingId);

  if (!listing) {
    return <Navigate to="/marketplace" replace />;
  }

  const similarListings = listing.similarListingIds
    .map((id) => listings.find((candidate) => candidate.id === id))
    .filter((candidate): candidate is MarketplaceListing => !!candidate);

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
            <MarketplaceDescriptionCard description={listing.description} relevantCourses={listing.relevantCourses} />
            <MarketplaceSafetyTip />
          </div>

          <div className="mt-8 space-y-6 lg:col-span-4 lg:mt-0">
            <MarketplaceSellerPanel listing={listing} />
            <MarketplacePickupMap imageUrl={listing.mapImageUrl} />
          </div>
        </div>

        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-2xl font-black tracking-tight text-slate-900">Similar {listing.itemType}</h3>
            <Link to="/marketplace" className="text-sm font-bold text-primary-900 transition hover:text-primary-700">
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