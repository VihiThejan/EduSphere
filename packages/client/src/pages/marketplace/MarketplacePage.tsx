import React from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Clock3,
  LayoutDashboard,
  ListChecks,
  Settings,
  ShoppingBag,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AppFooter, AppHeader, AppNavItem, AppSidebar } from '@/components/common';
import {
  MarketplaceFilters,
  MarketplaceListingCard,
  MarketplacePagination,
  MarketplaceToolbar,
  MarketplaceCampus,
  MarketplaceCondition,
  MarketplaceFiltersState,
  MarketplaceItemType,
  MarketplaceListing,
  MarketplaceSortValue,
} from '@/components/marketplace';
import { useAuthStore } from '@/store/authStore';
import { marketplaceApi } from '@/services/api/marketplace.api';

const LISTINGS_PER_PAGE = 6;

const categoryMap: Record<string, string> = {
  Textbooks: 'textbooks',
  Calculators: 'calculators',
  'Laptops & Tech': 'laptops-tech',
};

const campusMap: Record<string, string> = {
  'All Campuses': '',
  'Colombo Campus': 'colombo',
  'Moratuwa Campus': 'moratuwa',
  'Peradeniya Campus': 'peradeniya',
  'Kelaniya Campus': 'kelaniya',
};

const conditionMap: Record<string, string> = {
  Any: '',
  New: 'new',
  'Used - Like New': 'used-like-new',
  'Used - Good': 'used-good',
};

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
  price: number;
  campus: string;
  category: string;
  condition: string;
  isNegotiable: boolean;
  createdAt: string | Date;
  images?: Array<{ url: string }>;
  seller?: {
    name?: string;
    reviewCount?: number;
  };
}

const mapListing = (listing: ApiListing): MarketplaceListing => ({
  id: listing._id,
  title: listing.title,
  price: listing.price,
  sellerName: listing.seller?.name || 'Seller',
  campus: (campusDisplayMap[listing.campus] || 'Colombo Campus') as MarketplaceCampus,
  imageUrl: listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80',
  itemType: (categoryDisplayMap[listing.category] || 'Textbooks') as MarketplaceItemType,
  condition: (conditionDisplayMap[listing.condition] || 'New') as MarketplaceCondition,
  verifiedSeller: (listing.seller?.reviewCount || 0) >= 5,
  negotiable: Boolean(listing.isNegotiable),
  postedAt: new Date(listing.createdAt).toISOString(),
});

const MarketplacePage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState<MarketplaceSortValue>('relevant');
  const [filters, setFilters] = React.useState<MarketplaceFiltersState>({
    types: ['Textbooks', 'Calculators', 'Laptops & Tech'],
    minPrice: 0,
    maxPrice: 200000,
    campus: 'All Campuses',
    condition: 'Any',
  });

  const headerItems: AppNavItem[] = [
    { label: 'Courses', href: '/courses' },
    { label: 'Kuppi', href: '/courses' },
    { label: 'Faculties', href: '/courses' },
    { label: 'My Learning', href: '/dashboard' },
  ];

  const sidebarPrimaryItems: AppNavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Courses', href: '/courses', icon: BookOpen },
    { label: 'My Learning', href: '#', icon: Clock3 },
    { label: 'Marketplace', href: '/marketplace', icon: ShoppingBag, active: true },
    { label: 'Listings', href: '#', icon: ListChecks },
  ];

  const sidebarSecondaryItems: AppNavItem[] = [
    { label: 'Analytics', href: '#', icon: BarChart3 },
    { label: 'Settings', href: '#', icon: Settings },
  ];

  const selectedCategory = filters.types.length === 1 ? categoryMap[filters.types[0]] : undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['marketplace-list', { page, search, sort, filters }],
    queryFn: async () => {
      return marketplaceApi.getListings({
        page,
        limit: LISTINGS_PER_PAGE,
        search: search.trim() || undefined,
        category: selectedCategory,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        campus: campusMap[filters.campus] || undefined,
        condition: conditionMap[filters.condition] || undefined,
      });
    },
  });

  const fetchedListings = React.useMemo(
    () => (data?.data || []).map(mapListing),
    [data]
  );

  const sortedListings = React.useMemo(() => {
    const sorted = [...fetchedListings];
    if (sort === 'price-asc') {
      sorted.sort((left, right) => left.price - right.price);
    } else if (sort === 'price-desc') {
      sorted.sort((left, right) => right.price - left.price);
    } else if (sort === 'newest') {
      sorted.sort((left, right) => new Date(right.postedAt).getTime() - new Date(left.postedAt).getTime());
    }
    return sorted;
  }, [fetchedListings, sort]);

  const totalPages = data?.pagination?.pages || 1;
  const absoluteMaxPrice = Math.max(200000, ...sortedListings.map((listing) => listing.price));

  React.useEffect(() => {
    setPage(1);
  }, [search, filters, sort]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader
        navItems={headerItems}
        search={search}
        searchPlaceholder="Search textbooks, tech, and more..."
        onSearchChange={setSearch}
        isAuthenticated={isAuthenticated}
        userName={user?.profile.firstName || 'Student'}
        userMeta={isAuthenticated ? 'Marketplace' : undefined}
        avatarUrl={user?.profile.avatar}
        onLogout={isAuthenticated ? () => void logout() : undefined}
      />

      <div className="flex flex-1">
        <AppSidebar
          primaryItems={sidebarPrimaryItems}
          secondaryItems={sidebarSecondaryItems}
          streakDays={14}
        />

        <main className="flex-1 px-4 py-8 md:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 xl:flex-row">
            <MarketplaceFilters
              filters={filters}
              absoluteMaxPrice={absoluteMaxPrice}
              onToggleType={(type) => {
                setFilters((current) => ({
                  ...current,
                  types: current.types.includes(type)
                    ? current.types.filter((item) => item !== type)
                    : [...current.types, type],
                }));
              }}
              onMinPriceChange={(value) => {
                setFilters((current) => ({
                  ...current,
                  minPrice: Math.min(value, current.maxPrice),
                }));
              }}
              onMaxPriceChange={(value) => {
                setFilters((current) => ({
                  ...current,
                  maxPrice: Math.max(value, current.minPrice),
                }));
              }}
              onCampusChange={(value) => {
                setFilters((current) => ({ ...current, campus: value }));
              }}
              onConditionChange={(value) => {
                setFilters((current) => ({ ...current, condition: value }));
              }}
            />

            <section className="min-w-0 flex-1">
              <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-primary-900 via-primary-800 to-slate-900 text-white shadow-xl">
                <div className="grid items-stretch md:grid-cols-[1.1fr_0.9fr]">
                  <div className="p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">Marketplace Highlights</p>
                    <h2 className="mt-4 max-w-md text-3xl font-black leading-tight tracking-tight">
                      Exams coming? Find trusted study gear and textbooks from your campus.
                    </h2>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary-900 transition hover:bg-slate-100"
                      >
                        Explore Now
                      </button>
                      <Link
                        to={isAuthenticated ? '/seller/listings/create' : '/seller/onboarding'}
                        className="rounded-xl border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/20"
                      >
                        Sell an Item
                      </Link>
                    </div>
                  </div>
                  <div className="hidden h-full md:block">
                    <img
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                      alt="Students reviewing marketplace listings together"
                      className="h-full w-full object-cover opacity-75"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <MarketplaceToolbar
                  totalCount={data?.pagination?.total || 0}
                  sort={sort}
                  onSortChange={setSort}
                />

                <div className="mb-5 flex flex-wrap gap-2">
                  {['relevant', 'price-asc', 'price-desc', 'newest'].map((value) => {
                    const labels: Record<string, string> = {
                      relevant: 'Relevant',
                      'price-asc': 'Budget Picks',
                      'price-desc': 'Premium',
                      newest: 'Newest',
                    };

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSort(value as MarketplaceSortValue)}
                        className={
                          sort === value
                            ? 'rounded-full bg-primary-900 px-4 py-2 text-xs font-semibold text-white'
                            : 'rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-primary-900 hover:text-primary-900'
                        }
                      >
                        {labels[value]}
                      </button>
                    );
                  })}
                </div>

                {isLoading ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-500">Loading listings...</div>
                ) : isError ? (
                  <div className="rounded-2xl border border-dashed border-red-300 bg-red-50 px-6 py-12 text-center text-red-600">Unable to load listings right now.</div>
                ) : sortedListings.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
                    {sortedListings.map((listing) => (
                      <MarketplaceListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                    <h3 className="text-lg font-bold text-slate-900">No listings matched your filters</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Try widening the price range or selecting more item types.
                    </p>
                  </div>
                )}

                <MarketplacePagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </section>
          </div>
        </main>
      </div>

      <AppFooter />
    </div>
  );
};

export default MarketplacePage;
