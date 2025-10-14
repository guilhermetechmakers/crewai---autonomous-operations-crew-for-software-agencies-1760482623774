import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { TaskScheduler } from '@/components/ui/task-scheduler';
import { TaskList } from '@/components/ui/task-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { agentOrchestrationEngine } from '@/services/AgentOrchestrationEngineService';
import { cn } from '@/lib/utils';
import { 
  Play,
  Pause,
  Zap,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { AgentTask, CreateTaskRequest, AgentOrchestrationStatus } from '@/types';

export default function OrchestrationPage() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [orchestrationStatus, setOrchestrationStatus] = useState<AgentOrchestrationStatus>(agentOrchestrationEngine.getStatus());
  const [isOrchestrationRunning, setIsOrchestrationRunning] = useState(false);

  // Initialize orchestration engine and load tasks
  useEffect(() => {
    const initializeOrchestration = async () => {
      try {
        await agentOrchestrationEngine.initializeAgents();
        setTasks(agentOrchestrationEngine.getTasks());
        setOrchestrationStatus(agentOrchestrationEngine.getStatus());
        setIsOrchestrationRunning(true);
      } catch (error) {
        console.error('Failed to initialize orchestration engine:', error);
      }
    };

    initializeOrchestration();

    // Set up periodic updates
    const interval = setInterval(() => {
      setTasks(agentOrchestrationEngine.getTasks());
      setOrchestrationStatus(agentOrchestrationEngine.getStatus());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle task creation
  const handleTaskCreated = async (taskData: CreateTaskRequest) => {
    try {
      const newTask = await agentOrchestrationEngine.scheduleTask(taskData);
      setTasks(agentOrchestrationEngine.getTasks());
      setOrchestrationStatus(agentOrchestrationEngine.getStatus());
      console.log('Task created successfully:', newTask);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  // Handle task actions
  const handleTaskAction = async (taskId: string, action: 'start' | 'stop' | 'retry' | 'cancel') => {
    try {
      switch (action) {
        case 'start':
          // Start task execution
          break;
        case 'stop':
          // Pause task execution
          break;
        case 'retry':
          // Retry failed task
          break;
        case 'cancel':
          agentOrchestrationEngine.cancelTask(taskId);
          setTasks(agentOrchestrationEngine.getTasks());
          setOrchestrationStatus(agentOrchestrationEngine.getStatus());
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} task:`, error);
    }
  };

  const toggleOrchestration = () => {
    if (isOrchestrationRunning) {
      agentOrchestrationEngine.stopOrchestration();
      setIsOrchestrationRunning(false);
    } else {
      agentOrchestrationEngine.initializeAgents();
      setIsOrchestrationRunning(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Agent Orchestration
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor your automated AI agents and their tasks.
          </p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="animate-fade-in-up">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Orchestration Status
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {isOrchestrationRunning ? 'Running' : 'Stopped'}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isOrchestrationRunning ? 'bg-green-500/10' : 'bg-gray-500/10'
                }`}>
                  {isOrchestrationRunning ? (
                    <Play className="h-6 w-6 text-green-500" />
                  ) : (
                    <Pause className="h-6 w-6 text-gray-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Active Tasks
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {orchestrationStatus.active_tasks}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Completed Today
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {orchestrationStatus.completed_tasks_today}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Failed Today
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {orchestrationStatus.failed_tasks_today}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <Card className="animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Orchestration Control
              </CardTitle>
              <Badge 
                variant={isOrchestrationRunning ? 'success' : 'secondary'}
                className="text-xs"
              >
                {isOrchestrationRunning ? 'Running' : 'Stopped'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                onClick={toggleOrchestration}
                className={cn(
                  'min-w-[120px]',
                  isOrchestrationRunning 
                    ? 'bg-destructive hover:bg-destructive/90' 
                    : 'btn-primary'
                )}
              >
                {isOrchestrationRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Engine
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Engine
                  </>
                )}
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Last activity: {new Date(orchestrationStatus.last_activity).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Task Scheduler */}
          <TaskScheduler 
            onTaskCreated={handleTaskCreated}
            className="animate-fade-in-up"
          />

          {/* Task List */}
          <TaskList 
            tasks={tasks}
            onTaskAction={handleTaskAction}
            className="animate-fade-in-up"
          />
        </div>

        {/* Agent Status */}
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Agent Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(orchestrationStatus.agents_status).map(([agent, status]) => (
                <div
                  key={agent}
                  className="p-4 rounded-lg border border-border text-center"
                >
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    status === 'active' ? 'bg-green-500/10' : 
                    status === 'inactive' ? 'bg-gray-500/10' : 'bg-red-500/10'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'active' ? 'bg-green-500' : 
                      status === 'inactive' ? 'bg-gray-500' : 'bg-red-500'
                    }`} />
                  </div>
                  <h3 className="font-medium text-foreground capitalize mb-1">
                    {agent.replace('_', ' ')}
                  </h3>
                  <Badge 
                    className={cn(
                      'text-xs',
                      status === 'active' ? 'bg-green-500/20 text-green-400' :
                      status === 'inactive' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-red-500/20 text-red-400'
                    )}
                  >
                    {status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}