import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar,
  Clock,
  Play,
  Plus,
  Zap,
  MessageSquare,
  FolderOpen,
  Rocket,
  Handshake,
  Headphones
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreateTaskRequest } from '@/types';

const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  agent_type: z.enum(['intake', 'spin_up', 'pm', 'launch', 'handover', 'support']),
  scheduled_at: z.string().optional(),
  cron_expression: z.string().optional(),
  timezone: z.string().default('UTC'),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskSchedulerProps {
  onTaskCreated?: (task: CreateTaskRequest) => void;
  className?: string;
}

const agentTypes = [
  { 
    value: 'intake', 
    label: 'Intake Agent', 
    description: 'Qualify leads and gather requirements',
    icon: MessageSquare,
    color: 'text-blue-500'
  },
  { 
    value: 'spin_up', 
    label: 'Project Spin-Up Agent', 
    description: 'Auto-setup new projects',
    icon: Zap,
    color: 'text-purple-500'
  },
  { 
    value: 'pm', 
    label: 'Project Management Agent', 
    description: 'Manage tasks and sprints',
    icon: FolderOpen,
    color: 'text-green-500'
  },
  { 
    value: 'launch', 
    label: 'Launch Agent', 
    description: 'Deploy and launch projects',
    icon: Rocket,
    color: 'text-orange-500'
  },
  { 
    value: 'handover', 
    label: 'Handover Agent', 
    description: 'Client handover and documentation',
    icon: Handshake,
    color: 'text-cyan-500'
  },
  { 
    value: 'support', 
    label: 'Support Agent', 
    description: 'Handle support tickets and issues',
    icon: Headphones,
    color: 'text-red-500'
  },
];

const priorityColors = {
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function TaskScheduler({ onTaskCreated, className }: TaskSchedulerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled' | 'recurring'>('immediate');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'medium',
      agent_type: 'intake',
      timezone: 'UTC',
    },
  });

  const selectedAgentType = watch('agent_type');
  const selectedPriority = watch('priority');

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    
    try {
      const taskData: CreateTaskRequest = {
        ...data,
        scheduled_at: scheduleType === 'immediate' ? undefined : data.scheduled_at,
        cron_expression: scheduleType === 'recurring' ? data.cron_expression : undefined,
      };

      onTaskCreated?.(taskData);
      reset();
      setScheduleType('immediate');
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAgent = agentTypes.find(agent => agent.value === selectedAgentType);

  return (
    <Card className={cn('animate-fade-in-up group hover:shadow-glow transition-all duration-300', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="gradient-text font-bold">Schedule New Task</div>
              <p className="text-sm text-muted-foreground font-normal">Create automated agent workflows</p>
            </div>
          </CardTitle>
          <Badge variant="secondary" className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border-primary/20">
            Agent Orchestration
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Task Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Task Name</Label>
                <Input
                  id="name"
                  placeholder="Enter task name"
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={selectedPriority}
                  onValueChange={(value) => setValue('priority', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-500" />
                        Low Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        Medium Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        High Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        Urgent Priority
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Describe what this task should accomplish"
                {...register('description')}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Agent Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Select Agent</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agentTypes.map((agent) => {
                const Icon = agent.icon;
                const isSelected = selectedAgentType === agent.value;
                
                return (
                  <button
                    key={agent.value}
                    type="button"
                    onClick={() => setValue('agent_type', agent.value as any)}
                    className={cn(
                      'p-5 rounded-2xl border-2 transition-all duration-300 text-left group relative overflow-hidden',
                      isSelected
                        ? 'border-primary bg-gradient-to-br from-primary/10 to-accent/10 shadow-glow scale-105'
                        : 'border-border hover:border-primary/50 hover:bg-secondary/50 hover:scale-102'
                    )}
                  >
                    {/* Gradient overlay for selected state */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl" />
                    )}
                    
                    <div className="relative flex items-start gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300',
                        isSelected 
                          ? 'bg-gradient-to-br from-primary to-accent shadow-lg' 
                          : 'bg-primary/10 group-hover:bg-primary/20'
                      )}>
                        <Icon className={cn(
                          'h-6 w-6 transition-colors',
                          isSelected ? 'text-white' : agent.color
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          'font-semibold text-foreground transition-colors mb-1',
                          isSelected ? 'text-primary' : 'group-hover:text-primary'
                        )}>
                          {agent.label}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {agent.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule Type */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Schedule Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setScheduleType('immediate')}
                className={cn(
                  'p-6 rounded-2xl border-2 transition-all duration-300 text-center group relative overflow-hidden',
                  scheduleType === 'immediate'
                    ? 'border-primary bg-gradient-to-br from-primary/10 to-accent/10 shadow-glow scale-105'
                    : 'border-border hover:border-primary/50 hover:bg-secondary/50 hover:scale-102'
                )}
              >
                {scheduleType === 'immediate' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl" />
                )}
                <div className="relative">
                  <div className={cn(
                    'w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all duration-300',
                    scheduleType === 'immediate'
                      ? 'bg-gradient-to-br from-primary to-accent shadow-lg'
                      : 'bg-primary/10 group-hover:bg-primary/20'
                  )}>
                    <Play className={cn(
                      'h-6 w-6 transition-colors',
                      scheduleType === 'immediate' ? 'text-white' : 'text-primary'
                    )} />
                  </div>
                  <h3 className={cn(
                    'font-semibold text-foreground mb-1 transition-colors',
                    scheduleType === 'immediate' ? 'text-primary' : 'group-hover:text-primary'
                  )}>
                    Immediate
                  </h3>
                  <p className="text-sm text-muted-foreground">Run now</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScheduleType('scheduled')}
                className={cn(
                  'p-6 rounded-2xl border-2 transition-all duration-300 text-center group relative overflow-hidden',
                  scheduleType === 'scheduled'
                    ? 'border-primary bg-gradient-to-br from-primary/10 to-accent/10 shadow-glow scale-105'
                    : 'border-border hover:border-primary/50 hover:bg-secondary/50 hover:scale-102'
                )}
              >
                {scheduleType === 'scheduled' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl" />
                )}
                <div className="relative">
                  <div className={cn(
                    'w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all duration-300',
                    scheduleType === 'scheduled'
                      ? 'bg-gradient-to-br from-primary to-accent shadow-lg'
                      : 'bg-primary/10 group-hover:bg-primary/20'
                  )}>
                    <Calendar className={cn(
                      'h-6 w-6 transition-colors',
                      scheduleType === 'scheduled' ? 'text-white' : 'text-primary'
                    )} />
                  </div>
                  <h3 className={cn(
                    'font-semibold text-foreground mb-1 transition-colors',
                    scheduleType === 'scheduled' ? 'text-primary' : 'group-hover:text-primary'
                  )}>
                    Scheduled
                  </h3>
                  <p className="text-sm text-muted-foreground">Run at specific time</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScheduleType('recurring')}
                className={cn(
                  'p-6 rounded-2xl border-2 transition-all duration-300 text-center group relative overflow-hidden',
                  scheduleType === 'recurring'
                    ? 'border-primary bg-gradient-to-br from-primary/10 to-accent/10 shadow-glow scale-105'
                    : 'border-border hover:border-primary/50 hover:bg-secondary/50 hover:scale-102'
                )}
              >
                {scheduleType === 'recurring' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl" />
                )}
                <div className="relative">
                  <div className={cn(
                    'w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all duration-300',
                    scheduleType === 'recurring'
                      ? 'bg-gradient-to-br from-primary to-accent shadow-lg'
                      : 'bg-primary/10 group-hover:bg-primary/20'
                  )}>
                    <Clock className={cn(
                      'h-6 w-6 transition-colors',
                      scheduleType === 'recurring' ? 'text-white' : 'text-primary'
                    )} />
                  </div>
                  <h3 className={cn(
                    'font-semibold text-foreground mb-1 transition-colors',
                    scheduleType === 'recurring' ? 'text-primary' : 'group-hover:text-primary'
                  )}>
                    Recurring
                  </h3>
                  <p className="text-sm text-muted-foreground">Run on schedule</p>
                </div>
              </button>
            </div>
          </div>

          {/* Schedule Details */}
          {scheduleType === 'scheduled' && (
            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Scheduled Time</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                {...register('scheduled_at')}
                className={errors.scheduled_at ? 'border-destructive' : ''}
              />
              {errors.scheduled_at && (
                <p className="text-sm text-destructive">{errors.scheduled_at.message}</p>
              )}
            </div>
          )}

          {scheduleType === 'recurring' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cron_expression">Cron Expression</Label>
                <Input
                  id="cron_expression"
                  placeholder="0 9 * * 1-5 (Every weekday at 9 AM)"
                  {...register('cron_expression')}
                  className={errors.cron_expression ? 'border-destructive' : ''}
                />
                {errors.cron_expression && (
                  <p className="text-sm text-destructive">{errors.cron_expression.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Use standard cron syntax (minute hour day month weekday)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={watch('timezone')}
                  onValueChange={(value) => setValue('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Task Preview */}
          {selectedAgent && (
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <h4 className="font-medium text-foreground mb-2">Task Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Agent:</span>
                  <div className="flex items-center gap-2">
                    <selectedAgent.icon className={cn('h-4 w-4', selectedAgent.color)} />
                    <span className="text-foreground">{selectedAgent.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Priority:</span>
                  <Badge 
                    className={cn(
                      'text-xs',
                      priorityColors[selectedPriority as keyof typeof priorityColors]
                    )}
                  >
                    {selectedPriority.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Schedule:</span>
                  <span className="text-foreground">
                    {scheduleType === 'immediate' ? 'Run immediately' : 
                     scheduleType === 'scheduled' ? 'Scheduled execution' : 
                     'Recurring schedule'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Task
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}