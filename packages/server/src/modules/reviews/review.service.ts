import mongoose from 'mongoose';
import { Review, IReviewDocument } from './review.model.js';
import { MarketplaceItem } from '../marketplace/marketplace.model.js';
import { Order } from '../orders/order.model.js';
import {
  NotFoundError,
  AuthorizationError,
  ConflictError,
  ValidationError,
} from '../../shared/utils/errors.js';
import { ORDER_PAYMENT_STATUS } from '@edusphere/shared';

interface CreateReviewInput {
  itemId: string;
  rating: number;
  comment?: string;
}

interface ReviewsResult {
  data: IReviewDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  averageRating: number;
}

export class ReviewService {
  async createReview(buyerId: string, input: CreateReviewInput): Promise<IReviewDocument> {
    const item = await MarketplaceItem.findById(input.itemId);
    if (!item) throw new NotFoundError('Marketplace item');

    // Verify buyer has a completed order containing this item
    const completedOrder = await Order.findOne({
      buyerId: new mongoose.Types.ObjectId(buyerId),
      'items.itemId': new mongoose.Types.ObjectId(input.itemId),
      paymentStatus: ORDER_PAYMENT_STATUS.COMPLETED,
    });

    if (!completedOrder) {
      throw new ValidationError('You can only review items you have purchased');
    }

    const existing = await Review.findOne({
      itemId: new mongoose.Types.ObjectId(input.itemId),
      buyerId: new mongoose.Types.ObjectId(buyerId),
    });
    if (existing) throw new ConflictError('You have already reviewed this item');

    const review = await Review.create({
      itemId: new mongoose.Types.ObjectId(input.itemId),
      sellerId: item.sellerId,
      buyerId: new mongoose.Types.ObjectId(buyerId),
      rating: input.rating,
      comment: input.comment,
    });

    await this.recalculateRating(input.itemId);
    return review;
  }

  async getReviewsForItem(
    itemId: string,
    page = 1,
    limit = 10
  ): Promise<ReviewsResult> {
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      throw new ValidationError('Invalid item ID');
    }

    const query = { itemId: new mongoose.Types.ObjectId(itemId) };
    const skip = (page - 1) * limit;
    const total = await Review.countDocuments(query);

    const data = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('buyerId', 'profile.firstName profile.lastName profile.avatar');

    const agg = await Review.aggregate([
      { $match: query },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    const averageRating = agg[0]?.avg ?? 0;

    return {
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }

  async deleteReview(reviewId: string, buyerId: string): Promise<void> {
    const review = await Review.findById(reviewId);
    if (!review) throw new NotFoundError('Review');
    if (review.buyerId.toString() !== buyerId) {
      throw new AuthorizationError('You cannot delete this review');
    }
    const itemId = review.itemId.toString();
    await review.deleteOne();
    await this.recalculateRating(itemId);
  }

  private async recalculateRating(itemId: string): Promise<void> {
    const agg = await Review.aggregate([
      { $match: { itemId: new mongoose.Types.ObjectId(itemId) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    const avg = agg[0]?.avg ?? 0;
    const count = agg[0]?.count ?? 0;

    await MarketplaceItem.findByIdAndUpdate(itemId, {
      'seller.rating': Math.round(avg * 10) / 10,
      'seller.reviewCount': count,
    });
  }
}

export const reviewService = new ReviewService();
