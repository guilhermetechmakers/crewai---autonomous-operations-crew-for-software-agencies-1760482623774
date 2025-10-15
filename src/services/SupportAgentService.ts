import { supportApi } from '@/api/support';
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
  AgentPerformanceMetrics,
  SLAPerformanceMetrics,
} from '@/types/SLA';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

class SupportAgentService {
  private static instance: SupportAgentService;
  private retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  };

  private constructor() {}

  public static getInstance(): SupportAgentService {
    if (!SupportAgentService.instance) {
      SupportAgentService.instance = new SupportAgentService();
    }
    return SupportAgentService.instance;
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    context: string,
    retryCount = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retryCount >= this.retryConfig.maxRetries) {
        throw error;
      }

      const delay = Math.min(
        this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, retryCount),
        this.retryConfig.maxDelay
      );

      console.warn(`${context} failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.retryConfig.maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return this.retryWithBackoff(operation, context, retryCount + 1);
    }
  }

  // Ticket Management
  /**
   * Get tickets with advanced filtering and search
   */
  public async getTickets(params?: TicketSearchRequest): Promise<TicketSearchResponse> {
    return this.retryWithBackoff(
      () => supportApi.getTickets(params),
      'getTickets'
    );
  }

  /**
   * Get a specific ticket by ID
   */
  public async getTicket(ticketId: string): Promise<SupportTicket> {
    return this.retryWithBackoff(
      () => supportApi.getTicket(ticketId),
      'getTicket'
    );
  }

  /**
   * Create a new support ticket
   */
  public async createTicket(data: CreateTicketRequest): Promise<SupportTicket> {
    return this.retryWithBackoff(
      () => supportApi.createTicket(data),
      'createTicket'
    );
  }

  /**
   * Update an existing ticket
   */
  public async updateTicket(ticketId: string, data: UpdateTicketRequest): Promise<SupportTicket> {
    return this.retryWithBackoff(
      () => supportApi.updateTicket(ticketId, data),
      'updateTicket'
    );
  }

  /**
   * Delete a ticket (soft delete)
   */
  public async deleteTicket(ticketId: string): Promise<boolean> {
    const result = await this.retryWithBackoff(
      () => supportApi.deleteTicket(ticketId),
      'deleteTicket'
    );
    return result.success;
  }

  /**
   * Bulk update tickets
   */
  public async bulkUpdateTickets(data: BulkTicketUpdate): Promise<number> {
    const result = await this.retryWithBackoff(
      () => supportApi.bulkUpdateTickets(data),
      'bulkUpdateTickets'
    );
    return result.updated_count;
  }

  /**
   * Bulk assign tickets
   */
  public async bulkAssignTickets(data: BulkTicketAssign): Promise<number> {
    const result = await this.retryWithBackoff(
      () => supportApi.bulkAssignTickets(data),
      'bulkAssignTickets'
    );
    return result.assigned_count;
  }

  /**
   * Bulk close tickets
   */
  public async bulkCloseTickets(data: BulkTicketClose): Promise<number> {
    const result = await this.retryWithBackoff(
      () => supportApi.bulkCloseTickets(data),
      'bulkCloseTickets'
    );
    return result.closed_count;
  }

  // Ticket Comments
  /**
   * Add a comment to a ticket
   */
  public async addTicketComment(data: CreateCommentRequest): Promise<import('@/types/SLA').TicketComment> {
    return this.retryWithBackoff(
      () => supportApi.addTicketComment(data),
      'addTicketComment'
    );
  }

  /**
   * Get comments for a ticket
   */
  public async getTicketComments(ticketId: string): Promise<import('@/types/SLA').TicketComment[]> {
    return this.retryWithBackoff(
      () => supportApi.getTicketComments(ticketId),
      'getTicketComments'
    );
  }

  // SLA Management
  /**
   * Get all SLAs
   */
  public async getSLAs(): Promise<SLA[]> {
    return this.retryWithBackoff(
      () => supportApi.getSLAs(),
      'getSLAs'
    );
  }

  /**
   * Get a specific SLA by ID
   */
  public async getSLA(slaId: string): Promise<SLA> {
    return this.retryWithBackoff(
      () => supportApi.getSLA(slaId),
      'getSLA'
    );
  }

  /**
   * Create a new SLA
   */
  public async createSLA(data: Omit<SLA, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<SLA> {
    return this.retryWithBackoff(
      () => supportApi.createSLA(data),
      'createSLA'
    );
  }

  /**
   * Update an existing SLA
   */
  public async updateSLA(slaId: string, data: Partial<Omit<SLA, 'id' | 'created_at' | 'updated_at' | 'created_by'>>): Promise<SLA> {
    return this.retryWithBackoff(
      () => supportApi.updateSLA(slaId, data),
      'updateSLA'
    );
  }

  /**
   * Delete an SLA
   */
  public async deleteSLA(slaId: string): Promise<boolean> {
    const result = await this.retryWithBackoff(
      () => supportApi.deleteSLA(slaId),
      'deleteSLA'
    );
    return result.success;
  }

  // SLA Rules
  /**
   * Get rules for an SLA
   */
  public async getSLARules(slaId: string): Promise<SLARule[]> {
    return this.retryWithBackoff(
      () => supportApi.getSLARules(slaId),
      'getSLARules'
    );
  }

  /**
   * Create a new SLA rule
   */
  public async createSLARule(data: CreateSLARuleRequest): Promise<SLARule> {
    return this.retryWithBackoff(
      () => supportApi.createSLARule(data),
      'createSLARule'
    );
  }

  /**
   * Update an SLA rule
   */
  public async updateSLARule(ruleId: string, data: Partial<Omit<SLARule, 'id' | 'sla_id' | 'created_at' | 'updated_at'>>): Promise<SLARule> {
    return this.retryWithBackoff(
      () => supportApi.updateSLARule(ruleId, data),
      'updateSLARule'
    );
  }

  /**
   * Delete an SLA rule
   */
  public async deleteSLARule(ruleId: string): Promise<boolean> {
    const result = await this.retryWithBackoff(
      () => supportApi.deleteSLARule(ruleId),
      'deleteSLARule'
    );
    return result.success;
  }

  // Support Agents
  /**
   * Get all support agents
   */
  public async getAgents(): Promise<SupportAgent[]> {
    return this.retryWithBackoff(
      () => supportApi.getAgents(),
      'getAgents'
    );
  }

  /**
   * Get a specific agent by ID
   */
  public async getAgent(agentId: string): Promise<SupportAgent> {
    return this.retryWithBackoff(
      () => supportApi.getAgent(agentId),
      'getAgent'
    );
  }

  /**
   * Update agent status
   */
  public async updateAgentStatus(agentId: string, status: 'available' | 'busy' | 'away' | 'offline'): Promise<SupportAgent> {
    return this.retryWithBackoff(
      () => supportApi.updateAgentStatus(agentId, status),
      'updateAgentStatus'
    );
  }

  /**
   * Get agent performance metrics
   */
  public async getAgentMetrics(agentId: string, period: 'today' | 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<AgentPerformanceMetrics> {
    return this.retryWithBackoff(
      () => supportApi.getAgentMetrics(agentId, period),
      'getAgentMetrics'
    );
  }

  // Support Queues
  /**
   * Get all support queues
   */
  public async getQueues(): Promise<SupportQueue[]> {
    return this.retryWithBackoff(
      () => supportApi.getQueues(),
      'getQueues'
    );
  }

  /**
   * Get a specific queue by ID
   */
  public async getQueue(queueId: string): Promise<SupportQueue> {
    return this.retryWithBackoff(
      () => supportApi.getQueue(queueId),
      'getQueue'
    );
  }

  /**
   * Create a new support queue
   */
  public async createQueue(data: CreateQueueRequest): Promise<SupportQueue> {
    return this.retryWithBackoff(
      () => supportApi.createQueue(data),
      'createQueue'
    );
  }

  /**
   * Update an existing queue
   */
  public async updateQueue(queueId: string, data: Partial<Omit<SupportQueue, 'id' | 'created_at' | 'updated_at' | 'created_by'>>): Promise<SupportQueue> {
    return this.retryWithBackoff(
      () => supportApi.updateQueue(queueId, data),
      'updateQueue'
    );
  }

  /**
   * Delete a support queue
   */
  public async deleteQueue(queueId: string): Promise<boolean> {
    const result = await this.retryWithBackoff(
      () => supportApi.deleteQueue(queueId),
      'deleteQueue'
    );
    return result.success;
  }

  // Dashboard and Analytics
  /**
   * Get support dashboard data
   */
  public async getDashboard(period: 'today' | 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<SupportDashboard> {
    return this.retryWithBackoff(
      () => supportApi.getDashboard(period),
      'getDashboard'
    );
  }

  /**
   * Get SLA performance metrics
   */
  public async getSLAPerformance(slaId?: string, period: 'today' | 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<SLAPerformanceMetrics[]> {
    return this.retryWithBackoff(
      () => supportApi.getSLAPerformance(slaId, period),
      'getSLAPerformance'
    );
  }

  // Auto-triage
  /**
   * Get auto-triage suggestions for a ticket
   */
  public async getAutoTriageSuggestions(ticketId: string): Promise<AutoTriageSuggestion[]> {
    return this.retryWithBackoff(
      () => supportApi.getAutoTriageSuggestions(ticketId),
      'getAutoTriageSuggestions'
    );
  }

  /**
   * Apply auto-triage suggestions
   */
  public async applyAutoTriageSuggestions(ticketId: string, suggestionIds: string[]): Promise<number> {
    const result = await this.retryWithBackoff(
      () => supportApi.applyAutoTriageSuggestions(ticketId, suggestionIds),
      'applyAutoTriageSuggestions'
    );
    return result.applied_count;
  }

  /**
   * Run auto-triage on a ticket
   */
  public async runAutoTriage(ticketId: string): Promise<AutoTriageResult> {
    return this.retryWithBackoff(
      () => supportApi.runAutoTriage(ticketId),
      'runAutoTriage'
    );
  }

  // Escalations
  /**
   * Escalate a ticket
   */
  public async escalateTicket(ticketId: string, reason: string, escalateTo?: string): Promise<EscalationEvent> {
    return this.retryWithBackoff(
      () => supportApi.escalateTicket(ticketId, reason, escalateTo),
      'escalateTicket'
    );
  }

  /**
   * Get escalation history for a ticket
   */
  public async getEscalationHistory(ticketId: string): Promise<EscalationEvent[]> {
    return this.retryWithBackoff(
      () => supportApi.getEscalationHistory(ticketId),
      'getEscalationHistory'
    );
  }

  // SLA Violations
  /**
   * Get SLA violations
   */
  public async getSLAViolations(params?: {
    ticket_id?: string;
    sla_id?: string;
    status?: 'active' | 'resolved' | 'acknowledged';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    page?: number;
    limit?: number;
  }): Promise<{ violations: SLAViolation[]; total: number; page: number; limit: number }> {
    return this.retryWithBackoff(
      () => supportApi.getSLAViolations(params),
      'getSLAViolations'
    );
  }

  /**
   * Acknowledge an SLA violation
   */
  public async acknowledgeSLAViolation(violationId: string, notes?: string): Promise<SLAViolation> {
    return this.retryWithBackoff(
      () => supportApi.acknowledgeSLAViolation(violationId, notes),
      'acknowledgeSLAViolation'
    );
  }

  /**
   * Resolve an SLA violation
   */
  public async resolveSLAViolation(violationId: string, notes?: string): Promise<SLAViolation> {
    return this.retryWithBackoff(
      () => supportApi.resolveSLAViolation(violationId, notes),
      'resolveSLAViolation'
    );
  }

  // Notifications
  /**
   * Get support notifications
   */
  public async getNotifications(params?: {
    unread_only?: boolean;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{ notifications: SupportNotification[]; total: number; page: number; limit: number }> {
    return this.retryWithBackoff(
      () => supportApi.getNotifications(params),
      'getNotifications'
    );
  }

  /**
   * Mark notification as read
   */
  public async markNotificationRead(notificationId: string): Promise<boolean> {
    const result = await this.retryWithBackoff(
      () => supportApi.markNotificationRead(notificationId),
      'markNotificationRead'
    );
    return result.success;
  }

  /**
   * Mark all notifications as read
   */
  public async markAllNotificationsRead(): Promise<boolean> {
    const result = await this.retryWithBackoff(
      () => supportApi.markAllNotificationsRead(),
      'markAllNotificationsRead'
    );
    return result.success;
  }

  // File Upload
  /**
   * Upload attachment for a ticket
   */
  public async uploadAttachment(ticketId: string, file: File): Promise<import('@/types/SLA').TicketAttachment> {
    return this.retryWithBackoff(
      () => supportApi.uploadAttachment(ticketId, file),
      'uploadAttachment'
    );
  }

  /**
   * Delete an attachment
   */
  public async deleteAttachment(attachmentId: string): Promise<boolean> {
    const result = await this.retryWithBackoff(
      () => supportApi.deleteAttachment(attachmentId),
      'deleteAttachment'
    );
    return result.success;
  }

  // Utility Methods
  /**
   * Calculate SLA compliance rate
   */
  public calculateSLAComplianceRate(totalTickets: number, compliantTickets: number): number {
    if (totalTickets === 0) return 0;
    return Math.round((compliantTickets / totalTickets) * 100);
  }

  /**
   * Calculate average response time in minutes
   */
  public calculateAverageResponseTime(responseTimes: number[]): number {
    if (responseTimes.length === 0) return 0;
    const total = responseTimes.reduce((sum, time) => sum + time, 0);
    return Math.round(total / responseTimes.length);
  }

  /**
   * Calculate average resolution time in hours
   */
  public calculateAverageResolutionTime(resolutionTimes: number[]): number {
    if (resolutionTimes.length === 0) return 0;
    const total = resolutionTimes.reduce((sum, time) => sum + time, 0);
    return Math.round((total / resolutionTimes.length) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Format ticket priority for display
   */
  public formatPriority(priority: string): { label: string; color: string; bgColor: string } {
    const priorityMap = {
      low: { label: 'Low', color: 'text-green-600', bgColor: 'bg-green-100' },
      medium: { label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
      high: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100' },
      urgent: { label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-100' },
      critical: { label: 'Critical', color: 'text-red-800', bgColor: 'bg-red-200' },
    };
    return priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
  }

  /**
   * Format ticket status for display
   */
  public formatStatus(status: string): { label: string; color: string; bgColor: string } {
    const statusMap = {
      open: { label: 'Open', color: 'text-blue-600', bgColor: 'bg-blue-100' },
      in_progress: { label: 'In Progress', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
      pending_customer: { label: 'Pending Customer', color: 'text-purple-600', bgColor: 'bg-purple-100' },
      resolved: { label: 'Resolved', color: 'text-green-600', bgColor: 'bg-green-100' },
      closed: { label: 'Closed', color: 'text-gray-600', bgColor: 'bg-gray-100' },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.open;
  }

  /**
   * Check if ticket is overdue
   */
  public isTicketOverdue(ticket: SupportTicket): boolean {
    const now = new Date();
    const dueDate = new Date(ticket.due_date);
    return now > dueDate && !['resolved', 'closed'].includes(ticket.status);
  }

  /**
   * Check if ticket is due soon (within 2 hours)
   */
  public isTicketDueSoon(ticket: SupportTicket): boolean {
    const now = new Date();
    const dueDate = new Date(ticket.due_date);
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    return dueDate <= twoHoursFromNow && now <= dueDate && !['resolved', 'closed'].includes(ticket.status);
  }

  /**
   * Update retry configuration
   */
  public updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
  }
}

export default SupportAgentService;