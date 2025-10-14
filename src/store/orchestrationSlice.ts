import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AgentTask, AgentOrchestrationStatus } from '@/types';

interface OrchestrationState {
  tasks: AgentTask[];
  status: AgentOrchestrationStatus;
  isRunning: boolean;
  isLoading: boolean;
  error: string | null;
  selectedTask: AgentTask | null;
}

const initialState: OrchestrationState = {
  tasks: [],
  status: {
    is_running: false,
    active_tasks: 0,
    completed_tasks_today: 0,
    failed_tasks_today: 0,
    agents_status: {
      intake: 'inactive',
      spin_up: 'inactive',
      pm: 'inactive',
      launch: 'inactive',
      handover: 'inactive',
      support: 'inactive',
    },
    last_activity: new Date().toISOString(),
  },
  isRunning: false,
  isLoading: false,
  error: null,
  selectedTask: null,
};

const orchestrationSlice = createSlice({
  name: 'orchestration',
  initialState,
  reducers: {
    // Task management
    setTasks: (state: OrchestrationState, action: PayloadAction<AgentTask[]>) => {
      state.tasks = action.payload;
    },
    
    addTask: (state: OrchestrationState, action: PayloadAction<AgentTask>) => {
      state.tasks.unshift(action.payload);
    },
    
    updateTask: (state: OrchestrationState, action: PayloadAction<AgentTask>) => {
      const index = state.tasks.findIndex((task: AgentTask) => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    
    removeTask: (state: OrchestrationState, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((task: AgentTask) => task.id !== action.payload);
    },
    
    // Status management
    setStatus: (state: OrchestrationState, action: PayloadAction<AgentOrchestrationStatus>) => {
      state.status = action.payload;
    },
    
    updateStatus: (state: OrchestrationState, action: PayloadAction<Partial<AgentOrchestrationStatus>>) => {
      state.status = { ...state.status, ...action.payload };
    },
    
    // Engine control
    setRunning: (state: OrchestrationState, action: PayloadAction<boolean>) => {
      state.isRunning = action.payload;
      state.status.is_running = action.payload;
    },
    
    // Loading states
    setLoading: (state: OrchestrationState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state: OrchestrationState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Task selection
    setSelectedTask: (state: OrchestrationState, action: PayloadAction<AgentTask | null>) => {
      state.selectedTask = action.payload;
    },
    
    // Task actions
    startTask: (state: OrchestrationState, action: PayloadAction<string>) => {
      const task = state.tasks.find((t: AgentTask) => t.id === action.payload);
      if (task) {
        task.status = 'running';
        task.started_at = new Date().toISOString();
        task.updated_at = new Date().toISOString();
      }
    },
    
    pauseTask: (state: OrchestrationState, action: PayloadAction<string>) => {
      const task = state.tasks.find((t: AgentTask) => t.id === action.payload);
      if (task && task.status === 'running') {
        task.status = 'pending';
        task.updated_at = new Date().toISOString();
      }
    },
    
    completeTask: (state: OrchestrationState, action: PayloadAction<{ taskId: string; result?: any }>) => {
      const task = state.tasks.find((t: AgentTask) => t.id === action.payload.taskId);
      if (task) {
        task.status = 'completed';
        task.progress = 100;
        task.completed_at = new Date().toISOString();
        task.updated_at = new Date().toISOString();
      }
    },
    
    failTask: (state: OrchestrationState, action: PayloadAction<{ taskId: string; error: string }>) => {
      const task = state.tasks.find((t: AgentTask) => t.id === action.payload.taskId);
      if (task) {
        task.status = 'failed';
        task.completed_at = new Date().toISOString();
        task.updated_at = new Date().toISOString();
      }
    },
    
    cancelTask: (state: OrchestrationState, action: PayloadAction<string>) => {
      const task = state.tasks.find((t: AgentTask) => t.id === action.payload);
      if (task && task.status !== 'completed') {
        task.status = 'cancelled';
        task.updated_at = new Date().toISOString();
      }
    },
    
    updateTaskProgress: (state: OrchestrationState, action: PayloadAction<{ taskId: string; progress: number }>) => {
      const task = state.tasks.find((t: AgentTask) => t.id === action.payload.taskId);
      if (task) {
        task.progress = Math.max(0, Math.min(100, action.payload.progress));
        task.updated_at = new Date().toISOString();
      }
    },
    
    // Agent status updates
    updateAgentStatus: (state: OrchestrationState, action: PayloadAction<{ agent: string; status: 'active' | 'inactive' | 'error' }>) => {
      state.status.agents_status[action.payload.agent] = action.payload.status;
    },
    
    // Reset state
    resetOrchestration: (state: OrchestrationState) => {
      state.tasks = [];
      state.status = initialState.status;
      state.isRunning = false;
      state.isLoading = false;
      state.error = null;
      state.selectedTask = null;
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  removeTask,
  setStatus,
  updateStatus,
  setRunning,
  setLoading,
  setError,
  setSelectedTask,
  startTask,
  pauseTask,
  completeTask,
  failTask,
  cancelTask,
  updateTaskProgress,
  updateAgentStatus,
  resetOrchestration,
} = orchestrationSlice.actions;

export default orchestrationSlice.reducer;

// Selectors
export const selectTasks = (state: { orchestration: OrchestrationState }) => state.orchestration.tasks;
export const selectStatus = (state: { orchestration: OrchestrationState }) => state.orchestration.status;
export const selectIsRunning = (state: { orchestration: OrchestrationState }) => state.orchestration.isRunning;
export const selectIsLoading = (state: { orchestration: OrchestrationState }) => state.orchestration.isLoading;
export const selectError = (state: { orchestration: OrchestrationState }) => state.orchestration.error;
export const selectSelectedTask = (state: { orchestration: OrchestrationState }) => state.orchestration.selectedTask;

export const selectTasksByStatus = (status: string) => (state: { orchestration: OrchestrationState }) =>
  state.orchestration.tasks.filter(task => task.status === status);

export const selectTasksByAgent = (agentType: string) => (state: { orchestration: OrchestrationState }) =>
  state.orchestration.tasks.filter(task => task.agent_type === agentType);

export const selectActiveTasks = (state: { orchestration: OrchestrationState }) =>
  state.orchestration.tasks.filter(task => task.status === 'running');

export const selectCompletedTasksToday = (state: { orchestration: OrchestrationState }) => {
  const today = new Date().toDateString();
  return state.orchestration.tasks.filter(task => 
    task.status === 'completed' && 
    task.completed_at && 
    new Date(task.completed_at).toDateString() === today
  );
};

export const selectFailedTasksToday = (state: { orchestration: OrchestrationState }) => {
  const today = new Date().toDateString();
  return state.orchestration.tasks.filter(task => 
    task.status === 'failed' && 
    task.completed_at && 
    new Date(task.completed_at).toDateString() === today
  );
};