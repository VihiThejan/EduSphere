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

  refreshToken: async (): Promise<{ accessToken: string }> => {
    return apiClient.post<{ accessToken: string }>('/auth/refresh');
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    return apiClient.get<{ user: User }>('/auth/me');
  },
};
