import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { projectSpinUpApi } from '@/api/projectSpinUp';
import type { 
  SpinUpConfiguration, 
  SpinUpTemplate
} from '@/types';

// Query keys for React Query
export const spinUpQueryKeys = {
  all: ['spinup'] as const,
  templates: () => [...spinUpQueryKeys.all, 'templates'] as const,
  projects: () => [...spinUpQueryKeys.all, 'projects'] as const,
  project: (id: string) => [...spinUpQueryKeys.all, 'project', id] as const,
  progress: (id: string) => [...spinUpQueryKeys.all, 'progress', id] as const,
  logs: (id: string) => [...spinUpQueryKeys.all, 'logs', id] as const,
};

// Hook for managing project spin-up state and operations
export function useProjectSpinUp() {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<SpinUpTemplate | null>(null);

  // Fetch templates
  const {
    data: templates = [],
    isLoading: isLoadingTemplates,
    error: templatesError,
  } = useQuery({
    queryKey: spinUpQueryKeys.templates(),
    queryFn: projectSpinUpApi.getTemplates,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch user's projects
  const {
    data: projects = [],
    isLoading: isLoadingProjects,
    error: projectsError,
  } = useQuery({
    queryKey: spinUpQueryKeys.projects(),
    queryFn: projectSpinUpApi.getProjects,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Initiate spin-up mutation
  const initiateMutation = useMutation({
    mutationFn: projectSpinUpApi.initiate,
    onSuccess: () => {
      toast.success('Project spin-up initiated successfully!', {
        description: 'Your project is being set up. You\'ll receive notifications as it progresses.',
      });
      
      // Invalidate projects query to refresh the list
      queryClient.invalidateQueries({ queryKey: spinUpQueryKeys.projects() });
      
      // Reset form state
      setCurrentStep(0);
      setSelectedTemplate(null);
    },
    onError: (error) => {
      toast.error('Failed to initiate project spin-up', {
        description: error instanceof Error ? error.message : 'Please try again or contact support if the issue persists.',
      });
    },
  });

  // Cancel spin-up mutation
  const cancelMutation = useMutation({
    mutationFn: projectSpinUpApi.cancel,
    onSuccess: () => {
      toast.success('Project spin-up cancelled successfully');
      queryClient.invalidateQueries({ queryKey: spinUpQueryKeys.projects() });
    },
    onError: (error) => {
      toast.error('Failed to cancel project spin-up', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    },
  });

  // Retry spin-up mutation
  const retryMutation = useMutation({
    mutationFn: projectSpinUpApi.retry,
    onSuccess: () => {
      toast.success('Project spin-up retry initiated');
      queryClient.invalidateQueries({ queryKey: spinUpQueryKeys.projects() });
    },
    onError: (error) => {
      toast.error('Failed to retry project spin-up', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    },
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: ({ id, config }: { id: string; config: Partial<SpinUpConfiguration> }) =>
      projectSpinUpApi.updateConfiguration(id, config),
    onSuccess: () => {
      toast.success('Configuration updated successfully');
      queryClient.invalidateQueries({ queryKey: spinUpQueryKeys.projects() });
    },
    onError: (error) => {
      toast.error('Failed to update configuration', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    },
  });

  // Navigation helpers
  const nextStep = useCallback(() => {
    setCurrentStep(prev => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, 4))); // 0-4 steps
  }, []);

  const resetForm = useCallback(() => {
    setCurrentStep(0);
    setSelectedTemplate(null);
  }, []);

  // Template selection
  const selectTemplate = useCallback((template: SpinUpTemplate) => {
    setSelectedTemplate(template);
    nextStep();
  }, [nextStep]);

  // Actions
  const initiateSpinUp = useCallback((data: {
    name: string;
    description: string;
    configuration: SpinUpConfiguration;
  }) => {
    initiateMutation.mutate(data);
  }, [initiateMutation]);

  const cancelSpinUp = useCallback((spinupId: string) => {
    cancelMutation.mutate(spinupId);
  }, [cancelMutation]);

  const retrySpinUp = useCallback((spinupId: string) => {
    retryMutation.mutate(spinupId);
  }, [retryMutation]);

  const updateConfiguration = useCallback((spinupId: string, config: Partial<SpinUpConfiguration>) => {
    updateConfigMutation.mutate({ id: spinupId, config });
  }, [updateConfigMutation]);

  return {
    // State
    currentStep,
    selectedTemplate,
    
    // Data
    templates,
    projects,
    
    // Loading states
    isLoadingTemplates,
    isLoadingProjects,
    isInitiating: initiateMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isRetrying: retryMutation.isPending,
    isUpdating: updateConfigMutation.isPending,
    
    // Errors
    templatesError,
    projectsError,
    initiateError: initiateMutation.error,
    cancelError: cancelMutation.error,
    retryError: retryMutation.error,
    updateError: updateConfigMutation.error,
    
    // Actions
    nextStep,
    prevStep,
    goToStep,
    resetForm,
    selectTemplate,
    initiateSpinUp,
    cancelSpinUp,
    retrySpinUp,
    updateConfiguration,
  };
}

// Hook for fetching spin-up progress
export function useSpinUpProgress(spinupId: string | null) {
  return useQuery({
    queryKey: spinUpQueryKeys.progress(spinupId || ''),
    queryFn: () => projectSpinUpApi.getProgress(spinupId!),
    enabled: !!spinupId,
    refetchInterval: 2000, // Refetch every 2 seconds for real-time updates
    staleTime: 0, // Always consider data stale for real-time updates
  });
}

// Hook for fetching spin-up logs
export function useSpinUpLogs(spinupId: string | null) {
  return useQuery({
    queryKey: spinUpQueryKeys.logs(spinupId || ''),
    queryFn: () => projectSpinUpApi.getLogs(spinupId!),
    enabled: !!spinupId,
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 0, // Always consider data stale for real-time updates
  });
}

// Hook for fetching a specific project
export function useProject(spinupId: string | null) {
  return useQuery({
    queryKey: spinUpQueryKeys.project(spinupId || ''),
    queryFn: () => projectSpinUpApi.getProject(spinupId!),
    enabled: !!spinupId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
