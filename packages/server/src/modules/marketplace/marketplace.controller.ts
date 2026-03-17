import { Request, Response, NextFunction } from 'express';
import { marketplaceService } from './marketplace.service.js';
import { ApiResponse, MarketplaceFilterInput } from '@edusphere/shared';

export class MarketplaceController {
  async createListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sellerId = req.user!.userId;
      const listing = await marketplaceService.createListing(sellerId, req.body);

      const response: ApiResponse = {
        success: true,
        data: { listing },
        message: 'Listing created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: MarketplaceFilterInput = {
        category: req.query.category as any,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        condition: req.query.condition as any,
        campus: req.query.campus as any,
        search: req.query.search as string,
        status: req.query.status as any,
        sellerId: req.query.sellerId as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 6,
      };

      const result = await marketplaceService.getListings(filters);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getListingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { listingId } = req.params;

      const listing = await marketplaceService.getListingById(listingId);

      const response: ApiResponse = {
        success: true,
        data: { listing },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sellerId = req.user!.userId;
      const { listingId } = req.params;

      const listing = await marketplaceService.updateListing(listingId, sellerId, req.body);

      const response: ApiResponse = {
        success: true,
        data: { listing },
        message: 'Listing updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sellerId = req.user!.userId;
      const { listingId } = req.params;

      await marketplaceService.deleteListing(listingId, sellerId);

      const response: ApiResponse = {
        success: true,
        message: 'Listing deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getSellerListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sellerId = req.user!.userId;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const result = await marketplaceService.getSellerListings(sellerId, page, limit);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getListingsBySellerPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sellerId } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;

      const result = await marketplaceService.getListingsBySellerPublic(sellerId, page, limit);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const marketplaceController = new MarketplaceController();
