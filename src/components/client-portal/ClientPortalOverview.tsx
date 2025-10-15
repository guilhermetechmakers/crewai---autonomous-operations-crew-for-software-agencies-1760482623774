import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Mail, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Plus
} from 'lucide-react';
import type { ClientPortalInvitation } from '@/types';

// Mock data - in real app, this would come from API
const mockInvitations: ClientPortalInvitation[] = [
  {
    id: '1',
    client_email: 'client1@example.com',
    project_id: '1',
    token: 'inv_123456789',
    expires_at: '2024-02-15T00:00:00Z',
    status: 'pending',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    project: { id: '1', name: 'E-commerce Platform', description: 'Modern e-commerce solution' } as any,
  },
  {
    id: '2',
    client_email: 'client2@example.com',
    project_id: '2',
    token: 'inv_987654321',
    expires_at: '2024-02-20T00:00:00Z',
    status: 'accepted',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z',
    accepted_at: '2024-01-12T00:00:00Z',
    project: { id: '2', name: 'Mobile App', description: 'Cross-platform mobile application' } as any,
  },
];

export default function ClientPortalOverview() {
  const { data: invitations, isLoading } = useQuery({
    queryKey: ['client-portal-overview'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockInvitations;
    },
  });

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

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Client Portal
          </CardTitle>
          <CardDescription>Recent client portal activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentInvitations = invitations?.slice(0, 3) || [];
  const pendingCount = invitations?.filter(inv => inv.status === 'pending' && !isExpired(inv.expires_at)).length || 0;
  const acceptedCount = invitations?.filter(inv => inv.status === 'accepted').length || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Client Portal
            </CardTitle>
            <CardDescription>Recent client portal activity</CardDescription>
          </div>
          <Button asChild size="sm">
            <Link to="/client-portal/invitation">
              <Plus className="mr-2 h-4 w-4" />
              Send Invitation
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-success">{acceptedCount}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </div>
        </div>

        {/* Recent Invitations */}
        <div className="space-y-3">
          {recentInvitations.length > 0 ? (
            recentInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium truncate">{invitation.client_email}</p>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(invitation.status)}`} />
                      <Badge variant="secondary" className="text-xs">
                        {getStatusText(invitation.status)}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {invitation.project?.name}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  {invitation.status === 'accepted' ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : invitation.status === 'pending' && !isExpired(invitation.expires_at) ? (
                    <Clock className="h-4 w-4 text-warning" />
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No client invitations yet</p>
              <Button asChild size="sm" variant="outline">
                <Link to="/client-portal/invitation">
                  <Plus className="mr-2 h-4 w-4" />
                  Send First Invitation
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* View All Link */}
        {recentInvitations.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link to="/client-portal/invitation">
                <ExternalLink className="mr-2 h-4 w-4" />
                Manage All Invitations
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}