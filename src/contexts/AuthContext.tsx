import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { User, AuthState } from '@/types';
import type { ReactNode } from 'react';
import AuthService from '@/services/AuthService';
import { OAuthErrorHandler, logOAuthError } from '@/lib/oauth-errors';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  initiateOAuth: (provider: 'google' | 'github' | 'microsoft') => Promise<void>;
  handleOAuthCallback: (code: string, state: string) => Promise<{ success: boolean; error?: string }>;
  isOAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const authService = AuthService.getInstance();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const storedToken = authService.getAuthToken();
        const storedUser = authService.getCurrentUser();
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid stored data
        authService.logout();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [authService]);

  const login = async (email: string, _password: string) => {
    setIsLoading(true);
    try {
      // This would call the actual API
      // const response = await authApi.login({ email, password });
      // For now, simulate the response
      const mockUser: User = {
        id: '1',
        email,
        full_name: 'Test User',
        role: 'user',
        workspace_id: 'workspace-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const mockToken = 'mock_token_' + Date.now();
      
      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      
      toast.success('Successfully signed in!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to sign in. Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; full_name: string }) => {
    setIsLoading(true);
    try {
      // This would call the actual API
      // const response = await authApi.register(data);
      // For now, simulate the response
      const mockUser: User = {
        id: '1',
        email: data.email,
        full_name: data.full_name,
        role: 'user',
        workspace_id: 'workspace-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const mockToken = 'mock_token_' + Date.now();
      
      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      
      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to create account. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    authService.logout();
    toast.success('Successfully signed out');
  }, [authService]);

  const refreshUser = useCallback(async () => {
    try {
      const storedUser = authService.getCurrentUser();
      const storedToken = authService.getAuthToken();
      
      if (storedUser && storedToken) {
        setUser(storedUser);
        setToken(storedToken);
      } else {
        // Clear invalid data
        setUser(null);
        setToken(null);
        authService.logout();
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
      setToken(null);
      authService.logout();
    }
  }, [authService]);

  const initiateOAuth = useCallback(async (provider: 'google' | 'github' | 'microsoft') => {
    try {
      setIsOAuthLoading(true);
      await authService.initiateOAuth(provider);
      // Note: The actual redirect happens in AuthService, so we don't need to handle success here
    } catch (error) {
      const oauthError = OAuthErrorHandler.parseError(error, provider);
      logOAuthError(oauthError, 'AuthContext.initiateOAuth');
      toast.error(`Failed to initiate ${provider} authentication: ${oauthError.message}`);
      throw error;
    } finally {
      setIsOAuthLoading(false);
    }
  }, [authService]);

  const handleOAuthCallback = useCallback(async (code: string, state: string) => {
    try {
      setIsOAuthLoading(true);
      
      // Validate state parameter
      if (!authService.validateOAuthState(state)) {
        throw new Error('Invalid OAuth state parameter');
      }

      const result = await authService.handleOAuthCallback(code, state);
      
      if (result.success && result.user && result.token) {
        setUser(result.user);
        setToken(result.token);
        toast.success('Successfully signed in!');
        return { success: true };
      } else {
        const errorMessage = result.error || 'OAuth authentication failed';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const oauthError = OAuthErrorHandler.parseError(error, state);
      logOAuthError(oauthError, 'AuthContext.handleOAuthCallback');
      const errorMessage = oauthError.message;
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsOAuthLoading(false);
    }
  }, [authService]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!(user && token),
    login,
    register,
    logout,
    refreshUser,
    initiateOAuth,
    handleOAuthCallback,
    isOAuthLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
