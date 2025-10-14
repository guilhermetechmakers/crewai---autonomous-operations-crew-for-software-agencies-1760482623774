import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
  Zap
} from 'lucide-react';

const onboardingSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  companySize: z.enum(['1-10', '11-50', '51-200', '200+']),
  techStack: z.array(z.string()).min(1, 'Please select at least one tech stack'),
  gitProvider: z.enum(['github', 'gitlab', 'bitbucket']),
  deploymentPlatform: z.enum(['vercel', 'cloudflare', 'custom']),
  billingPlan: z.enum(['starter', 'professional', 'enterprise']),
  teamMembers: z.array(z.object({
    email: z.string().email(),
    role: z.enum(['admin', 'user', 'viewer']),
  })).optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const steps = [
  { id: 'company', title: 'Company Info', description: 'Tell us about your company' },
  { id: 'stack', title: 'Tech Stack', description: 'Select your preferred technologies' },
  { id: 'integrations', title: 'Integrations', description: 'Connect your tools' },
  { id: 'billing', title: 'Billing', description: 'Choose your plan' },
  { id: 'team', title: 'Team', description: 'Invite your team members' },
  { id: 'complete', title: 'Complete', description: 'You\'re all set!' },
];

const techStacks = [
  { id: 'react', name: 'React', description: 'Frontend framework' },
  { id: 'nextjs', name: 'Next.js', description: 'Full-stack React framework' },
  { id: 'vue', name: 'Vue.js', description: 'Progressive framework' },
  { id: 'angular', name: 'Angular', description: 'Platform for building mobile and desktop web applications' },
  { id: 'nodejs', name: 'Node.js', description: 'JavaScript runtime' },
  { id: 'python', name: 'Python', description: 'Programming language' },
  { id: 'typescript', name: 'TypeScript', description: 'Typed JavaScript' },
  { id: 'tailwind', name: 'Tailwind CSS', description: 'Utility-first CSS framework' },
];

const billingPlans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for small teams',
    features: ['Up to 5 projects', 'Basic AI agents', 'Email support', 'Standard integrations'],
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$99',
    period: '/month',
    description: 'Best for growing agencies',
    features: ['Unlimited projects', 'Advanced AI agents', 'Priority support', 'All integrations', 'Custom branding'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    features: ['Everything in Professional', 'Dedicated support', 'Custom integrations', 'SSO', 'Advanced analytics'],
    popular: false,
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      techStack: [],
      teamMembers: [],
    },
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
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

  const onSubmit = async (_data: OnboardingFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Workspace setup complete! Welcome to CrewAI!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTechStack = (techId: string) => {
    const currentStack = watchedValues.techStack || [];
    const newStack = currentStack.includes(techId)
      ? currentStack.filter(id => id !== techId)
      : [...currentStack, techId];
    setValue('techStack', newStack);
  };

  const addTeamMember = () => {
    const currentMembers = watchedValues.teamMembers || [];
    setValue('teamMembers', [...currentMembers, { email: '', role: 'user' }]);
  };

  const removeTeamMember = (index: number) => {
    const currentMembers = watchedValues.teamMembers || [];
    setValue('teamMembers', currentMembers.filter((_, i) => i !== index));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Company Info
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
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
                <Label>Company Size</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['1-10', '11-50', '51-200', '200+'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setValue('companySize', size as any)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        watchedValues.companySize === size
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      <div className="font-medium">{size} employees</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Tech Stack
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Select your tech stack</Label>
              <div className="grid grid-cols-2 gap-3">
                {techStacks.map((tech) => (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => toggleTechStack(tech.id)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      watchedValues.techStack?.includes(tech.id)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    <div className="font-medium">{tech.name}</div>
                    <div className="text-sm text-muted-foreground">{tech.description}</div>
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
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Git Provider</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'github', name: 'GitHub', icon: Github },
                    { id: 'gitlab', name: 'GitLab', icon: Github },
                    { id: 'bitbucket', name: 'Bitbucket', icon: Github },
                  ].map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => setValue('gitProvider', provider.id as any)}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        watchedValues.gitProvider === provider.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      <provider.icon className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">{provider.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Deployment Platform</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'vercel', name: 'Vercel', icon: Globe },
                    { id: 'cloudflare', name: 'Cloudflare', icon: Server },
                    { id: 'custom', name: 'Custom', icon: Settings },
                  ].map((platform) => (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => setValue('deploymentPlatform', platform.id as any)}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        watchedValues.deploymentPlatform === platform.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      <platform.icon className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">{platform.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Billing
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {billingPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all ${
                    watchedValues.billingPlan === plan.id
                      ? 'ring-2 ring-primary border-primary'
                      : 'hover:border-primary/50'
                  } ${plan.popular ? 'border-primary' : ''}`}
                  onClick={() => setValue('billingPlan', plan.id as any)}
                >
                  {plan.popular && (
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
                    <CardDescription>{plan.description}</CardDescription>
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
          </div>
        );

      case 4: // Team
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Team Members</Label>
                <Button type="button" variant="outline" onClick={addTeamMember}>
                  <Users className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>

              <div className="space-y-3">
                {(watchedValues.teamMembers || []).map((member, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Input
                      placeholder="member@company.com"
                      value={member.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newMembers = [...(watchedValues.teamMembers || [])];
                        newMembers[index] = { ...member, email: e.target.value };
                        setValue('teamMembers', newMembers);
                      }}
                      className="flex-1"
                    />
                    <select
                      value={member.role}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const newMembers = [...(watchedValues.teamMembers || [])];
                        newMembers[index] = { ...member, role: e.target.value as any };
                        setValue('teamMembers', newMembers);
                      }}
                      className="px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTeamMember(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5: // Complete
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-10 w-10 text-success" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Welcome to CrewAI! 🎉
              </h3>
              <p className="text-muted-foreground">
                Your workspace is ready. Let's start automating your agency operations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-card rounded-lg border">
                <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold">AI Agents Ready</h4>
                <p className="text-sm text-muted-foreground">Your specialized agents are configured and ready to work</p>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <Github className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold">Integrations Connected</h4>
                <p className="text-sm text-muted-foreground">Your tools are connected and ready for automation</p>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold">Team Invited</h4>
                <p className="text-sm text-muted-foreground">Your team members will receive invitation emails</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
                className={`flex-1 text-center ${
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
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
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button type="button" onClick={nextStep} variant="gradient">
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="gradient"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Setting up...' : 'Complete Setup'}
                    <Zap className="h-4 w-4 ml-2" />
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