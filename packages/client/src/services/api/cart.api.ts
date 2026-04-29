import { apiClient } from './client';

export interface CartItem {
  _id: string;
  itemId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  updatedAt: string;
}

export const cartApi = {
  getCart: async (): Promise<{ cart: Cart }> => {
    return apiClient.get<{ cart: Cart }>('/cart');
  },

  addItem: async (itemId: string, quantity = 1): Promise<{ cart: Cart }> => {
    return apiClient.post<{ cart: Cart }>('/cart', { itemId, quantity });
  },

  updateItem: async (itemId: string, quantity: number): Promise<{ cart: Cart }> => {
    return apiClient.put<{ cart: Cart }>(`/cart/${itemId}`, { quantity });
  },

  removeItem: async (itemId: string): Promise<{ cart: Cart }> => {
    return apiClient.delete<{ cart: Cart }>(`/cart/${itemId}`);
  },

  clearCart: async (): Promise<{ cart: Cart }> => {
    return apiClient.delete<{ cart: Cart }>('/cart');
  },

  getTotal: async (): Promise<{ subtotal: number; itemCount: number }> => {
    return apiClient.get<{ subtotal: number; itemCount: number }>('/cart/total');
  },
};
