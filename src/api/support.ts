import { api } from '@/lib/api';
import type {
  SupportTicket,
  CreateTicketRequest,
  UpdateTicketRequest,
  CreateCommentRequest,
  TicketSearchRequest,
  TicketSearchResponse,
  SLA,
  SLARule,
  CreateSLARuleRequest,
  SupportAgent,
  SupportQueue,
  CreateQueueRequest,
  SupportDashboard,
  AutoTriageResult,
  BulkTicketUpdate,
  BulkTicketAssign,
  BulkTicketClose,
  SupportNotification,
  SLAViolation,
  EscalationEvent,
  AutoTriageSuggestion,
} from '@/types/SLA';

export const supportApi = {
  // Ticket Management
  /**
   * Get all tickets with optional filtering and pagination
   */
  getTickets: (params?: TicketSearchRequest) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v.toString()));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<TicketSearchResponse>(`/support/tickets${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get a specific ticket by ID
   */
  getTicket: (ticketId: string) => 
    api.get<SupportTicket>(`/support/tickets/${ticketId}`),

  /**
   * Create a new support ticket
   */
  createTicket: (data: CreateTicketRequest) => 
    api.post<SupportTicket>('/support/tickets', data),

  /**
   * Update an existing ticket
   */
  updateTicket: (ticketId: string, data: UpdateTicketRequest) => 
    api.put<SupportTicket>(`/support/tickets/${ticketId}`, data),

  /**
   * Delete a ticket (soft delete)
   */
  deleteTicket: (ticketId: string) => 
    api.delete<{ success: boolean }>(`/support/tickets/${ticketId}`),

  /**
   * Bulk update tickets
   */
  bulkUpdateTickets: (data: BulkTicketUpdate) => 
    api.post<{ success: boolean; updated_count: number }>('/support/tickets/bulk-update', data),

  /**
   * Bulk assign tickets
   */
  bulkAssignTickets: (data: BulkTicketAssign) => 
    api.post<{ success: boolean; assigned_count: number }>('/support/tickets/bulk-assign', data),

  /**
   * Bulk close tickets
   */
  bulkCloseTickets: (data: BulkTicketClose) => 
    api.post<{ success: boolean; closed_count: number }>('/support/tickets/bulk-close', data),

  // Ticket Comments
  /**
   * Get comments for a ticket
   */
  getTicketComments: (ticketId: string) => 
    api.get<import('@/types/SLA').TicketComment[]>(`/support/tickets/${ticketId}/comments`),

  /**
   * Add a comment to a ticket
   */
  addTicketComment: (data: CreateCommentRequest) => 
    api.post<import('@/types/SLA').TicketComment>('/support/tickets/comments', data),

  /**
   * Update a ticket comment
   */
  updateTicketComment: (commentId: string, content: string) => 
    api.put<import('@/types/SLA').TicketComment>(`/support/tickets/comments/${commentId}`, { content }),

  /**
   * Delete a ticket comment
   */
  deleteTicketComment: (commentId: string) => 
    api.delete<{ success: boolean }>(`/support/tickets/comments/${commentId}`),

  // SLA Management
  /**
   * Get all SLAs
   */
  getSLAs: () => 
    api.get<SLA[]>('/support/slas'),

  /**
   * Get a specific SLA by ID
   */
  getSLA: (slaId: string) => 
    api.get<SLA>(`/support/slas/${slaId}`),

  /**
   * Create a new SLA
   */
  createSLA: (data: Omit<SLA, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => 
    api.post<SLA>('/support/slas', data),

  /**
   * Update an existing SLA
   */
  updateSLA: (slaId: string, data: Partial<Omit<SLA, 'id' | 'created_at' | 'updated_at' | 'created_by'>>) => 
    api.put<SLA>(`/support/slas/${slaId}`, data),

  /**
   * Delete an SLA
   */
  deleteSLA: (slaId: string) => 
    api.delete<{ success: boolean }>(`/support/slas/${slaId}`),

  // SLA Rules
  /**
   * Get rules for an SLA
   */
  getSLARules: (slaId: string) => 
    api.get<SLARule[]>(`/support/slas/${slaId}/rules`),

  /**
   * Create a new SLA rule
   */
  createSLARule: (data: CreateSLARuleRequest) => 
    api.post<SLARule>('/support/slas/rules', data),

  /**
   * Update an SLA rule
   */
  updateSLARule: (ruleId: string, data: Partial<Omit<SLARule, 'id' | 'sla_id' | 'created_at' | 'updated_at'>>) => 
    api.put<SLARule>(`/support/slas/rules/${ruleId}`, data),

  /**
   * Delete an SLA rule
   */
  deleteSLARule: (ruleId: string) => 
    api.delete<{ success: boolean }>(`/support/slas/rules/${ruleId}`),

  // Support Agents
  /**
   * Get all support agents
   */
  getAgents: () => 
    api.get<SupportAgent[]>('/support/agents'),

  /**
   * Get a specific agent by ID
   */
  getAgent: (agentId: string) => 
    api.get<SupportAgent>(`/support/agents/${agentId}`),

  /**
   * Update agent status
   */
  updateAgentStatus: (agentId: string, status: 'available' | 'busy' | 'away' | 'offline') => 
    api.put<SupportAgent>(`/support/agents/${agentId}/status`, { status }),

  /**
   * Get agent performance metrics
   */
  getAgentMetrics: (agentId: string, period: 'today' | 'week' | 'month' | 'quarter' | 'year' = 'month') => 
    api.get<import('@/types/SLA').AgentPerformanceMetrics>(`/support/agents/${agentId}/metrics?period=${period}`),

  // Support Queues
  /**
   * Get all support queues
   */
  getQueues: () => 
    api.get<SupportQueue[]>('/support/queues'),

  /**
   * Get a specific queue by ID
   */
  getQueue: (queueId: string) => 
    api.get<SupportQueue>(`/support/queues/${queueId}`),

  /**
   * Create a new support queue
   */
  createQueue: (data: CreateQueueRequest) => 
    api.post<SupportQueue>('/support/queues', data),

  /**
   * Update an existing queue
   */
  updateQueue: (queueId: string, data: Partial<Omit<SupportQueue, 'id' | 'created_at' | 'updated_at' | 'created_by'>>) => 
    api.put<SupportQueue>(`/support/queues/${queueId}`, data),

  /**
   * Delete a support queue
   */
  deleteQueue: (queueId: string) => 
    api.delete<{ success: boolean }>(`/support/queues/${queueId}`),

  // Dashboard and Analytics
  /**
   * Get support dashboard data
   */
  getDashboard: (period: 'today' | 'week' | 'month' | 'quarter' | 'year' = 'month') => 
    api.get<SupportDashboard>(`/support/dashboard?period=${period}`),

  /**
   * Get SLA performance metrics
   */
  getSLAPerformance: (slaId?: string, period: 'today' | 'week' | 'month' | 'quarter' | 'year' = 'month') => {
    const params = new URLSearchParams({ period });
    if (slaId) params.append('sla_id', slaId);
    return api.get<import('@/types/SLA').SLAPerformanceMetrics[]>(`/support/sla-performance?${params.toString()}`);
  },

  // Auto-triage
  /**
   * Get auto-triage suggestions for a ticket
   */
  getAutoTriageSuggestions: (ticketId: string) => 
    api.get<AutoTriageSuggestion[]>(`/support/tickets/${ticketId}/auto-triage`),

  /**
   * Apply auto-triage suggestions
   */
  applyAutoTriageSuggestions: (ticketId: string, suggestionIds: string[]) => 
    api.post<{ success: boolean; applied_count: number }>(`/support/tickets/${ticketId}/auto-triage/apply`, { suggestion_ids: suggestionIds }),

  /**
   * Run auto-triage on a ticket
   */
  runAutoTriage: (ticketId: string) => 
    api.post<AutoTriageResult>(`/support/tickets/${ticketId}/auto-triage/run`, {}),

  // Escalations
  /**
   * Escalate a ticket
   */
  escalateTicket: (ticketId: string, reason: string, escalateTo?: string) => 
    api.post<EscalationEvent>(`/support/tickets/${ticketId}/escalate`, { reason, escalate_to: escalateTo }),

  /**
   * Get escalation history for a ticket
   */
  getEscalationHistory: (ticketId: string) => 
    api.get<EscalationEvent[]>(`/support/tickets/${ticketId}/escalations`),

  // SLA Violations
  /**
   * Get SLA violations
   */
  getSLAViolations: (params?: {
    ticket_id?: string;
    sla_id?: string;
    status?: 'active' | 'resolved' | 'acknowledged';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<{ violations: SLAViolation[]; total: number; page: number; limit: number }>(`/support/sla-violations${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Acknowledge an SLA violation
   */
  acknowledgeSLAViolation: (violationId: string, notes?: string) => 
    api.put<SLAViolation>(`/support/sla-violations/${violationId}/acknowledge`, { notes }),

  /**
   * Resolve an SLA violation
   */
  resolveSLAViolation: (violationId: string, notes?: string) => 
    api.put<SLAViolation>(`/support/sla-violations/${violationId}/resolve`, { notes }),

  // Notifications
  /**
   * Get support notifications
   */
  getNotifications: (params?: {
    unread_only?: boolean;
    type?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<{ notifications: SupportNotification[]; total: number; page: number; limit: number }>(`/support/notifications${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Mark notification as read
   */
  markNotificationRead: (notificationId: string) => 
    api.put<{ success: boolean }>(`/support/notifications/${notificationId}/read`, {}),

  /**
   * Mark all notifications as read
   */
  markAllNotificationsRead: () => 
    api.put<{ success: boolean }>('/support/notifications/read-all', {}),

  // File Upload
  /**
   * Upload attachment for a ticket
   */
  uploadAttachment: (ticketId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<import('@/types/SLA').TicketAttachment>(`/support/tickets/${ticketId}/attachments`, formData);
  },

  /**
   * Delete an attachment
   */
  deleteAttachment: (attachmentId: string) => 
    api.delete<{ success: boolean }>(`/support/attachments/${attachmentId}`),

  // Reports and Analytics
  /**
   * Get ticket analytics
   */
  getTicketAnalytics: (params?: {
    period: 'today' | 'week' | 'month' | 'quarter' | 'year';
    group_by?: 'status' | 'priority' | 'category' | 'assignee' | 'client';
    start_date?: string;
    end_date?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<Record<string, any>>(`/support/analytics/tickets${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get agent performance report
   */
  getAgentPerformanceReport: (params?: {
    agent_ids?: string[];
    period: 'today' | 'week' | 'month' | 'quarter' | 'year';
    start_date?: string;
    end_date?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<import('@/types/SLA').AgentPerformanceMetrics[]>(`/support/analytics/agents${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Export tickets to CSV
   */
  exportTickets: (params: TicketSearchRequest & { format: 'csv' | 'xlsx' }) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    return api.get(`/support/tickets/export?${searchParams.toString()}`);
  },
};