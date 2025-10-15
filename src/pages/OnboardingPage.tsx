import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
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
  X
} from 'lucide-react';
import { onboardingApi } from '@/lib/api';
import type { 
  TechStackSelection, 
  BillingPlanSelection
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
  const navigate = useNavigate();

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

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

  // React Query hooks for data fetching (commented out for now as we use static data)
  // const { data: techStackOptionsData, isLoading: isLoadingTechStack } = useQuery({
  //   queryKey: ['tech-stack-options'],
  //   queryFn: onboardingApi.getTechStackOptions,
  //   staleTime: 1000 * 60 * 5, // 5 minutes
  // });

  // const { data: integrationProviders, isLoading: isLoadingIntegrations } = useQuery({
  //   queryKey: ['integration-providers'],
  //   queryFn: onboardingApi.getIntegrationProviders,
  //   staleTime: 1000 * 60 * 5,
  // });

  // const { data: billingPlansData, isLoading: isLoadingBilling } = useQuery({
  //   queryKey: ['billing-plans'],
  //   queryFn: onboardingApi.getBillingPlans,
  //   staleTime: 1000 * 60 * 5,
  // });

  // Mutation for updating onboarding data
  const updateOnboardingMutation = useMutation({
    mutationFn: onboardingApi.updateStep,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Progress saved!');
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
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Welcome to CrewAI! Your workspace is ready.');
        navigate(data.redirect_url || '/dashboard');
      }
    },
    onError: (error) => {
      toast.error('Failed to complete setup. Please try again.');
      console.error('Onboarding completion error:', error);
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
      await form.trigger();
      const isValid = form.formState.isValid;
      
      if (!isValid) {
        toast.error('Please complete all required fields before continuing.');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  };

  const saveProgress = async () => {
    const formData = form.getValues();
    const stepId = steps[currentStep].id;
    
    try {
      await updateOnboardingMutation.mutateAsync({
        step: stepId,
        data: {
          company_info: {
            name: formData.companyName,
            size: formData.companySize,
            industry: formData.industry,
            website: formData.website,
            description: formData.description,
          },
          tech_stack: techStackOptions.filter(tech => 
            formData.techStack.includes(tech.id)
          ).map(tech => ({ ...tech, selected: true })),
          integrations: [
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
          ],
          billing_plan: billingPlans.find(plan => plan.plan_id === formData.billingPlan)!,
          team_members: (formData.teamMembers || []).map(member => ({
            ...member,
            status: 'pending' as const,
            invited_at: new Date().toISOString(),
          })),
          preferences: formData.preferences,
        },
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
      await completeOnboardingMutation.mutateAsync({
        onboarding_data: {
          id: '', // Will be generated by backend
          user_id: '', // Will be set by backend
          workspace_id: '', // Will be generated by backend
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        },
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
              <Label>Select your tech stack *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {techStackOptions.map((tech) => (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => toggleTechStack(tech.id)}
                    className={`p-4 rounded-lg border text-left transition-all duration-200 hover:scale-102 ${
                      selectedTechStack.includes(tech.id)
                        ? 'border-primary bg-primary/10 text-primary shadow-glow'
                        : 'border-border hover:bg-accent hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{tech.icon}</span>
                      <div>
                        <div className="font-medium">{tech.name}</div>
                        <div className="text-sm text-muted-foreground">{tech.description}</div>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {tech.category}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {errors.techStack && (
                <p className="text-sm text-destructive">{errors.techStack.message}</p>
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
                <Label>Team Members (Optional)</Label>
                <Button type="button" variant="outline" onClick={addTeamMember}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>

              <div className="space-y-3">
                {(watchedValues.teamMembers || []).map((member, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 border rounded-lg bg-card">
                    <Input
                      placeholder="member@company.com"
                      value={member.email}
                      onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                      className="flex-1"
                    />
                    <Select
                      value={member.role}
                      onValueChange={(value) => updateTeamMember(index, 'role', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTeamMember(index)}
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
                </div>
              )}
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
            </div>
          </div>
        );

      case 6: // Complete
        return (
          <div className="text-center space-y-6 animate-fade-in-up">
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
              <div className="p-6 bg-card rounded-lg border card-hover">
                <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">AI Agents Ready</h4>
                <p className="text-sm text-muted-foreground">Your specialized agents are configured and ready to work</p>
              </div>
              <div className="p-6 bg-card rounded-lg border card-hover">
                <Github className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Integrations Connected</h4>
                <p className="text-sm text-muted-foreground">Your tools are connected and ready for automation</p>
              </div>
              <div className="p-6 bg-card rounded-lg border card-hover">
                <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Team Invited</h4>
                <p className="text-sm text-muted-foreground">Your team members will receive invitation emails</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progressPercentage = (currentStep / (steps.length - 1)) * 100;

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
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 text-center transition-colors duration-200 ${
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {React.createElement(step.icon, { className: "h-4 w-4" })}
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              </div>
            ))}
          </div>
          <Progress value={progressPercentage} className="h-2" />
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
                  disabled={currentStep === 0}
                  className="transition-all duration-200 hover:scale-102"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    className="btn-primary transition-all duration-200 hover:scale-102"
                    disabled={updateOnboardingMutation.isPending}
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
                    disabled={isLoading || completeOnboardingMutation.isPending}
                  >
                    {isLoading || completeOnboardingMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Complete Setup
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}