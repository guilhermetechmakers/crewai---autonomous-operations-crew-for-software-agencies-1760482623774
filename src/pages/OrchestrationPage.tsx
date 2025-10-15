import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { TaskScheduler } from '@/components/ui/task-scheduler';
import { TaskList } from '@/components/ui/task-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { agentOrchestrationEngine } from '@/services/AgentOrchestrationEngineService';
import { agentOrchestrationApi } from '@/api/agentOrchestration';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  Play,
  Pause,
  Zap,
  Activity,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Download,
  RefreshCw,
  Settings,
  TrendingUp,
  Users
} from 'lucide-react';
import type { AgentTask, CreateTaskRequest, AgentOrchestrationStatus } from '@/types';

export default function OrchestrationPage() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [orchestrationStatus, setOrchestrationStatus] = useState<AgentOrchestrationStatus>(agentOrchestrationEngine.getStatus());
  const [isOrchestrationRunning, setIsOrchestrationRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [healthMetrics, setHealthMetrics] = useState<any>(null);
  const [agentPerformance, setAgentPerformance] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus] = useState<string>('all');
  const [filterAgentType] = useState<string>('all');

  // Load health metrics and performance data
  const loadMetrics = useCallback(async () => {
    try {
      const [healthData, performanceData] = await Promise.all([
        agentOrchestrationApi.getHealthMetrics(),
        agentOrchestrationApi.getAgentPerformanceMetrics()
      ]);
      setHealthMetrics(healthData);
      setAgentPerformance(performanceData);
    } catch (error) {
      console.error('Failed to load metrics:', error);
      // Fallback to local data
      setHealthMetrics(agentOrchestrationEngine.getHealthMetrics());
      setAgentPerformance(agentOrchestrationEngine.getAgentPerformanceMetrics());
    }
  }, []);

  // Initialize orchestration engine and load tasks
  useEffect(() => {
    const initializeOrchestration = async () => {
      setIsLoading(true);
      try {
        await agentOrchestrationEngine.initializeAgents();
        setTasks(agentOrchestrationEngine.getTasks());
        setOrchestrationStatus(agentOrchestrationEngine.getStatus());
        setIsOrchestrationRunning(true);
        await loadMetrics();
        toast.success('Agent Orchestration Engine initialized successfully');
      } catch (error) {
        console.error('Failed to initialize orchestration engine:', error);
        toast.error('Failed to initialize orchestration engine');
      } finally {
        setIsLoading(false);
      }
    };

    initializeOrchestration();

    // Set up real-time event listeners
    const handleTaskUpdate = (event: any) => {
      setTasks(agentOrchestrationEngine.getTasks());
      setOrchestrationStatus(agentOrchestrationEngine.getStatus());
      
      // Show toast notifications for important events
      switch (event.type) {
        case 'task_completed':
          toast.success(`Task completed: ${event.task?.name}`);
          break;
        case 'task_failed':
          toast.error(`Task failed: ${event.task?.name}`);
          break;
        case 'task_cancelled':
          toast.warning(`Task cancelled: ${event.task?.name}`);
          break;
      }
    };

    agentOrchestrationEngine.addEventListener(handleTaskUpdate);

    // Set up periodic updates for metrics
    const interval = setInterval(() => {
      setTasks(agentOrchestrationEngine.getTasks());
      setOrchestrationStatus(agentOrchestrationEngine.getStatus());
      loadMetrics();
    }, 10000); // Update every 10 seconds

    return () => {
      clearInterval(interval);
      agentOrchestrationEngine.removeEventListener(handleTaskUpdate);
    };
  }, [loadMetrics]);

  // Handle task creation
  const handleTaskCreated = async (taskData: CreateTaskRequest) => {
    try {
      const newTask = await agentOrchestrationEngine.scheduleTask(taskData);
      setTasks(agentOrchestrationEngine.getTasks());
      setOrchestrationStatus(agentOrchestrationEngine.getStatus());
      toast.success(`Task created: ${newTask.name}`);
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
    }
  };

  // Handle task actions
  const handleTaskAction = async (taskId: string, action: 'start' | 'stop' | 'retry' | 'cancel') => {
    try {
      let success = false;
      switch (action) {
        case 'start':
          success = agentOrchestrationEngine.resumeTask(taskId);
          if (success) toast.success('Task started');
          break;
        case 'stop':
          success = agentOrchestrationEngine.pauseTask(taskId);
          if (success) toast.warning('Task paused');
          break;
        case 'retry':
          success = agentOrchestrationEngine.retryTask(taskId);
          if (success) toast.success('Task queued for retry');
          break;
        case 'cancel':
          success = agentOrchestrationEngine.cancelTask(taskId);
          if (success) toast.warning('Task cancelled');
          break;
      }
      
      if (success) {
        setTasks(agentOrchestrationEngine.getTasks());
        setOrchestrationStatus(agentOrchestrationEngine.getStatus());
      } else {
        toast.error(`Failed to ${action} task`);
      }
    } catch (error) {
      console.error(`Failed to ${action} task:`, error);
      toast.error(`Failed to ${action} task`);
    }
  };

  // Handle bulk operations
  const handleBulkAction = async (action: 'pause_all' | 'resume_all' | 'cleanup') => {
    try {
      let result;
      switch (action) {
        case 'pause_all':
          result = agentOrchestrationEngine.pauseAllTasks();
          toast.success(`Paused ${result} tasks`);
          break;
        case 'resume_all':
          result = agentOrchestrationEngine.resumeAllTasks();
          toast.success(`Resumed ${result} tasks`);
          break;
        case 'cleanup':
          result = agentOrchestrationEngine.cleanupOldTasks(30);
          toast.success(`Cleaned up ${result} old tasks`);
          break;
      }
      setTasks(agentOrchestrationEngine.getTasks());
      setOrchestrationStatus(agentOrchestrationEngine.getStatus());
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
      toast.error(`Failed to ${action}`);
    }
  };

  // Export task data
  const handleExportData = (format: 'json' | 'csv' = 'json') => {
    try {
      const data = agentOrchestrationEngine.exportTaskData(format);
      const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agent-tasks-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export data');
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterAgentType !== 'all' && task.agent_type !== filterAgentType) return false;
    return true;
  });

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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
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
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadMetrics()}
                disabled={isLoading}
                className="h-10"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportData('json')}
                className="h-10"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('cleanup')}
                className="h-10"
              >
                <Settings className="h-4 w-4 mr-2" />
                Cleanup
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            {/* Task Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Task Scheduler */}
              <TaskScheduler 
                onTaskCreated={handleTaskCreated}
                className="animate-fade-in-up"
              />

              {/* Task List */}
              <TaskList 
                tasks={filteredTasks}
                onTaskAction={handleTaskAction}
                className="animate-fade-in-up"
                isLoading={isLoading}
              />
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Health Metrics */}
              <Card className="animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Health Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {healthMetrics ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 rounded-lg bg-secondary/50">
                          <div className="text-2xl font-bold text-foreground">{healthMetrics.successRate}%</div>
                          <div className="text-sm text-muted-foreground">Success Rate</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-secondary/50">
                          <div className="text-2xl font-bold text-foreground">{Math.round(healthMetrics.avgExecutionTimeMs / 1000)}s</div>
                          <div className="text-sm text-muted-foreground">Avg Execution Time</div>
                        </div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-secondary/50">
                        <div className="text-2xl font-bold text-foreground">{healthMetrics.dailyActivity}</div>
                        <div className="text-sm text-muted-foreground">Daily Activity</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading metrics...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Agent Performance */}
              <Card className="animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Agent Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {agentPerformance.length > 0 ? (
                    <div className="space-y-3">
                      {agentPerformance.map((agent) => (
                        <div key={agent.agentType} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${agent.isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="font-medium capitalize">{agent.agentType.replace('_', ' ')}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{agent.successRate}%</div>
                            <div className="text-xs text-muted-foreground">{agent.totalTasks} tasks</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading performance data...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Orchestration Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Bulk Operations</h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        onClick={() => handleBulkAction('pause_all')}
                        className="w-full justify-start"
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pause All Tasks
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleBulkAction('resume_all')}
                        className="w-full justify-start"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Resume All Tasks
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleBulkAction('cleanup')}
                        className="w-full justify-start"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Cleanup Old Tasks
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Data Export</h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        onClick={() => handleExportData('json')}
                        className="w-full justify-start"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export as JSON
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleExportData('csv')}
                        className="w-full justify-start"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export as CSV
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}