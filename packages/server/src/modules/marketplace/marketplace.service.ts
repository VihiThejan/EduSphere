import mongoose from 'mongoose';
import { MarketplaceItem, IMarketplaceItemDocument } from './marketplace.model.js';
import { UserModel } from '../users/user.model.js';
import {
  NotFoundError,
  AuthorizationError,
} from '../../shared/utils/errors.js';
import {
  MarketplaceItemCreateInput,
  MarketplaceItemUpdateInput,
  MarketplaceFilterInput,
  MARKETPLACE_ITEM_STATUS,
} from '@edusphere/shared';

interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class MarketplaceService {
  async createListing(
    sellerId: string,
    input: MarketplaceItemCreateInput
  ): Promise<IMarketplaceItemDocument> {
    // Verify seller exists
    const seller = await UserModel.findById(sellerId);
    if (!seller) {
      throw new NotFoundError('Seller');
    }

    // Create seller info from user
    const sellerInfo = {
      id: new mongoose.Types.ObjectId(sellerId),
      name: `${seller.profile.firstName} ${seller.profile.lastName}`,
      avatar: seller.profile.avatar,
      rating: 0,
      reviewCount: 0,
    };

    // Sort images by order
    const sortedImages = [...input.images].sort((a, b) => a.order - b.order);

    // Create the listing
    const listing = await MarketplaceItem.create({
      ...input,
      images: sortedImages,
      sellerId,
      seller: sellerInfo,
      status: MARKETPLACE_ITEM_STATUS.ACTIVE,
    });

    return listing;
  }

  async getListingById(listingId: string): Promise<IMarketplaceItemDocument> {
    const listing = await MarketplaceItem.findById(listingId);

    if (!listing) {
      throw new NotFoundError('Listing');
    }

    // Increment views count
    listing.stats.views += 1;
    await listing.save();

    return listing;
  }

  async getListings(filters: MarketplaceFilterInput): Promise<PaginationResult<IMarketplaceItemDocument>> {
    const {
      category,
      minPrice,
      maxPrice,
      condition,
      campus,
      search,
      status = MARKETPLACE_ITEM_STATUS.ACTIVE,
      sellerId,
      page = 1,
      limit = 6,
    } = filters;

    const query: Record<string, any> = {};

    // Always filter by status unless explicitly provided
    if (status) {
      query.status = status;
    }

    // Apply filters
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (campus) query.campus = campus;
    if (sellerId) query.sellerId = sellerId;

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (minPrice !== undefined) priceFilter.$gte = minPrice;
      if (maxPrice !== undefined) priceFilter.$lte = maxPrice;
      query.price = priceFilter;
    }

    // Text search on title, description, tags
    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await MarketplaceItem.countDocuments(query);
    const pages = Math.ceil(total / limit);

    // Execute query
    const listings = await MarketplaceItem.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      data: listings as unknown as IMarketplaceItemDocument[],
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  async updateListing(
    listingId: string,
    sellerId: string,
    input: MarketplaceItemUpdateInput
  ): Promise<IMarketplaceItemDocument> {
    // Verify listing exists and seller owns it
    const listing = await MarketplaceItem.findById(listingId);

    if (!listing) {
      throw new NotFoundError('Listing');
    }

    if (listing.sellerId.toString() !== sellerId) {
      throw new AuthorizationError('You can only update your own listings');
    }

    // Update allowed fields only
    const updateData: Record<string, any> = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.price !== undefined) updateData.price = input.price;
    if (input.originalPrice !== undefined) updateData.originalPrice = input.originalPrice;
    if (input.quantity !== undefined) updateData.quantity = input.quantity;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.condition !== undefined) updateData.condition = input.condition;
    if (input.campus !== undefined) updateData.campus = input.campus;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.isNegotiable !== undefined) updateData.isNegotiable = input.isNegotiable;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.images !== undefined) {
      // Sort images by order
      updateData.images = [...input.images].sort((a, b) => a.order - b.order);
    }

    // Update the listing
    const updatedListing = await MarketplaceItem.findByIdAndUpdate(
      listingId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedListing) {
      throw new NotFoundError('Listing');
    }

    return updatedListing;
  }

  async deleteListing(listingId: string, sellerId: string): Promise<void> {
    // Verify listing exists and seller owns it
    const listing = await MarketplaceItem.findById(listingId);

    if (!listing) {
      throw new NotFoundError('Listing');
    }

    if (listing.sellerId.toString() !== sellerId) {
      throw new AuthorizationError('You can only delete your own listings');
    }

    // Soft delete - mark as inactive
    await MarketplaceItem.findByIdAndUpdate(listingId, {
      status: MARKETPLACE_ITEM_STATUS.INACTIVE,
    });
  }

  async getSellerListings(
    sellerId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginationResult<IMarketplaceItemDocument>> {
    const query = { sellerId };
    const skip = (page - 1) * limit;
    const total = await MarketplaceItem.countDocuments(query);
    const pages = Math.ceil(total / limit);

    const listings = await MarketplaceItem.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      data: listings as unknown as IMarketplaceItemDocument[],
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  async getListingsBySellerPublic(
    sellerId: string,
    page: number = 1,
    limit: number = 6
  ): Promise<PaginationResult<IMarketplaceItemDocument>> {
    // Public view - only active listings
    const query = {
      sellerId,
      status: MARKETPLACE_ITEM_STATUS.ACTIVE,
    };

    const skip = (page - 1) * limit;
    const total = await MarketplaceItem.countDocuments(query);
    const pages = Math.ceil(total / limit);

    const listings = await MarketplaceItem.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      data: listings as unknown as IMarketplaceItemDocument[],
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }
}

export const marketplaceService = new MarketplaceService();
