import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
// import { Alert, AlertDescription } from '@/components/ui/alert';
import { clientPortalApi } from '@/api/auth';
import { 
  CheckCircle, 
  XCircle, 
  Mail, 
  ExternalLink, 
  Loader2,
  Shield,
  Calendar,
  Users
} from 'lucide-react';
import type { 
  ClientPortalInvitation, 
  ClientPortalPermission 
} from '@/types';

// Form validation schema
const invitationFormSchema = z.object({
  client_email: z.string().email('Please enter a valid email address'),
  project_id: z.string().min(1, 'Please select a project'),
  permissions: z.array(z.string()).min(1, 'Please select at least one permission'),
  expires_in_days: z.number().min(1).max(30).default(7),
  message: z.string().optional(),
});

type InvitationFormData = z.infer<typeof invitationFormSchema>;

// Mock projects data - in real app, this would come from API
const mockProjects = [
  { id: '1', name: 'E-commerce Platform', description: 'Modern e-commerce solution with React and Node.js' },
  { id: '2', name: 'Mobile App', description: 'Cross-platform mobile application' },
  { id: '3', name: 'Dashboard System', description: 'Analytics dashboard for business intelligence' },
];

const mockPermissions: ClientPortalPermission[] = [
  { id: '1', name: 'View Project', description: 'View project details and status', resource: 'project', actions: ['view'] },
  { id: '2', name: 'View Milestones', description: 'See project milestones and progress', resource: 'milestones', actions: ['view'] },
  { id: '3', name: 'Review Deliverables', description: 'Review and approve project deliverables', resource: 'deliverables', actions: ['view', 'comment', 'approve'] },
  { id: '4', name: 'Download Files', description: 'Download project files and documents', resource: 'deliverables', actions: ['view', 'download'] },
];

export default function ClientPortalInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    invitation?: ClientPortalInvitation;
    error?: string;
  } | null>(null);

  const token = searchParams.get('token');

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<InvitationFormData>({
    resolver: zodResolver(invitationFormSchema),
    defaultValues: {
      expires_in_days: 7,
      permissions: ['1', '2'], // Default permissions
    },
  });

  const selectedPermissions = watch('permissions') || [];

  // Validate invitation token on page load
  useEffect(() => {
    if (token) {
      validateInvitation();
    }
  }, [token]);

  const validateInvitation = async () => {
    if (!token) return;
    
    setIsValidating(true);
    try {
      const response = await clientPortalApi.validateInvitation({ token });
      setValidationResult({
        isValid: response.success,
        invitation: response.invitation,
        error: response.error,
      });
    } catch (error) {
      setValidationResult({
        isValid: false,
        error: 'Failed to validate invitation. Please check your link and try again.',
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: clientPortalApi.sendInvitation,
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Invitation sent successfully!', {
          description: 'The client will receive an email with access instructions.',
        });
        // Reset form
        setValue('client_email', '');
        setValue('message', '');
      } else {
        toast.error('Failed to send invitation', {
          description: response.error || 'Please try again.',
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to send invitation', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    },
  });

  // Login with token mutation
  const loginWithTokenMutation = useMutation({
    mutationFn: clientPortalApi.loginWithToken,
    onSuccess: (response) => {
      if (response.success && response.access_token) {
        // Store access token
        localStorage.setItem('client_portal_token', response.access_token);
        toast.success('Welcome to the client portal!', {
          description: 'You now have access to view your project details.',
        });
        // Navigate to client portal dashboard
        navigate('/client-portal/dashboard');
      } else {
        toast.error('Failed to access portal', {
          description: response.error || 'Please try again.',
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to access portal', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    },
  });

  const onSubmit = (data: InvitationFormData) => {
    sendInvitationMutation.mutate(data);
  };

  const handleLoginWithToken = () => {
    if (token) {
      loginWithTokenMutation.mutate({ token });
    }
  };

  const togglePermission = (permissionId: string) => {
    const current = selectedPermissions;
    const updated = current.includes(permissionId)
      ? current.filter(id => id !== permissionId)
      : [...current, permissionId];
    setValue('permissions', updated);
  };

  // If validating token, show loading state
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Validating invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If token validation failed, show error
  if (token && validationResult && !validationResult.isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4 text-center">
              <XCircle className="h-12 w-12 text-destructive" />
              <h2 className="text-2xl font-bold">Invalid Invitation</h2>
              <p className="text-muted-foreground">
                {validationResult.error || 'This invitation link is invalid or has expired.'}
              </p>
              <Button 
                onClick={() => navigate('/')} 
                variant="outline"
                className="mt-4"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If token is valid, show login option
  if (token && validationResult && validationResult.isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4 text-center">
              <CheckCircle className="h-12 w-12 text-success" />
              <h2 className="text-2xl font-bold">Valid Invitation</h2>
              <p className="text-muted-foreground">
                You have been invited to access the client portal for{' '}
                <strong>{validationResult.invitation?.project?.name}</strong>
              </p>
              <Button 
                onClick={handleLoginWithToken}
                disabled={loginWithTokenMutation.isPending}
                className="w-full"
              >
                {loginWithTokenMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accessing Portal...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Access Client Portal
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default view - invitation form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Client Portal
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {' '}Invitations
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Send secure invitations to clients for project access and collaboration
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Invitation Form */}
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  Send Invitation
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Create a secure invitation for client portal access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Client Email */}
                  <div className="space-y-2">
                    <Label htmlFor="client_email" className="text-white">
                      Client Email Address
                    </Label>
                    <Input
                      id="client_email"
                      type="email"
                      placeholder="client@example.com"
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                      {...register('client_email')}
                    />
                    {errors.client_email && (
                      <p className="text-sm text-red-400">{errors.client_email.message}</p>
                    )}
                  </div>

                  {/* Project Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="project_id" className="text-white">
                      Project
                    </Label>
                    <select
                      id="project_id"
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      {...register('project_id')}
                    >
                      <option value="" className="bg-slate-800">Select a project</option>
                      {mockProjects.map((project) => (
                        <option key={project.id} value={project.id} className="bg-slate-800">
                          {project.name}
                        </option>
                      ))}
                    </select>
                    {errors.project_id && (
                      <p className="text-sm text-red-400">{errors.project_id.message}</p>
                    )}
                  </div>

                  {/* Permissions */}
                  <div className="space-y-3">
                    <Label className="text-white">Permissions</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {mockPermissions.map((permission) => (
                        <div
                          key={permission.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                            selectedPermissions.includes(permission.id)
                              ? 'bg-purple-500/20 border-purple-400 text-white'
                              : 'bg-white/5 border-white/20 text-slate-300 hover:bg-white/10'
                          }`}
                          onClick={() => togglePermission(permission.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{permission.name}</h4>
                              <p className="text-sm opacity-80">{permission.description}</p>
                            </div>
                            <div className="flex space-x-1">
                              {permission.actions.map((action) => (
                                <Badge key={action} variant="secondary" className="text-xs">
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.permissions && (
                      <p className="text-sm text-red-400">{errors.permissions.message}</p>
                    )}
                  </div>

                  {/* Expiration */}
                  <div className="space-y-2">
                    <Label htmlFor="expires_in_days" className="text-white">
                      Expires In (Days)
                    </Label>
                    <Input
                      id="expires_in_days"
                      type="number"
                      min="1"
                      max="30"
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                      {...register('expires_in_days', { valueAsNumber: true })}
                    />
                    {errors.expires_in_days && (
                      <p className="text-sm text-red-400">{errors.expires_in_days.message}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white">
                      Personal Message (Optional)
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Add a personal message to the invitation..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 min-h-[100px]"
                      {...register('message')}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={sendInvitationMutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    {sendInvitationMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Invitation...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Features & Info */}
            <div className="space-y-6">
              {/* Security Features */}
              <Card className="backdrop-blur-sm bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Security Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="text-white font-medium">Secure Token Access</h4>
                      <p className="text-slate-300 text-sm">Time-limited, encrypted access tokens</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="text-white font-medium">Permission Control</h4>
                      <p className="text-slate-300 text-sm">Granular access control for different resources</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="text-white font-medium">Audit Trail</h4>
                      <p className="text-slate-300 text-sm">Complete activity logging and monitoring</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* How It Works */}
              <Card className="backdrop-blur-sm bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">1</div>
                    <div>
                      <h4 className="text-white font-medium">Send Invitation</h4>
                      <p className="text-slate-300 text-sm">Client receives secure email with access link</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">2</div>
                    <div>
                      <h4 className="text-white font-medium">Client Clicks Link</h4>
                      <p className="text-slate-300 text-sm">Token is validated and portal access is granted</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">3</div>
                    <div>
                      <h4 className="text-white font-medium">Secure Access</h4>
                      <p className="text-slate-300 text-sm">Client can view project details and collaborate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card className="backdrop-blur-sm bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-slate-300 text-sm">
                    <strong className="text-white">Enhanced Collaboration:</strong> Real-time project updates and feedback
                  </div>
                  <div className="text-slate-300 text-sm">
                    <strong className="text-white">Transparency:</strong> Clients can track progress and milestones
                  </div>
                  <div className="text-slate-300 text-sm">
                    <strong className="text-white">Efficiency:</strong> Streamlined communication and approval processes
                  </div>
                  <div className="text-slate-300 text-sm">
                    <strong className="text-white">Security:</strong> Enterprise-grade security and access control
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}