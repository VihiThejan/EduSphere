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

export const MARKETPLACE_LISTING_PUBLISH_STATUS = {
  DRAFT: 'draft',
  PENDING_PAYMENT: 'pending-payment',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type MarketplaceListingPublishStatus =
  (typeof MARKETPLACE_LISTING_PUBLISH_STATUS)[keyof typeof MARKETPLACE_LISTING_PUBLISH_STATUS];

export const VENDOR_PLAN_TIERS = {
  STARTER: 'starter',
  PRO: 'pro',
  ELITE: 'elite',
} as const;

export type VendorPlanTier = (typeof VENDOR_PLAN_TIERS)[keyof typeof VENDOR_PLAN_TIERS];

export const VENDOR_PLAN_INTERVAL = {
  MONTHLY: 'monthly',
} as const;

export type VendorPlanInterval = (typeof VENDOR_PLAN_INTERVAL)[keyof typeof VENDOR_PLAN_INTERVAL];

export const VENDOR_SUBSCRIPTION_STATUS = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
  PAST_DUE: 'past-due',
  CANCELED: 'canceled',
  UNPAID: 'unpaid',
} as const;

export type VendorSubscriptionStatus =
  (typeof VENDOR_SUBSCRIPTION_STATUS)[keyof typeof VENDOR_SUBSCRIPTION_STATUS];

export const VENDOR_PLAN_QUOTAS: Record<VendorPlanTier, number> = {
  [VENDOR_PLAN_TIERS.STARTER]: 5,
  [VENDOR_PLAN_TIERS.PRO]: 20,
  [VENDOR_PLAN_TIERS.ELITE]: 100,
};

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
