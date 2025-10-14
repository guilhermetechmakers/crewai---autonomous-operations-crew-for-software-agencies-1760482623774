import { useState } from 'react';
import { 
  Bot, 
  ArrowLeft, 
  Plus, 
  Filter, 
  Search, 
  MoreVertical,
  Clock,
  Flag,
  Circle
} from 'lucide-react';

export default function ProjectBoardPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const columns = [
    { id: 'backlog', title: 'Backlog', color: 'bg-gray-500' },
    { id: 'ready', title: 'Ready', color: 'bg-blue-500' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-500' },
    { id: 'qa', title: 'QA', color: 'bg-purple-500' },
    { id: 'done', title: 'Done', color: 'bg-green-500' }
  ];

  const tasks = [
    {
      id: '1',
      title: 'User Authentication System',
      description: 'Implement JWT-based authentication with role-based access control',
      status: 'in_progress',
      priority: 'high',
      storyPoints: 8,
      assignee: { name: 'Sarah Chen', avatar: 'SC' },
      dueDate: '2024-02-15',
      tags: ['backend', 'security']
    },
    {
      id: '2',
      title: 'Product Catalog API',
      description: 'Create RESTful API for product management',
      status: 'ready',
      priority: 'medium',
      storyPoints: 5,
      assignee: { name: 'Mike Johnson', avatar: 'MJ' },
      dueDate: '2024-02-20',
      tags: ['backend', 'api']
    },
    {
      id: '3',
      title: 'Shopping Cart Component',
      description: 'Build responsive shopping cart with state management',
      status: 'backlog',
      priority: 'high',
      storyPoints: 13,
      assignee: { name: 'Emily Davis', avatar: 'ED' },
      dueDate: '2024-02-25',
      tags: ['frontend', 'react']
    },
    {
      id: '4',
      title: 'Payment Integration',
      description: 'Integrate Stripe payment processing',
      status: 'qa',
      priority: 'high',
      storyPoints: 8,
      assignee: { name: 'Alex Kim', avatar: 'AK' },
      dueDate: '2024-02-12',
      tags: ['backend', 'payments']
    },
    {
      id: '5',
      title: 'Order Management Dashboard',
      description: 'Admin dashboard for order tracking and management',
      status: 'done',
      priority: 'medium',
      storyPoints: 5,
      assignee: { name: 'Sarah Chen', avatar: 'SC' },
      dueDate: '2024-02-08',
      tags: ['frontend', 'admin']
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Flag className="h-4 w-4" />;
      case 'medium':
        return <Clock className="h-4 w-4" />;
      case 'low':
        return <Circle className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button className="mr-4 p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <Bot className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold gradient-text">CrewAI</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64"
                  />
                </div>
                <button className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                  <Filter className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              
              <button className="btn-primary inline-flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">E-commerce Platform</h1>
              <p className="text-muted-foreground">TechCorp Solutions • Sprint 2 of 4</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold text-foreground">65%</p>
              </div>
              <div className="w-32 bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                  <h3 className="font-semibold text-foreground">{column.title}</h3>
                  <span className="text-sm text-muted-foreground">
                    ({tasks.filter(task => task.status === column.id).length})
                  </span>
                </div>
                <button className="p-1 hover:bg-secondary/50 rounded transition-colors">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              
              <div className="space-y-3">
                {tasks
                  .filter(task => task.status === column.id)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="bg-background p-4 rounded-lg border border-border hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground text-sm">{task.title}</h4>
                        <div className={`flex items-center ${getPriorityColor(task.priority)}`}>
                          {getPriorityIcon(task.priority)}
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {task.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">{task.assignee.avatar}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{task.storyPoints} pts</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-1">
                          {task.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-secondary text-xs text-muted-foreground rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
