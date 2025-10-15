import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  FileText, 
  Send, 
  Download, 
  MoreHorizontal,
  Eye,
  Trash2,
  Copy,
  Calendar,
  DollarSign,
  Users,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ProposalEditor } from '@/components/proposals/ProposalEditor';
import { ApprovalWorkflow } from '@/components/proposals/ApprovalWorkflow';
import { proposalApi, proposalWorkflowApi } from '@/api/proposals';
import { ProposalService } from '@/services/ProposalService';
import type { Proposal } from '@/types';

export default function ProposalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);

  // Fetch proposal data
  const { data: proposal, isLoading, error } = useQuery({
    queryKey: ['proposal', id],
    queryFn: () => proposalApi.getProposal(id!),
    enabled: !!id,
  });

  // Fetch clients for the editor
  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => Promise.resolve([]), // This would be a separate clients API
  });

  // Fetch projects for the editor
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => Promise.resolve([]), // This would be a separate projects API
  });

  // Update proposal mutation
  const updateProposalMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      proposalApi.updateProposal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal', id] });
      toast.success('Proposal saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save proposal');
    },
  });

  // Send proposal mutation
  const sendProposalMutation = useMutation({
    mutationFn: (data: any) => proposalApi.sendProposal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal', id] });
      toast.success('Proposal sent successfully');
      setShowSendDialog(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send proposal');
    },
  });

  // Approve proposal mutation
  const approveProposalMutation = useMutation({
    mutationFn: ({ proposalId, stepId, comments }: { proposalId: string; stepId: string; comments?: string }) =>
      proposalApi.approveProposal({ proposal_id: proposalId, step_id: stepId, comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal', id] });
      toast.success('Proposal step approved');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve proposal');
    },
  });

  // Reject proposal mutation
  const rejectProposalMutation = useMutation({
    mutationFn: ({ proposalId, stepId, comments }: { proposalId: string; stepId: string; comments: string }) =>
      proposalApi.rejectProposal({ proposal_id: proposalId, step_id: stepId, comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal', id] });
      toast.success('Proposal step rejected');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject proposal');
    },
  });

  // Skip proposal step mutation
  const skipProposalMutation = useMutation({
    mutationFn: ({ proposalId, stepId, reason }: { proposalId: string; stepId: string; reason?: string }) =>
      proposalWorkflowApi.skipStep(proposalId, stepId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal', id] });
      toast.success('Proposal step skipped');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to skip proposal step');
    },
  });

  // Resend proposal mutation
  const resendProposalMutation = useMutation({
    mutationFn: () => proposalWorkflowApi.resendProposal(id!),
    onSuccess: () => {
      toast.success('Proposal resent successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to resend proposal');
    },
  });

  const handleSave = async (proposalData: Partial<Proposal>) => {
    if (!id) return;
    await updateProposalMutation.mutateAsync({ id, data: proposalData });
  };

  const handlePreview = () => {
    setIsPreviewMode(true);
  };

  const handleApprove = async (stepId: string, comments?: string) => {
    if (!id) return;
    await approveProposalMutation.mutateAsync({ proposalId: id, stepId, comments });
  };

  const handleReject = async (stepId: string, comments: string) => {
    if (!id) return;
    await rejectProposalMutation.mutateAsync({ proposalId: id, stepId, comments });
  };

  const handleSkip = async (stepId: string, reason?: string) => {
    if (!id) return;
    await skipProposalMutation.mutateAsync({ proposalId: id, stepId, reason });
  };

  const handleResend = async () => {
    await resendProposalMutation.mutateAsync();
  };

  const handleSend = async (approvers: string[], message?: string) => {
    if (!id) return;
    await sendProposalMutation.mutateAsync({
      proposal_id: id,
      message,
      send_email: true,
      approvers,
    });
  };

  const handleExport = async (format: 'pdf' | 'word') => {
    if (!id) return;
    try {
      const response = await proposalApi.exportPdf(id); // or exportWord
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposal-${id}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Proposal exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export proposal');
    }
  };

  const handleDuplicate = async () => {
    if (!id) return;
    try {
      const response = await proposalApi.duplicateProposal(id);
      if (response.success && response.proposal) {
        navigate(`/proposals/${response.proposal.id}`);
        toast.success('Proposal duplicated successfully');
      }
    } catch (error) {
      toast.error('Failed to duplicate proposal');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) {
      return;
    }
    try {
      await proposalApi.deleteProposal(id);
      toast.success('Proposal deleted successfully');
      navigate('/proposals');
    } catch (error) {
      toast.error('Failed to delete proposal');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !proposal?.success || !proposal.proposal) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Proposal Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The proposal you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/proposals')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Proposals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const proposalData = proposal.proposal;
  const statusInfo = ProposalService.getProposalStatusInfo(proposalData.status);
  const timeRemaining = ProposalService.getTimeRemaining(proposalData.valid_until);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/proposals')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              {proposalData.title}
            </h1>
            <p className="text-muted-foreground">
              Created {ProposalService.formatDate(proposalData.created_at)} • 
              Version {proposalData.version}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={proposalData.status === 'approved' ? 'default' : 'secondary'}
            className="flex items-center gap-1"
          >
            {React.createElement(statusInfo.icon, { className: "h-3 w-3" })}
            {statusInfo.label}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsPreviewMode(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('word')}>
                <Download className="h-4 w-4 mr-2" />
                Export Word
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSendDialog(true)}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Proposal Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="font-semibold">
                  {ProposalService.formatCurrency(proposalData.total_amount, proposalData.currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-semibold">Client {proposalData.client_id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Valid Until</p>
                <p className="font-semibold">
                  {ProposalService.formatDate(proposalData.valid_until)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Time Remaining</p>
                <p className="font-semibold">
                  {timeRemaining.isExpired ? (
                    <span className="text-destructive">Expired</span>
                  ) : (
                    `${timeRemaining.days}d ${timeRemaining.hours}h`
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="editor" className="space-y-6">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="workflow">Approval Workflow</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <ProposalEditor
            proposal={proposalData}
            onSave={handleSave}
            onPreview={handlePreview}
            clients={clients || []}
            projects={projects || []}
          />
        </TabsContent>

        <TabsContent value="workflow">
          {proposalData.approval_workflow && (
            <ApprovalWorkflow
              workflow={proposalData.approval_workflow}
              onApprove={handleApprove}
              onReject={handleReject}
              onSkip={handleSkip}
              onResend={handleResend}
              currentUserId="current-user-id" // This would come from auth context
            />
          )}
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Comments & Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Comments and feedback functionality will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Proposal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Send this proposal to clients for review and approval.
            </p>
            {/* Send form would be implemented here */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSendDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSend(['client@example.com'])}>
                Send Proposal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewMode} onOpenChange={setIsPreviewMode}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Proposal Preview</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none">
            <h1>{proposalData.title}</h1>
            <p className="text-muted-foreground">{proposalData.description}</p>
            <div dangerouslySetInnerHTML={{ __html: proposalData.content }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}