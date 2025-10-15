import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { proposalApi } from '@/api/proposals';
import type { Proposal, CreateProposalRequest, UpdateProposalRequest } from '@/types';

interface ProposalState {
  proposals: Proposal[];
  currentProposal: Proposal | null;
  loading: boolean;
  error: string | null;
  filters: {
    status: string;
    clientId: string;
    searchTerm: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: ProposalState = {
  proposals: [],
  currentProposal: null,
  loading: false,
  error: null,
  filters: {
    status: 'all',
    clientId: '',
    searchTerm: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchProposals = createAsyncThunk(
  'proposals/fetchProposals',
  async (params: {
    status?: string;
    clientId?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const response = await proposalApi.getProposals({
      status: params.status === 'all' ? undefined : params.status as Proposal['status'],
      client_id: params.clientId || undefined,
      page: params.page,
      limit: params.limit,
    });
    return response;
  }
);

export const fetchProposal = createAsyncThunk(
  'proposals/fetchProposal',
  async (proposalId: string) => {
    const response = await proposalApi.getProposal(proposalId);
    return response;
  }
);

export const createProposal = createAsyncThunk(
  'proposals/createProposal',
  async (proposalData: CreateProposalRequest) => {
    const response = await proposalApi.createProposal(proposalData);
    return response;
  }
);

export const updateProposal = createAsyncThunk(
  'proposals/updateProposal',
  async ({ id, data }: { id: string; data: UpdateProposalRequest }) => {
    const response = await proposalApi.updateProposal(id, data);
    return response;
  }
);

export const deleteProposal = createAsyncThunk(
  'proposals/deleteProposal',
  async (proposalId: string) => {
    const response = await proposalApi.deleteProposal(proposalId);
    return { proposalId, response };
  }
);

export const sendProposal = createAsyncThunk(
  'proposals/sendProposal',
  async (data: { proposalId: string; approvers: string[]; message?: string }) => {
    const response = await proposalApi.sendProposal({
      proposal_id: data.proposalId,
      message: data.message,
      send_email: true,
      approvers: data.approvers,
    });
    return response;
  }
);

export const approveProposal = createAsyncThunk(
  'proposals/approveProposal',
  async ({ proposalId, stepId, comments }: { proposalId: string; stepId: string; comments?: string }) => {
    const response = await proposalApi.approveProposal({
      proposal_id: proposalId,
      step_id: stepId,
      comments,
    });
    return response;
  }
);

export const rejectProposal = createAsyncThunk(
  'proposals/rejectProposal',
  async ({ proposalId, stepId, comments }: { proposalId: string; stepId: string; comments: string }) => {
    const response = await proposalApi.rejectProposal({
      proposal_id: proposalId,
      step_id: stepId,
      comments,
    });
    return response;
  }
);

export const duplicateProposal = createAsyncThunk(
  'proposals/duplicateProposal',
  async ({ proposalId, newTitle }: { proposalId: string; newTitle?: string }) => {
    const response = await proposalApi.duplicateProposal(proposalId, newTitle);
    return response;
  }
);

const proposalSlice = createSlice({
  name: 'proposals',
  initialState,
  reducers: {
    setCurrentProposal: (state, action: PayloadAction<Proposal | null>) => {
      state.currentProposal = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<ProposalState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action: PayloadAction<Partial<ProposalState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    updateProposalInList: (state, action: PayloadAction<Proposal>) => {
      const index = state.proposals.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.proposals[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch proposals
    builder
      .addCase(fetchProposals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProposals.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.proposals) {
          state.proposals = action.payload.proposals;
          if (action.payload.pagination) {
            state.pagination = {
              page: action.payload.pagination.page,
              limit: action.payload.pagination.limit,
              total: action.payload.pagination.total,
              totalPages: action.payload.pagination.total_pages,
            };
          }
        } else {
          state.error = action.payload.error || 'Failed to fetch proposals';
        }
      })
      .addCase(fetchProposals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch proposals';
      });

    // Fetch single proposal
    builder
      .addCase(fetchProposal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProposal.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.proposal) {
          state.currentProposal = action.payload.proposal;
        } else {
          state.error = action.payload.error || 'Failed to fetch proposal';
        }
      })
      .addCase(fetchProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch proposal';
      });

    // Create proposal
    builder
      .addCase(createProposal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProposal.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.proposal) {
          state.proposals.unshift(action.payload.proposal);
          state.currentProposal = action.payload.proposal;
        } else {
          state.error = action.payload.error || 'Failed to create proposal';
        }
      })
      .addCase(createProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create proposal';
      });

    // Update proposal
    builder
      .addCase(updateProposal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProposal.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.proposal) {
          const index = state.proposals.findIndex(p => p.id === action.payload.proposal!.id);
          if (index !== -1) {
            state.proposals[index] = action.payload.proposal!;
          }
          if (state.currentProposal?.id === action.payload.proposal!.id) {
            state.currentProposal = action.payload.proposal!;
          }
        } else {
          state.error = action.payload.error || 'Failed to update proposal';
        }
      })
      .addCase(updateProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update proposal';
      });

    // Delete proposal
    builder
      .addCase(deleteProposal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProposal.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.response.success) {
          state.proposals = state.proposals.filter(p => p.id !== action.payload.proposalId);
          if (state.currentProposal?.id === action.payload.proposalId) {
            state.currentProposal = null;
          }
        } else {
          state.error = action.payload.response.error || 'Failed to delete proposal';
        }
      })
      .addCase(deleteProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete proposal';
      });

    // Send proposal
    builder
      .addCase(sendProposal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendProposal.fulfilled, (state, action) => {
        state.loading = false;
        if (!action.payload.success) {
          state.error = action.payload.error || 'Failed to send proposal';
        }
      })
      .addCase(sendProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send proposal';
      });

    // Approve proposal
    builder
      .addCase(approveProposal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveProposal.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.workflow) {
          // Update the workflow in the current proposal
          if (state.currentProposal) {
            state.currentProposal.approval_workflow = action.payload.workflow;
          }
        } else {
          state.error = action.payload.error || 'Failed to approve proposal';
        }
      })
      .addCase(approveProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to approve proposal';
      });

    // Reject proposal
    builder
      .addCase(rejectProposal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectProposal.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.workflow) {
          // Update the workflow in the current proposal
          if (state.currentProposal) {
            state.currentProposal.approval_workflow = action.payload.workflow;
          }
        } else {
          state.error = action.payload.error || 'Failed to reject proposal';
        }
      })
      .addCase(rejectProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to reject proposal';
      });

    // Duplicate proposal
    builder
      .addCase(duplicateProposal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(duplicateProposal.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.proposal) {
          state.proposals.unshift(action.payload.proposal);
          state.currentProposal = action.payload.proposal;
        } else {
          state.error = action.payload.error || 'Failed to duplicate proposal';
        }
      })
      .addCase(duplicateProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to duplicate proposal';
      });
  },
});

export const {
  setCurrentProposal,
  setFilters,
  setPagination,
  clearError,
  updateProposalInList,
} = proposalSlice.actions;

export default proposalSlice.reducer;