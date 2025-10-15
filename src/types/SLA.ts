// Support Agent & SLA Management Types

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'pending_customer' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  category: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general';
  subcategory?: string;
  client_id: string;
  client_name: string;
  client_email: string;
  assignee_id?: string;
  assignee_name?: string;
  sla_id: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  due_date: string;
  response_due: string;
  resolution_due: string;
  tags: string[];
  attachments: TicketAttachment[];
  comments: TicketComment[];
  escalation_history: EscalationEvent[];
  auto_triage_suggestions: AutoTriageSuggestion[];
  satisfaction_rating?: number;
  satisfaction_feedback?: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  filename: string;
  file_size: number;
  mime_type: string;
  url: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  author_id: string;
  author_name: string;
  author_type: 'agent' | 'client' | 'system';
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  attachments?: TicketAttachment[];
}

export interface EscalationEvent {
  id: string;
  ticket_id: string;
  escalated_from: string;
  escalated_to: string;
  reason: string;
  escalated_by: string;
  escalated_at: string;
  resolved_at?: string;
  notes?: string;
}

export interface AutoTriageSuggestion {
  id: string;
  ticket_id: string;
  suggestion_type: 'category' | 'priority' | 'assignee' | 'escalation' | 'resolution';
  suggested_value: string;
  confidence_score: number; // 0-1
  reasoning: string;
  created_at: string;
  applied: boolean;
  applied_at?: string;
}

export interface SLA {
  id: string;
  name: string;
  description: string;
  client_id?: string; // null for default SLA
  client_name?: string;
  is_default: boolean;
  is_active: boolean;
  rules: SLARule[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface SLARule {
  id: string;
  sla_id: string;
  name: string;
  description: string;
  conditions: SLACondition[];
  actions: SLAAction[];
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SLACondition {
  id: string;
  rule_id: string;
  field: 'priority' | 'category' | 'client_id' | 'assignee_id' | 'created_at' | 'updated_at' | 'tags';
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | string[] | number;
  logical_operator?: 'AND' | 'OR';
}

export interface SLAAction {
  id: string;
  rule_id: string;
  action_type: 'set_priority' | 'assign_agent' | 'escalate' | 'set_due_date' | 'add_tag' | 'remove_tag' | 'send_notification' | 'auto_resolve';
  parameters: Record<string, any>;
  delay_minutes?: number;
  is_immediate: boolean;
}

export interface SLAViolation {
  id: string;
  ticket_id: string;
  sla_id: string;
  rule_id: string;
  violation_type: 'response_time' | 'resolution_time' | 'escalation_time';
  expected_time: string;
  actual_time?: string;
  violation_duration_minutes: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'acknowledged';
  created_at: string;
  resolved_at?: string;
  notes?: string;
}

export interface SupportAgent {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'agent' | 'senior_agent' | 'supervisor' | 'manager';
  status: 'available' | 'busy' | 'away' | 'offline';
  skills: string[];
  max_concurrent_tickets: number;
  current_ticket_count: number;
  performance_metrics: AgentPerformanceMetrics;
  created_at: string;
  updated_at: string;
}

export interface AgentPerformanceMetrics {
  tickets_resolved_today: number;
  tickets_resolved_this_week: number;
  tickets_resolved_this_month: number;
  average_resolution_time_hours: number;
  average_response_time_minutes: number;
  customer_satisfaction_score: number;
  sla_compliance_rate: number;
  escalation_rate: number;
}

export interface SupportQueue {
  id: string;
  name: string;
  description: string;
  filters: QueueFilter[];
  sort_order: QueueSortOrder;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface QueueFilter {
  id: string;
  queue_id: string;
  field: 'status' | 'priority' | 'category' | 'assignee_id' | 'client_id' | 'created_at' | 'updated_at' | 'tags';
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'is_null' | 'is_not_null';
  value: string | string[] | number | null;
  logical_operator?: 'AND' | 'OR';
}

export interface QueueSortOrder {
  field: 'created_at' | 'updated_at' | 'priority' | 'due_date' | 'client_name' | 'assignee_name';
  direction: 'asc' | 'desc';
  secondary_field?: 'created_at' | 'updated_at' | 'priority' | 'due_date' | 'client_name' | 'assignee_name';
  secondary_direction?: 'asc' | 'desc';
}

export interface SupportDashboard {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_today: number;
  overdue_tickets: number;
  sla_violations: number;
  average_response_time: number;
  average_resolution_time: number;
  customer_satisfaction: number;
  agent_utilization: number;
  tickets_by_priority: Record<string, number>;
  tickets_by_category: Record<string, number>;
  tickets_by_status: Record<string, number>;
  recent_activity: SupportActivity[];
  top_agents: AgentPerformanceMetrics[];
  sla_performance: SLAPerformanceMetrics[];
}

export interface SupportActivity {
  id: string;
  type: 'ticket_created' | 'ticket_updated' | 'ticket_resolved' | 'ticket_escalated' | 'sla_violation' | 'agent_assigned';
  ticket_id: string;
  ticket_title: string;
  user_id: string;
  user_name: string;
  description: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface SLAPerformanceMetrics {
  sla_id: string;
  sla_name: string;
  total_tickets: number;
  compliant_tickets: number;
  violation_tickets: number;
  compliance_rate: number;
  average_response_time: number;
  average_resolution_time: number;
  escalation_rate: number;
}

// API Request/Response Types
export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  category: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general';
  subcategory?: string;
  client_id: string;
  tags?: string[];
  attachments?: File[];
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'pending_customer' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  category?: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general';
  subcategory?: string;
  assignee_id?: string;
  tags?: string[];
}

export interface CreateCommentRequest {
  ticket_id: string;
  content: string;
  is_internal?: boolean;
  attachments?: File[];
}

export interface CreateSLARuleRequest {
  sla_id: string;
  name: string;
  description: string;
  conditions: Omit<SLACondition, 'id' | 'rule_id'>[];
  actions: Omit<SLAAction, 'id' | 'rule_id'>[];
  priority: number;
}

export interface CreateQueueRequest {
  name: string;
  description: string;
  filters: Omit<QueueFilter, 'id' | 'queue_id'>[];
  sort_order: QueueSortOrder;
  is_default?: boolean;
}

export interface TicketSearchRequest {
  query?: string;
  status?: string[];
  priority?: string[];
  category?: string[];
  assignee_id?: string;
  client_id?: string;
  tags?: string[];
  created_from?: string;
  created_to?: string;
  due_from?: string;
  due_to?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface TicketSearchResponse {
  tickets: SupportTicket[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  facets: {
    status: Record<string, number>;
    priority: Record<string, number>;
    category: Record<string, number>;
    assignee: Record<string, number>;
    client: Record<string, number>;
  };
}

// Auto-triage specific types
export interface AutoTriageConfig {
  enabled: boolean;
  confidence_threshold: number; // 0-1
  auto_apply_suggestions: boolean;
  suggestion_types: ('category' | 'priority' | 'assignee' | 'escalation' | 'resolution')[];
  model_version: string;
  last_trained: string;
}

export interface AutoTriageResult {
  ticket_id: string;
  suggestions: AutoTriageSuggestion[];
  confidence_scores: Record<string, number>;
  reasoning: string;
  processing_time_ms: number;
  model_version: string;
}

// Notification types
export interface SupportNotification {
  id: string;
  type: 'ticket_assigned' | 'ticket_escalated' | 'sla_violation' | 'ticket_due_soon' | 'ticket_overdue' | 'new_comment';
  ticket_id: string;
  ticket_title: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

// Bulk operations
export interface BulkTicketUpdate {
  ticket_ids: string[];
  updates: UpdateTicketRequest;
  reason?: string;
}

export interface BulkTicketAssign {
  ticket_ids: string[];
  assignee_id: string;
  reason?: string;
}

export interface BulkTicketClose {
  ticket_ids: string[];
  resolution: string;
  reason?: string;
}