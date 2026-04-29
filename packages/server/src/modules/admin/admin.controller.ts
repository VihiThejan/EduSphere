import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service.js';
import { ApiResponse } from '@edusphere/shared';

export class AdminController {
  async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await adminService.getPlatformStats();
      res.json({ success: true, data: stats } satisfies ApiResponse);
    } catch (e) { next(e); }
  }

  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await adminService.getUsers(page, limit, req.query.search as string, req.query.role as string);
      res.json({ success: true, data: result } satisfies ApiResponse);
    } catch (e) { next(e); }
  }

  async updateUserRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await adminService.updateUserRoles(req.user!.userId, req.params.userId, req.body.roles);
      res.json({ success: true, data: { user }, message: 'Roles updated' } satisfies ApiResponse);
    } catch (e) { next(e); }
  }

  async toggleUserSuspension(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminService.toggleUserSuspension(req.user!.userId, req.params.userId);
      res.json({ success: true, data: result, message: result.suspended ? 'User suspended' : 'User unsuspended' } satisfies ApiResponse);
    } catch (e) { next(e); }
  }

  async getSellers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await adminService.getSellers(page, limit, req.query.search as string, req.query.status as string);
      res.json({ success: true, data: result } satisfies ApiResponse);
    } catch (e) { next(e); }
  }

  async updateSellerVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await adminService.updateSellerVerification(req.params.sellerId, req.body.status);
      res.json({ success: true, data: { profile }, message: 'Seller status updated' } satisfies ApiResponse);
    } catch (e) { next(e); }
  }

  async getListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await adminService.getListings(page, limit, req.query.search as string, req.query.publishStatus as string);
      res.json({ success: true, data: result } satisfies ApiResponse);
    } catch (e) { next(e); }
  }

  async removeListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await adminService.removeListing(req.params.listingId);
      res.json({ success: true, message: 'Listing removed' } satisfies ApiResponse);
    } catch (e) { next(e); }
  }

  async getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await adminService.getOrders(page, limit);
      res.json({ success: true, data: result } satisfies ApiResponse);
    } catch (e) { next(e); }
  }
}

export const adminController = new AdminController();
