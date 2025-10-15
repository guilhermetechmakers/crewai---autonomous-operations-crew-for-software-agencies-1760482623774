import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Calendar,
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ProposalService } from '@/services/ProposalService';
import type { ApprovalWorkflow, ApprovalStep } from '@/types';

interface ApprovalWorkflowProps {
  workflow: ApprovalWorkflow;
  onApprove: (stepId: string, comments?: string) => Promise<void>;
  onReject: (stepId: string, comments: string) => Promise<void>;
  onSkip: (stepId: string, reason?: string) => Promise<void>;
  onResend: () => Promise<void>;
  currentUserId?: string;
  isClientView?: boolean;
  className?: string;
}

interface StepActionDialogProps {
  action: 'approve' | 'reject' | 'skip';
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (action: 'approve' | 'reject' | 'skip', comments: string) => Promise<void>;
  loading?: boolean;
}

function StepActionDialog({ 
  action, 
  isOpen, 
  onClose, 
  onSubmit
}: StepActionDialogProps) {
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (action === 'reject' && !comments.trim()) {
      return; // Comments required for rejection
    }

    setIsSubmitting(true);
    try {
      await onSubmit(action, comments);
      setComments('');
      onClose();
    } catch (error) {
      console.error('Error submitting action:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionInfo = () => {
    switch (action) {
      case 'approve':
        return {
          title: 'Approve Proposal',
          description: 'Approve this proposal step. You can add optional comments.',
          buttonText: 'Approve',
          buttonVariant: 'default' as const,
          icon: CheckCircle2,
        };
      case 'reject':
        return {
          title: 'Reject Proposal',
          description: 'Reject this proposal step. Comments are required.',
          buttonText: 'Reject',
          buttonVariant: 'destructive' as const,
          icon: XCircle,
        };
      case 'skip':
        return {
          title: 'Skip Step',
          description: 'Skip this approval step. Provide a reason if needed.',
          buttonText: 'Skip',
          buttonVariant: 'outline' as const,
          icon: MoreHorizontal,
        };
    }
  };

  const actionInfo = getActionInfo();
  const Icon = actionInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {actionInfo.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {actionInfo.description}
          </p>

          <div className="space-y-2">
            <Label htmlFor="comments">
              Comments {action === 'reject' && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={
                action === 'approve' 
                  ? 'Optional comments about your approval...'
                  : action === 'reject'
                  ? 'Please explain why you are rejecting this proposal...'
                  : 'Optional reason for skipping this step...'
              }
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant={actionInfo.buttonVariant}
              onClick={handleSubmit}
              disabled={isSubmitting || (action === 'reject' && !comments.trim())}
            >
              {isSubmitting ? 'Processing...' : actionInfo.buttonText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ApprovalWorkflow({
  workflow,
  onApprove,
  onReject,
  onSkip,
  onResend,
  currentUserId,
  isClientView = false,
  className,
}: ApprovalWorkflowProps) {
  const [actionDialog, setActionDialog] = useState<{
    step: ApprovalStep | null;
    action: 'approve' | 'reject' | 'skip' | null;
  }>({ step: null, action: null });
  const [isLoading, setIsLoading] = useState(false);

  const getStepStatusInfo = (step: ApprovalStep) => {
    switch (step.status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          label: 'Pending',
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          label: 'Approved',
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          label: 'Rejected',
        };
      case 'skipped':
        return {
          icon: MoreHorizontal,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          label: 'Skipped',
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          label: 'Unknown',
        };
    }
  };

  const getWorkflowStatusInfo = () => {
    return ProposalService.getWorkflowStatusInfo(workflow.status);
  };

  const canCurrentUserAct = (step: ApprovalStep) => {
    if (isClientView) return false;
    if (!currentUserId) return false;
    return step.approver_id === currentUserId && step.status === 'pending';
  };

  const isStepOverdue = (step: ApprovalStep) => {
    return step.status === 'pending' && new Date(step.due_date) < new Date();
  };

  const getProgressPercentage = () => {
    const completedSteps = workflow.steps.filter(step => 
      step.status === 'approved' || step.status === 'skipped'
    ).length;
    return Math.round((completedSteps / workflow.steps.length) * 100);
  };

  const handleAction = async (action: 'approve' | 'reject' | 'skip', comments: string) => {
    if (!actionDialog.step) return;

    setIsLoading(true);
    try {
      switch (action) {
        case 'approve':
          await onApprove(actionDialog.step.id, comments);
          break;
        case 'reject':
          await onReject(actionDialog.step.id, comments);
          break;
        case 'skip':
          await onSkip(actionDialog.step.id, comments);
          break;
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setIsLoading(false);
      setActionDialog({ step: null, action: null });
    }
  };

  const workflowStatusInfo = getWorkflowStatusInfo();
  const progressPercentage = getProgressPercentage();

  return (
    <div className={cn('space-y-6', className)}>
      {/* Workflow Header */}
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Approval Workflow
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {workflow.steps.length} approval step{workflow.steps.length !== 1 ? 's' : ''} • 
                Current step: {workflow.current_step + 1} of {workflow.steps.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={workflow.status === 'approved' ? 'default' : 'secondary'}
                className={cn('flex items-center gap-1', workflowStatusInfo.color)}
              >
                {React.createElement(workflowStatusInfo.icon, { className: "h-3 w-3" })}
                {workflowStatusInfo.label}
              </Badge>
              {!isClientView && workflow.status === 'pending' && (
                <Button variant="outline" size="sm" onClick={onResend}>
                  <Send className="h-4 w-4 mr-2" />
                  Resend
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Approval Steps */}
      <div className="space-y-4">
        {workflow.steps.map((step, index) => {
          const statusInfo = getStepStatusInfo(step);
          const Icon = statusInfo.icon;
          const isOverdue = isStepOverdue(step);
          const canAct = canCurrentUserAct(step);
          const isCurrentStep = index === workflow.current_step;

          return (
            <Card 
              key={step.id} 
              className={cn(
                'transition-all duration-200',
                isCurrentStep && 'ring-2 ring-primary ring-offset-2',
                isOverdue && 'border-red-200 dark:border-red-800',
                statusInfo.borderColor
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Step Number & Status */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                      statusInfo.bgColor,
                      statusInfo.borderColor,
                      'border-2'
                    )}>
                      {step.status === 'approved' || step.status === 'skipped' ? (
                        <Icon className="h-4 w-4" />
                      ) : (
                        step.step_number
                      )}
                    </div>
                    {index < workflow.steps.length - 1 && (
                      <div className={cn(
                        'w-0.5 h-8 mt-2',
                        step.status === 'approved' || step.status === 'skipped'
                          ? 'bg-green-200 dark:bg-green-800'
                          : 'bg-gray-200 dark:bg-gray-800'
                      )} />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{step.approver_name}</h4>
                        <p className="text-sm text-muted-foreground">{step.approver_email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={step.status === 'approved' ? 'default' : 'secondary'}
                          className={cn('flex items-center gap-1', statusInfo.color)}
                        >
                          <Icon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Due: {ProposalService.formatDate(step.due_date)}
                      {step.approved_at && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Completed: {ProposalService.formatDateTime(step.approved_at)}</span>
                        </>
                      )}
                    </div>

                    {/* Comments */}
                    {step.comments && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Comments:</p>
                            <p className="text-sm text-muted-foreground">{step.comments}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {canAct && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          onClick={() => setActionDialog({ step, action: 'approve' })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setActionDialog({ step, action: 'reject' })}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActionDialog({ step, action: 'skip' })}
                        >
                          <MoreHorizontal className="h-4 w-4 mr-2" />
                          Skip
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Dialog */}
      {actionDialog.step && actionDialog.action && (
        <StepActionDialog
          action={actionDialog.action!}
          isOpen={true}
          onClose={() => setActionDialog({ step: null, action: null })}
          onSubmit={handleAction}
          loading={isLoading}
        />
      )}

      {/* Workflow Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workflow Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Total Steps</p>
              <p className="font-medium">{workflow.steps.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Completed</p>
              <p className="font-medium text-green-600">
                {workflow.steps.filter(s => s.status === 'approved' || s.status === 'skipped').length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium">{workflowStatusInfo.label}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}