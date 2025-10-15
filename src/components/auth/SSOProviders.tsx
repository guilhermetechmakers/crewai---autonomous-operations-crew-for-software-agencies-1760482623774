import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { SSOButton } from './SSOButton';
import AuthService from '@/services/AuthService';
import { OAuthErrorHandler, logOAuthError } from '@/lib/oauth-errors';

interface SSOProvidersProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showLabels?: boolean;
  disabled?: boolean;
}

interface ProviderConfig {
  id: 'google' | 'github' | 'microsoft';
  name: string;
  enabled: boolean;
}

export function SSOProviders({
  onSuccess,
  onError,
  className = '',
  variant = 'outline',
  size = 'default',
  showLabels = true,
  disabled = false,
}: SSOProvidersProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authService = AuthService.getInstance();

  // Load available providers on mount
  useEffect(() => {
    const loadProviders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get available providers from AuthService
        const availableProviders = authService.getAvailableProviders();
        
        // If no providers are available from service, use default list
        const defaultProviders: ProviderConfig[] = [
          { id: 'google', name: 'Google', enabled: true },
          { id: 'github', name: 'GitHub', enabled: true },
          { id: 'microsoft', name: 'Microsoft', enabled: true },
        ];
        
        const providerList = availableProviders.length > 0 
          ? availableProviders.map(p => ({ id: p.id as 'google' | 'github' | 'microsoft', name: p.name, enabled: p.enabled }))
          : defaultProviders;
          
        setProviders(providerList);
      } catch (err) {
        console.error('Failed to load SSO providers:', err);
        setError('Failed to load authentication providers');
        // Fallback to default providers
        setProviders([
          { id: 'google', name: 'Google', enabled: true },
          { id: 'github', name: 'GitHub', enabled: true },
          { id: 'microsoft', name: 'Microsoft', enabled: true },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProviders();
  }, [authService]);

  const handleSSOLogin = async (provider: 'google' | 'github' | 'microsoft') => {
    if (disabled || loadingProvider) return;
    
    try {
      setLoadingProvider(provider);
      setError(null);
      
      // Show loading toast
      const loadingToast = toast.loading(`Connecting to ${provider}...`);
      
      await authService.initiateOAuth(provider);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Show success toast
      toast.success(`Redirecting to ${provider}...`);
      
      onSuccess?.();
    } catch (error) {
      const oauthError = OAuthErrorHandler.parseError(error, provider);
      logOAuthError(oauthError, 'SSOProviders');
      
      const errorMessage = oauthError.message;
      setError(errorMessage);
      
      // Show error toast with retry option
      toast.error(`Failed to sign in with ${provider}: ${errorMessage}`, {
        action: {
          label: 'Retry',
          onClick: () => handleSSOLogin(provider),
        },
      });
      
      onError?.(errorMessage);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {showLabels && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 bg-muted animate-pulse rounded-md"
            />
          ))}
        </div>
      </div>
    );
  }

  const enabledProviders = providers.filter(p => p.enabled);

  if (enabledProviders.length === 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="text-center text-sm text-muted-foreground">
          SSO authentication is currently unavailable
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {showLabels && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={handleRetry}
              className="text-xs text-destructive hover:text-destructive/80 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-3">
        {enabledProviders.map((provider) => (
          <SSOButton
            key={provider.id}
            provider={provider.id}
            onClick={() => handleSSOLogin(provider.id)}
            loading={loadingProvider === provider.id}
            disabled={disabled || loadingProvider !== null}
            variant={variant}
            size={size}
          />
        ))}
      </div>
    </div>
  );
}
