import { api } from '@/lib/api';
import type { 
  AgentTask, 
  AgentOrchestrationStatus, 
  CreateTaskRequest
} from '@/types';

// Agent Orchestration API functions
export const agentOrchestrationApi = {
  // Get all tasks
  getTasks: () => api.get<AgentTask[]>('/agent/tasks'),
  
  // Get task by ID
  getTask: (taskId: string) => api.get<AgentTask>(`/agent/tasks/${taskId}`),
  
  // Create a new task
  createTask: (data: CreateTaskRequest) => api.post<AgentTask>('/agent/tasks', data),
  
  // Cancel a task
  cancelTask: (taskId: string) => api.post<{ success: boolean }>(`/agent/tasks/${taskId}/cancel`, {}),
  
  // Get orchestration status
  getStatus: () => api.get<AgentOrchestrationStatus>('/agent/status'),
  
  // Start orchestration engine
  start: () => api.post<{ success: boolean }>('/agent/start', {}),
  
  // Stop orchestration engine
  stop: () => api.post<{ success: boolean }>('/agent/stop', {}),
  
  // Get task logs
  getTaskLogs: (taskId: string) => api.get<any[]>(`/agent/tasks/${taskId}/logs`),
  
  // Retry failed task
  retryTask: (taskId: string) => api.post<{ success: boolean }>(`/agent/tasks/${taskId}/retry`, {}),
  
  // Get agent health status
  getAgentHealth: () => api.get<Record<string, 'active' | 'inactive' | 'error'>>('/agent/health'),
  
  // Update task priority
  updateTaskPriority: (taskId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => 
    api.put<{ success: boolean }>(`/agent/tasks/${taskId}/priority`, { priority }),
  
  // Get scheduled tasks
  getScheduledTasks: () => api.get<AgentTask[]>('/agent/tasks/scheduled'),
  
  // Pause/Resume task
  toggleTaskStatus: (taskId: string, isActive: boolean) => 
    api.put<{ success: boolean }>(`/agent/tasks/${taskId}/toggle`, { isActive }),
};