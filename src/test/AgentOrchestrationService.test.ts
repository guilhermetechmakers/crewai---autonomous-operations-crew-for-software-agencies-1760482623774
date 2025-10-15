import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { agentOrchestrationEngine } from '@/services/AgentOrchestrationEngineService';
import type { CreateTaskRequest, AgentTask } from '@/types';

// Mock console methods to avoid noise in tests
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

// Mock the console object
Object.defineProperty(console, 'log', { value: mockConsole.log });
Object.defineProperty(console, 'error', { value: mockConsole.error });
Object.defineProperty(console, 'warn', { value: mockConsole.warn });

describe('AgentOrchestrationEngineService', () => {
  beforeEach(() => {
    // Clear all tasks and reset the engine state
    agentOrchestrationEngine['tasks'].clear();
    agentOrchestrationEngine['schedules'].clear();
    agentOrchestrationEngine['isRunning'] = false;
    agentOrchestrationEngine['intervalId'] = null;
    agentOrchestrationEngine['listeners'].clear();
  });

  afterEach(() => {
    // Clean up any running intervals
    if (agentOrchestrationEngine['intervalId']) {
      clearInterval(agentOrchestrationEngine['intervalId']);
      agentOrchestrationEngine['intervalId'] = null;
    }
    agentOrchestrationEngine['isRunning'] = false;
  });

  describe('Task Scheduling', () => {
    it('should schedule a new task successfully', async () => {
      const taskData: CreateTaskRequest = {
        name: 'Test Task',
        description: 'A test task for unit testing',
        priority: 'medium',
        agent_type: 'intake',
      };

      const task = await agentOrchestrationEngine.scheduleTask(taskData);

      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.name).toBe(taskData.name);
      expect(task.description).toBe(taskData.description);
      expect(task.priority).toBe(taskData.priority);
      expect(task.agent_type).toBe(taskData.agent_type);
      expect(task.status).toBe('pending');
      expect(task.progress).toBe(0);
      expect(task.logs).toEqual([]);
    });

    it('should schedule a task with immediate execution', async () => {
      const taskData: CreateTaskRequest = {
        name: 'Immediate Task',
        description: 'A task that should run immediately',
        priority: 'high',
        agent_type: 'spin_up',
      };

      const task = await agentOrchestrationEngine.scheduleTask(taskData);

      expect(task.status).toBe('pending');
      // The task should be queued for immediate execution
      expect(agentOrchestrationEngine.getTasks()).toHaveLength(1);
    });

    it('should schedule a recurring task with cron expression', async () => {
      const taskData: CreateTaskRequest = {
        name: 'Recurring Task',
        description: 'A task that runs on schedule',
        priority: 'low',
        agent_type: 'pm',
        cron_expression: '0 9 * * 1-5', // Every weekday at 9 AM
        timezone: 'UTC',
      };

      const task = await agentOrchestrationEngine.scheduleTask(taskData);

      expect(task).toBeDefined();
      expect(agentOrchestrationEngine['schedules'].size).toBe(1);
      
      const schedule = Array.from(agentOrchestrationEngine['schedules'].values())[0];
      expect(schedule.task_id).toBe(task.id);
      expect(schedule.cron_expression).toBe('0 9 * * 1-5');
      expect(schedule.timezone).toBe('UTC');
      expect(schedule.is_active).toBe(true);
    });

    it('should schedule multiple tasks in batch', async () => {
      const tasksData: CreateTaskRequest[] = [
        {
          name: 'Batch Task 1',
          description: 'First batch task',
          priority: 'medium',
          agent_type: 'intake',
        },
        {
          name: 'Batch Task 2',
          description: 'Second batch task',
          priority: 'high',
          agent_type: 'launch',
        },
      ];

      const tasks = await agentOrchestrationEngine.scheduleBatchTasks(tasksData);

      expect(tasks).toHaveLength(2);
      expect(tasks[0].name).toBe('Batch Task 1');
      expect(tasks[1].name).toBe('Batch Task 2');
      expect(agentOrchestrationEngine.getTasks()).toHaveLength(2);
    });
  });

  describe('Task Management', () => {
    let testTask: AgentTask;

    beforeEach(async () => {
      const taskData: CreateTaskRequest = {
        name: 'Test Task',
        description: 'A test task for management operations',
        priority: 'medium',
        agent_type: 'intake',
      };
      testTask = await agentOrchestrationEngine.scheduleTask(taskData);
    });

    it('should get all tasks', () => {
      const tasks = agentOrchestrationEngine.getTasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe(testTask.id);
    });

    it('should get task by ID', () => {
      const task = agentOrchestrationEngine.getTask(testTask.id);
      expect(task).toBeDefined();
      expect(task?.id).toBe(testTask.id);
    });

    it('should return undefined for non-existent task', () => {
      const task = agentOrchestrationEngine.getTask('non-existent-id');
      expect(task).toBeUndefined();
    });

    it('should get tasks by status', async () => {
      // Create another task with different status
      const taskData2: CreateTaskRequest = {
        name: 'Running Task',
        description: 'A task that will be running',
        priority: 'high',
        agent_type: 'spin_up',
      };
      const runningTask = await agentOrchestrationEngine.scheduleTask(taskData2);
      
      // Manually set status to running
      runningTask.status = 'running';
      agentOrchestrationEngine['tasks'].set(runningTask.id, runningTask);

      const pendingTasks = agentOrchestrationEngine.getTasksByStatus('pending');
      const runningTasks = agentOrchestrationEngine.getTasksByStatus('running');

      expect(pendingTasks).toHaveLength(1);
      expect(pendingTasks[0].id).toBe(testTask.id);
      expect(runningTasks).toHaveLength(1);
      expect(runningTasks[0].id).toBe(runningTask.id);
    });

    it('should get tasks by agent type', async () => {
      const taskData2: CreateTaskRequest = {
        name: 'PM Task',
        description: 'A PM agent task',
        priority: 'medium',
        agent_type: 'pm',
      };
      await agentOrchestrationEngine.scheduleTask(taskData2);

      const intakeTasks = agentOrchestrationEngine.getTasksByAgentType('intake');
      const pmTasks = agentOrchestrationEngine.getTasksByAgentType('pm');

      expect(intakeTasks).toHaveLength(1);
      expect(intakeTasks[0].agent_type).toBe('intake');
      expect(pmTasks).toHaveLength(1);
      expect(pmTasks[0].agent_type).toBe('pm');
    });

    it('should get tasks by priority', async () => {
      const taskData2: CreateTaskRequest = {
        name: 'High Priority Task',
        description: 'A high priority task',
        priority: 'high',
        agent_type: 'intake',
      };
      await agentOrchestrationEngine.scheduleTask(taskData2);

      const mediumTasks = agentOrchestrationEngine.getTasksByPriority('medium');
      const highTasks = agentOrchestrationEngine.getTasksByPriority('high');

      expect(mediumTasks).toHaveLength(1);
      expect(mediumTasks[0].priority).toBe('medium');
      expect(highTasks).toHaveLength(1);
      expect(highTasks[0].priority).toBe('high');
    });
  });

  describe('Task Actions', () => {
    let testTask: AgentTask;

    beforeEach(async () => {
      const taskData: CreateTaskRequest = {
        name: 'Test Task',
        description: 'A test task for actions',
        priority: 'medium',
        agent_type: 'intake',
      };
      testTask = await agentOrchestrationEngine.scheduleTask(taskData);
    });

    it('should cancel a task', () => {
      const result = agentOrchestrationEngine.cancelTask(testTask.id);
      expect(result).toBe(true);

      const task = agentOrchestrationEngine.getTask(testTask.id);
      expect(task?.status).toBe('cancelled');
    });

    it('should not cancel a completed task', () => {
      testTask.status = 'completed';
      agentOrchestrationEngine['tasks'].set(testTask.id, testTask);

      const result = agentOrchestrationEngine.cancelTask(testTask.id);
      expect(result).toBe(false);
    });

    it('should retry a failed task', () => {
      testTask.status = 'failed';
      agentOrchestrationEngine['tasks'].set(testTask.id, testTask);

      const result = agentOrchestrationEngine.retryTask(testTask.id);
      expect(result).toBe(true);

      const task = agentOrchestrationEngine.getTask(testTask.id);
      expect(task?.status).toBe('pending');
      expect(task?.progress).toBe(0);
    });

    it('should not retry a non-failed task', () => {
      const result = agentOrchestrationEngine.retryTask(testTask.id);
      expect(result).toBe(false);
    });

    it('should pause a running task', () => {
      testTask.status = 'running';
      agentOrchestrationEngine['tasks'].set(testTask.id, testTask);

      const result = agentOrchestrationEngine.pauseTask(testTask.id);
      expect(result).toBe(true);

      const task = agentOrchestrationEngine.getTask(testTask.id);
      expect(task?.status).toBe('pending');
    });

    it('should not pause a non-running task', () => {
      const result = agentOrchestrationEngine.pauseTask(testTask.id);
      expect(result).toBe(false);
    });

    it('should resume a paused task', () => {
      testTask.status = 'pending';
      testTask.started_at = new Date().toISOString();
      agentOrchestrationEngine['tasks'].set(testTask.id, testTask);

      const result = agentOrchestrationEngine.resumeTask(testTask.id);
      expect(result).toBe(true);
    });

    it('should not resume a non-pending task', () => {
      const result = agentOrchestrationEngine.resumeTask(testTask.id);
      expect(result).toBe(false);
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(async () => {
      // Create multiple tasks with different statuses
      const tasksData: CreateTaskRequest[] = [
        { name: 'Task 1', description: 'Task 1', priority: 'medium', agent_type: 'intake' },
        { name: 'Task 2', description: 'Task 2', priority: 'high', agent_type: 'spin_up' },
        { name: 'Task 3', description: 'Task 3', priority: 'low', agent_type: 'pm' },
      ];

      for (const taskData of tasksData) {
        const task = await agentOrchestrationEngine.scheduleTask(taskData);
        // Set different statuses
        if (task.name === 'Task 2') {
          task.status = 'running';
          agentOrchestrationEngine['tasks'].set(task.id, task);
        }
      }
    });

    it('should pause all running tasks', () => {
      const pausedCount = agentOrchestrationEngine.pauseAllTasks();
      expect(pausedCount).toBe(1);

      const runningTasks = agentOrchestrationEngine.getTasksByStatus('running');
      expect(runningTasks).toHaveLength(0);
    });

    it('should resume all paused tasks', () => {
      // First pause all running tasks
      agentOrchestrationEngine.pauseAllTasks();
      
      // Set one task as previously started
      const tasks = agentOrchestrationEngine.getTasks();
      const taskToResume = tasks[0];
      taskToResume.started_at = new Date().toISOString();
      agentOrchestrationEngine['tasks'].set(taskToResume.id, taskToResume);

      const resumedCount = agentOrchestrationEngine.resumeAllTasks();
      expect(resumedCount).toBe(1);
    });

    it('should cleanup old tasks', () => {
      // Create an old completed task
      const oldTask: AgentTask = {
        id: 'old-task',
        name: 'Old Task',
        description: 'An old completed task',
        status: 'completed',
        priority: 'medium',
        agent_type: 'intake',
        progress: 100,
        logs: [],
        created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago
        updated_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      };
      agentOrchestrationEngine['tasks'].set(oldTask.id, oldTask);

      const cleanedCount = agentOrchestrationEngine.cleanupOldTasks(30);
      expect(cleanedCount).toBe(1);
      expect(agentOrchestrationEngine.getTask(oldTask.id)).toBeUndefined();
    });
  });

  describe('Health Metrics', () => {
    beforeEach(async () => {
      // Create various tasks for metrics testing
      const tasksData: CreateTaskRequest[] = [
        { name: 'Task 1', description: 'Task 1', priority: 'medium', agent_type: 'intake' },
        { name: 'Task 2', description: 'Task 2', priority: 'high', agent_type: 'spin_up' },
        { name: 'Task 3', description: 'Task 3', priority: 'low', agent_type: 'pm' },
      ];

      for (const taskData of tasksData) {
        const task = await agentOrchestrationEngine.scheduleTask(taskData);
        // Set different statuses and completion times
        if (task.name === 'Task 1') {
          task.status = 'completed';
          task.started_at = new Date(Date.now() - 1000).toISOString();
          task.completed_at = new Date().toISOString();
          agentOrchestrationEngine['tasks'].set(task.id, task);
        } else if (task.name === 'Task 2') {
          task.status = 'running';
          agentOrchestrationEngine['tasks'].set(task.id, task);
        }
      }
    });

    it('should calculate health metrics correctly', () => {
      const metrics = agentOrchestrationEngine.getHealthMetrics();

      expect(metrics.totalTasks).toBe(3);
      expect(metrics.activeTasks).toBe(1);
      expect(metrics.pendingTasks).toBe(1);
      expect(metrics.completedTasks).toBe(1);
      expect(metrics.failedTasks).toBe(0);
      expect(metrics.successRate).toBeGreaterThan(0);
      expect(metrics.avgExecutionTimeMs).toBeGreaterThan(0);
      expect(typeof metrics.isHealthy).toBe('boolean');
    });

    it('should calculate agent performance metrics correctly', () => {
      const performance = agentOrchestrationEngine.getAgentPerformanceMetrics();

      expect(Array.isArray(performance)).toBe(true);
      expect(performance.length).toBe(6); // All agent types

      const intakePerformance = performance.find(p => p.agentType === 'intake');
      expect(intakePerformance).toBeDefined();
      expect(intakePerformance?.totalTasks).toBe(1);
      expect(intakePerformance?.completedTasks).toBe(1);
      expect(intakePerformance?.successRate).toBe(100);
    });
  });

  describe('Data Export', () => {
    beforeEach(async () => {
      const taskData: CreateTaskRequest = {
        name: 'Export Test Task',
        description: 'A task for testing export functionality',
        priority: 'medium',
        agent_type: 'intake',
      };
      await agentOrchestrationEngine.scheduleTask(taskData);
    });

    it('should export data as JSON', () => {
      const jsonData = agentOrchestrationEngine.exportTaskData('json');
      expect(jsonData).toBeDefined();
      
      const parsed = JSON.parse(jsonData);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(1);
      expect(parsed[0].name).toBe('Export Test Task');
    });

    it('should export data as CSV', () => {
      const csvData = agentOrchestrationEngine.exportTaskData('csv');
      expect(csvData).toBeDefined();
      expect(csvData).toContain('id,name,description,status,priority,agent_type');
      expect(csvData).toContain('Export Test Task');
    });
  });

  describe('Event System', () => {
    it('should emit task update events', async () => {
      const eventListener = vi.fn();
      agentOrchestrationEngine.addEventListener(eventListener);

      const taskData: CreateTaskRequest = {
        name: 'Event Test Task',
        description: 'A task for testing events',
        priority: 'medium',
        agent_type: 'intake',
      };

      await agentOrchestrationEngine.scheduleTask(taskData);

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'task_created',
          taskId: expect.any(String),
          task: expect.any(Object),
        })
      );

      agentOrchestrationEngine.removeEventListener(eventListener);
    });

    it('should remove event listeners', () => {
      const eventListener = vi.fn();
      agentOrchestrationEngine.addEventListener(eventListener);
      agentOrchestrationEngine.removeEventListener(eventListener);

      // The listener should not be called after removal
      agentOrchestrationEngine['emitTaskUpdate']({
        type: 'task_created',
        taskId: 'test',
      });

      expect(eventListener).not.toHaveBeenCalled();
    });
  });

  describe('Orchestration Control', () => {
    it('should start orchestration', () => {
      agentOrchestrationEngine['startOrchestration']();
      expect(agentOrchestrationEngine['isRunning']).toBe(true);
      expect(agentOrchestrationEngine['intervalId']).toBeDefined();
    });

    it('should stop orchestration', () => {
      agentOrchestrationEngine['startOrchestration']();
      agentOrchestrationEngine.stopOrchestration();
      
      expect(agentOrchestrationEngine['isRunning']).toBe(false);
      expect(agentOrchestrationEngine['intervalId']).toBeNull();
    });

    it('should get orchestration status', () => {
      const status = agentOrchestrationEngine.getStatus();
      
      expect(status).toBeDefined();
      expect(typeof status.is_running).toBe('boolean');
      expect(typeof status.active_tasks).toBe('number');
      expect(typeof status.completed_tasks_today).toBe('number');
      expect(typeof status.failed_tasks_today).toBe('number');
      expect(typeof status.agents_status).toBe('object');
      expect(typeof status.last_activity).toBe('string');
    });
  });

  describe('Task Statistics', () => {
    beforeEach(async () => {
      // Create tasks with different statuses and dates
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const tasksData: CreateTaskRequest[] = [
        { name: 'Today Task 1', description: 'Task 1', priority: 'medium', agent_type: 'intake' },
        { name: 'Today Task 2', description: 'Task 2', priority: 'high', agent_type: 'spin_up' },
        { name: 'Today Task 3', description: 'Task 3', priority: 'low', agent_type: 'pm' },
      ];

      for (let i = 0; i < tasksData.length; i++) {
        const task = await agentOrchestrationEngine.scheduleTask(tasksData[i]);
        
        // Set different statuses
        if (i === 0) {
          task.status = 'completed';
          task.completed_at = today.toISOString();
        } else if (i === 1) {
          task.status = 'failed';
          task.completed_at = today.toISOString();
        }
        // Task 2 remains pending
        
        agentOrchestrationEngine['tasks'].set(task.id, task);
      }
    });

    it('should calculate task statistics correctly', () => {
      const stats = agentOrchestrationEngine.getTaskStatistics();

      expect(stats.total).toBe(3);
      expect(stats.pending).toBe(1);
      expect(stats.running).toBe(0);
      expect(stats.completed).toBe(1);
      expect(stats.failed).toBe(1);
      expect(stats.cancelled).toBe(0);
      expect(stats.completedToday).toBe(1);
      expect(stats.failedToday).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle task scheduling errors gracefully', async () => {
      // Mock a scenario where task creation fails
      const originalScheduleTask = agentOrchestrationEngine.scheduleTask;
      agentOrchestrationEngine.scheduleTask = vi.fn().mockRejectedValue(new Error('Scheduling failed'));

      await expect(agentOrchestrationEngine.scheduleTask({} as CreateTaskRequest))
        .rejects.toThrow('Task scheduling failed');

      // Restore original method
      agentOrchestrationEngine.scheduleTask = originalScheduleTask;
    });

    it('should handle event listener errors gracefully', () => {
      const errorListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      const normalListener = vi.fn();

      agentOrchestrationEngine.addEventListener(errorListener);
      agentOrchestrationEngine.addEventListener(normalListener);

      // This should not throw an error
      expect(() => {
        agentOrchestrationEngine['emitTaskUpdate']({
          type: 'task_created',
          taskId: 'test',
        });
      }).not.toThrow();

      // Normal listener should still be called
      expect(normalListener).toHaveBeenCalled();
    });
  });
});
