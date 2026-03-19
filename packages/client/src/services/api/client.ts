import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { config } from '../../config';
import { ApiResponse } from '@edusphere/shared';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  // Single-flight refresh: all concurrent 401s share one refresh call
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: config.apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // For cookies (refresh token)
    });

    this.setupInterceptors();
  }

  private doRefresh(): Promise<string | null> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = axios
      .post<ApiResponse>(`${config.apiUrl}/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        const newToken: string | null = res.data?.data?.accessToken ?? null;
        if (newToken) this.setAccessToken(newToken);
        return newToken;
      })
      .catch(() => {
        this.clearAccessToken();
        return null;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  private setupInterceptors() {
    // Request interceptor — attach access token
    this.client.interceptors.request.use(
      (req: InternalAxiosRequestConfig) => {
        if (this.accessToken) {
          req.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return req;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor — handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Only attempt refresh on 401, never for the refresh endpoint itself, and only once
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/auth/refresh')
        ) {
          originalRequest._retry = true;

          const newToken = await this.doRefresh();

          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          }

          // Refresh failed → redirect to login (but not if already there)
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        // 403 = wrong role, not an auth failure — never redirect
        return Promise.reject(error);
      }
    );
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  clearAccessToken() {
    this.accessToken = null;
  }

  getAccessToken() {
    return this.accessToken;
  }

  isTokenSet() {
    return !!this.accessToken;
  }

  /**
   * Called once on app start. Tries to silently restore the session
   * using the HTTP-only refresh cookie. Returns the new access token
   * or null if the session is gone.
   */
  async tryRestoreSession(): Promise<string | null> {
    return this.doRefresh();
  }

  // Generic GET request
  async get<T = any>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    return response.data.data as T;
  }

  // Generic POST request
  async post<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    return response.data.data as T;
  }

  // Generic PUT request
  async put<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    return response.data.data as T;
  }

  // Generic PATCH request
  async patch<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data);
    return response.data.data as T;
  }

  // Generic DELETE request
  async delete<T = any>(url: string): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data.data as T;
  }

  // Raw axios instance for special cases (like file uploads)
  getClient() {
    return this.client;
  }
}

export const apiClient = new ApiClient();
