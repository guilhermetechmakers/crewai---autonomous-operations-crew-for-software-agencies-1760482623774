import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentOrchestrationApi } from '@/api/agentOrchestration';
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
    onSuccess: () => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: orchestrationKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: orchestrationKeys.status() });
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
    },
  });
};

export const useToggleTaskStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, isActive }: { taskId: string; isActive: boolean }) =>
      agentOrchestrationApi.toggleTaskStatus(taskId, isActive),
    onSuccess: () => {
      // Invalidate tasks list
      queryClient.invalidateQueries({ queryKey: orchestrationKeys.tasks() });
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
    },
  });
};