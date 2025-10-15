import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  MessageSquare, 
  Search, 
  Plus,
  RefreshCw,
  Eye,
  Edit,
  BarChart3,
  Bell,
  Zap
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

import SupportAgentService from '@/services/SupportAgentService';
import type { 
  SupportTicket, 
  TicketSearchRequest 
} from '@/types/SLA';

interface SupportSLAQueueViewProps {
  className?: string;
}

const SupportSLAQueueView: React.FC<SupportSLAQueueViewProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: [] as string[],
    priority: [] as string[],
    category: [] as string[],
    assignee: '',
  });
  const [sortBy] = useState('created_at');
  const [sortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);

  const queryClient = useQueryClient();
  const supportService = SupportAgentService.getInstance();

  // Fetch dashboard data
  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['support-dashboard', 'month'],
    queryFn: () => supportService.getDashboard('month'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch tickets
  const { data: ticketsData, isLoading: ticketsLoading, refetch: refetchTickets } = useQuery({
    queryKey: ['support-tickets', searchQuery, filters, sortBy, sortDirection, currentPage, pageSize],
    queryFn: () => {
      const searchParams: TicketSearchRequest = {
        query: searchQuery || undefined,
        status: filters.status.length > 0 ? filters.status : undefined,
        priority: filters.priority.length > 0 ? filters.priority : undefined,
        category: filters.category.length > 0 ? filters.category : undefined,
        assignee_id: filters.assignee || undefined,
        page: currentPage,
        limit: pageSize,
        sort_by: sortBy,
        sort_direction: sortDirection,
      };
      return supportService.getTickets(searchParams);
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch agents for assignment
  const { data: agents } = useQuery({
    queryKey: ['support-agents'],
    queryFn: () => supportService.getAgents(),
  });

  // Bulk operations mutations

  const bulkAssignMutation = useMutation({
    mutationFn: (data: { ticket_ids: string[]; assignee_id: string }) => 
      supportService.bulkAssignTickets(data),
    onSuccess: (assignedCount) => {
      toast.success(`${assignedCount} tickets assigned successfully`);
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setSelectedTickets([]);
    },
    onError: (error) => {
      toast.error(`Failed to assign tickets: ${error.message}`);
    },
  });

  const bulkCloseMutation = useMutation({
    mutationFn: (data: { ticket_ids: string[]; resolution: string }) => 
      supportService.bulkCloseTickets(data),
    onSuccess: (closedCount) => {
      toast.success(`${closedCount} tickets closed successfully`);
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setSelectedTickets([]);
    },
    onError: (error) => {
      toast.error(`Failed to close tickets: ${error.message}`);
    },
  });

  // Handle ticket selection
  const handleTicketSelect = (ticketId: string, selected: boolean) => {
    if (selected) {
      setSelectedTickets(prev => [...prev, ticketId]);
    } else {
      setSelectedTickets(prev => prev.filter(id => id !== ticketId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTickets(ticketsData?.tickets.map(ticket => ticket.id) || []);
    } else {
      setSelectedTickets([]);
    }
  };

  // Handle bulk operations
  const handleBulkAssign = (assigneeId: string) => {
    if (selectedTickets.length === 0) return;
    bulkAssignMutation.mutate({
      ticket_ids: selectedTickets,
      assignee_id: assigneeId,
    });
  };

  const handleBulkClose = () => {
    if (selectedTickets.length === 0) return;
    bulkCloseMutation.mutate({
      ticket_ids: selectedTickets,
      resolution: 'Bulk closed by support agent',
    });
  };

  // Format priority and status
  const formatPriority = (priority: string) => {
    const priorityMap = {
      low: { label: 'Low', color: 'text-green-600', bgColor: 'bg-green-100' },
      medium: { label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
      high: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100' },
      urgent: { label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-100' },
      critical: { label: 'Critical', color: 'text-red-800', bgColor: 'bg-red-200' },
    };
    return priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
  };

  const formatStatus = (status: string) => {
    const statusMap = {
      open: { label: 'Open', color: 'text-blue-600', bgColor: 'bg-blue-100' },
      in_progress: { label: 'In Progress', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
      pending_customer: { label: 'Pending Customer', color: 'text-purple-600', bgColor: 'bg-purple-100' },
      resolved: { label: 'Resolved', color: 'text-green-600', bgColor: 'bg-green-100' },
      closed: { label: 'Closed', color: 'text-gray-600', bgColor: 'bg-gray-100' },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.open;
  };

  // Calculate time remaining
  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 0) {
      return { text: 'Overdue', color: 'text-red-600', bgColor: 'bg-red-100' };
    } else if (diffHours <= 2) {
      return { text: `${diffHours}h left`, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    } else if (diffHours <= 24) {
      return { text: `${diffHours}h left`, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    } else {
      const diffDays = Math.ceil(diffHours / 24);
      return { text: `${diffDays}d left`, color: 'text-green-600', bgColor: 'bg-green-100' };
    }
  };

  // Calculate SLA progress
  const getSLAProgress = (ticket: SupportTicket) => {
    const now = new Date();
    const created = new Date(ticket.created_at);
    const due = new Date(ticket.due_date);
    const totalTime = due.getTime() - created.getTime();
    const elapsedTime = now.getTime() - created.getTime();
    const progress = Math.min((elapsedTime / totalTime) * 100, 100);
    return Math.max(progress, 0);
  };

  if (dashboardLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/4"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.total_tickets || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.open_tickets || 0} open, {dashboard?.resolved_today || 0} resolved today
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{dashboard?.sla_violations || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.overdue_tickets || 0} overdue tickets
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.average_response_time || 0}m</div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.average_resolution_time || 0}h avg resolution
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.customer_satisfaction || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.agent_utilization || 0}% agent utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Ticket Queue */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Support Queue</CardTitle>
                  <CardDescription>
                    Manage and track support tickets with SLA monitoring
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchTickets()}
                    disabled={ticketsLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${ticketsLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Ticket
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters and Search */}
              <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filters.status[0]} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value ? [value] : [] }))}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="pending_customer">Pending Customer</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.priority[0]} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value ? [value] : [] }))}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bulk Actions */}
                {selectedTickets.length > 0 && (
                  <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">{selectedTickets.length} selected</span>
                    <Select onValueChange={handleBulkAssign}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Assign to..." />
                      </SelectTrigger>
                      <SelectContent>
                        {agents?.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkClose}
                      disabled={bulkCloseMutation.isPending}
                    >
                      Close Tickets
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTickets([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                )}
              </div>

              {/* Tickets Table */}
              <div className="space-y-2">
                {ticketsLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 p-3 bg-muted rounded-lg text-sm font-medium">
                      <div className="col-span-1">
                        <Checkbox
                          checked={selectedTickets.length === (ticketsData?.tickets.length || 0) && selectedTickets.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </div>
                      <div className="col-span-3">Ticket</div>
                      <div className="col-span-2">Client</div>
                      <div className="col-span-1">Priority</div>
                      <div className="col-span-1">Status</div>
                      <div className="col-span-2">SLA Progress</div>
                      <div className="col-span-1">Assignee</div>
                      <div className="col-span-1">Actions</div>
                    </div>

                    {/* Table Rows */}
                    {ticketsData?.tickets.map((ticket) => {
                      const priority = formatPriority(ticket.priority);
                      const status = formatStatus(ticket.status);
                      const timeRemaining = getTimeRemaining(ticket.due_date);
                      const slaProgress = getSLAProgress(ticket);
                      const isOverdue = supportService.isTicketOverdue(ticket);
                      const isDueSoon = supportService.isTicketDueSoon(ticket);

                      return (
                        <div
                          key={ticket.id}
                          className={`grid grid-cols-12 gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors ${
                            isOverdue ? 'border-destructive/50 bg-destructive/5' : 
                            isDueSoon ? 'border-warning/50 bg-warning/5' : ''
                          }`}
                        >
                          <div className="col-span-1 flex items-center">
                            <Checkbox
                              checked={selectedTickets.includes(ticket.id)}
                              onCheckedChange={(checked) => handleTicketSelect(ticket.id, checked as boolean)}
                            />
                          </div>
                          <div className="col-span-3">
                            <div className="font-medium text-sm">{ticket.title}</div>
                            <div className="text-xs text-muted-foreground">
                              #{ticket.id.slice(-8)} • {ticket.category}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-sm">{ticket.client_name}</div>
                            <div className="text-xs text-muted-foreground">{ticket.client_email}</div>
                          </div>
                          <div className="col-span-1">
                            <Badge variant="outline" className={`${priority.color} ${priority.bgColor}`}>
                              {priority.label}
                            </Badge>
                          </div>
                          <div className="col-span-1">
                            <Badge variant="outline" className={`${status.color} ${status.bgColor}`}>
                              {status.label}
                            </Badge>
                          </div>
                          <div className="col-span-2">
                            <div className="space-y-1">
                              <Progress value={slaProgress} className="h-2" />
                              <div className="flex items-center justify-between text-xs">
                                <span className={timeRemaining.color}>{timeRemaining.text}</span>
                                <span className="text-muted-foreground">
                                  {Math.round(slaProgress)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-1">
                            <div className="text-sm">
                              {ticket.assignee_name || 'Unassigned'}
                            </div>
                          </div>
                          <div className="col-span-1">
                            <div className="flex items-center space-x-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {ticketsData?.tickets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tickets found matching your criteria</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {ticketsData && ticketsData.total_pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, ticketsData.total)} of {ticketsData.total} tickets
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {ticketsData.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, ticketsData.total_pages))}
                      disabled={currentPage === ticketsData.total_pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Auto-triage Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Auto-triage</span>
              </CardTitle>
              <CardDescription>
                AI-powered suggestions for ticket management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  No pending suggestions
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Run Auto-triage
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Open Tickets</span>
                  <Badge variant="outline">{dashboard?.open_tickets || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">In Progress</span>
                  <Badge variant="outline">{dashboard?.in_progress_tickets || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overdue</span>
                  <Badge variant="destructive">{dashboard?.overdue_tickets || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Resolved Today</span>
                  <Badge variant="success">{dashboard?.resolved_today || 0}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard?.recent_activity?.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="text-sm">
                    <div className="font-medium">{activity.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleString()}
                    </div>
                  </div>
                )) || (
                  <div className="text-sm text-muted-foreground">
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupportSLAQueueView;