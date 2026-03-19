import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@edusphere/shared';
import { apiClient } from '../services/api/client';
import { authApi } from '../services/api/auth.api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** true once the silent-restore attempt has finished (success or failure) */
  isInitialized: boolean;

  setUser: (user: User | null) => void;
  setAccessToken: (token: string) => void;
  login: (accessToken: string, user: User) => void;
  logout: () => Promise<void>;
  /**
   * Called once on app mount.
   * Tries to restore the session using the HTTP-only refresh cookie.
   * Always sets isInitialized=true when done so the app can render.
   */
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setAccessToken: (token) => {
        apiClient.setAccessToken(token);
      },

      login: (accessToken: string, user: User) => {
        apiClient.setAccessToken(accessToken);
        set({ user, isAuthenticated: true, isInitialized: true });
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // ignore
        } finally {
          apiClient.clearAccessToken();
          set({ user: null, isAuthenticated: false });
        }
      },

      initAuth: async () => {
        set({ isLoading: true });
        try {
          // Try to get a fresh access token from the refresh cookie
          const newToken = await apiClient.tryRestoreSession();
          if (!newToken) {
            set({ user: null, isAuthenticated: false });
            return;
          }
          // Token restored — fetch the user profile
          const { user } = await authApi.getCurrentUser();
          set({ user, isAuthenticated: true });
        } catch {
          apiClient.clearAccessToken();
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      // Persist only the user object (no tokens — they live in cookies / memory)
      partialize: (state) => ({ user: state.user }),
    }
  )
);
