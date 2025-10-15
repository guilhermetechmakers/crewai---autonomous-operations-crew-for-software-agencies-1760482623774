import { useState } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useProjectSpinUp } from '@/hooks/useProjectSpinUp';
import { RepositoryForm, EnvironmentForm, InfrastructureForm } from '@/components/forms';
import type { 
  SpinUpConfiguration,
  RepositoryConfig,
  EnvironmentConfig,
  InfrastructureConfig
} from '@/types';



// Step configuration
const steps = [
  { id: 'template', title: 'Choose Template', icon: Code },
  { id: 'repository', title: 'Repository Setup', icon: Settings },
  { id: 'environment', title: 'Environment Config', icon: Globe },
  { id: 'infrastructure', title: 'Infrastructure', icon: Database },
  { id: 'review', title: 'Review & Deploy', icon: Rocket },
];

export default function ProjectSpinUpPage() {
  const {
    currentStep,
    selectedTemplate,
    templates,
    isLoadingTemplates,
    isInitiating,
    nextStep,
    prevStep,
    selectTemplate,
    initiateSpinUp,
  } = useProjectSpinUp();

  const [formData, setFormData] = useState<{
    repository?: RepositoryConfig;
    environment?: EnvironmentConfig;
    infrastructure?: InfrastructureConfig;
  }>({});

  const handleRepositorySubmit = (data: RepositoryConfig) => {
    setFormData(prev => ({ ...prev, repository: data }));
    nextStep();
  };

  const handleEnvironmentSubmit = (data: EnvironmentConfig) => {
    setFormData(prev => ({ ...prev, environment: data }));
    nextStep();
  };

  const handleInfrastructureSubmit = (data: InfrastructureConfig) => {
    setFormData(prev => ({ ...prev, infrastructure: data }));
    nextStep();
  };

  const handleFinalSubmit = () => {
    if (!formData.repository || !formData.environment || !formData.infrastructure) {
      toast.error('Please complete all configuration steps');
      return;
    }

    const configuration: SpinUpConfiguration = {
      repository: formData.repository,
      environment: formData.environment,
      infrastructure: formData.infrastructure,
      integrations: [],
      deployment: {
        strategy: 'auto',
        branch: 'main',
        preview_environments: true,
        rollback_enabled: true,
        health_checks: true,
      },
    };

    initiateSpinUp({
      name: formData.repository.name,
      description: formData.repository.description,
      configuration,
    });
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
            
            {isLoadingTemplates ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
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
            )}
          </div>
        );

      case 1:
        return (
          <RepositoryForm
            template={selectedTemplate}
            defaultValues={formData.repository}
            onSubmit={handleRepositorySubmit}
            onBack={prevStep}
            isLoading={isInitiating}
          />
        );

      case 2:
        return (
          <EnvironmentForm
            defaultValues={formData.environment}
            onSubmit={handleEnvironmentSubmit}
            onBack={prevStep}
            isLoading={isInitiating}
          />
        );

      case 3:
        return (
          <InfrastructureForm
            defaultValues={formData.infrastructure}
            onSubmit={handleInfrastructureSubmit}
            onBack={prevStep}
            isLoading={isInitiating}
          />
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
              {formData.repository && (
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
                        <span className="ml-2 font-medium">{formData.repository.name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Framework:</span>
                        <span className="ml-2 font-medium capitalize">{formData.repository.framework}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Visibility:</span>
                        <span className="ml-2 font-medium capitalize">{formData.repository.visibility}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Package Manager:</span>
                        <span className="ml-2 font-medium">{formData.repository.package_manager}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {formData.environment && (
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
                        <span className="ml-2 font-medium">{formData.environment.name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-2 font-medium capitalize">{formData.environment.type}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Domain:</span>
                        <span className="ml-2 font-medium">{formData.environment.domain || 'Not set'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">SSL:</span>
                        <span className="ml-2 font-medium">{formData.environment.ssl_enabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {formData.infrastructure && (
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
                        <span className="ml-2 font-medium capitalize">{formData.infrastructure.provider}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Region:</span>
                        <span className="ml-2 font-medium">{formData.infrastructure.region}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Database:</span>
                        <span className="ml-2 font-medium capitalize">{formData.infrastructure.database.type}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Storage:</span>
                        <span className="ml-2 font-medium capitalize">{formData.infrastructure.storage.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
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
        <div className="animate-fade-in-up">
          {renderStepContent()}
          
          {/* Navigation Buttons - Only show for template selection and review steps */}
          {(currentStep === 0 || currentStep === 4) && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex justify-between">
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
                      type="button"
                      onClick={handleFinalSubmit}
                      disabled={isInitiating || !formData.repository || !formData.environment || !formData.infrastructure}
                      className="flex items-center gap-2"
                    >
                      {isInitiating ? (
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}