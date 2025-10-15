import type { 
  AgentTask, 
  AgentSchedule, 
  AgentOrchestrationStatus, 
  CreateTaskRequest,
  AgentTaskLog
} from '@/types';

// Event types for real-time updates
export interface TaskUpdateEvent {
  type: 'task_created' | 'task_started' | 'task_progress' | 'task_completed' | 'task_failed' | 'task_cancelled';
  taskId: string;
  task?: AgentTask;
  progress?: number;
  error?: string;
}

// Event listener type
type TaskUpdateListener = (event: TaskUpdateEvent) => void;

class AgentOrchestrationEngineService {
  private tasks: Map<string, AgentTask> = new Map();
  private schedules: Map<string, AgentSchedule> = new Map();
  private isRunning = false;
  private intervalId: number | null = null;
  private listeners: Set<TaskUpdateListener> = new Set();
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  constructor() {
    this.initializeAgents();
  }

  /**
   * Add event listener for task updates
   */
  addEventListener(listener: TaskUpdateListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: TaskUpdateListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Emit task update event to all listeners
   */
  private emitTaskUpdate(event: TaskUpdateEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in task update listener:', error);
      }
    });
  }

  /**
   * Initialize all available agents and their configurations
   */
  async initializeAgents(): Promise<void> {
    console.log('🤖 Initializing Agent Orchestration Engine...');
    
    try {
      // Initialize agent configurations
      const agentConfigs = [
        { type: 'intake', name: 'Intake Agent', status: 'active' as const },
        { type: 'spin_up', name: 'Project Spin-Up Agent', status: 'active' as const },
        { type: 'pm', name: 'Project Management Agent', status: 'active' as const },
        { type: 'launch', name: 'Launch Agent', status: 'active' as const },
        { type: 'handover', name: 'Handover Agent', status: 'active' as const },
        { type: 'support', name: 'Support Agent', status: 'active' as const },
      ];

      // Store agent statuses
      agentConfigs.forEach(agent => {
        console.log(`✅ ${agent.name} initialized and ${agent.status}`);
      });

      // Start the orchestration engine
      this.startOrchestration();
    } catch (error) {
      console.error('Failed to initialize agents:', error);
      throw new Error('Agent initialization failed');
    }
  }

  /**
   * Schedule a new task for execution
   */
  async scheduleTask(taskData: CreateTaskRequest): Promise<AgentTask> {
    try {
      const taskId = this.generateId();
      const now = new Date().toISOString();

      const task: AgentTask = {
        id: taskId,
        name: taskData.name,
        description: taskData.description,
        status: 'pending',
        priority: taskData.priority,
        agent_type: taskData.agent_type,
        scheduled_at: taskData.scheduled_at || now,
        progress: 0,
        logs: [],
        created_at: now,
        updated_at: now,
      };

      this.tasks.set(taskId, task);

      // If it's a scheduled task, create a schedule entry
      if (taskData.cron_expression) {
        const schedule: AgentSchedule = {
          id: this.generateId(),
          task_id: taskId,
          cron_expression: taskData.cron_expression,
          timezone: taskData.timezone || 'UTC',
          is_active: true,
          next_run: this.calculateNextRun(taskData.cron_expression, taskData.timezone),
          created_at: now,
          updated_at: now,
        };
        this.schedules.set(schedule.id, schedule);
      }

      // Emit task created event
      this.emitTaskUpdate({
        type: 'task_created',
        taskId,
        task: { ...task }
      });

      // If it's an immediate task, execute it
      if (!taskData.scheduled_at || new Date(taskData.scheduled_at) <= new Date()) {
        this.executeTask(taskId);
      }

      console.log(`📋 Task scheduled: ${task.name} (${task.agent_type})`);
      return task;
    } catch (error) {
      console.error('Failed to schedule task:', error);
      throw new Error('Task scheduling failed');
    }
  }

  /**
   * Execute a specific task
   */
  private async executeTask(taskId: string, retryCount: number = 0): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      console.error(`❌ Task not found: ${taskId}`);
      return;
    }

    try {
      console.log(`🚀 Executing task: ${task.name}${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);
      
      // Update task status
      task.status = 'running';
      task.started_at = new Date().toISOString();
      task.updated_at = new Date().toISOString();
      this.addTaskLog(taskId, 'info', `Task execution started${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);

      // Emit task started event
      this.emitTaskUpdate({
        type: 'task_started',
        taskId,
        task: { ...task }
      });

      // Simulate task execution with progress updates
      await this.simulateTaskExecution(taskId);
    } catch (error) {
      console.error(`❌ Task execution failed: ${task.name}`, error);
      
      // Handle retry logic
      if (retryCount < this.maxRetries) {
        this.addTaskLog(taskId, 'warning', `Task failed, retrying in ${this.retryDelay / 1000} seconds... (attempt ${retryCount + 1}/${this.maxRetries})`);
        
        // Schedule retry
        setTimeout(() => {
          this.executeTask(taskId, retryCount + 1);
        }, this.retryDelay);
      } else {
        // Mark task as failed after max retries
        task.status = 'failed';
        task.updated_at = new Date().toISOString();
        this.addTaskLog(taskId, 'error', `Task failed after ${this.maxRetries} retries: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        // Emit task failed event
        this.emitTaskUpdate({
          type: 'task_failed',
          taskId,
          task: { ...task },
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Simulate task execution with progress updates
   */
  private async simulateTaskExecution(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const steps = [
      { progress: 20, message: 'Initializing agent...', delay: 1000 },
      { progress: 40, message: 'Processing request...', delay: 1500 },
      { progress: 60, message: 'Executing business logic...', delay: 2000 },
      { progress: 80, message: 'Finalizing results...', delay: 1000 },
      { progress: 100, message: 'Task completed successfully', delay: 500 },
    ];

    try {
      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, step.delay));
        
        task.progress = step.progress;
        task.updated_at = new Date().toISOString();
        this.addTaskLog(taskId, 'info', step.message);
        
        // Emit progress update event
        this.emitTaskUpdate({
          type: 'task_progress',
          taskId,
          task: { ...task },
          progress: step.progress
        });
      }

      // Mark task as completed
      task.status = 'completed';
      task.completed_at = new Date().toISOString();
      task.updated_at = new Date().toISOString();
      this.addTaskLog(taskId, 'success', 'Task completed successfully');

      // Emit task completed event
      this.emitTaskUpdate({
        type: 'task_completed',
        taskId,
        task: { ...task }
      });

      console.log(`✅ Task completed: ${task.name}`);
    } catch (error) {
      // If simulation fails, throw error to trigger retry logic
      throw error;
    }
  }

  /**
   * Add a log entry to a task
   */
  private addTaskLog(taskId: string, level: AgentTaskLog['level'], message: string, details?: Record<string, any>): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const log: AgentTaskLog = {
      id: this.generateId(),
      task_id: taskId,
      level,
      message,
      timestamp: new Date().toISOString(),
      details,
    };

    task.logs.push(log);
  }

  /**
   * Start the orchestration engine
   */
  private startOrchestration(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('🎯 Agent Orchestration Engine started');

    // Check for scheduled tasks every 30 seconds
    this.intervalId = setInterval(() => {
      this.checkScheduledTasks();
    }, 30000);
  }

  /**
   * Stop the orchestration engine
   */
  stopOrchestration(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏹️ Agent Orchestration Engine stopped');
  }

  /**
   * Check for tasks that need to be executed
   */
  private checkScheduledTasks(): void {
    const now = new Date();
    
    this.schedules.forEach(schedule => {
      if (!schedule.is_active) return;
      
      const nextRun = new Date(schedule.next_run || '');
      if (nextRun <= now) {
        // Execute the scheduled task
        this.executeTask(schedule.task_id);
        
        // Update next run time
        schedule.next_run = this.calculateNextRun(schedule.cron_expression, schedule.timezone);
        schedule.last_run = now.toISOString();
        schedule.updated_at = now.toISOString();
      }
    });
  }

  /**
   * Calculate next run time based on cron expression
   */
  private calculateNextRun(_cronExpression: string, _timezone: string = 'UTC'): string {
    // Simple implementation - in production, use a proper cron library
    const now = new Date();
    const nextRun = new Date(now.getTime() + 60000); // Default to 1 minute from now
    return nextRun.toISOString();
  }

  /**
   * Get all tasks
   */
  getTasks(): AgentTask[] {
    return Array.from(this.tasks.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get orchestration status
   */
  getStatus(): AgentOrchestrationStatus {
    const tasks = Array.from(this.tasks.values());
    const today = new Date().toDateString();
    
    const completedToday = tasks.filter(task => 
      task.status === 'completed' && 
      task.completed_at && 
      new Date(task.completed_at).toDateString() === today
    ).length;

    const failedToday = tasks.filter(task => 
      task.status === 'failed' && 
      task.completed_at && 
      new Date(task.completed_at).toDateString() === today
    ).length;

    const activeTasks = tasks.filter(task => task.status === 'running').length;

    return {
      is_running: this.isRunning,
      active_tasks: activeTasks,
      completed_tasks_today: completedToday,
      failed_tasks_today: failedToday,
      agents_status: {
        intake: 'active',
        spin_up: 'active',
        pm: 'active',
        launch: 'active',
        handover: 'active',
        support: 'active',
      },
      last_activity: new Date().toISOString(),
    };
  }

  /**
   * Cancel a task
   */
  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status === 'completed') return false;

    task.status = 'cancelled';
    task.updated_at = new Date().toISOString();
    this.addTaskLog(taskId, 'warning', 'Task cancelled by user');

    // Emit task cancelled event
    this.emitTaskUpdate({
      type: 'task_cancelled',
      taskId,
      task: { ...task }
    });

    console.log(`❌ Task cancelled: ${task.name}`);
    return true;
  }

  /**
   * Retry a failed task
   */
  retryTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== 'failed') return false;

    // Reset task for retry
    task.status = 'pending';
    task.progress = 0;
    task.started_at = undefined;
    task.completed_at = undefined;
    task.updated_at = new Date().toISOString();
    this.addTaskLog(taskId, 'info', 'Task queued for retry');

    // Execute the task
    this.executeTask(taskId);
    return true;
  }

  /**
   * Pause a running task
   */
  pauseTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== 'running') return false;

    task.status = 'pending';
    task.updated_at = new Date().toISOString();
    this.addTaskLog(taskId, 'warning', 'Task paused by user');

    console.log(`⏸️ Task paused: ${task.name}`);
    return true;
  }

  /**
   * Resume a paused task
   */
  resumeTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== 'pending') return false;

    this.executeTask(taskId);
    return true;
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  /**
   * Get task statistics
   */
  getTaskStatistics() {
    const tasks = Array.from(this.tasks.values());
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
      completedToday: tasks.filter(t => 
        t.status === 'completed' && 
        t.completed_at && 
        new Date(t.completed_at) >= today
      ).length,
      failedToday: tasks.filter(t => 
        t.status === 'failed' && 
        t.completed_at && 
        new Date(t.completed_at) >= today
      ).length,
    };
  }

  /**
   * Clean up completed tasks older than specified days
   */
  cleanupOldTasks(daysOld: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    let cleanedCount = 0;
    for (const [taskId, task] of this.tasks.entries()) {
      if (
        (task.status === 'completed' || task.status === 'cancelled') &&
        task.completed_at &&
        new Date(task.completed_at) < cutoffDate
      ) {
        this.tasks.delete(taskId);
        cleanedCount++;
      }
    }
    
    console.log(`🧹 Cleaned up ${cleanedCount} old tasks`);
    return cleanedCount;
  }
}

// Export singleton instance
export const agentOrchestrationEngine = new AgentOrchestrationEngineService();
export default agentOrchestrationEngine;