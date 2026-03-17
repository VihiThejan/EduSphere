import React from 'react';
import {
  BarChart3,
  BookOpen,
  Clock3,
  LayoutDashboard,
  ListChecks,
  Settings,
  ShoppingBag,
} from 'lucide-react';
import { AppFooter, AppHeader, AppNavItem, AppSidebar } from '@/components/common';
import {
  MarketplaceFilters,
  MarketplaceListingCard,
  MarketplacePagination,
  MarketplaceToolbar,
  MarketplaceFiltersState,
  MarketplaceListing,
  MarketplaceSortValue,
} from '@/components/marketplace';
import listingsJson from '@/data/mock/marketplace-listings.json';
import { useAuthStore } from '@/store/authStore';

const LISTINGS_PER_PAGE = 6;
const allListings = listingsJson as unknown as MarketplaceListing[];
const absoluteMaxPrice = Math.max(...allListings.map((listing) => listing.price));

const MarketplacePage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState<MarketplaceSortValue>('relevant');
  const [filters, setFilters] = React.useState<MarketplaceFiltersState>({
    types: ['Textbooks', 'Calculators', 'Laptops & Tech'],
    minPrice: 500,
    maxPrice: 15000,
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

  const filteredListings = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const matches = allListings.filter((listing) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        listing.title.toLowerCase().includes(normalizedSearch) ||
        listing.sellerName.toLowerCase().includes(normalizedSearch) ||
        listing.campus.toLowerCase().includes(normalizedSearch) ||
        listing.itemType.toLowerCase().includes(normalizedSearch);

      const matchesType = filters.types.includes(listing.itemType);
      const matchesPrice = listing.price >= filters.minPrice && listing.price <= filters.maxPrice;
      const matchesCampus = filters.campus === 'All Campuses' || listing.campus === filters.campus;
      const matchesCondition = filters.condition === 'Any' || listing.condition === filters.condition;

      return matchesSearch && matchesType && matchesPrice && matchesCampus && matchesCondition;
    });

    const sorted = [...matches];
    if (sort === 'price-asc') {
      sorted.sort((left, right) => left.price - right.price);
    } else if (sort === 'price-desc') {
      sorted.sort((left, right) => right.price - left.price);
    } else if (sort === 'newest') {
      sorted.sort((left, right) => new Date(right.postedAt).getTime() - new Date(left.postedAt).getTime());
    }

    return sorted;
  }, [filters, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / LISTINGS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedListings = filteredListings.slice(
    (currentPage - 1) * LISTINGS_PER_PAGE,
    currentPage * LISTINGS_PER_PAGE
  );

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
                    <button
                      type="button"
                      className="mt-6 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary-900 transition hover:bg-slate-100"
                    >
                      Explore Now
                    </button>
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
                  totalCount={filteredListings.length}
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

                {pagedListings.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
                    {pagedListings.map((listing) => (
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
                  currentPage={currentPage}
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