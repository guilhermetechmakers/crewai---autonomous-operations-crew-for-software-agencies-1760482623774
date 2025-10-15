import { api } from '@/lib/api';
import type { 
  OAuthCallbackResponse, 
  SSOConfig, 
  User,
  SendInvitationRequest,
  SendInvitationResponse,
  ValidateInvitationRequest,
  ValidateInvitationResponse,
  ClientPortalLoginRequest,
  ClientPortalLoginResponse,
  RevokeInvitationRequest,
  RevokeInvitationResponse,
  ClientPortalProject,
  ClientPortalPermission
} from '@/types';

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

// Client Portal API functions
export const clientPortalApi = {
  /**
   * Send client portal invitation
   */
  sendInvitation: (data: SendInvitationRequest) =>
    api.post<SendInvitationResponse>('/client-portal/invite', data),

  /**
   * Validate invitation token
   */
  validateInvitation: (data: ValidateInvitationRequest) =>
    api.post<ValidateInvitationResponse>('/client-portal/validate', data),

  /**
   * Login with invitation token
   */
  loginWithToken: (data: ClientPortalLoginRequest) =>
    api.post<ClientPortalLoginResponse>('/client-portal/login', data),

  /**
   * Get client portal project data
   */
  getProject: (projectId: string) =>
    api.get<ClientPortalProject>(`/client-portal/projects/${projectId}`),

  /**
   * Get client portal permissions
   */
  getPermissions: () =>
    api.get<ClientPortalPermission[]>('/client-portal/permissions'),

  /**
   * Revoke invitation
   */
  revokeInvitation: (data: RevokeInvitationRequest) =>
    api.post<RevokeInvitationResponse>('/client-portal/revoke', data),

  /**
   * Get client portal access token
   */
  getAccessToken: () =>
    api.get<{ access_token: string; expires_at: string }>('/client-portal/token'),

  /**
   * Refresh client portal access token
   */
  refreshAccessToken: () =>
    api.post<{ access_token: string; expires_at: string }>('/client-portal/refresh', {}),
};
