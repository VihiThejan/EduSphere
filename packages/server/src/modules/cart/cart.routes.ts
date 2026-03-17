import { Router } from 'express';
import { cartController } from './cart.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';
import { validateBody } from '../../shared/middleware/validate.js';
import {
  cartAddItemSchema,
  cartUpdateItemSchema,
} from '@edusphere/shared';

const router = Router();

// All cart endpoints require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/cart/validate
 * @desc    Validate all cart items (check stock/availability)
 * @access  Private
 */
router.get(
  '/validate',
  cartController.validateCart.bind(cartController)
);

/**
 * @route   GET /api/v1/cart/total
 * @desc    Get cart subtotal and item count
 * @access  Private
 */
router.get(
  '/total',
  cartController.getCartTotal.bind(cartController)
);

/**
 * @route   GET /api/v1/cart
 * @desc    Get user's shopping cart
 * @access  Private
 */
router.get(
  '/',
  cartController.getCart.bind(cartController)
);

/**
 * @route   POST /api/v1/cart
 * @desc    Add item to cart
 * @access  Private
 */
router.post(
  '/',
  validateBody(cartAddItemSchema),
  cartController.addItem.bind(cartController)
);

/**
 * @route   PUT /api/v1/cart/:itemId
 * @desc    Update item quantity in cart
 * @access  Private
 */
router.put(
  '/:itemId',
  validateBody(cartUpdateItemSchema),
  cartController.updateItem.bind(cartController)
);

/**
 * @route   DELETE /api/v1/cart/:itemId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete(
  '/:itemId',
  cartController.removeItem.bind(cartController)
);

/**
 * @route   DELETE /api/v1/cart
 * @desc    Clear entire cart
 * @access  Private
 */
router.delete(
  '/',
  cartController.clearCart.bind(cartController)
);

export default router;
