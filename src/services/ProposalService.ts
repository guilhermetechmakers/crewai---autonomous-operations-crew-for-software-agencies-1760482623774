import { proposalApi, costEstimationApi } from '@/api/proposals';
import type {
  Proposal,
  CreateProposalRequest,
  UpdateProposalRequest,
  CostEstimationRequest,
  CostItem,
  CostBreakdown,
  ApprovalWorkflow,
  ApprovalStep,
} from '@/types';

/**
 * ProposalService - Business logic layer for proposal management
 */
export class ProposalService {
  /**
   * Create a new proposal with validation and default values
   */
  static async createProposal(data: CreateProposalRequest): Promise<Proposal> {
    try {
      // Validate required fields
      if (!data.title || !data.client_id) {
        throw new Error('Title and client ID are required');
      }

      // Set default values
      const proposalData: CreateProposalRequest = {
        ...data,
        cost_breakdown: {
          ...data.cost_breakdown,
          currency: data.cost_breakdown.currency || 'USD',
          tax_rate: data.cost_breakdown.tax_rate || 0,
          discount_rate: data.cost_breakdown.discount_rate || 0,
        },
        valid_until: data.valid_until || this.getDefaultValidUntil(),
      };

      const response = await proposalApi.createProposal(proposalData);
      
      if (!response.success || !response.proposal) {
        throw new Error(response.error || 'Failed to create proposal');
      }

      return response.proposal;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  }

  /**
   * Update an existing proposal
   */
  static async updateProposal(proposalId: string, data: UpdateProposalRequest): Promise<Proposal> {
    try {
      const response = await proposalApi.updateProposal(proposalId, data);
      
      if (!response.success || !response.proposal) {
        throw new Error(response.error || 'Failed to update proposal');
      }

      return response.proposal;
    } catch (error) {
      console.error('Error updating proposal:', error);
      throw error;
    }
  }

  /**
   * Send proposal to clients for review
   */
  static async sendProposal(proposalId: string, approvers: string[], message?: string): Promise<void> {
    try {
      const response = await proposalApi.sendProposal({
        proposal_id: proposalId,
        message,
        send_email: true,
        approvers,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to send proposal');
      }
    } catch (error) {
      console.error('Error sending proposal:', error);
      throw error;
    }
  }

  /**
   * Approve a proposal step
   */
  static async approveProposal(proposalId: string, stepId: string, comments?: string): Promise<ApprovalWorkflow> {
    try {
      const response = await proposalApi.approveProposal({
        proposal_id: proposalId,
        step_id: stepId,
        comments,
      });

      if (!response.success || !response.workflow) {
        throw new Error(response.error || 'Failed to approve proposal');
      }

      return response.workflow;
    } catch (error) {
      console.error('Error approving proposal:', error);
      throw error;
    }
  }

  /**
   * Reject a proposal step
   */
  static async rejectProposal(proposalId: string, stepId: string, comments: string): Promise<ApprovalWorkflow> {
    try {
      const response = await proposalApi.rejectProposal({
        proposal_id: proposalId,
        step_id: stepId,
        comments,
      });

      if (!response.success || !response.workflow) {
        throw new Error(response.error || 'Failed to reject proposal');
      }

      return response.workflow;
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      throw error;
    }
  }

  /**
   * Get cost estimation for a project
   */
  static async estimateProjectCost(data: CostEstimationRequest): Promise<{
    total_hours: number;
    total_cost: number;
    breakdown: CostItem[];
    timeline: number;
    confidence_score: number;
  }> {
    try {
      const response = await costEstimationApi.estimateCost(data);
      
      if (!response.success || !response.estimation) {
        throw new Error(response.error || 'Failed to estimate project cost');
      }

      return response.estimation;
    } catch (error) {
      console.error('Error estimating project cost:', error);
      throw error;
    }
  }

  /**
   * Calculate cost breakdown totals
   */
  static calculateCostBreakdown(items: CostItem[], taxRate: number = 0, discountRate: number = 0): CostBreakdown {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const discountAmount = subtotal * (discountRate / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);
    const total = taxableAmount + taxAmount;

    return {
      id: '', // Will be set by the API
      proposal_id: '', // Will be set by the API
      items,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      discount_rate: discountRate,
      discount_amount: discountAmount,
      total,
      currency: 'USD',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Create approval workflow steps
   */
  static createApprovalWorkflow(approvers: string[], dueDate?: string): ApprovalWorkflow {
    const now = new Date();
    const defaultDueDate = dueDate || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days from now

    const steps: ApprovalStep[] = approvers.map((approverId, index) => ({
      id: `step_${index + 1}`,
      step_number: index + 1,
      approver_id: approverId,
      approver_name: '', // Will be populated by the API
      approver_email: '', // Will be populated by the API
      status: 'pending',
      due_date: defaultDueDate,
      is_required: true,
    }));

    return {
      id: '', // Will be set by the API
      proposal_id: '', // Will be set by the API
      status: 'pending',
      steps,
      current_step: 0,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };
  }

  /**
   * Validate proposal data before submission
   */
  static validateProposal(data: Partial<Proposal>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Proposal title is required');
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.push('Proposal description is required');
    }

    if (!data.content || data.content.trim().length === 0) {
      errors.push('Proposal content is required');
    }

    if (!data.client_id) {
      errors.push('Client selection is required');
    }

    if (data.cost_breakdown && data.cost_breakdown.items.length === 0) {
      errors.push('At least one cost item is required');
    }

    if (data.cost_breakdown && data.cost_breakdown.total <= 0) {
      errors.push('Proposal total must be greater than zero');
    }

    if (data.valid_until && new Date(data.valid_until) <= new Date()) {
      errors.push('Valid until date must be in the future');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get proposal status display information
   */
  static getProposalStatusInfo(status: Proposal['status']): {
    label: string;
    color: string;
    icon: string;
  } {
    const statusMap = {
      draft: { label: 'Draft', color: 'text-muted-foreground', icon: 'FileText' },
      sent: { label: 'Sent', color: 'text-blue-500', icon: 'Send' },
      reviewed: { label: 'Under Review', color: 'text-yellow-500', icon: 'Eye' },
      approved: { label: 'Approved', color: 'text-green-500', icon: 'CheckCircle' },
      rejected: { label: 'Rejected', color: 'text-red-500', icon: 'XCircle' },
      expired: { label: 'Expired', color: 'text-gray-500', icon: 'Clock' },
    };

    return statusMap[status] || statusMap.draft;
  }

  /**
   * Get approval workflow status information
   */
  static getWorkflowStatusInfo(status: ApprovalWorkflow['status']): {
    label: string;
    color: string;
    icon: string;
  } {
    const statusMap = {
      pending: { label: 'Pending', color: 'text-yellow-500', icon: 'Clock' },
      in_review: { label: 'In Review', color: 'text-blue-500', icon: 'Eye' },
      approved: { label: 'Approved', color: 'text-green-500', icon: 'CheckCircle' },
      rejected: { label: 'Rejected', color: 'text-red-500', icon: 'XCircle' },
      expired: { label: 'Expired', color: 'text-gray-500', icon: 'Clock' },
    };

    return statusMap[status] || statusMap.pending;
  }

  /**
   * Calculate proposal completion percentage
   */
  static calculateCompletionPercentage(proposal: Partial<Proposal>): number {
    const requiredFields = [
      'title',
      'description',
      'content',
      'client_id',
      'cost_breakdown',
    ];

    const completedFields = requiredFields.filter(field => {
      const value = proposal[field as keyof Proposal];
      if (field === 'cost_breakdown') {
        return value && (value as CostBreakdown).items.length > 0;
      }
      return value && (typeof value === 'string' ? value.trim().length > 0 : true);
    });

    return Math.round((completedFields.length / requiredFields.length) * 100);
  }

  /**
   * Get default valid until date (30 days from now)
   */
  private static getDefaultValidUntil(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString();
  }

  /**
   * Format currency amount
   */
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  /**
   * Format date for display
   */
  static formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  }

  /**
   * Format date and time for display
   */
  static formatDateTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  }

  /**
   * Get time remaining until proposal expires
   */
  static getTimeRemaining(validUntil: string): {
    days: number;
    hours: number;
    minutes: number;
    isExpired: boolean;
  } {
    const now = new Date();
    const expiry = new Date(validUntil);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, isExpired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, isExpired: false };
  }
}