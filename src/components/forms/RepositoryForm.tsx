import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Code, CheckCircle } from 'lucide-react';
import type { SpinUpTemplate, RepositoryConfig } from '@/types';

const repositorySchema = z.object({
  name: z.string().min(1, 'Repository name is required'),
  description: z.string().min(1, 'Description is required'),
  visibility: z.enum(['public', 'private']),
  framework: z.enum(['nextjs', 'react', 'vue', 'angular', 'svelte', 'vanilla']),
  package_manager: z.enum(['npm', 'yarn', 'pnpm']),
  features: z.array(z.string()).min(1, 'At least one feature must be selected'),
});

type RepositoryFormData = z.infer<typeof repositorySchema>;

interface RepositoryFormProps {
  template?: SpinUpTemplate | null;
  defaultValues?: Partial<RepositoryConfig>;
  onSubmit: (data: RepositoryFormData) => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export function RepositoryForm({ 
  template, 
  defaultValues, 
  onSubmit, 
  onBack, 
  isLoading = false 
}: RepositoryFormProps) {
  const form = useForm<RepositoryFormData>({
    resolver: zodResolver(repositorySchema),
    defaultValues: {
      name: defaultValues?.name || '',
      description: defaultValues?.description || '',
      visibility: defaultValues?.visibility || 'private',
      framework: (defaultValues?.framework || template?.framework || 'nextjs') as 'nextjs' | 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla',
      package_manager: defaultValues?.package_manager || 'npm',
      features: defaultValues?.features || template?.features || [],
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const watchedValues = watch();

  const handleFormSubmit = (data: RepositoryFormData) => {
    onSubmit(data as RepositoryConfig);
  };

  const toggleFeature = (feature: string) => {
    const currentFeatures = watchedValues.features;
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    setValue('features', newFeatures);
  };

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Repository Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="repo-name">Repository Name</Label>
                <Input
                  id="repo-name"
                  {...register('name')}
                  placeholder="my-awesome-project"
                  className="mt-1"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="repo-description">Description</Label>
                <Input
                  id="repo-description"
                  {...register('description')}
                  placeholder="A brief description of your project"
                  className="mt-1"
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Visibility</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="private"
                      {...register('visibility')}
                      className="text-primary"
                    />
                    <span className="text-sm">Private</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="public"
                      {...register('visibility')}
                      className="text-primary"
                    />
                    <span className="text-sm">Public</span>
                  </label>
                </div>
              </div>
              
              <div>
                <Label>Package Manager</Label>
                <div className="flex gap-4 mt-2">
                  {['npm', 'yarn', 'pnpm'].map((pm) => (
                    <label key={pm} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value={pm}
                        {...register('package_manager')}
                        className="text-primary"
                      />
                      <span className="text-sm capitalize">{pm}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Features Selection */}
          <div>
            <Label>Features</Label>
            <div className="mt-2 space-y-2">
              {template?.features.map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => toggleFeature(feature)}
                    className={`flex items-center space-x-2 p-2 rounded border transition-all duration-200 ${
                      watchedValues.features.includes(feature)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:bg-secondary/50'
                    }`}
                  >
                    {watchedValues.features.includes(feature) ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <div className="h-4 w-4 rounded border border-current" />
                    )}
                    <span className="text-sm">{feature}</span>
                  </button>
                </div>
              ))}
            </div>
            {errors.features && (
              <p className="text-sm text-destructive mt-1">{errors.features.message}</p>
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
