import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TaskScheduler } from '@/components/ui/task-scheduler';
import { TaskList } from '@/components/ui/task-list';
import { agentOrchestrationEngine, type TaskUpdateEvent } from '@/services/AgentOrchestrationEngineService';
import { 
  useTasks,
  useOrchestrationStatus,
  useCreateTask,
  useCancelTask,
  useRetryTask,
  usePauseTask,
  useResumeTask,
  useTaskStatistics,
  useStartOrchestration,
  useStopOrchestration
} from '@/hooks/useOrchestration';
import { 
  FolderOpen, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Zap,
  MessageSquare,
  Settings,
  Play,
  Pause
} from 'lucide-react';
import { toast } from 'sonner';
import type { CreateTaskRequest } from '@/types';

export default function DashboardPage() {
  // React Query hooks
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useTasks();
  const { data: orchestrationStatus } = useOrchestrationStatus();
  const { data: taskStats } = useTaskStatistics();
  
  // Mutation hooks
  const createTaskMutation = useCreateTask();
  const cancelTaskMutation = useCancelTask();
  const retryTaskMutation = useRetryTask();
  const pauseTaskMutation = usePauseTask();
  const resumeTaskMutation = useResumeTask();
  const startOrchestrationMutation = useStartOrchestration();
  const stopOrchestrationMutation = useStopOrchestration();

  // Local state
  const [isOrchestrationRunning, setIsOrchestrationRunning] = useState(false);

  // Initialize orchestration engine
  useEffect(() => {
    const initializeOrchestration = async () => {
      try {
        await agentOrchestrationEngine.initializeAgents();
        setIsOrchestrationRunning(true);
      } catch (error) {
        console.error('Failed to initialize orchestration engine:', error);
        toast.error('Failed to initialize orchestration engine');
      }
    };

    initializeOrchestration();
  }, []);

  // Set up real-time updates via event listeners
  useEffect(() => {
    const handleTaskUpdate = (event: TaskUpdateEvent) => {
      console.log('Task update received:', event);
      
      // Show toast notifications for important events
      switch (event.type) {
        case 'task_completed':
          toast.success(`Task "${event.task?.name}" completed successfully`);
          break;
        case 'task_failed':
          toast.error(`Task "${event.task?.name}" failed: ${event.error || 'Unknown error'}`);
          break;
        case 'task_cancelled':
          toast.info(`Task "${event.task?.name}" was cancelled`);
          break;
      }
    };

    agentOrchestrationEngine.addEventListener(handleTaskUpdate);
    
    return () => {
      agentOrchestrationEngine.removeEventListener(handleTaskUpdate);
    };
  }, []);

  // Handle task creation
  const handleTaskCreated = useCallback(async (taskData: CreateTaskRequest) => {
    try {
      const newTask = await agentOrchestrationEngine.scheduleTask(taskData);
      console.log('Task created successfully:', newTask);
    } catch (error) {
      console.error('Failed to create task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to create task: ${errorMessage}`);
    }
  }, []);

  // Handle task actions
  const handleTaskAction = useCallback(async (taskId: string, action: 'start' | 'stop' | 'retry' | 'cancel') => {
    try {
      switch (action) {
        case 'start':
          resumeTaskMutation.mutate(taskId);
          break;
        case 'stop':
          pauseTaskMutation.mutate(taskId);
          break;
        case 'retry':
          retryTaskMutation.mutate(taskId);
          break;
        case 'cancel':
          cancelTaskMutation.mutate(taskId);
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} task:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to ${action} task: ${errorMessage}`);
    }
  }, [cancelTaskMutation, retryTaskMutation, pauseTaskMutation, resumeTaskMutation]);

  // Handle orchestration control
  const handleOrchestrationToggle = useCallback(() => {
    try {
      if (isOrchestrationRunning) {
        stopOrchestrationMutation.mutate();
        setIsOrchestrationRunning(false);
      } else {
        startOrchestrationMutation.mutate();
        setIsOrchestrationRunning(true);
      }
    } catch (error) {
      console.error('Failed to toggle orchestration:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to toggle orchestration: ${errorMessage}`);
    }
  }, [isOrchestrationRunning, startOrchestrationMutation, stopOrchestrationMutation]);

  // Stats including orchestration metrics - memoized for performance
  const stats = useMemo(() => [
    {
      title: 'Active Projects',
      value: '12',
      change: '+2 this week',
      changeType: 'positive' as const,
      icon: FolderOpen,
      color: 'text-blue-500'
    },
    {
      title: 'Running Tasks',
      value: orchestrationStatus?.active_tasks?.toString() || '0',
      change: `${taskStats?.completedToday || 0} completed today`,
      changeType: 'positive' as const,
      icon: Play,
      color: 'text-green-500'
    },
    {
      title: 'Total Tasks',
      value: taskStats?.total?.toString() || '0',
      change: `${taskStats?.completedToday || 0} completed today`,
      changeType: 'positive' as const,
      icon: Zap,
      color: 'text-purple-500'
    },
    {
      title: 'Failed Tasks',
      value: taskStats?.failedToday?.toString() || '0',
      change: (taskStats?.failedToday || 0) > 0 ? 'Needs attention' : 'All good',
      changeType: ((taskStats?.failedToday || 0) > 0 ? 'negative' : 'positive') as 'positive' | 'negative',
      icon: AlertCircle,
      color: (taskStats?.failedToday || 0) > 0 ? 'text-red-500' : 'text-green-500'
    }
  ], [orchestrationStatus?.active_tasks, taskStats?.completedToday, taskStats?.total, taskStats?.failedToday]);

  const recentProjects = [
    {
      id: '1',
      name: 'E-commerce Platform',
      client: 'TechCorp',
      status: 'active',
      progress: 75,
      dueDate: '2024-02-15',
      assignee: 'Sarah Chen'
    },
    {
      id: '2',
      name: 'Mobile App Redesign',
      client: 'StartupXYZ',
      status: 'in_progress',
      progress: 45,
      dueDate: '2024-02-28',
      assignee: 'Mike Johnson'
    },
    {
      id: '3',
      name: 'API Integration',
      client: 'DataFlow Inc',
      status: 'review',
      progress: 90,
      dueDate: '2024-02-10',
      assignee: 'Emily Davis'
    }
  ];

  const agentActivity = [
    {
      agent: 'Intake Agent',
      action: 'Generated proposal for new lead',
      time: '2 minutes ago',
      status: 'completed',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      agent: 'PM Agent',
      action: 'Created 15 tasks for sprint planning',
      time: '15 minutes ago',
      status: 'completed',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      agent: 'Launch Agent',
      action: 'Deployed staging environment',
      time: '1 hour ago',
      status: 'completed',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      agent: 'Support Agent',
      action: 'Escalated high-priority ticket',
      time: '2 hours ago',
      status: 'warning',
      icon: AlertCircle,
      color: 'text-orange-500'
    }
  ];


  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, Sarah! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your projects and AI agents today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card 
              key={index}
              className="card-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className={`text-sm ${
                      stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Agent Orchestration Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Agent Orchestration</h2>
              <p className="text-muted-foreground">
                Manage and monitor your automated AI agents and their tasks.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={isOrchestrationRunning ? 'success' : 'secondary'}
                className="text-xs"
              >
                {isOrchestrationRunning ? 'Running' : 'Stopped'}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={handleOrchestrationToggle}
                disabled={startOrchestrationMutation.isPending || stopOrchestrationMutation.isPending}
              >
                {isOrchestrationRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Task Scheduler */}
            <TaskScheduler 
              onTaskCreated={handleTaskCreated}
              className="animate-fade-in-up"
              isLoading={createTaskMutation.isPending}
            />

            {/* Task List */}
            <TaskList 
              tasks={tasks}
              onTaskAction={handleTaskAction}
              className="animate-fade-in-up"
              isLoading={tasksLoading}
              error={tasksError}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <Card className="animate-fade-in-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Projects</CardTitle>
                  <Link 
                    to="/projects" 
                    className="text-primary hover:text-primary/80 transition-colors text-sm font-medium inline-flex items-center"
                  >
                    View all
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjects.map((project, index) => (
                    <div 
                      key={project.id}
                      className="p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">{project.name}</h3>
                        <Badge variant={project.status === 'active' ? 'success' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {project.client} • {project.assignee}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-foreground font-medium">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Due {new Date(project.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agent Activity Feed */}
          <div className="lg:col-span-1">
            <Card className="animate-fade-in-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Agent Activity</CardTitle>
                  <Settings className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agentActivity.map((activity, index) => (
                    <div 
                      key={index}
                      className="flex items-start space-x-3 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={`w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ${activity.color}`}>
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {activity.agent}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/intake"
                className="p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-center group"
              >
                <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-foreground mb-1">Start Intake</h3>
                <p className="text-sm text-muted-foreground">Qualify new leads</p>
              </Link>
              
              <Link
                to="/spin-up"
                className="p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-center group"
              >
                <Zap className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-foreground mb-1">Project Spin-Up</h3>
                <p className="text-sm text-muted-foreground">Auto-setup project</p>
              </Link>
              
              <Link
                to="/projects/new"
                className="p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-center group"
              >
                <FolderOpen className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-foreground mb-1">New Project</h3>
                <p className="text-sm text-muted-foreground">Create project</p>
              </Link>
              
              <Link
                to="/analytics"
                className="p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-center group"
              >
                <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-foreground mb-1">Analytics</h3>
                <p className="text-sm text-muted-foreground">View insights</p>
              </Link>
              
              <Link
                to="/settings"
                className="p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-center group"
              >
                <Settings className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-foreground mb-1">Settings</h3>
                <p className="text-sm text-muted-foreground">Configure agents</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
