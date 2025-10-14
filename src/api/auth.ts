import { api } from '@/lib/api';
import type { OAuthCallbackResponse, SSOConfig, User } from '@/types';

export const authApi = {
  /**
   * Get SSO configuration
   */
  getSSOConfig: () => api.get<SSOConfig>('/auth/sso/config'),

  /**
   * Handle OAuth callback
   */
  handleOAuthCallback: (data: {
    code: string;
    provider: string;
    redirect_uri: string;
  }) => api.post<OAuthCallbackResponse>('/auth/oauth/callback', data),

  /**
   * Get current user
   */
  getCurrentUser: () => api.get<User>('/auth/me'),

  /**
   * Login with email and password
   */
  login: (data: { email: string; password: string }) =>
    api.post<{ user: User; token: string }>('/auth/login', data),

  /**
   * Register new user
   */
  register: (data: {
    email: string;
    password: string;
    full_name: string;
  }) => api.post<{ user: User; token: string }>('/auth/register', data),

  /**
   * Logout
   */
  logout: () => api.post<{ message: string }>('/auth/logout', {}),

  /**
   * Refresh token
   */
  refreshToken: () => api.post<{ token: string }>('/auth/refresh', {}),

  /**
   * Request password reset
   */
  requestPasswordReset: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),

  /**
   * Reset password
   */
  resetPassword: (data: {
    token: string;
    password: string;
  }) => api.post<{ message: string }>('/auth/reset-password', data),
};
