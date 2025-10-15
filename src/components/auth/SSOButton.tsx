import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Mail, Github, Building2 } from 'lucide-react';

interface SSOButtonProps {
  provider: 'google' | 'github' | 'microsoft';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const providerConfig = {
  google: {
    name: 'Google',
    icon: Mail,
    color: 'hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950 dark:hover:text-red-400',
    bgColor: 'bg-white dark:bg-gray-900',
    borderColor: 'border-gray-200 dark:border-gray-700',
    textColor: 'text-gray-700 dark:text-gray-300',
  },
  github: {
    name: 'GitHub',
    icon: Github,
    color: 'hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
    bgColor: 'bg-white dark:bg-gray-900',
    borderColor: 'border-gray-200 dark:border-gray-700',
    textColor: 'text-gray-700 dark:text-gray-300',
  },
  microsoft: {
    name: 'Microsoft',
    icon: Building2,
    color: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950 dark:hover:text-blue-400',
    bgColor: 'bg-white dark:bg-gray-900',
    borderColor: 'border-gray-200 dark:border-gray-700',
    textColor: 'text-gray-700 dark:text-gray-300',
  },
};

export function SSOButton({
  provider,
  onClick,
  disabled = false,
  loading = false,
  className,
  variant = 'outline',
  size = 'default',
}: SSOButtonProps) {
  const config = providerConfig[provider];
  const Icon = config.icon;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'w-full transition-all duration-200',
        'hover:scale-[1.02] hover:shadow-md hover:shadow-black/5',
        'focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'active:scale-[0.98] active:shadow-sm',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        config.color,
        config.bgColor,
        config.borderColor,
        config.textColor,
        'border-2',
        className
      )}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="text-sm font-medium">Connecting...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3">
          <Icon className="h-5 w-5" />
          <span className="text-sm font-medium">{config.name}</span>
        </div>
      )}
    </Button>
  );
}
