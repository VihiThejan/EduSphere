import mongoose from 'mongoose';
import { Cart } from './cart.model.js';
import { MarketplaceItem } from '../marketplace/marketplace.model.js';
import { NotFoundError, ValidationError } from '../../shared/utils/errors.js';

interface CartItemResponse {
  _id: string;
  itemId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  addedAt: Date;
}

interface CartResponse {
  _id: string;
  userId: string;
  items: CartItemResponse[];
  itemCount: number;
  subtotal: number;
  updatedAt: Date;
}

export class CartService {
  async getCart(userId: string): Promise<CartResponse> {
    // Find or create cart for user
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [],
      });
    }

    // Populate item details from marketplace
    const populatedItems: CartItemResponse[] = [];

    for (const cartItem of cart.items) {
      const listing = await MarketplaceItem.findById(cartItem.itemId);

      if (listing) {
        populatedItems.push({
          _id: cartItem.itemId.toString(),
          itemId: cartItem.itemId.toString(),
          title: listing.title,
          price: listing.price,
          image: listing.images[0]?.url || '',
          quantity: cartItem.quantity,
          addedAt: cartItem.addedAt,
        });
      }
    }

    // Calculate subtotal
    const subtotal = populatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      _id: cart._id.toString(),
      userId: cart.userId.toString(),
      items: populatedItems,
      itemCount: populatedItems.length,
      subtotal,
      updatedAt: cart.updatedAt,
    };
  }

  async addToCart(userId: string, itemId: string, quantity: number = 1): Promise<CartResponse> {
    // Validate quantity
    if (quantity < 1) {
      throw new ValidationError('Quantity must be at least 1');
    }

    // Verify item exists and is available
    const listing = await MarketplaceItem.findById(itemId);
    if (!listing) {
      throw new NotFoundError('Listing');
    }

    if (listing.quantity <= 0) {
      throw new ValidationError('Item is out of stock');
    }

    // Check if quantity requested exceeds available
    if (quantity > listing.quantity) {
      throw new ValidationError(`Only ${listing.quantity} items available`);
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [],
      });
    }

    // Check if item already in cart
    const existingItem = cart.items.find((item) => item.itemId.toString() === itemId);

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > listing.quantity) {
        throw new ValidationError(`Only ${listing.quantity} items available in total`);
      }

      existingItem.quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        itemId: new mongoose.Types.ObjectId(itemId),
        quantity,
        addedAt: new Date(),
      });
    }

    await cart.save();

    return this.getCart(userId);
  }

  async updateCartItem(userId: string, itemId: string, quantity: number): Promise<CartResponse> {
    // Validate quantity
    if (quantity < 0) {
      throw new ValidationError('Quantity cannot be negative');
    }

    // Verify item exists
    const listing = await MarketplaceItem.findById(itemId);
    if (!listing) {
      throw new NotFoundError('Listing');
    }

    // If quantity is 0, remove the item
    if (quantity === 0) {
      return this.removeFromCart(userId, itemId);
    }

    // Check if quantity available
    if (quantity > listing.quantity) {
      throw new ValidationError(`Only ${listing.quantity} items available`);
    }

    // Find cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new NotFoundError('Cart');
    }

    // Find and update item
    const cartItem = cart.items.find((item) => item.itemId.toString() === itemId);
    if (!cartItem) {
      throw new NotFoundError('Item not in cart');
    }

    cartItem.quantity = quantity;
    await cart.save();

    return this.getCart(userId);
  }

  async removeFromCart(userId: string, itemId: string): Promise<CartResponse> {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new NotFoundError('Cart');
    }

    // Remove item from cart
    cart.items = cart.items.filter((item) => item.itemId.toString() !== itemId);
    await cart.save();

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<CartResponse> {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new NotFoundError('Cart');
    }

    cart.items = [];
    await cart.save();

    return this.getCart(userId);
  }

  async validateCartItems(userId: string): Promise<{ valid: boolean; errors: string[] }> {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new NotFoundError('Cart');
    }

    const errors: string[] = [];

    for (const cartItem of cart.items) {
      const listing = await MarketplaceItem.findById(cartItem.itemId);

      if (!listing) {
        errors.push(`Item ${cartItem.itemId} no longer exists`);
        continue;
      }

      if (listing.quantity <= 0) {
        errors.push(`${listing.title} is out of stock`);
        continue;
      }

      if (cartItem.quantity > listing.quantity) {
        errors.push(`${listing.title}: only ${listing.quantity} available (requested ${cartItem.quantity})`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async getCartTotal(userId: string): Promise<{ subtotal: number; itemCount: number }> {
    const cart = await this.getCart(userId);

    return {
      subtotal: cart.subtotal,
      itemCount: cart.itemCount,
    };
  }
}

export const cartService = new CartService();
