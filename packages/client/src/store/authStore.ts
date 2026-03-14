import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@edusphere/shared';
import { apiClient } from '../services/api/client';
import { authApi } from '../services/api/auth.api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setUser: (user: User | null) => void;
  setAccessToken: (token: string) => void;
  login: (accessToken: string, user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setAccessToken: (token) => {
        apiClient.setAccessToken(token);
      },

      login: (accessToken, user) => {
        apiClient.setAccessToken(accessToken);
        set({ user, isAuthenticated: true });
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          apiClient.clearAccessToken();
          set({ user: null, isAuthenticated: false });
        }
      },

      checkAuth: async () => {
        const token = apiClient.getAccessToken();
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          set({ isLoading: true });
          const { user } = await authApi.getCurrentUser();
          set({ user, isAuthenticated: true });
        } catch (error) {
          apiClient.clearAccessToken();
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Don't persist sensitive data
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
