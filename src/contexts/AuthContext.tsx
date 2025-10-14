import { createContext, useContext, useEffect, useState } from 'react';
import type { User, AuthState } from '@/types';
import type { ReactNode } from 'react';
import AuthService from '@/services/AuthService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  initiateOAuth: (provider: 'google' | 'github' | 'microsoft') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authService = AuthService.getInstance();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
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
    } catch (error) {
      console.error('Login error:', error);
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
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    authService.logout();
  };

  const refreshUser = async () => {
    try {
      const storedUser = authService.getCurrentUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const initiateOAuth = async (provider: 'google' | 'github' | 'microsoft') => {
    try {
      await authService.initiateOAuth(provider);
    } catch (error) {
      console.error('OAuth initiation error:', error);
      throw error;
    }
  };

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
