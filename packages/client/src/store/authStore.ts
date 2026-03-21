import { create } from 'zustand';
import { User } from '@edusphere/shared';
import { apiClient } from '../services/api/client';
import { authApi } from '../services/api/auth.api';

export const AUTH_SESSION_HINT_KEY = 'edusphere-had-session';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  
  setUser: (user: User | null) => void;
  setAccessToken: (token: string) => void;
  initializeAsGuest: () => void;
  login: (accessToken: string, user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setAccessToken: (token) => {
    apiClient.setAccessToken(token);
  },

  initializeAsGuest: () => {
    set({ isInitialized: true, isLoading: false });
  },

  login: (accessToken, user) => {
    apiClient.setAccessToken(accessToken);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_SESSION_HINT_KEY, '1');
    }
    set({ user, isAuthenticated: true, isInitialized: true });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiClient.clearAccessToken();
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(AUTH_SESSION_HINT_KEY);
      }
      set({ user: null, isAuthenticated: false, isInitialized: true });
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });

      // If token is missing (e.g. page refresh), attempt refresh using httpOnly cookie.
      if (!apiClient.getAccessToken()) {
        const refresh = await authApi.refreshToken();
        apiClient.setAccessToken(refresh.accessToken);
      }

      const { user } = await authApi.getCurrentUser();
      set({ user, isAuthenticated: true, isInitialized: true });
    } catch {
      apiClient.clearAccessToken();
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(AUTH_SESSION_HINT_KEY);
      }
      set({ user: null, isAuthenticated: false, isInitialized: true });
    } finally {
      set({ isLoading: false });
    }
  },
}));
