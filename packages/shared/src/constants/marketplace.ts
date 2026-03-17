// Marketplace Item Categories
export const MARKETPLACE_CATEGORIES = [
  'textbooks',
  'calculators',
  'laptops-tech',
  'course-materials',
  'notes',
  'lab-equipment',
  'other',
] as const;

export type MarketplaceCategory = (typeof MARKETPLACE_CATEGORIES)[number];

// Marketplace Item Condition
export const ITEM_CONDITION = {
  NEW: 'new',
  USED_LIKE_NEW: 'used-like-new',
  USED_GOOD: 'used-good',
  USED_FAIR: 'used-fair',
} as const;

export type ItemCondition = (typeof ITEM_CONDITION)[keyof typeof ITEM_CONDITION];

// Marketplace Item Status
export const MARKETPLACE_ITEM_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SOLD: 'sold',
} as const;

export type MarketplaceItemStatus = (typeof MARKETPLACE_ITEM_STATUS)[keyof typeof MARKETPLACE_ITEM_STATUS];

// Campus Locations
export const CAMPUS_LOCATIONS = [
  'colombo',
  'moratuwa',
  'peradeniya',
  'kelaniya',
  'other',
] as const;

export type CampusLocation = (typeof CAMPUS_LOCATIONS)[number];

// Seller Verification Status
export const SELLER_VERIFICATION_STATUS = {
  UNVERIFIED: 'unverified',
  VERIFIED: 'verified',
  SUSPENDED: 'suspended',
} as const;

export type SellerVerificationStatus = (typeof SELLER_VERIFICATION_STATUS)[keyof typeof SELLER_VERIFICATION_STATUS];

// Marketplace Status
export const MARKETPLACE_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
} as const;

export type MarketplaceStatus = (typeof MARKETPLACE_STATUS)[keyof typeof MARKETPLACE_STATUS];
