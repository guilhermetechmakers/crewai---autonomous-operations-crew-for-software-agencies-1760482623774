import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentOrchestrationApi } from '@/api/agentOrchestration';
import { toast } from 'sonner';
import type { AgentTask, CreateTaskRequest } from '@/types';

// Query keys
export const orchestrationKeys = {
  all: ['orchestration'] as const,
  tasks: () => [...orchestrationKeys.all, 'tasks'] as const,
  task: (id: string) => [...orchestrationKeys.tasks(), id] as const,
  status: () => [...orchestrationKeys.all, 'status'] as const,
  health: () => [...orchestrationKeys.all, 'health'] as const,
  scheduled: () => [...orchestrationKeys.tasks(), 'scheduled'] as const,
  logs: (taskId: string) => [...orchestrationKeys.task(taskId), 'logs'] as const,
};

// Hooks for fetching data
export const useTasks = () => {
  return useQuery({
    queryKey: orchestrationKeys.tasks(),
    queryFn: agentOrchestrationApi.getTasks,
    staleTime: 30000, // 30 seconds
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};

export const useTask = (taskId: string) => {
  return useQuery({
    queryKey: orchestrationKeys.task(taskId),
    queryFn: () => agentOrchestrationApi.getTask(taskId),
    enabled: !!taskId,
  });
};

export const useOrchestrationStatus = () => {
  return useQuery({
    queryKey: orchestrationKeys.status(),
    queryFn: agentOrchestrationApi.getStatus,
    staleTime: 10000, // 10 seconds
    refetchInterval: 5000, // Refetch every 5 seconds
  });
};

export const useAgentHealth = () => {
  return useQuery({
    queryKey: orchestrationKeys.health(),
    queryFn: agentOrchestrationApi.getAgentHealth,
    staleTime: 30000, // 30 seconds
    refetchInterval: 15000, // Refetch every 15 seconds
  });
};

export const useScheduledTasks = () => {
  return useQuery({
    queryKey: orchestrationKeys.scheduled(),
    queryFn: agentOrchestrationApi.getScheduledTasks,
    staleTime: 60000, // 1 minute
  });
};

export const useTaskLogs = (taskId: string) => {
  return useQuery({
    queryKey: orchestrationKeys.logs(taskId),
    queryFn: () => agentOrchestrationApi.getTaskLogs(taskId),
    enabled: !!taskId,
  });
};

// Hooks for mutations
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => agentOrchestrationApi.createTask(data),
    onSuccess: (data) => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: orchestrationKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: orchestrationKeys.status() });
      toast.success(`Task "${data.name}" created successfully`);
    },
    onError: (error) => {
      toast.error('Failed to create task');
      console.error('Create task error:', error);
    },
  });
};

export const useCancelTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => agentOrchestrationApi.cancelTask(taskId),
    onSuccess: (_, taskId) => {
      // Update the specific task in cache
      queryClient.setQueryData(
        orchestrationKeys.task(taskId),
        (oldData: AgentTask | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            };
          }
          return oldData;
        }
      );
      
      // Invalidate tasks list and status
      queryClient.invalidateQueries({ queryKey: orchestrationKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: orchestrationKeys.status() });
      toast.success('Task cancelled successfully');
    },
    onError: (error) => {
      toast.error('Failed to cancel task');
      console.error('Cancel task error:', error);
    },
  });
};

export const useRetryTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => agentOrchestrationApi.retryTask(taskId),
    onSuccess: (_, taskId) => {
      // Update the specific task in cache
      queryClient.setQueryData(
        orchestrationKeys.task(taskId),
        (oldData: AgentTask | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              status: 'pending',
              progress: 0,
              updated_at: new Date().toISOString(),
            };
          }
          return oldData;
        }
      );
      
      // Invalidate tasks list and status
      queryClient.invalidateQueries({ queryKey: orchestrationKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: orchestrationKeys.status() });
      toast.success('Task queued for retry');
    },
    onError: (error) => {
      toast.error('Failed to retry task');
      console.error('Retry task error:', error);
    },
  });
};

export const useUpdateTaskPriority = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, priority }: { taskId: string; priority: 'low' | 'medium' | 'high' | 'urgent' }) =>
      agentOrchestrationApi.updateTaskPriority(taskId, priority),
    onSuccess: (_, { taskId, priority }) => {
      // Update the specific task in cache
      queryClient.setQueryData(
        orchestrationKeys.task(taskId),
        (oldData: AgentTask | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              priority,
              updated_at: new Date().toISOString(),
            };
          }
          return oldData;
        }
      );
      
      // Invalidate tasks list
      queryClient.invalidateQueries({ queryKey: orchestrationKeys.tasks() });
      toast.success(`Task priority updated to ${priority}`);
    },
    onError: (error) => {
      toast.error('Failed to update task priority');
      console.error('Update priority error:', error);
    },
  });
};

export const useToggleTaskStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, isActive }: { taskId: string; isActive: boolean }) =>
      agentOrchestrationApi.toggleTaskStatus(taskId, isActive),
    onSuccess: (_, { isActive }) => {
      // Invalidate tasks list
      queryClient.invalidateQueries({ queryKey: orchestrationKeys.tasks() });
      toast.success(`Task ${isActive ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error) => {
      toast.error('Failed to toggle task status');
      console.error('Toggle task status error:', error);
    },
  });
};

export const useStartOrchestration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => agentOrchestrationApi.start(),
    onSuccess: () => {
      // Invalidate status
      queryClient.invalidateQueries({ queryKey: orchestrationKeys.status() });
      toast.success('Orchestration engine started');
    },
    onError: (error) => {
      toast.error('Failed to start orchestration engine');
      console.error('Start orchestration error:', error);
    },
  });
};

export const useStopOrchestration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => agentOrchestrationApi.stop(),
    onSuccess: () => {
      // Invalidate status
      queryClient.invalidateQueries({ queryKey: orchestrationKeys.status() });
      toast.success('Orchestration engine stopped');
    },
    onError: (error) => {
      toast.error('Failed to stop orchestration engine');
      console.error('Stop orchestration error:', error);
    },
  });
};

// New hooks for enhanced functionality
export const usePauseTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => agentOrchestrationApi.pauseTask(taskId),
    onSuccess: (_, taskId) => {
      // Update the specific task in cache
      queryClient.setQueryData(
        orchestrationKeys.task(taskId),
        (oldData: AgentTask | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              status: 'pending',
              updated_at: new Date().toISOString(),
            };
          }
          return oldData;
        }
      );
      
      // Invalidate tasks list
      queryClient.invalidateQueries({ queryKey: orchestrationKeys.tasks() });
      toast.success('Task paused successfully');
    },
    onError: (error) => {
      toast.error('Failed to pause task');
      console.error('Pause task error:', error);
    },
  });
};

export const useResumeTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => agentOrchestrationApi.resumeTask(taskId),
    onSuccess: (_, taskId) => {
      // Update the specific task in cache
      queryClient.setQueryData(
        orchestrationKeys.task(taskId),
        (oldData: AgentTask | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              status: 'running',
              started_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          }
          return oldData;
        }
      );
      
      // Invalidate tasks list
      queryClient.invalidateQueries({ queryKey: orchestrationKeys.tasks() });
      toast.success('Task resumed successfully');
    },
    onError: (error) => {
      toast.error('Failed to resume task');
      console.error('Resume task error:', error);
    },
  });
};

export const useTaskStatistics = () => {
  return useQuery({
    queryKey: [...orchestrationKeys.all, 'statistics'],
    queryFn: agentOrchestrationApi.getTaskStatistics,
    staleTime: 30000, // 30 seconds
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};

export const useCleanupOldTasks = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (daysOld?: number) => agentOrchestrationApi.cleanupOldTasks(daysOld),
    onSuccess: (data) => {
      // Invalidate tasks list
      queryClient.invalidateQueries({ queryKey: orchestrationKeys.tasks() });
      toast.success(`Cleaned up ${data.cleanedCount} old tasks`);
    },
    onError: (error) => {
      toast.error('Failed to cleanup old tasks');
      console.error('Cleanup tasks error:', error);
    },
  });
};