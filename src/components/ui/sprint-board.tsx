import { useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar,
  Clock,
  Target,
  BarChart3,
  Play,
  CheckCircle,
  AlertCircle,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowRight,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Sprint } from '@/types';

interface SprintBoardProps {
  sprints: Sprint[];
  onSprintUpdate?: (sprintId: string, updates: Partial<Sprint>) => void;
  onSprintAction?: (sprintId: string, action: 'start' | 'complete' | 'edit' | 'delete') => void;
  onAddTask?: (sprintId: string) => void;
  className?: string;
  isLoading?: boolean;
  error?: Error | null;
}

const statusColors = {
  planning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  active: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const statusIcons = {
  planning: Clock,
  active: Play,
  completed: CheckCircle,
  cancelled: AlertCircle,
};

export const SprintBoard = memo(function SprintBoard({ 
  sprints, 
  onSprintAction, 
  onAddTask,
  className, 
  isLoading = false, 
  error 
}: SprintBoardProps) {
  const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set());

  const toggleSprintExpansion = (sprintId: string) => {
    const newExpanded = new Set(expandedSprints);
    if (newExpanded.has(sprintId)) {
      newExpanded.delete(sprintId);
    } else {
      newExpanded.add(sprintId);
    }
    setExpandedSprints(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

  const getSprintProgress = (sprint: Sprint) => {
    if (sprint.capacity === 0) return 0;
    return Math.round((sprint.velocity / sprint.capacity) * 100);
  };

  const getSprintDuration = (sprint: Sprint) => {
    const start = new Date(sprint.start_date);
    const end = new Date(sprint.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysRemaining = (sprint: Sprint) => {
    const end = new Date(sprint.end_date);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getActionButtons = (sprint: Sprint) => {
    const actions = [];

    switch (sprint.status) {
      case 'planning':
        actions.push(
          <Button
            key="start"
            size="sm"
            variant="outline"
            onClick={() => onSprintAction?.(sprint.id, 'start')}
            className="h-8"
            aria-label={`Start sprint: ${sprint.name}`}
          >
            <Play className="h-3 w-3 mr-1" />
            Start
          </Button>
        );
        break;
      case 'active':
        actions.push(
          <Button
            key="complete"
            size="sm"
            variant="outline"
            onClick={() => onSprintAction?.(sprint.id, 'complete')}
            className="h-8"
            aria-label={`Complete sprint: ${sprint.name}`}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Complete
          </Button>
        );
        break;
    }

    actions.push(
      <Button
        key="edit"
        size="sm"
        variant="ghost"
        onClick={() => onSprintAction?.(sprint.id, 'edit')}
        className="h-8 w-8 p-0"
        aria-label={`Edit sprint: ${sprint.name}`}
      >
        <Edit className="h-4 w-4" />
      </Button>
    );

    if (sprint.status === 'planning') {
      actions.push(
        <Button
          key="delete"
          size="sm"
          variant="ghost"
          onClick={() => onSprintAction?.(sprint.id, 'delete')}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          aria-label={`Delete sprint: ${sprint.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      );
    }

    return actions;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn('animate-fade-in-up', className)}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Loading Sprints...</h3>
          <p className="text-muted-foreground">
            Fetching your sprint planning data.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('animate-fade-in-up', className)}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Failed to Load Sprints</h3>
          <p className="text-muted-foreground mb-4">
            {error.message || 'An error occurred while loading sprints.'}
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (sprints.length === 0) {
    return (
      <Card className={cn('animate-fade-in-up', className)}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No Sprints Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first sprint to start planning and managing your project iterations.
          </p>
          <Button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Sprint
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('animate-fade-in-up group hover:shadow-glow transition-all duration-300', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="gradient-text font-bold">Sprint Planning</div>
              <p className="text-sm text-muted-foreground font-normal">Manage project iterations and sprints</p>
            </div>
          </CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border-primary/20">
              {sprints.length} sprints
            </Badge>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-blue-400 font-medium">{sprints.filter(s => s.status === 'active').length} active</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-green-400 font-medium">{sprints.filter(s => s.status === 'completed').length} completed</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {sprints.map((sprint, index) => {
            const StatusIcon = statusIcons[sprint.status];
            const isExpanded = expandedSprints.has(sprint.id);
            const progress = getSprintProgress(sprint);
            const daysRemaining = getDaysRemaining(sprint);
            const duration = getSprintDuration(sprint);
            
            return (
              <div
                key={sprint.id}
                className={cn(
                  'border-b border-border last:border-b-0 p-6 hover:bg-gradient-to-r hover:from-secondary/20 hover:to-transparent transition-all duration-300 group',
                  'animate-fade-in-up'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Sprint Icon */}
                    <div className={cn(
                      'w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-300 shadow-lg',
                      'text-primary'
                    )}>
                      <StatusIcon className="h-6 w-6" />
                    </div>

                    {/* Sprint Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">
                          {sprint.name}
                        </h3>
                        <Badge 
                          className={cn(
                            'text-xs',
                            statusColors[sprint.status]
                          )}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          <span className="capitalize">{sprint.status}</span>
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {sprint.description}
                      </p>

                      {/* Sprint Goal */}
                      {sprint.goal && (
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Goal: {sprint.goal}</span>
                        </div>
                      )}

                      {/* Progress Bar for Active Sprints */}
                      {sprint.status === 'active' && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{progress}% ({sprint.velocity}/{sprint.capacity} story points)</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      {/* Sprint Metadata */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{duration} days</span>
                        </div>
                        {sprint.status === 'active' && daysRemaining > 0 && (
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            <span>{daysRemaining} days left</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          <span>{sprint.task_ids.length} tasks</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 ml-4">
                    {getActionButtons(sprint)}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleSprintExpansion(sprint.id)}
                      className="h-8 w-8 p-0"
                      aria-label={isExpanded ? `Collapse details for ${sprint.name}` : `Expand details for ${sprint.name}`}
                      aria-expanded={isExpanded}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Sprint Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="space-y-4">
                      {/* Sprint Statistics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div className="p-3 rounded-lg bg-secondary/50">
                          <div className="text-muted-foreground mb-1">Capacity</div>
                          <div className="text-foreground font-semibold">{sprint.capacity} pts</div>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50">
                          <div className="text-muted-foreground mb-1">Velocity</div>
                          <div className="text-foreground font-semibold">{sprint.velocity} pts</div>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50">
                          <div className="text-muted-foreground mb-1">Tasks</div>
                          <div className="text-foreground font-semibold">{sprint.task_ids.length}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50">
                          <div className="text-muted-foreground mb-1">Duration</div>
                          <div className="text-foreground font-semibold">{duration} days</div>
                        </div>
                      </div>

                      {/* Sprint Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAddTask?.(sprint.id)}
                          className="h-8"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Task
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSprintAction?.(sprint.id, 'edit')}
                          className="h-8"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit Sprint
                        </Button>
                      </div>

                      {/* Sprint Configuration */}
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Sprint ID:</span>
                          <span className="ml-2 text-foreground font-mono">{sprint.id}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Project ID:</span>
                          <span className="ml-2 text-foreground font-mono">{sprint.project_id}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <span className="ml-2 text-foreground">{formatTimeAgo(sprint.created_at)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Updated:</span>
                          <span className="ml-2 text-foreground">{formatTimeAgo(sprint.updated_at)}</span>
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
});