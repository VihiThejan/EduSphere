import { Request, Response, NextFunction } from 'express';
import { cartService } from './cart.service.js';
import { ApiResponse } from '@edusphere/shared';

export class CartController {
  async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const cart = await cartService.getCart(userId);

      const response: ApiResponse = {
        success: true,
        data: { cart },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { itemId, quantity } = req.body;

      const cart = await cartService.addToCart(userId, itemId, quantity);

      const response: ApiResponse = {
        success: true,
        data: { cart },
        message: 'Item added to cart',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { itemId } = req.params;
      const { quantity } = req.body;

      const cart = await cartService.updateCartItem(userId, itemId, quantity);

      const response: ApiResponse = {
        success: true,
        data: { cart },
        message: 'Cart updated',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { itemId } = req.params;

      const cart = await cartService.removeFromCart(userId, itemId);

      const response: ApiResponse = {
        success: true,
        data: { cart },
        message: 'Item removed from cart',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;

      const cart = await cartService.clearCart(userId);

      const response: ApiResponse = {
        success: true,
        data: { cart },
        message: 'Cart cleared',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async validateCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;

      const validation = await cartService.validateCartItems(userId);

      const response: ApiResponse = {
        success: validation.valid,
        data: validation,
        message: validation.valid ? 'Cart is valid' : 'Cart has validation errors',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCartTotal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;

      const total = await cartService.getCartTotal(userId);

      const response: ApiResponse = {
        success: true,
        data: total,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const cartController = new CartController();
