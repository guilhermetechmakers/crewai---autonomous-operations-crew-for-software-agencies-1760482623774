import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bot,
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  BarChart3,
  Settings,
  Users,
  Zap,
  Handshake,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: FolderOpen,
  },
  {
    name: 'Intake Chat',
    href: '/intake',
    icon: MessageSquare,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Team',
    href: '/team',
    icon: Users,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

const agentItems = [
  {
    name: 'Intake Agent',
    href: '/agents/intake',
    icon: Bot,
    status: 'active',
  },
  {
    name: 'Spin-Up Agent',
    href: '/agents/spin-up',
    icon: Zap,
    status: 'active',
  },
  {
    name: 'PM Agent',
    href: '/agents/pm',
    icon: LayoutDashboard,
    status: 'active',
  },
  {
    name: 'Launch Agent',
    href: '/agents/launch',
    icon: Zap,
    status: 'active',
  },
  {
    name: 'Handover Agent',
    href: '/agents/handover',
    icon: Handshake,
    status: 'active',
  },
  {
    name: 'Support Agent',
    href: '/agents/support',
    icon: Headphones,
    status: 'active',
  },
];

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div
      className={cn(
        'flex h-full flex-col bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold gradient-text">CrewAI</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {collapsed ? '' : 'Navigation'}
          </div>
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  collapsed && 'justify-center'
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>

        <Separator className="mx-4" />

        {/* AI Agents */}
        <div className="p-4 space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {collapsed ? '' : 'AI Agents'}
          </div>
          {agentItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  collapsed && 'justify-center'
                )}
              >
                <div className="relative">
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-success rounded-full" />
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <span className="truncate">{item.name}</span>
                    <div className="text-xs text-muted-foreground capitalize">
                      {item.status}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <Button className="w-full" variant="gradient">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      )}
    </div>
  );
}