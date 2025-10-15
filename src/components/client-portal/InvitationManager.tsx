import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { clientPortalApi } from '@/api/auth';
import { 
  Mail, 
  Plus, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  Loader2,
  AlertTriangle,
  Users,
  Calendar
} from 'lucide-react';
import type { 
  ClientPortalInvitation, 
  Project 
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

// Mock permissions data
const mockPermissions = [
  { id: '1', name: 'View Project', description: 'View project details and status', resource: 'project', actions: ['view'] },
  { id: '2', name: 'View Milestones', description: 'See project milestones and progress', resource: 'milestones', actions: ['view'] },
  { id: '3', name: 'Review Deliverables', description: 'Review and approve project deliverables', resource: 'deliverables', actions: ['view', 'comment', 'approve'] },
  { id: '4', name: 'Download Files', description: 'Download project files and documents', resource: 'deliverables', actions: ['view', 'download'] },
];

interface InvitationManagerProps {
  projects: Project[];
}

export default function InvitationManager({ projects }: InvitationManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<InvitationFormData>({
    resolver: zodResolver(invitationFormSchema),
    defaultValues: {
      expires_in_days: 7,
      permissions: ['1', '2'], // Default permissions
    },
  });

  const selectedPermissions = watch('permissions') || [];

  // Fetch invitations
  const { data: invitations, isLoading } = useQuery({
    queryKey: ['client-portal-invitations'],
    queryFn: async () => {
      // Mock data - in real app, this would come from API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        {
          id: '1',
          client_email: 'client1@example.com',
          project_id: '1',
          token: 'inv_123456789',
          expires_at: '2024-02-15T00:00:00Z',
          status: 'pending' as const,
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
          project: projects.find(p => p.id === '1'),
        },
        {
          id: '2',
          client_email: 'client2@example.com',
          project_id: '2',
          token: 'inv_987654321',
          expires_at: '2024-02-20T00:00:00Z',
          status: 'accepted' as const,
          created_at: '2024-01-10T00:00:00Z',
          updated_at: '2024-01-12T00:00:00Z',
          accepted_at: '2024-01-12T00:00:00Z',
          project: projects.find(p => p.id === '2'),
        },
        {
          id: '3',
          client_email: 'client3@example.com',
          project_id: '1',
          token: 'inv_expired123',
          expires_at: '2024-01-01T00:00:00Z',
          status: 'expired' as const,
          created_at: '2023-12-15T00:00:00Z',
          updated_at: '2023-12-15T00:00:00Z',
          project: projects.find(p => p.id === '1'),
        },
      ] as ClientPortalInvitation[];
    },
  });

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: clientPortalApi.sendInvitation,
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Invitation sent successfully!', {
          description: 'The client will receive an email with access instructions.',
        });
        queryClient.invalidateQueries({ queryKey: ['client-portal-invitations'] });
        reset();
        setIsFormOpen(false);
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

  // Revoke invitation mutation
  const revokeInvitationMutation = useMutation({
    mutationFn: clientPortalApi.revokeInvitation,
    onSuccess: () => {
      toast.success('Invitation revoked successfully');
      queryClient.invalidateQueries({ queryKey: ['client-portal-invitations'] });
    },
    onError: (error) => {
      toast.error('Failed to revoke invitation', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    },
  });

  const onSubmit = (data: InvitationFormData) => {
    sendInvitationMutation.mutate(data);
  };

  const handleRevokeInvitation = (invitationId: string) => {
    revokeInvitationMutation.mutate({ invitation_id: invitationId });
  };

  const copyInvitationLink = (token: string) => {
    const link = `${window.location.origin}/client-portal/invitation?token=${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Invitation link copied to clipboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'accepted':
        return 'bg-green-500';
      case 'expired':
        return 'bg-red-500';
      case 'revoked':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const togglePermission = (permissionId: string) => {
    const current = selectedPermissions;
    const updated = current.includes(permissionId)
      ? current.filter(id => id !== permissionId)
      : [...current, permissionId];
    setValue('permissions', updated);
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Portal Invitations</CardTitle>
          <CardDescription>Manage client access to project portals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Client Portal Invitations
            </CardTitle>
            <CardDescription>Manage client access to project portals</CardDescription>
          </div>
          <Button onClick={() => setIsFormOpen(!isFormOpen)}>
            <Plus className="mr-2 h-4 w-4" />
            Send Invitation
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Invitation Form */}
        {isFormOpen && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <h3 className="text-lg font-semibold mb-4">Send New Invitation</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_email">Client Email</Label>
                  <Input
                    id="client_email"
                    type="email"
                    placeholder="client@example.com"
                    {...register('client_email')}
                  />
                  {errors.client_email && (
                    <p className="text-sm text-destructive">{errors.client_email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project_id">Project</Label>
                  <select
                    id="project_id"
                    className="w-full p-2 border rounded-md"
                    {...register('project_id')}
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  {errors.project_id && (
                    <p className="text-sm text-destructive">{errors.project_id.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {mockPermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPermissions.includes(permission.id)
                          ? 'bg-primary/10 border-primary'
                          : 'bg-background border-border hover:bg-muted'
                      }`}
                      onClick={() => togglePermission(permission.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{permission.name}</h4>
                          <p className="text-sm text-muted-foreground">{permission.description}</p>
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
                  <p className="text-sm text-destructive">{errors.permissions.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expires_in_days">Expires In (Days)</Label>
                  <Input
                    id="expires_in_days"
                    type="number"
                    min="1"
                    max="30"
                    {...register('expires_in_days', { valueAsNumber: true })}
                  />
                  {errors.expires_in_days && (
                    <p className="text-sm text-destructive">{errors.expires_in_days.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Add a personal message..."
                    {...register('message')}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={sendInvitationMutation.isPending}
                >
                  {sendInvitationMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Invitations List */}
        <div className="space-y-4">
          {invitations && invitations.length > 0 ? (
            invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{invitation.client_email}</h4>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(invitation.status)}`} />
                        <Badge variant="secondary" className="text-xs">
                          {getStatusText(invitation.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Project: {invitation.project?.name || 'Unknown Project'}</p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Created: {new Date(invitation.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                        </div>
                      </div>
                      {invitation.accepted_at && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accepted: {new Date(invitation.accepted_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {invitation.status === 'pending' && !isExpired(invitation.expires_at) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyInvitationLink(invitation.token)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Link
                      </Button>
                    )}
                    
                    {invitation.status === 'accepted' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyInvitationLink(invitation.token)}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Portal
                      </Button>
                    )}

                    {(invitation.status === 'pending' || invitation.status === 'accepted') && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRevokeInvitation(invitation.id)}
                        disabled={revokeInvitationMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>

                {isExpired(invitation.expires_at) && invitation.status === 'pending' && (
                  <Alert className="mt-3">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This invitation has expired and is no longer valid.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Invitations Yet</h3>
              <p className="text-muted-foreground mb-4">
                Send your first client portal invitation to get started.
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}