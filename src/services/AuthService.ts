import { api } from '@/lib/api';
import type { OAuthCallbackResponse, SSOConfig, User } from '@/types';
import { OAuthErrorHandler, logOAuthError } from '@/lib/oauth-errors';

class AuthService {
  private static instance: AuthService;
  private ssoConfig: SSOConfig | null = null;

  private constructor() {
    this.loadSSOConfig();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async loadSSOConfig(): Promise<void> {
    try {
      this.ssoConfig = await api.get<SSOConfig>('/auth/sso/config');
    } catch (error) {
      console.warn('Failed to load SSO config:', error);
      // Fallback to default config
      this.ssoConfig = {
        google: { client_id: '', enabled: false },
        github: { client_id: '', enabled: false },
        microsoft: { client_id: '', tenant_id: '', enabled: false },
      };
    }
  }

  /**
   * Initiate OAuth flow with the specified provider
   */
  public async initiateOAuth(provider: 'google' | 'github' | 'microsoft'): Promise<void> {
    try {
      if (!this.ssoConfig) {
        await this.loadSSOConfig();
      }

      const providerConfig = this.ssoConfig?.[provider];
      if (!providerConfig?.enabled) {
        const error = OAuthErrorHandler.parseError('configuration_error', provider);
        logOAuthError(error, 'initiateOAuth');
        throw new Error(`${provider} SSO is not enabled`);
      }

      if (!providerConfig.client_id) {
        const error = OAuthErrorHandler.parseError('invalid_client', provider);
        logOAuthError(error, 'initiateOAuth');
        throw new Error(`${provider} OAuth client ID is not configured`);
      }

      const redirectUri = `${window.location.origin}/auth/callback`;
      
      let authUrl = '';
      
      switch (provider) {
        case 'google':
          authUrl = `https://accounts.google.com/oauth/authorize?` +
            `client_id=${providerConfig.client_id}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=code&` +
            `scope=openid email profile&` +
            `state=${provider}`;
          break;
          
        case 'github':
          authUrl = `https://github.com/login/oauth/authorize?` +
            `client_id=${providerConfig.client_id}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=user:email&` +
            `state=${provider}`;
          break;
          
        case 'microsoft':
          const tenantId = 'tenant_id' in providerConfig ? providerConfig.tenant_id || 'common' : 'common';
          authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
            `client_id=${providerConfig.client_id}&` +
            `response_type=code&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=openid email profile&` +
            `state=${provider}`;
          break;
      }

      // Store the current URL to redirect back after OAuth
      localStorage.setItem('oauth_redirect_url', window.location.pathname);
      
      // Redirect to OAuth provider
      window.location.href = authUrl;
    } catch (error) {
      const oauthError = OAuthErrorHandler.parseError(error, provider);
      logOAuthError(oauthError, 'initiateOAuth');
      throw new Error(oauthError.message);
    }
  }

  /**
   * Handle OAuth callback and exchange code for token
   */
  public async handleOAuthCallback(code: string, state: string): Promise<OAuthCallbackResponse> {
    try {
      const response = await api.post<OAuthCallbackResponse>('/auth/oauth/callback', {
        code,
        provider: state,
        redirect_uri: `${window.location.origin}/auth/callback`,
      });

      if (response.success && response.token) {
        // Store the auth token
        localStorage.setItem('auth_token', response.token);
        
        // Store user data
        if (response.user) {
          localStorage.setItem('user_data', JSON.stringify(response.user));
        }
      }

      return response;
    } catch (error) {
      const oauthError = OAuthErrorHandler.parseError(error, state);
      logOAuthError(oauthError, 'handleOAuthCallback');
      
      return {
        success: false,
        error: oauthError.message,
      };
    }
  }

  /**
   * Get current user from stored data
   */
  public getCurrentUser(): User | null {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Get current auth token
   */
  public getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    const token = this.getAuthToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Logout user and clear stored data
   */
  public logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('oauth_redirect_url');
  }

  /**
   * Get available OAuth providers
   */
  public getAvailableProviders(): Array<{ id: string; name: string; enabled: boolean }> {
    if (!this.ssoConfig) {
      return [];
    }

    return [
      { id: 'google', name: 'Google', enabled: this.ssoConfig.google.enabled },
      { id: 'github', name: 'GitHub', enabled: this.ssoConfig.github.enabled },
      { id: 'microsoft', name: 'Microsoft', enabled: this.ssoConfig.microsoft.enabled },
    ].filter(provider => provider.enabled);
  }

  /**
   * Refresh SSO configuration
   */
  public async refreshSSOConfig(): Promise<void> {
    await this.loadSSOConfig();
  }
}

export default AuthService;
