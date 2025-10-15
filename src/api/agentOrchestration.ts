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

  // Schedule a task (new endpoint)
  scheduleTask: (data: CreateTaskRequest) => api.post<AgentTask>('/agent/schedule', data),
  
  // Pause a running task
  pauseTask: (taskId: string) => api.post<{ success: boolean }>(`/agent/tasks/${taskId}/pause`, {}),
  
  // Resume a paused task
  resumeTask: (taskId: string) => api.post<{ success: boolean }>(`/agent/tasks/${taskId}/resume`, {}),
  
  // Get task statistics
  getTaskStatistics: () => api.get<{
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
    completedToday: number;
    failedToday: number;
  }>('/agent/tasks/statistics'),
  
  // Clean up old tasks
  cleanupOldTasks: (daysOld?: number) => api.post<{ cleanedCount: number }>('/agent/tasks/cleanup', { daysOld }),

  // Batch operations
  scheduleBatchTasks: (tasks: CreateTaskRequest[]) => api.post<AgentTask[]>('/agent/tasks/batch', { tasks }),
  
  // Health and metrics
  getHealthMetrics: () => api.get<{
    totalTasks: number;
    activeTasks: number;
    pendingTasks: number;
    completedTasks: number;
    failedTasks: number;
    recentActivity: number;
    dailyActivity: number;
    successRate: number;
    avgExecutionTimeMs: number;
    isHealthy: boolean;
    lastActivity: string | null;
  }>('/agent/health/metrics'),
  
  getAgentPerformanceMetrics: () => api.get<Array<{
    agentType: string;
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    successRate: number;
    avgExecutionTimeMs: number;
    isHealthy: boolean;
  }>>('/agent/performance'),
  
  // Bulk operations
  pauseAllTasks: () => api.post<{ pausedCount: number }>('/agent/tasks/pause-all', {}),
  resumeAllTasks: () => api.post<{ resumedCount: number }>('/agent/tasks/resume-all', {}),
  
  // Task filtering
  getTasksByStatus: (status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled') => 
    api.get<AgentTask[]>(`/agent/tasks/status/${status}`),
  
  getTasksByAgentType: (agentType: 'intake' | 'spin_up' | 'pm' | 'launch' | 'handover' | 'support') => 
    api.get<AgentTask[]>(`/agent/tasks/agent/${agentType}`),
  
  getTasksByPriority: (priority: 'low' | 'medium' | 'high' | 'urgent') => 
    api.get<AgentTask[]>(`/agent/tasks/priority/${priority}`),
  
  // Data export
  exportTaskData: (format: 'json' | 'csv' = 'json') => 
    api.get<string>(`/agent/tasks/export?format=${format}`),
  
  // Task history
  getTaskHistory: (limit?: number) => 
    api.get<AgentTask[]>(`/agent/tasks/history?limit=${limit || 50}`),
};