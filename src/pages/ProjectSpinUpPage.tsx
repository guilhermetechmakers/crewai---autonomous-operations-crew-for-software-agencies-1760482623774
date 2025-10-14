import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Settings, 
  Database, 
  Globe, 
  Code, 
  Rocket,
  Loader2
} from 'lucide-react';
import type { 
  SpinUpTemplate 
} from '@/types';

// Form validation schemas
const repositorySchema = z.object({
  name: z.string().min(1, 'Repository name is required'),
  description: z.string().min(1, 'Description is required'),
  visibility: z.enum(['public', 'private']),
  framework: z.enum(['nextjs', 'react', 'vue', 'angular', 'svelte', 'vanilla']),
  package_manager: z.enum(['npm', 'yarn', 'pnpm']),
  features: z.array(z.string()).min(1, 'At least one feature must be selected'),
});

const environmentSchema = z.object({
  name: z.string().min(1, 'Environment name is required'),
  type: z.enum(['development', 'staging', 'production']),
  domain: z.string().optional(),
  ssl_enabled: z.boolean(),
  auto_deploy: z.boolean(),
});

const infrastructureSchema = z.object({
  provider: z.enum(['vercel', 'netlify', 'aws', 'gcp', 'azure']),
  region: z.string().min(1, 'Region is required'),
  tier: z.enum(['free', 'pro', 'enterprise']),
  database_type: z.enum(['postgresql', 'mysql', 'mongodb', 'sqlite']),
  database_provider: z.enum(['supabase', 'planetscale', 'mongodb_atlas', 'local']),
  storage_type: z.enum(['local', 's3', 'cloudinary', 'supabase_storage']),
  monitoring_enabled: z.boolean(),
});

const spinUpSchema = z.object({
  repository: repositorySchema,
  environment: environmentSchema,
  infrastructure: infrastructureSchema,
});

type SpinUpFormData = z.infer<typeof spinUpSchema>;

// Available templates
const templates: SpinUpTemplate[] = [
  {
    id: 'nextjs-starter',
    name: 'Next.js Starter',
    description: 'Modern React framework with TypeScript and Tailwind CSS',
    category: 'web_app',
    framework: 'nextjs',
    features: ['TypeScript', 'Tailwind CSS', 'ESLint', 'Prettier'],
    estimated_setup_time: 5,
    complexity: 'beginner',
  },
  {
    id: 'react-vite',
    name: 'React + Vite',
    description: 'Fast React development with Vite bundler',
    category: 'web_app',
    framework: 'react',
    features: ['TypeScript', 'Vite', 'React Router', 'Zustand'],
    estimated_setup_time: 3,
    complexity: 'beginner',
  },
  {
    id: 'fullstack-nextjs',
    name: 'Full-Stack Next.js',
    description: 'Complete full-stack application with database and auth',
    category: 'fullstack',
    framework: 'nextjs',
    features: ['TypeScript', 'Prisma', 'NextAuth', 'PostgreSQL', 'Tailwind'],
    estimated_setup_time: 15,
    complexity: 'advanced',
  },
];

// Step configuration
const steps = [
  { id: 'template', title: 'Choose Template', icon: Code },
  { id: 'repository', title: 'Repository Setup', icon: Settings },
  { id: 'environment', title: 'Environment Config', icon: Globe },
  { id: 'infrastructure', title: 'Infrastructure', icon: Database },
  { id: 'review', title: 'Review & Deploy', icon: Rocket },
];

export default function ProjectSpinUpPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<SpinUpTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SpinUpFormData>({
    resolver: zodResolver(spinUpSchema),
    defaultValues: {
      repository: {
        name: '',
        description: '',
        visibility: 'private',
        framework: 'nextjs',
        package_manager: 'npm',
        features: [],
      },
      environment: {
        name: 'production',
        type: 'production',
        domain: '',
        ssl_enabled: true,
        auto_deploy: true,
      },
      infrastructure: {
        provider: 'vercel',
        region: 'us-east-1',
        tier: 'pro',
        database_type: 'postgresql',
        database_provider: 'supabase',
        storage_type: 'supabase_storage',
        monitoring_enabled: true,
      },
    },
  });

  const { handleSubmit, watch, setValue, formState: { errors } } = form;
  const watchedValues = watch();

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectTemplate = (template: SpinUpTemplate) => {
    setSelectedTemplate(template);
    setValue('repository.framework', template.framework as any);
    setValue('repository.features', template.features);
    nextStep();
  };

  const onSubmit = async (data: SpinUpFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call with the form data
      console.log('Submitting spin-up data:', data);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Project spin-up initiated successfully!', {
        description: 'Your project is being set up. You\'ll receive notifications as it progresses.',
      });
      
      // Reset form and go back to first step
      setCurrentStep(0);
      setSelectedTemplate(null);
      form.reset();
    } catch (error) {
      toast.error('Failed to initiate project spin-up', {
        description: 'Please try again or contact support if the issue persists.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Choose a Template</h2>
              <p className="text-muted-foreground">
                Select a pre-configured template to get started quickly
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-card-hover ${
                    selectedTemplate?.id === template.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-secondary/50'
                  }`}
                  onClick={() => selectTemplate(template)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Code className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant={template.complexity === 'beginner' ? 'success' : 'secondary'}>
                        {template.complexity}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-foreground mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Setup Time</span>
                        <span className="font-medium">{template.estimated_setup_time} min</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {template.features.slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {template.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Repository Configuration</h2>
              <p className="text-muted-foreground">
                Configure your repository settings and features
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="repo-name">Repository Name</Label>
                  <Input
                    id="repo-name"
                    {...form.register('repository.name')}
                    placeholder="my-awesome-project"
                    className="mt-1"
                  />
                  {errors.repository?.name && (
                    <p className="text-sm text-destructive mt-1">{errors.repository.name.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="repo-description">Description</Label>
                  <Input
                    id="repo-description"
                    {...form.register('repository.description')}
                    placeholder="A brief description of your project"
                    className="mt-1"
                  />
                  {errors.repository?.description && (
                    <p className="text-sm text-destructive mt-1">{errors.repository.description.message}</p>
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
                        {...form.register('repository.visibility')}
                        className="text-primary"
                      />
                      <span className="text-sm">Private</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="public"
                        {...form.register('repository.visibility')}
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
                          {...form.register('repository.package_manager')}
                          className="text-primary"
                        />
                        <span className="text-sm capitalize">{pm}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Environment Configuration</h2>
              <p className="text-muted-foreground">
                Set up your deployment environment
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="env-name">Environment Name</Label>
                  <Input
                    id="env-name"
                    {...form.register('environment.name')}
                    placeholder="production"
                    className="mt-1"
                  />
                  {errors.environment?.name && (
                    <p className="text-sm text-destructive mt-1">{errors.environment.name.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="domain">Domain (Optional)</Label>
                  <Input
                    id="domain"
                    {...form.register('environment.domain')}
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
                          {...form.register('environment.type')}
                          className="text-primary"
                        />
                        <span className="text-sm capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...form.register('environment.ssl_enabled')}
                      className="text-primary"
                    />
                    <span className="text-sm">Enable SSL</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...form.register('environment.auto_deploy')}
                      className="text-primary"
                    />
                    <span className="text-sm">Auto-deploy on push</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Infrastructure Setup</h2>
              <p className="text-muted-foreground">
                Configure your hosting and database infrastructure
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Hosting Provider</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['vercel', 'netlify', 'aws', 'gcp', 'azure'].map((provider) => (
                      <label key={provider} className="flex items-center space-x-2 p-2 rounded border hover:bg-secondary/50">
                        <input
                          type="radio"
                          value={provider}
                          {...form.register('infrastructure.provider')}
                          className="text-primary"
                        />
                        <span className="text-sm capitalize">{provider}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    {...form.register('infrastructure.region')}
                    placeholder="us-east-1"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Database</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['postgresql', 'mysql', 'mongodb', 'sqlite'].map((db) => (
                      <label key={db} className="flex items-center space-x-2 p-2 rounded border hover:bg-secondary/50">
                        <input
                          type="radio"
                          value={db}
                          {...form.register('infrastructure.database_type')}
                          className="text-primary"
                        />
                        <span className="text-sm capitalize">{db}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Storage</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['local', 's3', 'cloudinary', 'supabase_storage'].map((storage) => (
                      <label key={storage} className="flex items-center space-x-2 p-2 rounded border hover:bg-secondary/50">
                        <input
                          type="radio"
                          value={storage}
                          {...form.register('infrastructure.storage_type')}
                          className="text-primary"
                        />
                        <span className="text-sm capitalize">{storage.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Review & Deploy</h2>
              <p className="text-muted-foreground">
                Review your configuration and deploy your project
              </p>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Repository Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <span className="ml-2 font-medium">{watchedValues.repository.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Framework:</span>
                      <span className="ml-2 font-medium capitalize">{watchedValues.repository.framework}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Visibility:</span>
                      <span className="ml-2 font-medium capitalize">{watchedValues.repository.visibility}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Package Manager:</span>
                      <span className="ml-2 font-medium">{watchedValues.repository.package_manager}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Environment Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <span className="ml-2 font-medium">{watchedValues.environment.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 font-medium capitalize">{watchedValues.environment.type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Domain:</span>
                      <span className="ml-2 font-medium">{watchedValues.environment.domain || 'Not set'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">SSL:</span>
                      <span className="ml-2 font-medium">{watchedValues.environment.ssl_enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Infrastructure Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Provider:</span>
                      <span className="ml-2 font-medium capitalize">{watchedValues.infrastructure.provider}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Region:</span>
                      <span className="ml-2 font-medium">{watchedValues.infrastructure.region}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Database:</span>
                      <span className="ml-2 font-medium capitalize">{watchedValues.infrastructure.database_type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Storage:</span>
                      <span className="ml-2 font-medium capitalize">{watchedValues.infrastructure.storage_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Project Spin-Up
          </h1>
          <p className="text-muted-foreground">
            Quickly set up new projects with automated configuration and deployment
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isCompleted 
                        ? 'bg-success text-success-foreground' 
                        : isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`text-sm mt-2 font-medium ${
                      isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-success' : 'bg-border'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="animate-fade-in-up">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              {renderStepContent()}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Deploying...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4" />
                        Deploy Project
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}