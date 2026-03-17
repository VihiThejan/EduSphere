export const MARKETPLACE_ITEM_TYPES = ['Textbooks', 'Calculators', 'Laptops & Tech'] as const;
export const MARKETPLACE_CONDITIONS = ['Any', 'New', 'Used - Like New', 'Used - Good'] as const;
export const MARKETPLACE_CAMPUSES = [
  'All Campuses',
  'Colombo Campus',
  'Moratuwa Campus',
  'Peradeniya Campus',
  'Kelaniya Campus',
] as const;
export const MARKETPLACE_SORT_OPTIONS = [
  { label: 'Relevant', value: 'relevant' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest', value: 'newest' },
] as const;

export type MarketplaceItemType = (typeof MARKETPLACE_ITEM_TYPES)[number];
export type MarketplaceCondition = Exclude<(typeof MARKETPLACE_CONDITIONS)[number], 'Any'>;
export type MarketplaceCampus = Exclude<(typeof MARKETPLACE_CAMPUSES)[number], 'All Campuses'>;
export type MarketplaceSortValue = (typeof MARKETPLACE_SORT_OPTIONS)[number]['value'];

export interface MarketplaceListing {
  id: string;
  title: string;
  price: number;
  sellerName: string;
  campus: MarketplaceCampus;
  imageUrl: string;
  itemType: MarketplaceItemType;
  condition: MarketplaceCondition | 'New';
  verifiedSeller: boolean;
  negotiable: boolean;
  postedAt: string;
}

export interface MarketplaceFiltersState {
  types: MarketplaceItemType[];
  minPrice: number;
  maxPrice: number;
  campus: (typeof MARKETPLACE_CAMPUSES)[number];
  condition: (typeof MARKETPLACE_CONDITIONS)[number];
}
