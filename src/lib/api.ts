// Enhanced fetch wrapper with comprehensive error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      // Handle different HTTP status codes
      if (response.status === 401) {
        // Unauthorized - clear auth data and redirect
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('oauth_state');
        window.location.href = '/login';
        throw new Error('Authentication required');
      }

      if (response.status === 403) {
        throw new Error('Access forbidden');
      }

      if (response.status === 404) {
        throw new Error('Resource not found');
      }

      if (response.status === 422) {
        // Validation error - try to parse error details
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Validation failed');
        } catch {
          throw new Error('Validation failed');
        }
      }

      if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }

      // Generic error for other status codes
      throw new Error(`Request failed with status ${response.status}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }

    // Re-throw other errors
    throw error;
  }
}

// API utilities with enhanced error handling
export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) => 
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: <T>(endpoint: string, data: unknown) => 
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: <T>(endpoint: string) => 
    apiRequest<T>(endpoint, { method: 'DELETE' }),
  patch: <T>(endpoint: string, data: unknown) => 
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// OAuth-specific API functions with enhanced error handling
export const oauthApi = {
  /**
   * Get SSO configuration with retry logic
   */
  getSSOConfig: async () => {
    try {
      return await api.get('/auth/sso/config');
    } catch (error) {
      console.warn('Failed to fetch SSO config, using fallback:', error);
      // Return fallback config
      return {
        google: { client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '', enabled: false },
        github: { client_id: import.meta.env.VITE_GITHUB_CLIENT_ID || '', enabled: false },
        microsoft: { 
          client_id: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '', 
          tenant_id: import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common',
          enabled: false 
        },
      };
    }
  },

  /**
   * Handle OAuth callback with enhanced error handling
   */
  handleCallback: async (data: {
    code: string;
    provider: string;
    redirect_uri: string;
    state: string;
  }) => {
    try {
      return await api.post('/auth/oauth/callback', data);
    } catch (error) {
      console.error('OAuth callback failed:', error);
      throw error;
    }
  },

  /**
   * Refresh auth token
   */
  refreshToken: async () => {
    try {
      return await api.post('/auth/refresh', {});
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear invalid token
      localStorage.removeItem('auth_token');
      throw error;
    }
  },
};

// Project Spin-Up API functions
export const spinUpApi = {
  initiate: (data: {
    name: string;
    description: string;
    configuration: any;
  }) => api.post<{ id: string; status: string }>('/spinup/initiate', data),
  
  getProgress: (spinupId: string) => 
    api.get<{ progress: number; status: string; logs: any[] }>(`/spinup/${spinupId}/progress`),
  
  getTemplates: () => 
    api.get<any[]>('/spinup/templates'),
  
  cancel: (spinupId: string) => 
    api.post<{ success: boolean }>(`/spinup/${spinupId}/cancel`, {}),
};

// Onboarding API functions
export const onboardingApi = {
  /**
   * Get current onboarding data
   */
  getCurrent: () => 
    api.get<import('@/types').OnboardingData>('/onboarding/current'),
  
  /**
   * Update onboarding step data
   */
  updateStep: (data: import('@/types').OnboardingUpdateRequest) => 
    api.post<import('@/types').OnboardingUpdateResponse>('/onboarding/update', data),
  
  /**
   * Complete onboarding process
   */
  complete: (data: import('@/types').OnboardingCompleteRequest) => 
    api.post<import('@/types').OnboardingCompleteResponse>('/onboarding/complete', data),
  
  /**
   * Get available tech stack options
   */
  getTechStackOptions: () => 
    api.get<import('@/types').TechStackSelection[]>('/onboarding/tech-stack-options'),
  
  /**
   * Get available integration providers
   */
  getIntegrationProviders: () => 
    api.get<import('@/types').IntegrationSelection[]>('/onboarding/integration-providers'),
  
  /**
   * Get billing plan options
   */
  getBillingPlans: () => 
    api.get<import('@/types').BillingPlanSelection[]>('/onboarding/billing-plans'),
  
  /**
   * Test integration connection
   */
  testIntegration: (provider: string, config: Record<string, any>) => 
    api.post<{ success: boolean; error?: string }>(`/onboarding/test-integration/${provider}`, config),
  
  /**
   * Send team member invitations
   */
  inviteTeamMembers: (invites: import('@/types').TeamMemberInvite[]) => 
    api.post<{ success: boolean; sent: number; failed: number }>('/onboarding/invite-team', { invites }),
  
  /**
   * Skip onboarding (for returning users)
   */
  skip: () => 
    api.post<{ success: boolean }>('/onboarding/skip', {}),
};
