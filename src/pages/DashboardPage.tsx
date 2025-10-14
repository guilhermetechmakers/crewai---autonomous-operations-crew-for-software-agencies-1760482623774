import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Search, 
  Bell, 
  Plus, 
  FolderOpen, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Zap,
  MessageSquare,
  Settings
} from 'lucide-react';

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in real app this would come from API
  const stats = [
    {
      title: 'Active Projects',
      value: '12',
      change: '+2 this week',
      changeType: 'positive',
      icon: FolderOpen,
      color: 'text-blue-500'
    },
    {
      title: 'Launches This Month',
      value: '8',
      change: '+3 from last month',
      changeType: 'positive',
      icon: Zap,
      color: 'text-green-500'
    },
    {
      title: 'Open Tickets',
      value: '24',
      change: '-5 from yesterday',
      changeType: 'positive',
      icon: MessageSquare,
      color: 'text-orange-500'
    },
    {
      title: 'SLA Breaches',
      value: '2',
      change: '+1 this week',
      changeType: 'negative',
      icon: AlertCircle,
      color: 'text-red-500'
    }
  ];

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-500';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-500';
      case 'review':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'completed':
        return 'bg-green-500/20 text-green-500';
      case 'warning':
        return 'bg-orange-500/20 text-orange-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold gradient-text">CrewAI</span>
            </div>
            
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  placeholder="Search projects, tasks, or agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              
              <Link
                to="/intake"
                className="btn-primary inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Link>
              
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary">SC</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, Sarah! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your projects and AI agents today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-card p-6 rounded-2xl border border-border card-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
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
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Recent Projects</h2>
                <Link 
                  to="/projects" 
                  className="text-primary hover:text-primary/80 transition-colors text-sm font-medium inline-flex items-center"
                >
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentProjects.map((project, index) => (
                  <div 
                    key={project.id}
                    className="p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-foreground">{project.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
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
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Due {new Date(project.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Agent Activity Feed */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Agent Activity</h2>
                <Settings className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
              </div>
              
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
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in-up">
            <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/intake"
                className="p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-center group"
              >
                <Bot className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-foreground mb-1">Start Intake</h3>
                <p className="text-sm text-muted-foreground">Qualify new leads</p>
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
          </div>
        </div>
      </div>
    </div>
  );
}
