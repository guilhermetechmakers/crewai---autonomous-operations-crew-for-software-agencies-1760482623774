import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play,
  Pause,
  Square,
  RotateCcw,
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  MessageSquare,
  FolderOpen,
  Rocket,
  Handshake,
  Headphones
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentTask } from '@/types';

interface TaskListProps {
  tasks: AgentTask[];
  onTaskAction?: (taskId: string, action: 'start' | 'stop' | 'retry' | 'cancel') => void;
  className?: string;
}

const agentIcons = {
  intake: MessageSquare,
  spin_up: Zap,
  pm: FolderOpen,
  launch: Rocket,
  handover: Handshake,
  support: Headphones,
};

const agentColors = {
  intake: 'text-blue-500',
  spin_up: 'text-purple-500',
  pm: 'text-green-500',
  launch: 'text-orange-500',
  handover: 'text-cyan-500',
  support: 'text-red-500',
};

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  running: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const priorityColors = {
  low: 'bg-gray-500/20 text-gray-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-orange-500/20 text-orange-400',
  urgent: 'bg-red-500/20 text-red-400',
};

export function TaskList({ tasks, onTaskAction, className }: TaskListProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getStatusIcon = (status: AgentTask['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'running':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'cancelled':
        return <Square className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getActionButtons = (task: AgentTask) => {
    const actions = [];

    switch (task.status) {
      case 'pending':
        actions.push(
          <Button
            key="start"
            size="sm"
            variant="outline"
            onClick={() => onTaskAction?.(task.id, 'start')}
            className="h-8"
          >
            <Play className="h-3 w-3 mr-1" />
            Start
          </Button>
        );
        break;
      case 'running':
        actions.push(
          <Button
            key="stop"
            size="sm"
            variant="outline"
            onClick={() => onTaskAction?.(task.id, 'stop')}
            className="h-8"
          >
            <Pause className="h-3 w-3 mr-1" />
            Pause
          </Button>
        );
        break;
      case 'failed':
        actions.push(
          <Button
            key="retry"
            size="sm"
            variant="outline"
            onClick={() => onTaskAction?.(task.id, 'retry')}
            className="h-8"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        );
        break;
    }

    if (task.status !== 'completed' && task.status !== 'cancelled') {
      actions.push(
        <Button
          key="cancel"
          size="sm"
          variant="outline"
          onClick={() => onTaskAction?.(task.id, 'cancel')}
          className="h-8 text-destructive hover:text-destructive"
        >
          <Square className="h-3 w-3 mr-1" />
          Cancel
        </Button>
      );
    }

    return actions;
  };

  if (tasks.length === 0) {
    return (
      <Card className={cn('animate-fade-in-up', className)}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <Zap className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No Tasks Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first automated task to get started with agent orchestration.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('animate-fade-in-up', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Agent Tasks
            <Badge variant="secondary" className="text-xs">
              {tasks.length} total
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              {tasks.filter(t => t.status === 'running').length} running
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              {tasks.filter(t => t.status === 'completed').length} completed
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {tasks.map((task, index) => {
            const AgentIcon = agentIcons[task.agent_type];
            const isExpanded = expandedTasks.has(task.id);
            
            return (
              <div
                key={task.id}
                className={cn(
                  'border-b border-border last:border-b-0 p-4 hover:bg-secondary/30 transition-colors',
                  'animate-fade-in-up'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Agent Icon */}
                    <div className={cn(
                      'w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0',
                      agentColors[task.agent_type]
                    )}>
                      <AgentIcon className="h-5 w-5" />
                    </div>

                    {/* Task Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">
                          {task.name}
                        </h3>
                        <Badge 
                          className={cn(
                            'text-xs',
                            statusColors[task.status]
                          )}
                        >
                          {getStatusIcon(task.status)}
                          <span className="ml-1 capitalize">{task.status}</span>
                        </Badge>
                        <Badge 
                          className={cn(
                            'text-xs',
                            priorityColors[task.priority]
                          )}
                        >
                          {task.priority.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {task.description}
                      </p>

                      {/* Progress Bar for Running Tasks */}
                      {task.status === 'running' && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />
                        </div>
                      )}

                      {/* Task Metadata */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Created {formatTimeAgo(task.created_at)}</span>
                        {task.started_at && (
                          <span>Started {formatTimeAgo(task.started_at)}</span>
                        )}
                        {task.completed_at && (
                          <span>Completed {formatTimeAgo(task.completed_at)}</span>
                        )}
                        {task.scheduled_at && task.status === 'pending' && (
                          <span>Scheduled for {new Date(task.scheduled_at).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 ml-4">
                    {getActionButtons(task)}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleTaskExpansion(task.id)}
                      className="h-8 w-8 p-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Task Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="space-y-4">
                      {/* Task Logs */}
                      {task.logs.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Recent Logs</h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {task.logs.slice(-5).map((log) => (
                              <div
                                key={log.id}
                                className="flex items-start gap-2 text-xs"
                              >
                                <span className="text-muted-foreground">
                                  {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                                <span className={cn(
                                  'font-mono',
                                  log.level === 'error' ? 'text-destructive' :
                                  log.level === 'warning' ? 'text-warning' :
                                  log.level === 'success' ? 'text-success' :
                                  'text-muted-foreground'
                                )}>
                                  [{log.level.toUpperCase()}]
                                </span>
                                <span className="text-foreground">{log.message}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Task Configuration */}
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Agent Type:</span>
                          <span className="ml-2 text-foreground capitalize">{task.agent_type}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Priority:</span>
                          <span className="ml-2 text-foreground capitalize">{task.priority}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Task ID:</span>
                          <span className="ml-2 text-foreground font-mono">{task.id}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Updated:</span>
                          <span className="ml-2 text-foreground">{formatTimeAgo(task.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}