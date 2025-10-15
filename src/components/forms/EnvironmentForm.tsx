import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Globe, Shield, Zap } from 'lucide-react';
import type { EnvironmentConfig } from '@/types';

const environmentSchema = z.object({
  name: z.string().min(1, 'Environment name is required'),
  type: z.enum(['development', 'staging', 'production']),
  domain: z.string().optional(),
  ssl_enabled: z.boolean(),
  auto_deploy: z.boolean(),
  environment_variables: z.record(z.string()).default({}),
});

type EnvironmentFormData = z.infer<typeof environmentSchema>;

interface EnvironmentFormProps {
  defaultValues?: Partial<EnvironmentConfig>;
  onSubmit: (data: EnvironmentFormData) => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export function EnvironmentForm({ 
  defaultValues, 
  onSubmit, 
  onBack, 
  isLoading = false 
}: EnvironmentFormProps) {
  const form = useForm<EnvironmentFormData>({
    resolver: zodResolver(environmentSchema),
    defaultValues: {
      name: defaultValues?.name || 'production',
      type: defaultValues?.type || 'production',
      domain: defaultValues?.domain || '',
      ssl_enabled: defaultValues?.ssl_enabled ?? true,
      auto_deploy: defaultValues?.auto_deploy ?? true,
      environment_variables: defaultValues?.environment_variables || {},
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const watchedValues = watch();

  const handleFormSubmit = (data: EnvironmentFormData) => {
    onSubmit(data as EnvironmentConfig);
  };

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Environment Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="env-name">Environment Name</Label>
                <Input
                  id="env-name"
                  {...register('name')}
                  placeholder="production"
                  className="mt-1"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="domain">Domain (Optional)</Label>
                <Input
                  id="domain"
                  {...register('domain')}
                  placeholder="myapp.com"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Environment Type</Label>
                <div className="flex gap-4 mt-2">
                  {['development', 'staging', 'production'].map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value={type}
                        {...register('type')}
                        className="text-primary"
                      />
                      <span className="text-sm capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Security and Deployment Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="ssl-enabled" className="text-base font-medium">
                    Enable SSL
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Secure your application with HTTPS
                  </p>
                </div>
              </div>
              <Switch
                id="ssl-enabled"
                checked={watchedValues.ssl_enabled}
                onCheckedChange={(checked) => setValue('ssl_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="auto-deploy" className="text-base font-medium">
                    Auto-deploy on Push
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically deploy when changes are pushed to the main branch
                  </p>
                </div>
              </div>
              <Switch
                id="auto-deploy"
                checked={watchedValues.auto_deploy}
                onCheckedChange={(checked) => setValue('auto_deploy', checked)}
              />
            </div>
          </div>

          {/* Environment Variables Preview */}
          {watchedValues.environment_variables && Object.keys(watchedValues.environment_variables).length > 0 && (
            <div>
              <Label>Environment Variables</Label>
              <div className="mt-2 space-y-2">
                {Object.entries(watchedValues.environment_variables).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2 text-sm">
                    <code className="px-2 py-1 bg-secondary rounded text-primary">{key}</code>
                    <span className="text-muted-foreground">=</span>
                    <code className="px-2 py-1 bg-secondary rounded">{value}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-border">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing...' : 'Continue →'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
