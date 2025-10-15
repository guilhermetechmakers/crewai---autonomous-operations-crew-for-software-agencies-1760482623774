import { api } from '@/lib/api';
import type { OAuthCallbackResponse, SSOConfig, User } from '@/types';
import { OAuthErrorHandler, logOAuthError } from '@/lib/oauth-errors';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

class AuthService {
  private static instance: AuthService;
  private ssoConfig: SSOConfig | null = null;
  private retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  };

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
      // Fallback to default config with mock values for development
      this.ssoConfig = {
        google: { 
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '', 
          enabled: !!import.meta.env.VITE_GOOGLE_CLIENT_ID 
        },
        github: { 
          client_id: import.meta.env.VITE_GITHUB_CLIENT_ID || '', 
          enabled: !!import.meta.env.VITE_GITHUB_CLIENT_ID 
        },
        microsoft: { 
          client_id: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '', 
          tenant_id: import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common',
          enabled: !!import.meta.env.VITE_MICROSOFT_CLIENT_ID 
        },
      };
    }
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    context: string,
    retryCount = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const oauthError = OAuthErrorHandler.parseError(error);
      
      // Don't retry for certain error types
      if (!OAuthErrorHandler.shouldRetry(oauthError.type) || retryCount >= this.retryConfig.maxRetries) {
        throw error;
      }

      const delay = Math.min(
        this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, retryCount),
        this.retryConfig.maxDelay
      );

      console.warn(`${context} failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.retryConfig.maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return this.retryWithBackoff(operation, context, retryCount + 1);
    }
  }

  /**
   * Initiate OAuth flow with the specified provider
   */
  public async initiateOAuth(provider: 'google' | 'github' | 'microsoft'): Promise<void> {
    return this.retryWithBackoff(async () => {
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
      
      // Generate a random state parameter for security
      const state = `${provider}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      let authUrl = '';
      
      switch (provider) {
        case 'google':
          authUrl = `https://accounts.google.com/oauth/authorize?` +
            `client_id=${providerConfig.client_id}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent('openid email profile')}&` +
            `state=${state}&` +
            `access_type=offline&` +
            `prompt=consent`;
          break;
          
        case 'github':
          authUrl = `https://github.com/login/oauth/authorize?` +
            `client_id=${providerConfig.client_id}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=${encodeURIComponent('user:email')}&` +
            `state=${state}&` +
            `allow_signup=true`;
          break;
          
        case 'microsoft':
          const tenantId = 'tenant_id' in providerConfig ? providerConfig.tenant_id || 'common' : 'common';
          authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
            `client_id=${providerConfig.client_id}&` +
            `response_type=code&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=${encodeURIComponent('openid email profile')}&` +
            `state=${state}&` +
            `response_mode=query&` +
            `prompt=select_account`;
          break;
      }

      // Store the current URL and state to redirect back after OAuth
      localStorage.setItem('oauth_redirect_url', window.location.pathname);
      localStorage.setItem('oauth_state', state);
      
      // Redirect to OAuth provider
      window.location.href = authUrl;
    }, 'initiateOAuth');
  }

  /**
   * Handle OAuth callback and exchange code for token
   */
  public async handleOAuthCallback(code: string, state: string): Promise<OAuthCallbackResponse> {
    return this.retryWithBackoff(async () => {
      // Validate state parameter for security
      const storedState = localStorage.getItem('oauth_state');
      if (storedState && storedState !== state) {
        const error = OAuthErrorHandler.parseError('invalid_request', state);
        error.description = 'Invalid state parameter. Possible CSRF attack.';
        logOAuthError(error, 'handleOAuthCallback');
        throw new Error('Invalid state parameter');
      }

      // Extract provider from state
      const provider = state.split('_')[0] as 'google' | 'github' | 'microsoft';
      
      const response = await api.post<OAuthCallbackResponse>('/auth/oauth/callback', {
        code,
        provider,
        redirect_uri: `${window.location.origin}/auth/callback`,
        state,
      });

      if (response.success && response.token) {
        // Store the auth token
        localStorage.setItem('auth_token', response.token);
        
        // Store user data
        if (response.user) {
          localStorage.setItem('user_data', JSON.stringify(response.user));
        }

        // Clear OAuth state
        localStorage.removeItem('oauth_state');
      }

      return response;
    }, 'handleOAuthCallback');
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
    localStorage.removeItem('oauth_state');
  }

  /**
   * Validate OAuth state parameter
   */
  public validateOAuthState(state: string): boolean {
    const storedState = localStorage.getItem('oauth_state');
    return storedState === state;
  }

  /**
   * Get OAuth provider from state
   */
  public getProviderFromState(state: string): 'google' | 'github' | 'microsoft' | null {
    const validProviders = ['google', 'github', 'microsoft'];
    const provider = state.split('_')[0];
    return validProviders.includes(provider) ? provider as 'google' | 'github' | 'microsoft' : null;
  }

  /**
   * Update retry configuration
   */
  public updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
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
