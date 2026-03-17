import { MarketplaceCategory, ItemCondition, CampusLocation, MarketplaceItemStatus } from '../constants/marketplace';

export interface IMarketplaceImage {
  url: string;
  order: number;
}

export interface IMarketplaceSellerInfo {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
}

export interface IMarketplaceStats {
  views: number;
  favorites: number;
  inquiries: number;
}

export interface IMarketplaceItem {
  _id: string;
  title: string;
  description: string;
  sellerId: string;
  category: MarketplaceCategory;
  price: number;
  originalPrice?: number;
  quantity: number;
  condition: ItemCondition;
  campus: CampusLocation;
  images: IMarketplaceImage[];
  tags: string[];
  status: MarketplaceItemStatus;
  isNegotiable: boolean;
  seller: IMarketplaceSellerInfo;
  stats: IMarketplaceStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMarketplaceItemInput {
  title: string;
  description: string;
  category: MarketplaceCategory;
  price: number;
  originalPrice?: number;
  quantity?: number;
  condition: ItemCondition;
  campus: CampusLocation;
  images: IMarketplaceImage[];
  tags?: string[];
  isNegotiable?: boolean;
}

export interface IMarketplaceItemFilter {
  category?: MarketplaceCategory;
  minPrice?: number;
  maxPrice?: number;
  condition?: ItemCondition;
  campus?: CampusLocation;
  search?: string;
  status?: MarketplaceItemStatus;
  sellerId?: string;
}
