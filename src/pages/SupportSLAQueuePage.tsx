import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import SupportSLAQueueView from '@/components/views/SupportSLAQueueView';

const SupportSLAQueuePage: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has support agent permissions
  // For now, we'll allow all authenticated users
  // In a real app, you'd check user roles/permissions
  const hasSupportAccess = true; // user.role === 'admin' || user.role === 'support_agent';

  if (!hasSupportAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access the support queue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Support Agent & SLA Management
          </h1>
          <p className="text-muted-foreground">
            Manage support tickets, track SLA compliance, and automate resolution workflows.
          </p>
        </div>
        
        <SupportSLAQueueView />
      </div>
    </div>
  );
};

export default SupportSLAQueuePage;