import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Database, Cloud, HardDrive, Monitor } from 'lucide-react';
import type { InfrastructureConfig } from '@/types';

const infrastructureSchema = z.object({
  provider: z.enum(['vercel', 'netlify', 'aws', 'gcp', 'azure']),
  region: z.string().min(1, 'Region is required'),
  tier: z.enum(['free', 'pro', 'enterprise']),
  database: z.object({
    type: z.enum(['postgresql', 'mysql', 'mongodb', 'sqlite']),
    provider: z.enum(['supabase', 'planetscale', 'mongodb_atlas', 'local']),
    backup_enabled: z.boolean(),
    scaling: z.enum(['auto', 'manual']),
  }),
  storage: z.object({
    type: z.enum(['local', 's3', 'cloudinary', 'supabase_storage']),
    provider: z.string().optional(),
    cdn_enabled: z.boolean(),
    optimization: z.boolean(),
  }),
  monitoring: z.object({
    enabled: z.boolean(),
    provider: z.enum(['vercel_analytics', 'google_analytics', 'mixpanel', 'custom']),
    error_tracking: z.boolean(),
    performance_monitoring: z.boolean(),
  }),
});

type InfrastructureFormData = z.infer<typeof infrastructureSchema>;

interface InfrastructureFormProps {
  defaultValues?: Partial<InfrastructureConfig>;
  onSubmit: (data: InfrastructureFormData) => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export function InfrastructureForm({ 
  defaultValues, 
  onSubmit, 
  onBack, 
  isLoading = false 
}: InfrastructureFormProps) {
  const form = useForm<InfrastructureFormData>({
    resolver: zodResolver(infrastructureSchema),
    defaultValues: {
      provider: defaultValues?.provider || 'vercel',
      region: defaultValues?.region || 'us-east-1',
      tier: defaultValues?.tier || 'pro',
      database: {
        type: defaultValues?.database?.type || 'postgresql',
        provider: defaultValues?.database?.provider || 'supabase',
        backup_enabled: defaultValues?.database?.backup_enabled ?? true,
        scaling: defaultValues?.database?.scaling || 'auto',
      },
      storage: {
        type: defaultValues?.storage?.type || 'supabase_storage',
        provider: defaultValues?.storage?.provider || '',
        cdn_enabled: defaultValues?.storage?.cdn_enabled ?? true,
        optimization: defaultValues?.storage?.optimization ?? true,
      },
      monitoring: {
        enabled: defaultValues?.monitoring?.enabled ?? true,
        provider: defaultValues?.monitoring?.provider || 'vercel_analytics',
        error_tracking: defaultValues?.monitoring?.error_tracking ?? true,
        performance_monitoring: defaultValues?.monitoring?.performance_monitoring ?? true,
      },
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const watchedValues = watch();

  const handleFormSubmit = (data: InfrastructureFormData) => {
    onSubmit(data as InfrastructureConfig);
  };

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Infrastructure Setup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Hosting Provider */}
          <div>
            <Label>Hosting Provider</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {[
                { value: 'vercel', label: 'Vercel', icon: '▲' },
                { value: 'netlify', label: 'Netlify', icon: '●' },
                { value: 'aws', label: 'AWS', icon: '☁' },
                { value: 'gcp', label: 'Google Cloud', icon: 'G' },
                { value: 'azure', label: 'Azure', icon: 'A' },
              ].map((provider) => (
                <label key={provider.value} className="flex items-center space-x-2 p-3 rounded border hover:bg-secondary/50 transition-colors">
                  <input
                    type="radio"
                    value={provider.value}
                    {...register('provider')}
                    className="text-primary"
                  />
                  <span className="text-sm font-medium">{provider.icon} {provider.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                {...register('region')}
                placeholder="us-east-1"
                className="mt-1"
              />
              {errors.region && (
                <p className="text-sm text-destructive mt-1">{errors.region.message}</p>
              )}
            </div>
            
            <div>
              <Label>Tier</Label>
              <div className="flex gap-4 mt-2">
                {['free', 'pro', 'enterprise'].map((tier) => (
                  <label key={tier} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value={tier}
                      {...register('tier')}
                      className="text-primary"
                    />
                    <span className="text-sm capitalize">{tier}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Database Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Database</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Database Type</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['postgresql', 'mysql', 'mongodb', 'sqlite'].map((db) => (
                    <label key={db} className="flex items-center space-x-2 p-2 rounded border hover:bg-secondary/50">
                      <input
                        type="radio"
                        value={db}
                        {...register('database.type')}
                        className="text-primary"
                      />
                      <span className="text-sm capitalize">{db}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Database Provider</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['supabase', 'planetscale', 'mongodb_atlas', 'local'].map((provider) => (
                    <label key={provider} className="flex items-center space-x-2 p-2 rounded border hover:bg-secondary/50">
                      <input
                        type="radio"
                        value={provider}
                        {...register('database.provider')}
                        className="text-primary"
                      />
                      <span className="text-sm capitalize">{provider.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Storage Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Storage</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Storage Type</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['local', 's3', 'cloudinary', 'supabase_storage'].map((storage) => (
                    <label key={storage} className="flex items-center space-x-2 p-2 rounded border hover:bg-secondary/50">
                      <input
                        type="radio"
                        value={storage}
                        {...register('storage.type')}
                        className="text-primary"
                      />
                      <span className="text-sm capitalize">{storage.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cdn-enabled" className="text-sm">
                    CDN Enabled
                  </Label>
                  <Switch
                    id="cdn-enabled"
                    checked={watchedValues.storage.cdn_enabled}
                    onCheckedChange={(checked) => setValue('storage.cdn_enabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="optimization" className="text-sm">
                    Image Optimization
                  </Label>
                  <Switch
                    id="optimization"
                    checked={watchedValues.storage.optimization}
                    onCheckedChange={(checked) => setValue('storage.optimization', checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Monitoring Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Monitor className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Monitoring</h3>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <Label htmlFor="monitoring-enabled" className="text-base font-medium">
                  Enable Monitoring
                </Label>
                <p className="text-sm text-muted-foreground">
                  Track performance and errors
                </p>
              </div>
              <Switch
                id="monitoring-enabled"
                checked={watchedValues.monitoring.enabled}
                onCheckedChange={(checked) => setValue('monitoring.enabled', checked)}
              />
            </div>

            {watchedValues.monitoring.enabled && (
              <div className="space-y-3 pl-4">
                <div>
                  <Label>Monitoring Provider</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['vercel_analytics', 'google_analytics', 'mixpanel', 'custom'].map((provider) => (
                      <label key={provider} className="flex items-center space-x-2 p-2 rounded border hover:bg-secondary/50">
                        <input
                          type="radio"
                          value={provider}
                          {...register('monitoring.provider')}
                          className="text-primary"
                        />
                        <span className="text-sm capitalize">{provider.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="error-tracking" className="text-sm">
                      Error Tracking
                    </Label>
                    <Switch
                      id="error-tracking"
                      checked={watchedValues.monitoring.error_tracking}
                      onCheckedChange={(checked) => setValue('monitoring.error_tracking', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="performance-monitoring" className="text-sm">
                      Performance Monitoring
                    </Label>
                    <Switch
                      id="performance-monitoring"
                      checked={watchedValues.monitoring.performance_monitoring}
                      onCheckedChange={(checked) => setValue('monitoring.performance_monitoring', checked)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

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
