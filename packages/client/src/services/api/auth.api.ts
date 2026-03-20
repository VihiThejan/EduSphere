import { apiClient } from './client';
import { User, UserLoginInput, UserRegisterInput } from '@edusphere/shared';

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authApi = {
  register: async (data: UserRegisterInput): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  login: async (data: UserLoginInput): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', data);
  },

  logout: async (): Promise<void> => {
    return apiClient.post<void>('/auth/logout');
  },

  logoutAll: async (): Promise<void> => {
    return apiClient.post<void>('/auth/logout-all');
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    return apiClient.post<{ accessToken: string }>('/auth/refresh');
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    return apiClient.get<{ user: User }>('/auth/me');
  },

  /** Request a password-reset email */
  forgotPassword: async (email: string): Promise<void> => {
    return apiClient.post<void>('/auth/forgot-password', { email });
  },

  /** Submit the new password along with the token from the email */
  resetPassword: async (token: string, password: string): Promise<void> => {
    return apiClient.post<void>('/auth/reset-password', { token, password });
  },

  /** Verify email address */
  verifyEmail: async (token: string): Promise<void> => {
    return apiClient.post<void>('/auth/verify-email', { token });
  },

  /** Re-send the email verification link */
  resendVerification: async (): Promise<void> => {
    return apiClient.post<void>('/auth/resend-verification');
  },
};

