import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { SSOProviders } from '@/components/auth/SSOProviders';
import { 
  Bot, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Github, 
  Globe,
  Server,
  Users,
  Settings,
  Zap,
  Building2,
  Code2,
  Link,
  CreditCard,
  UserPlus,
  CheckCircle2,
  Sparkles,
  Loader2,
  X,
  AlertCircle,
  Shield,
  Rocket,
  Eye
} from 'lucide-react';
import { onboardingApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { 
  TechStackSelection, 
  BillingPlanSelection,
  OnboardingData
} from '@/types';

// Enhanced Zod schema with comprehensive validation
const onboardingSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name too long'),
  companySize: z.enum(['1-10', '11-50', '51-200', '200+'], {
    required_error: 'Please select a company size',
  }),
  industry: z.string().optional(),
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  description: z.string().max(500, 'Description too long').optional(),
  techStack: z.array(z.string()).min(1, 'Please select at least one tech stack'),
  gitProvider: z.enum(['github', 'gitlab', 'bitbucket'], {
    required_error: 'Please select a git provider',
  }),
  deploymentPlatform: z.enum(['vercel', 'cloudflare', 'custom'], {
    required_error: 'Please select a deployment platform',
  }),
  billingPlan: z.enum(['starter', 'professional', 'enterprise'], {
    required_error: 'Please select a billing plan',
  }),
  teamMembers: z.array(z.object({
    email: z.string().email('Please enter a valid email address'),
    role: z.enum(['admin', 'user', 'viewer']),
  })).optional(),
  preferences: z.object({
    theme: z.enum(['dark', 'light', 'system']).default('dark'),
    timezone: z.string().default('UTC'),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      slack: z.boolean().default(false),
    }).default({}),
    language: z.string().default('en'),
  }).optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

// Enhanced step configuration with icons and descriptions
const steps = [
  { 
    id: 'company', 
    title: 'Company Info', 
    description: 'Tell us about your company',
    icon: Building2,
    required: true
  },
  { 
    id: 'stack', 
    title: 'Tech Stack', 
    description: 'Select your preferred technologies',
    icon: Code2,
    required: true
  },
  { 
    id: 'integrations', 
    title: 'Integrations', 
    description: 'Connect your development tools',
    icon: Link,
    required: true
  },
  { 
    id: 'billing', 
    title: 'Billing', 
    description: 'Choose your plan',
    icon: CreditCard,
    required: true
  },
  { 
    id: 'team', 
    title: 'Team', 
    description: 'Invite your team members',
    icon: UserPlus,
    required: false
  },
  { 
    id: 'preferences', 
    title: 'Preferences', 
    description: 'Customize your experience',
    icon: Settings,
    required: false
  },
  { 
    id: 'complete', 
    title: 'Complete', 
    description: 'You\'re all set!',
    icon: CheckCircle2,
    required: false
  },
];

// Tech stack options with categories
const techStackOptions: TechStackSelection[] = [
  // Frontend
  { id: 'react', name: 'React', category: 'frontend', description: 'Frontend framework', icon: '⚛️', selected: false },
  { id: 'nextjs', name: 'Next.js', category: 'frontend', description: 'Full-stack React framework', icon: '▲', selected: false },
  { id: 'vue', name: 'Vue.js', category: 'frontend', description: 'Progressive framework', icon: '💚', selected: false },
  { id: 'angular', name: 'Angular', category: 'frontend', description: 'Platform for building web applications', icon: '🅰️', selected: false },
  { id: 'svelte', name: 'Svelte', category: 'frontend', description: 'Compile-time optimized framework', icon: '🧡', selected: false },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'frontend', description: 'Utility-first CSS framework', icon: '🎨', selected: false },
  
  // Backend
  { id: 'nodejs', name: 'Node.js', category: 'backend', description: 'JavaScript runtime', icon: '🟢', selected: false },
  { id: 'python', name: 'Python', category: 'backend', description: 'Programming language', icon: '🐍', selected: false },
  { id: 'typescript', name: 'TypeScript', category: 'backend', description: 'Typed JavaScript', icon: '🔷', selected: false },
  { id: 'go', name: 'Go', category: 'backend', description: 'Programming language', icon: '🐹', selected: false },
  { id: 'rust', name: 'Rust', category: 'backend', description: 'Systems programming language', icon: '🦀', selected: false },
  
  // Database
  { id: 'postgresql', name: 'PostgreSQL', category: 'database', description: 'Relational database', icon: '🐘', selected: false },
  { id: 'mongodb', name: 'MongoDB', category: 'database', description: 'Document database', icon: '🍃', selected: false },
  { id: 'redis', name: 'Redis', category: 'database', description: 'In-memory data store', icon: '🔴', selected: false },
  { id: 'mysql', name: 'MySQL', category: 'database', description: 'Relational database', icon: '🐬', selected: false },
  
  // Deployment
  { id: 'docker', name: 'Docker', category: 'deployment', description: 'Containerization platform', icon: '🐳', selected: false },
  { id: 'kubernetes', name: 'Kubernetes', category: 'deployment', description: 'Container orchestration', icon: '☸️', selected: false },
  { id: 'aws', name: 'AWS', category: 'deployment', description: 'Cloud platform', icon: '☁️', selected: false },
  { id: 'gcp', name: 'Google Cloud', category: 'deployment', description: 'Cloud platform', icon: '🌩️', selected: false },
];

// Billing plans with enhanced features
const billingPlans: BillingPlanSelection[] = [
  {
    plan_id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/month',
    features: [
      'Up to 5 projects',
      'Basic AI agents',
      'Email support',
      'Standard integrations',
      '1 team member',
      'Basic analytics'
    ],
    selected: false,
  },
  {
    plan_id: 'professional',
    name: 'Professional',
    price: '$99',
    period: '/month',
    features: [
      'Unlimited projects',
      'Advanced AI agents',
      'Priority support',
      'All integrations',
      'Up to 10 team members',
      'Custom branding',
      'Advanced analytics',
      'API access'
    ],
    selected: true, // Most popular
  },
  {
    plan_id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: [
      'Everything in Professional',
      'Unlimited team members',
      'Dedicated support',
      'Custom integrations',
      'SSO & SAML',
      'Advanced security',
      'Custom deployment',
      'SLA guarantee'
    ],
    selected: false,
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTechStack, setSelectedTechStack] = useState<string[]>([]);
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);
  const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({});
  const [isCompleting, setIsCompleting] = useState(false);
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      techStack: [],
      teamMembers: [],
      preferences: {
        theme: 'dark',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true,
          slack: false,
        },
        language: 'en',
      },
    },
  });

  const { watch, setValue, handleSubmit, formState: { errors, isValid } } = form;
  const watchedValues = watch();

  // React Query hooks for data fetching
  const { data: currentOnboardingData, isLoading: isLoadingCurrentData } = useQuery({
    queryKey: ['onboarding-current'],
    queryFn: onboardingApi.getCurrent,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Note: These queries are available for future use when backend APIs are implemented
  // const { data: techStackOptionsData, isLoading: isLoadingTechStack } = useQuery({
  //   queryKey: ['tech-stack-options'],
  //   queryFn: onboardingApi.getTechStackOptions,
  //   staleTime: 1000 * 60 * 5, // 5 minutes
  //   retry: 1,
  // });

  // const { data: integrationProviders, isLoading: isLoadingIntegrations } = useQuery({
  //   queryKey: ['integration-providers'],
  //   queryFn: onboardingApi.getIntegrationProviders,
  //   staleTime: 1000 * 60 * 5,
  //   retry: 1,
  // });

  // const { data: billingPlansData, isLoading: isLoadingBilling } = useQuery({
  //   queryKey: ['billing-plans'],
  //   queryFn: onboardingApi.getBillingPlans,
  //   staleTime: 1000 * 60 * 5,
  //   retry: 1,
  // });

  // Initialize form with existing data if available
  useEffect(() => {
    if (currentOnboardingData) {
      const data = currentOnboardingData;
      if (data.company_info) {
        setValue('companyName', data.company_info.name || '');
        setValue('companySize', data.company_info.size || '1-10');
        setValue('industry', data.company_info.industry || '');
        setValue('website', data.company_info.website || '');
        setValue('description', data.company_info.description || '');
      }
      if (data.tech_stack) {
        const selectedIds = data.tech_stack.filter(tech => tech.selected).map(tech => tech.id);
        setSelectedTechStack(selectedIds);
        setValue('techStack', selectedIds);
      }
      if (data.integrations) {
        const connectedIds = data.integrations.filter(integration => integration.connected).map(integration => integration.provider);
        setConnectedIntegrations(connectedIds);
        const gitProvider = data.integrations.find(i => i.type === 'git')?.provider;
        const deploymentProvider = data.integrations.find(i => i.type === 'deployment')?.provider;
        if (gitProvider) setValue('gitProvider', gitProvider as any);
        if (deploymentProvider) setValue('deploymentPlatform', deploymentProvider as any);
      }
      if (data.billing_plan) {
        setValue('billingPlan', data.billing_plan.plan_id as any);
      }
      if (data.team_members) {
        setValue('teamMembers', data.team_members.map(member => ({
          email: member.email,
          role: member.role
        })));
      }
      if (data.preferences) {
        setValue('preferences', data.preferences);
      }
    }
  }, [currentOnboardingData, setValue]);

  // Mutation for updating onboarding data
  const updateOnboardingMutation = useMutation({
    mutationFn: onboardingApi.updateStep,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Progress saved!');
        // Mark current step as validated
        setStepValidation(prev => ({ ...prev, [currentStep]: true }));
      }
    },
    onError: (error) => {
      toast.error('Failed to save progress. Please try again.');
      console.error('Onboarding update error:', error);
    },
  });

  // Mutation for completing onboarding
  const completeOnboardingMutation = useMutation({
    mutationFn: onboardingApi.complete,
    onSuccess: async (data) => {
      if (data.success) {
        setIsCompleting(true);
        toast.success('Welcome to CrewAI! Your workspace is ready.');
        
        // Refresh user data to get updated workspace info
        await refreshUser();
        
        // Navigate to dashboard after a brief delay
        setTimeout(() => {
          navigate(data.redirect_url || '/dashboard');
        }, 2000);
      }
    },
    onError: (error) => {
      toast.error('Failed to complete setup. Please try again.');
      console.error('Onboarding completion error:', error);
      setIsCompleting(false);
    },
  });

  // Mutation for team invitations
  const inviteTeamMutation = useMutation({
    mutationFn: onboardingApi.inviteTeamMembers,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Invited ${data.sent} team members successfully!`);
      }
    },
    onError: (error) => {
      toast.error('Failed to send team invitations.');
      console.error('Team invitation error:', error);
    },
  });

  const nextStep = async () => {
    // Validate current step before proceeding
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    // Save progress
    await saveProgress();

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    try {
      // Trigger validation for current step fields
      const fieldsToValidate = getFieldsForStep(currentStep);
      const isValid = await form.trigger(fieldsToValidate);
      
      if (!isValid) {
        const firstError = Object.keys(form.formState.errors)[0];
        const errorMessage = form.formState.errors[firstError as keyof typeof form.formState.errors]?.message;
        toast.error(errorMessage || 'Please complete all required fields before continuing.');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Validation failed. Please check your inputs.');
      return false;
    }
  };

  const getFieldsForStep = (step: number): (keyof OnboardingFormData)[] => {
    switch (step) {
      case 0: // Company Info
        return ['companyName', 'companySize'];
      case 1: // Tech Stack
        return ['techStack'];
      case 2: // Integrations
        return ['gitProvider', 'deploymentPlatform'];
      case 3: // Billing
        return ['billingPlan'];
      case 4: // Team (optional)
        return [];
      case 5: // Preferences (optional)
        return [];
      default:
        return [];
    }
  };

  const saveProgress = async () => {
    const formData = form.getValues();
    const stepId = steps[currentStep].id;
    
    try {
      const updateData: Partial<OnboardingData> = {};
      
      // Only include relevant data for the current step
      switch (currentStep) {
        case 0: // Company Info
          updateData.company_info = {
            name: formData.companyName,
            size: formData.companySize,
            industry: formData.industry,
            website: formData.website,
            description: formData.description,
          };
          break;
        case 1: // Tech Stack
          updateData.tech_stack = techStackOptions.filter(tech => 
            formData.techStack.includes(tech.id)
          ).map(tech => ({ ...tech, selected: true }));
          break;
        case 2: // Integrations
          updateData.integrations = [
            {
              provider: formData.gitProvider,
              type: 'git',
              connected: connectedIntegrations.includes(formData.gitProvider),
            },
            {
              provider: formData.deploymentPlatform,
              type: 'deployment',
              connected: connectedIntegrations.includes(formData.deploymentPlatform),
            },
          ];
          break;
        case 3: // Billing
          updateData.billing_plan = billingPlans.find(plan => plan.plan_id === formData.billingPlan)!;
          break;
        case 4: // Team
          updateData.team_members = (formData.teamMembers || []).map(member => ({
            ...member,
            status: 'pending' as const,
            invited_at: new Date().toISOString(),
          }));
          break;
        case 5: // Preferences
          updateData.preferences = formData.preferences;
          break;
      }

      await updateOnboardingMutation.mutateAsync({
        step: stepId,
        data: updateData,
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true);
    
    try {
      // Send team invitations if any
      if (data.teamMembers && data.teamMembers.length > 0) {
        const teamMembersWithStatus = data.teamMembers.map(member => ({
          ...member,
          status: 'pending' as const,
          invited_at: new Date().toISOString(),
        }));
        await inviteTeamMutation.mutateAsync(teamMembersWithStatus);
      }

      // Complete onboarding
      const onboardingData: OnboardingData = {
        id: currentOnboardingData?.id || '', // Use existing ID or let backend generate
        user_id: user?.id || '', // Use current user ID
        workspace_id: currentOnboardingData?.workspace_id || '', // Use existing or let backend generate
        company_info: {
          name: data.companyName,
          size: data.companySize,
          industry: data.industry,
          website: data.website,
          description: data.description,
        },
        tech_stack: techStackOptions.filter(tech => 
          data.techStack.includes(tech.id)
        ).map(tech => ({ ...tech, selected: true })),
        integrations: [
          {
            provider: data.gitProvider,
            type: 'git',
            connected: connectedIntegrations.includes(data.gitProvider),
          },
          {
            provider: data.deploymentPlatform,
            type: 'deployment',
            connected: connectedIntegrations.includes(data.deploymentPlatform),
          },
        ],
        billing_plan: billingPlans.find(plan => plan.plan_id === data.billingPlan)!,
        team_members: (data.teamMembers || []).map(member => ({
          ...member,
          status: 'pending' as const,
          invited_at: new Date().toISOString(),
        })),
        preferences: data.preferences || {
          theme: 'dark',
          timezone: 'UTC',
          notifications: { email: true, push: true, slack: false },
          language: 'en',
        },
        status: 'completed',
        created_at: currentOnboardingData?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      };

      await completeOnboardingMutation.mutateAsync({
        onboarding_data: onboardingData,
        skip_remaining: false,
      });
    } catch (error) {
      console.error('Onboarding completion error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTechStack = (techId: string) => {
    const currentStack = selectedTechStack;
    const newStack = currentStack.includes(techId)
      ? currentStack.filter(id => id !== techId)
      : [...currentStack, techId];
    
    setSelectedTechStack(newStack);
    setValue('techStack', newStack);
  };

  const toggleIntegration = (provider: string) => {
    const currentIntegrations = connectedIntegrations;
    const newIntegrations = currentIntegrations.includes(provider)
      ? currentIntegrations.filter(p => p !== provider)
      : [...currentIntegrations, provider];
    
    setConnectedIntegrations(newIntegrations);
  };

  const addTeamMember = () => {
    const currentMembers = watchedValues.teamMembers || [];
    setValue('teamMembers', [...currentMembers, { email: '', role: 'user' }]);
  };

  const removeTeamMember = (index: number) => {
    const currentMembers = watchedValues.teamMembers || [];
    setValue('teamMembers', currentMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: 'email' | 'role', value: string) => {
    const currentMembers = [...(watchedValues.teamMembers || [])];
    currentMembers[index] = { ...currentMembers[index], [field]: value };
    setValue('teamMembers', currentMembers);
  };


  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Company Info
        return (
          <div className="space-y-6 animate-fade-in-up">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="TechFlow Inc."
                  {...form.register('companyName')}
                  className={errors.companyName ? 'border-destructive' : ''}
                />
                {errors.companyName && (
                  <p className="text-sm text-destructive">{errors.companyName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Company Size *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['1-10', '11-50', '51-200', '200+'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setValue('companySize', size as any)}
                      className={`p-4 rounded-lg border text-left transition-all duration-200 hover:scale-102 ${
                        watchedValues.companySize === size
                          ? 'border-primary bg-primary/10 text-primary shadow-glow'
                          : 'border-border hover:bg-accent hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium">{size} employees</div>
                    </button>
                  ))}
                </div>
                {errors.companySize && (
                  <p className="text-sm text-destructive">{errors.companySize.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry (Optional)</Label>
                  <Input
                    id="industry"
                    placeholder="Technology, Healthcare, Finance..."
                    {...form.register('industry')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    placeholder="https://yourcompany.com"
                    {...form.register('website')}
                    className={errors.website ? 'border-destructive' : ''}
                  />
                  {errors.website && (
                    <p className="text-sm text-destructive">{errors.website.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Company Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your company and what you do..."
                  {...form.register('description')}
                  className={errors.description ? 'border-destructive' : ''}
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 1: // Tech Stack
        return (
          <div className="space-y-6 animate-fade-in-up">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Select your tech stack *</Label>
                <Badge variant="outline" className="text-xs">
                  {selectedTechStack.length} selected
                </Badge>
              </div>
              
              {/* Category filter */}
              <div className="flex flex-wrap gap-2">
                {['all', 'frontend', 'backend', 'database', 'deployment'].map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      category === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {techStackOptions.map((tech) => (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => toggleTechStack(tech.id)}
                    className={`p-4 rounded-lg border text-left transition-all duration-200 hover:scale-102 group ${
                      selectedTechStack.includes(tech.id)
                        ? 'border-primary bg-primary/10 text-primary shadow-glow'
                        : 'border-border hover:bg-accent hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                        {tech.icon}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium flex items-center justify-between">
                          {tech.name}
                          {selectedTechStack.includes(tech.id) && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{tech.description}</div>
                        <Badge 
                          variant="secondary" 
                          className="mt-1 text-xs"
                        >
                          {tech.category}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {errors.techStack && (
                <div className="flex items-center space-x-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.techStack.message}</span>
                </div>
              )}

              {selectedTechStack.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Code2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select at least one technology to continue</p>
                  <p className="text-sm">Choose the tools you use most frequently</p>
                </div>
              )}
            </div>
          </div>
        );

      case 2: // Integrations
        return (
          <div className="space-y-6 animate-fade-in-up">
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Git Provider *</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'github', name: 'GitHub', icon: Github, color: 'text-gray-900' },
                    { id: 'gitlab', name: 'GitLab', icon: Github, color: 'text-orange-500' },
                    { id: 'bitbucket', name: 'Bitbucket', icon: Github, color: 'text-blue-500' },
                  ].map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => {
                        setValue('gitProvider', provider.id as any);
                        toggleIntegration(provider.id);
                      }}
                      className={`p-4 rounded-lg border text-center transition-all duration-200 hover:scale-102 ${
                        watchedValues.gitProvider === provider.id
                          ? 'border-primary bg-primary/10 text-primary shadow-glow'
                          : 'border-border hover:bg-accent hover:border-primary/50'
                      }`}
                    >
                      <provider.icon className={`h-6 w-6 mx-auto mb-2 ${provider.color}`} />
                      <div className="font-medium">{provider.name}</div>
                    </button>
                  ))}
                </div>
                {errors.gitProvider && (
                  <p className="text-sm text-destructive">{errors.gitProvider.message}</p>
                )}
              </div>

              <div className="space-y-4">
                <Label>Deployment Platform *</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'vercel', name: 'Vercel', icon: Globe, color: 'text-black' },
                    { id: 'cloudflare', name: 'Cloudflare', icon: Server, color: 'text-orange-500' },
                    { id: 'custom', name: 'Custom', icon: Settings, color: 'text-gray-500' },
                  ].map((platform) => (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => {
                        setValue('deploymentPlatform', platform.id as any);
                        toggleIntegration(platform.id);
                      }}
                      className={`p-4 rounded-lg border text-center transition-all duration-200 hover:scale-102 ${
                        watchedValues.deploymentPlatform === platform.id
                          ? 'border-primary bg-primary/10 text-primary shadow-glow'
                          : 'border-border hover:bg-accent hover:border-primary/50'
                      }`}
                    >
                      <platform.icon className={`h-6 w-6 mx-auto mb-2 ${platform.color}`} />
                      <div className="font-medium">{platform.name}</div>
                    </button>
                  ))}
                </div>
                {errors.deploymentPlatform && (
                  <p className="text-sm text-destructive">{errors.deploymentPlatform.message}</p>
                )}
              </div>

              <div className="space-y-4">
                <Label>Additional Integrations (Optional)</Label>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <SSOProviders 
                    onSuccess={() => toast.success('Integration connected successfully!')}
                    onError={(error) => toast.error(`Integration failed: ${error}`)}
                    variant="outline"
                    size="sm"
                    showLabels={false}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Billing
        return (
          <div className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {billingPlans.map((plan) => (
                <Card
                  key={plan.plan_id}
                  className={`cursor-pointer transition-all duration-200 hover:scale-102 ${
                    watchedValues.billingPlan === plan.plan_id
                      ? 'ring-2 ring-primary border-primary shadow-glow'
                      : 'hover:border-primary/50'
                  } ${plan.plan_id === 'professional' ? 'border-primary' : ''}`}
                  onClick={() => setValue('billingPlan', plan.plan_id as any)}
                >
                  {plan.plan_id === 'professional' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold">
                      {plan.price}
                      <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-success mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            {errors.billingPlan && (
              <p className="text-sm text-destructive">{errors.billingPlan.message}</p>
            )}
          </div>
        );

      case 4: // Team
        return (
          <div className="space-y-6 animate-fade-in-up">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Team Members (Optional)</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Invite your team members to collaborate on projects
                  </p>
                </div>
                <Button type="button" variant="outline" onClick={addTeamMember}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>

              <div className="space-y-3">
                {(watchedValues.teamMembers || []).map((member, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 border rounded-lg bg-card hover:bg-card/80 transition-colors duration-200">
                    <div className="flex-1">
                      <Input
                        placeholder="member@company.com"
                        value={member.email}
                        onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                        className="mb-2"
                      />
                      <Select
                        value={member.role}
                        onValueChange={(value) => updateTeamMember(index, 'role', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4" />
                              <span>Admin - Full access</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="user">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span>User - Standard access</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="viewer">
                            <div className="flex items-center space-x-2">
                              <Eye className="h-4 w-4" />
                              <span>Viewer - Read-only access</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTeamMember(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {watchedValues.teamMembers && watchedValues.teamMembers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No team members added yet</p>
                  <p className="text-sm">You can always invite team members later from your dashboard</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addTeamMember}
                    className="mt-4"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Your First Team Member
                  </Button>
                </div>
              )}

              {/* Skip option */}
              <div className="text-center pt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Skip for now
                </Button>
              </div>
            </div>
          </div>
        );

      case 5: // Preferences
        return (
          <div className="space-y-6 animate-fade-in-up">
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Theme Preference</Label>
                <Select
                  value={watchedValues.preferences?.theme || 'dark'}
                  onValueChange={(value) => setValue('preferences.theme', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Timezone</Label>
                <Select
                  value={watchedValues.preferences?.timezone || 'UTC'}
                  onValueChange={(value) => setValue('preferences.timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Notifications</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email-notifications"
                      checked={watchedValues.preferences?.notifications?.email || false}
                      onCheckedChange={(checked) => 
                        setValue('preferences.notifications.email', checked as boolean)
                      }
                    />
                    <Label htmlFor="email-notifications">Email notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="push-notifications"
                      checked={watchedValues.preferences?.notifications?.push || false}
                      onCheckedChange={(checked) => 
                        setValue('preferences.notifications.push', checked as boolean)
                      }
                    />
                    <Label htmlFor="push-notifications">Push notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="slack-notifications"
                      checked={watchedValues.preferences?.notifications?.slack || false}
                      onCheckedChange={(checked) => 
                        setValue('preferences.notifications.slack', checked as boolean)
                      }
                    />
                    <Label htmlFor="slack-notifications">Slack notifications</Label>
                  </div>
                </div>
              </div>

              {/* Skip option */}
              <div className="text-center pt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Use default settings
                </Button>
              </div>
            </div>
          </div>
        );

      case 6: // Complete
        return (
          <div className="text-center space-y-8 animate-fade-in-up">
            {isCompleting ? (
              <div className="space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Rocket className="h-10 w-10 text-primary animate-bounce" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-foreground mb-2">
                    Setting up your workspace...
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    Please wait while we configure everything for you.
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto animate-bounce-in">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-foreground mb-2">
                    Welcome to CrewAI! 🎉
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    Your workspace is ready. Let's start automating your agency operations.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 bg-card rounded-lg border card-hover animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">AI Agents Ready</h4>
                    <p className="text-sm text-muted-foreground">Your specialized agents are configured and ready to work</p>
                  </div>
                  <div className="p-6 bg-card rounded-lg border card-hover animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <Github className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Integrations Connected</h4>
                    <p className="text-sm text-muted-foreground">Your tools are connected and ready for automation</p>
                  </div>
                  <div className="p-6 bg-card rounded-lg border card-hover animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Team Invited</h4>
                    <p className="text-sm text-muted-foreground">Your team members will receive invitation emails</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20">
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-primary">Next Steps</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Explore your dashboard</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Create your first project</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Invite team members</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Configure integrations</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const progressPercentage = (currentStep / (steps.length - 1)) * 100;
  const isStepValidated = stepValidation[currentStep] || false;

  // Show loading state while fetching initial data
  if (isLoadingCurrentData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your onboarding progress...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's a critical error
  if (updateOnboardingMutation.isError || completeOnboardingMutation.isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
          <p className="text-muted-foreground">
            We encountered an error while setting up your workspace. Please try again.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">CrewAI</h1>
                <p className="text-sm text-muted-foreground">Workspace Setup</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </div>
              {isStepValidated && (
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                  <Check className="h-3 w-3 mr-1" />
                  Validated
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`flex-1 text-center transition-all duration-300 ${
                    isCompleted 
                      ? 'text-success' 
                      : isCurrent 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-success text-success-foreground'
                        : isCurrent
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary/20'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        React.createElement(step.icon, { className: "h-4 w-4" })
                      )}
                    </div>
                    <div className="text-xs font-medium">
                      <span className="hidden sm:inline">{step.title}</span>
                      <span className="sm:hidden">{index + 1}</span>
                    </div>
                    {step.required && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="relative">
            <Progress value={progressPercentage} className="h-2" />
            <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-primary/20 to-accent/20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              {React.createElement(steps[currentStep].icon, { className: "h-6 w-6 text-primary" })}
              <span>{steps[currentStep].title}</span>
            </CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              {renderStepContent()}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0 || updateOnboardingMutation.isPending}
                  className="transition-all duration-200 hover:scale-102"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                <div className="flex items-center space-x-4">
                  {/* Step validation indicator */}
                  {currentStep < steps.length - 1 && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      {isStepValidated ? (
                        <div className="flex items-center space-x-1 text-success">
                          <Check className="h-4 w-4" />
                          <span>Step validated</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <AlertCircle className="h-4 w-4" />
                          <span>Complete required fields</span>
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep < steps.length - 1 ? (
                    <Button 
                      type="button" 
                      onClick={nextStep} 
                      className="btn-primary transition-all duration-200 hover:scale-102"
                      disabled={updateOnboardingMutation.isPending || !isValid}
                    >
                      {updateOnboardingMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4 mr-2" />
                      )}
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="btn-primary transition-all duration-200 hover:scale-102"
                      disabled={isLoading || completeOnboardingMutation.isPending || isCompleting}
                    >
                      {isLoading || completeOnboardingMutation.isPending || isCompleting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      {isCompleting ? 'Setting up...' : 'Complete Setup'}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}