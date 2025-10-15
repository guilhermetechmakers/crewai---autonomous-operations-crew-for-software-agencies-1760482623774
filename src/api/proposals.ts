import { api } from '@/lib/api';
import type {
  Proposal,
  CreateProposalRequest,
  CreateProposalResponse,
  UpdateProposalRequest,
  UpdateProposalResponse,
  SendProposalRequest,
  SendProposalResponse,
  ApproveProposalRequest,
  ApproveProposalResponse,
  RejectProposalRequest,
  RejectProposalResponse,
  GetProposalsRequest,
  GetProposalsResponse,
  GetProposalResponse,
  DeleteProposalResponse,
  CostEstimationRequest,
  CostEstimationResponse,
  ProposalTemplate,
  ProposalAnalytics,
} from '@/types';

/**
 * Proposal API functions with comprehensive error handling
 */
export const proposalApi = {
  /**
   * Get all proposals with optional filtering and pagination
   */
  getProposals: (params: GetProposalsRequest = {}) => {
    const searchParams = new URLSearchParams();
    
    if (params.client_id) searchParams.append('client_id', params.client_id);
    if (params.project_id) searchParams.append('project_id', params.project_id);
    if (params.status) searchParams.append('status', params.status);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/proposals?${queryString}` : '/proposals';
    
    return api.get<GetProposalsResponse>(endpoint);
  },

  /**
   * Get a specific proposal by ID
   */
  getProposal: (proposalId: string) => {
    return api.get<GetProposalResponse>(`/proposals/${proposalId}`);
  },

  /**
   * Create a new proposal
   */
  createProposal: (data: CreateProposalRequest) => {
    return api.post<CreateProposalResponse>('/proposals', data);
  },

  /**
   * Update an existing proposal
   */
  updateProposal: (proposalId: string, data: UpdateProposalRequest) => {
    return api.put<UpdateProposalResponse>(`/proposals/${proposalId}`, data);
  },

  /**
   * Delete a proposal
   */
  deleteProposal: (proposalId: string) => {
    return api.delete<DeleteProposalResponse>(`/proposals/${proposalId}`);
  },

  /**
   * Send a proposal to clients for review
   */
  sendProposal: (data: SendProposalRequest) => {
    return api.post<SendProposalResponse>('/proposals/send', data);
  },

  /**
   * Approve a proposal step
   */
  approveProposal: (data: ApproveProposalRequest) => {
    return api.post<ApproveProposalResponse>('/proposals/approve', data);
  },

  /**
   * Reject a proposal step
   */
  rejectProposal: (data: RejectProposalRequest) => {
    return api.post<RejectProposalResponse>('/proposals/reject', data);
  },

  /**
   * Duplicate an existing proposal
   */
  duplicateProposal: (proposalId: string, newTitle?: string) => {
    return api.post<CreateProposalResponse>(`/proposals/${proposalId}/duplicate`, {
      new_title: newTitle,
    });
  },

  /**
   * Get proposal templates
   */
  getTemplates: () => {
    return api.get<{ success: boolean; templates?: ProposalTemplate[]; error?: string }>('/proposals/templates');
  },

  /**
   * Create a proposal from template
   */
  createFromTemplate: (templateId: string, clientId: string, customizations?: Record<string, any>) => {
    return api.post<CreateProposalResponse>('/proposals/from-template', {
      template_id: templateId,
      client_id: clientId,
      customizations,
    });
  },

  /**
   * Save proposal as template
   */
  saveAsTemplate: (proposalId: string, templateName: string, isPublic: boolean = false) => {
    return api.post<{ success: boolean; template?: ProposalTemplate; error?: string }>('/proposals/save-template', {
      proposal_id: proposalId,
      template_name: templateName,
      is_public: isPublic,
    });
  },

  /**
   * Get proposal analytics and metrics
   */
  getAnalytics: (timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month') => {
    return api.get<{ success: boolean; analytics?: ProposalAnalytics; error?: string }>(`/proposals/analytics?timeframe=${timeframe}`);
  },

  /**
   * Get proposal comments
   */
  getComments: (proposalId: string) => {
    return api.get<{ success: boolean; comments?: any[]; error?: string }>(`/proposals/${proposalId}/comments`);
  },

  /**
   * Add comment to proposal
   */
  addComment: (proposalId: string, content: string, isInternal: boolean = false) => {
    return api.post<{ success: boolean; comment?: any; error?: string }>(`/proposals/${proposalId}/comments`, {
      content,
      is_internal: isInternal,
    });
  },

  /**
   * Upload attachment to proposal
   */
  uploadAttachment: (proposalId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post<{ success: boolean; attachment?: any; error?: string }>(`/proposals/${proposalId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Delete proposal attachment
   */
  deleteAttachment: (proposalId: string, attachmentId: string) => {
    return api.delete<{ success: boolean; error?: string }>(`/proposals/${proposalId}/attachments/${attachmentId}`);
  },

  /**
   * Export proposal as PDF
   */
  exportPdf: (proposalId: string) => {
    return api.get<Blob>(`/proposals/${proposalId}/export/pdf`);
  },

  /**
   * Export proposal as Word document
   */
  exportWord: (proposalId: string) => {
    return api.get<Blob>(`/proposals/${proposalId}/export/word`);
  },
};

/**
 * Cost estimation API functions
 */
export const costEstimationApi = {
  /**
   * Get cost estimation based on project requirements
   */
  estimateCost: (data: CostEstimationRequest) => {
    return api.post<CostEstimationResponse>('/proposals/cost-estimation', data);
  },

  /**
   * Get pricing templates for different project types
   */
  getPricingTemplates: () => {
    return api.get<{ success: boolean; templates?: any[]; error?: string }>('/proposals/pricing-templates');
  },

  /**
   * Calculate proposal total with custom rates
   */
  calculateTotal: (items: any[], taxRate: number = 0, discountRate: number = 0) => {
    return api.post<{ success: boolean; calculation?: any; error?: string }>('/proposals/calculate-total', {
      items,
      tax_rate: taxRate,
      discount_rate: discountRate,
    });
  },
};

/**
 * Proposal workflow API functions
 */
export const proposalWorkflowApi = {
  /**
   * Get approval workflow status
   */
  getWorkflowStatus: (proposalId: string) => {
    return api.get<{ success: boolean; workflow?: any; error?: string }>(`/proposals/${proposalId}/workflow`);
  },

  /**
   * Update workflow configuration
   */
  updateWorkflow: (proposalId: string, approvers: string[], dueDate?: string) => {
    return api.put<{ success: boolean; workflow?: any; error?: string }>(`/proposals/${proposalId}/workflow`, {
      approvers,
      due_date: dueDate,
    });
  },

  /**
   * Skip approval step
   */
  skipStep: (proposalId: string, stepId: string, reason?: string) => {
    return api.post<{ success: boolean; workflow?: any; error?: string }>(`/proposals/${proposalId}/workflow/skip`, {
      step_id: stepId,
      reason,
    });
  },

  /**
   * Resend proposal to approvers
   */
  resendProposal: (proposalId: string, message?: string) => {
    return api.post<{ success: boolean; error?: string }>(`/proposals/${proposalId}/resend`, {
      message,
    });
  },
};

/**
 * Client portal proposal API functions
 */
export const clientPortalProposalApi = {
  /**
   * Get proposals accessible to client
   */
  getClientProposals: (clientToken: string) => {
    return api.get<{ success: boolean; proposals?: Proposal[]; error?: string }>('/client-portal/proposals', {
      headers: {
        'X-Client-Token': clientToken,
      },
    });
  },

  /**
   * Get specific proposal for client
   */
  getClientProposal: (proposalId: string, clientToken: string) => {
    return api.get<{ success: boolean; proposal?: Proposal; error?: string }>(`/client-portal/proposals/${proposalId}`, {
      headers: {
        'X-Client-Token': clientToken,
      },
    });
  },

  /**
   * Client approves proposal
   */
  clientApprove: (proposalId: string, clientToken: string, comments?: string) => {
    return api.post<{ success: boolean; error?: string }>(`/client-portal/proposals/${proposalId}/approve`, {
      comments,
    }, {
      headers: {
        'X-Client-Token': clientToken,
      },
    });
  },

  /**
   * Client rejects proposal
   */
  clientReject: (proposalId: string, clientToken: string, comments: string) => {
    return api.post<{ success: boolean; error?: string }>(`/client-portal/proposals/${proposalId}/reject`, {
      comments,
    }, {
      headers: {
        'X-Client-Token': clientToken,
      },
    });
  },

  /**
   * Client adds comment to proposal
   */
  clientAddComment: (proposalId: string, clientToken: string, content: string) => {
    return api.post<{ success: boolean; comment?: any; error?: string }>(`/client-portal/proposals/${proposalId}/comments`, {
      content,
    }, {
      headers: {
        'X-Client-Token': clientToken,
      },
    });
  },
};