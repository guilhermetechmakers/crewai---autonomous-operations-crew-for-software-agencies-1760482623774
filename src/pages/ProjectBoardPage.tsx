import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  User,
  Clock,
  Flag,
  MessageSquare,
  Paperclip,
  CheckCircle,
  Circle,
  AlertCircle,
  Play,
  Pause,
  Square
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'ready' | 'in_progress' | 'qa' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  storyPoints?: number;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  comments: number;
  attachments: number;
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Implement user authentication',
    description: 'Add login/signup functionality with JWT tokens',
    status: 'in_progress',
    priority: 'high',
    storyPoints: 8,
    assignee: {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'SC'
    },
    tags: ['frontend', 'auth'],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    comments: 3,
    attachments: 2
  },
  {
    id: '2',
    title: 'Design dashboard layout',
    description: 'Create responsive dashboard with sidebar navigation',
    status: 'ready',
    priority: 'medium',
    storyPoints: 5,
    assignee: {
      id: '2',
      name: 'Mike Johnson',
      avatar: 'MJ'
    },
    tags: ['design', 'frontend'],
    createdAt: '2024-01-16',
    updatedAt: '2024-01-19',
    comments: 1,
    attachments: 0
  },
  {
    id: '3',
    title: 'Setup database schema',
    description: 'Create tables for users, projects, and tasks',
    status: 'done',
    priority: 'high',
    storyPoints: 13,
    assignee: {
      id: '3',
      name: 'Emily Davis',
      avatar: 'ED'
    },
    tags: ['backend', 'database'],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    comments: 5,
    attachments: 1
  },
  {
    id: '4',
    title: 'Write API documentation',
    description: 'Document all REST endpoints with examples',
    status: 'qa',
    priority: 'low',
    storyPoints: 3,
    assignee: {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'SC'
    },
    tags: ['documentation', 'api'],
    createdAt: '2024-01-17',
    updatedAt: '2024-01-21',
    comments: 2,
    attachments: 0
  },
  {
    id: '5',
    title: 'Implement file upload',
    description: 'Add drag-and-drop file upload functionality',
    status: 'backlog',
    priority: 'medium',
    storyPoints: 8,
    tags: ['frontend', 'files'],
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18',
    comments: 0,
    attachments: 0
  }
];

const columns = [
  { id: 'backlog', title: 'Backlog', color: 'bg-gray-500' },
  { id: 'ready', title: 'Ready', color: 'bg-blue-500' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-500' },
  { id: 'qa', title: 'QA', color: 'bg-purple-500' },
  { id: 'done', title: 'Done', color: 'bg-green-500' }
];

export default function ProjectBoardPage() {
  const { id: _id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [_showNewTaskModal, setShowNewTaskModal] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Flag className="h-3 w-3" />;
      case 'high': return <AlertCircle className="h-3 w-3" />;
      case 'medium': return <Circle className="h-3 w-3" />;
      case 'low': return <CheckCircle className="h-3 w-3" />;
      default: return <Circle className="h-3 w-3" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress': return <Play className="h-4 w-4 text-yellow-500" />;
      case 'qa': return <Pause className="h-4 w-4 text-purple-500" />;
      case 'done': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    const matchesAssignee = selectedAssignee === 'all' || task.assignee?.id === selectedAssignee;
    
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const tasksByStatus = columns.reduce((acc, column) => {
    acc[column.id] = filteredTasks.filter(task => task.status === column.id);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Project Board</h1>
            <p className="text-muted-foreground">Manage tasks and track progress</p>
          </div>
          <Button onClick={() => setShowNewTaskModal(true)} variant="gradient">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="priority-filter">Priority:</Label>
                <select
                  id="priority-filter"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">All</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="assignee-filter">Assignee:</Label>
                <select
                  id="assignee-filter"
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">All</option>
                  <option value="1">Sarah Chen</option>
                  <option value="2">Mike Johnson</option>
                  <option value="3">Emily Davis</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-foreground">{column.title}</h3>
                  <Badge variant="secondary" className="ml-2">
                    {tasksByStatus[column.id]?.length || 0}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3 min-h-96">
                {tasksByStatus[column.id]?.map((task) => (
                  <Card 
                    key={task.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow animate-fade-in-up"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-foreground text-sm leading-tight">
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(task.status)}
                            <div className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                              {getPriorityIcon(task.priority)}
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>

                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {task.assignee ? (
                              <div className="flex items-center gap-1">
                                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-primary">
                                    {task.assignee.avatar}
                                  </span>
                                </div>
                                <span>{task.assignee.name}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>Unassigned</span>
                              </div>
                            )}
                          </div>
                          
                          {task.storyPoints && (
                            <div className="flex items-center gap-1">
                              <Square className="h-3 w-3" />
                              <span>{task.storyPoints}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-3">
                            {task.comments > 0 && (
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{task.comments}</span>
                              </div>
                            )}
                            {task.attachments > 0 && (
                              <div className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                <span>{task.attachments}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}