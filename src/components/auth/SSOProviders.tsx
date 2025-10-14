import { useState } from 'react';
import { toast } from 'sonner';
import { SSOButton } from './SSOButton';
import AuthService from '@/services/AuthService';

interface SSOProvidersProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showLabels?: boolean;
}

export function SSOProviders({
  onSuccess,
  onError,
  className = '',
  variant = 'outline',
  size = 'default',
  showLabels = true,
}: SSOProvidersProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const authService = AuthService.getInstance();

  const handleSSOLogin = async (provider: 'google' | 'github' | 'microsoft') => {
    try {
      setLoadingProvider(provider);
      await authService.initiateOAuth(provider);
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'SSO authentication failed';
      console.error(`${provider} SSO error:`, error);
      toast.error(`Failed to sign in with ${provider}: ${errorMessage}`);
      onError?.(errorMessage);
    } finally {
      setLoadingProvider(null);
    }
  };

  const providers = [
    { id: 'google' as const, name: 'Google' },
    { id: 'github' as const, name: 'GitHub' },
    { id: 'microsoft' as const, name: 'Microsoft' },
  ];

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
        {providers.map((provider) => (
          <SSOButton
            key={provider.id}
            provider={provider.id}
            onClick={() => handleSSOLogin(provider.id)}
            loading={loadingProvider === provider.id}
            variant={variant}
            size={size}
          />
        ))}
      </div>
    </div>
  );
}
