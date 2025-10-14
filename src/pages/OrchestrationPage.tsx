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
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">
                Agent Orchestration
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage and monitor your automated AI agents and their tasks with precision and control.
              </p>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="animate-fade-in-up group hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Orchestration Status
                  </p>
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {isOrchestrationRunning ? 'Running' : 'Stopped'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isOrchestrationRunning ? 'All systems operational' : 'Engine paused'}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                  isOrchestrationRunning 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/25' 
                    : 'bg-gradient-to-br from-gray-500 to-slate-500 shadow-lg'
                }`}>
                  {isOrchestrationRunning ? (
                    <Play className="h-7 w-7 text-white" />
                  ) : (
                    <Pause className="h-7 w-7 text-white" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up group hover:shadow-glow transition-all duration-300" style={{ animationDelay: '100ms' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Active Tasks
                  </p>
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {orchestrationStatus.active_tasks}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Currently executing
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-all duration-300">
                  <Activity className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up group hover:shadow-glow transition-all duration-300" style={{ animationDelay: '200ms' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Completed Today
                  </p>
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {orchestrationStatus.completed_tasks_today}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Successfully finished
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:scale-110 transition-all duration-300">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up group hover:shadow-glow transition-all duration-300" style={{ animationDelay: '300ms' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Failed Today
                  </p>
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {orchestrationStatus.failed_tasks_today}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {orchestrationStatus.failed_tasks_today > 0 ? 'Needs attention' : 'All good'}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 ${
                  orchestrationStatus.failed_tasks_today > 0
                    ? 'bg-gradient-to-br from-red-500 to-rose-500 shadow-red-500/25'
                    : 'bg-gradient-to-br from-gray-500 to-slate-500'
                }`}>
                  <AlertCircle className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <Card className="animate-fade-in-up group hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="gradient-text font-bold">Orchestration Control</div>
                  <p className="text-sm text-muted-foreground font-normal">Manage engine state and operations</p>
                </div>
              </CardTitle>
              <Badge 
                variant={isOrchestrationRunning ? 'success' : 'secondary'}
                className={cn(
                  'text-xs px-3 py-1 rounded-full',
                  isOrchestrationRunning 
                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                    : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                )}
              >
                {isOrchestrationRunning ? 'Running' : 'Stopped'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Button
                  onClick={toggleOrchestration}
                  className={cn(
                    'min-w-[140px] h-12 text-base font-semibold transition-all duration-300',
                    isOrchestrationRunning 
                      ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105' 
                      : 'btn-primary hover:scale-105'
                  )}
                >
                  {isOrchestrationRunning ? (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Stop Engine
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Start Engine
                    </>
                  )}
                </Button>
                
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-secondary/50 border border-border">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <div className="text-sm">
                    <span className="text-muted-foreground">Last activity: </span>
                    <span className="text-foreground font-medium">
                      {new Date(orchestrationStatus.last_activity).toLocaleString()}
                    </span>
                  </div>
                </div>
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
        <Card className="animate-fade-in-up group hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="gradient-text font-bold">Agent Status</div>
                <p className="text-sm text-muted-foreground font-normal">Monitor individual agent health and availability</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {Object.entries(orchestrationStatus.agents_status).map(([agent, status], index) => (
                <div
                  key={agent}
                  className="p-6 rounded-2xl border border-border text-center group hover:shadow-glow transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                    status === 'active' 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/25' 
                      : status === 'inactive' 
                      ? 'bg-gradient-to-br from-gray-500 to-slate-500 shadow-lg' 
                      : 'bg-gradient-to-br from-red-500 to-rose-500 shadow-lg shadow-red-500/25'
                  }`}>
                    <div className={`w-4 h-4 rounded-full ${
                      status === 'active' ? 'bg-white animate-pulse' : 
                      status === 'inactive' ? 'bg-white' : 'bg-white'
                    }`} />
                  </div>
                  <h3 className="font-semibold text-foreground capitalize mb-2 text-sm">
                    {agent.replace('_', ' ')}
                  </h3>
                  <Badge 
                    className={cn(
                      'text-xs px-3 py-1 rounded-full font-medium',
                      status === 'active' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : status === 'inactive' 
                        ? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
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