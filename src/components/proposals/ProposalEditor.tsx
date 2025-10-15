import { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Link, 
  Image, 
  Save, 
  Eye, 
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ProposalService } from '@/services/ProposalService';
import { CostEstimator } from './CostEstimator';
import type { Proposal, CostItem, CostBreakdown, User as UserType } from '@/types';

interface ProposalEditorProps {
  proposal?: Partial<Proposal>;
  onSave: (proposal: Partial<Proposal>) => void;
  onPreview: (proposal: Partial<Proposal>) => void;
  clients?: UserType[];
  projects?: Array<{ id: string; name: string; client_id: string }>;
  className?: string;
}

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

// Simple rich text editor component
function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const toolbarButtons = [
    { command: 'bold', icon: Bold, label: 'Bold' },
    { command: 'italic', icon: Italic, label: 'Italic' },
    { command: 'underline', icon: Underline, label: 'Underline' },
    { command: 'insertUnorderedList', icon: List, label: 'Bullet List' },
    { command: 'insertOrderedList', icon: ListOrdered, label: 'Numbered List' },
    { command: 'formatBlock', value: 'blockquote', icon: Quote, label: 'Quote' },
  ];

  return (
    <div className={cn('border rounded-lg', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
        {toolbarButtons.map(({ command, icon: Icon, label, value }) => (
          <Button
            key={command}
            variant="ghost"
            size="sm"
            onClick={() => execCommand(command, value)}
            title={label}
            className="h-8 w-8 p-0"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={insertLink}
          title="Insert Link"
          className="h-8 w-8 p-0"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertImage}
          title="Insert Image"
          className="h-8 w-8 p-0"
        >
          <Image className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'min-h-[400px] p-4 focus:outline-none prose prose-sm max-w-none',
          isFocused && 'ring-2 ring-primary ring-offset-2'
        )}
        style={{ minHeight: '400px' }}
        data-placeholder={placeholder}
      />
    </div>
  );
}

export function ProposalEditor({
  proposal = {},
  onSave,
  onPreview,
  clients = [],
  projects = [],
  className,
}: ProposalEditorProps) {
  const [formData, setFormData] = useState<Partial<Proposal>>({
    title: '',
    description: '',
    content: '',
    client_id: '',
    project_id: '',
    status: 'draft',
    total_amount: 0,
    currency: 'USD',
    valid_until: '',
    cost_breakdown: {
      id: '',
      proposal_id: '',
      items: [],
      subtotal: 0,
      tax_rate: 0,
      tax_amount: 0,
      discount_rate: 0,
      discount_amount: 0,
      total: 0,
      currency: 'USD',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    ...proposal,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when proposal prop changes
  useEffect(() => {
    if (proposal) {
      setFormData(prev => ({ ...prev, ...proposal }));
    }
  }, [proposal]);

  const handleInputChange = (field: keyof Proposal, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCostItemsChange = (items: CostItem[]) => {
    const costBreakdown = ProposalService.calculateCostBreakdown(
      items,
      formData.cost_breakdown?.tax_rate || 0,
      formData.cost_breakdown?.discount_rate || 0
    );
    
    setFormData(prev => ({
      ...prev,
      cost_breakdown: costBreakdown,
      total_amount: costBreakdown.total,
    }));
  };

  const handleCostBreakdownChange = (breakdown: CostBreakdown) => {
    setFormData(prev => ({
      ...prev,
      cost_breakdown: breakdown,
      total_amount: breakdown.total,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});

    try {
      // Validate form data
      const validation = ProposalService.validateProposal(formData);
      if (!validation.isValid) {
        const errorMap: Record<string, string> = {};
        validation.errors.forEach(error => {
          // Map validation errors to form fields
          if (error.includes('title')) errorMap.title = error;
          else if (error.includes('description')) errorMap.description = error;
          else if (error.includes('content')) errorMap.content = error;
          else if (error.includes('client')) errorMap.client_id = error;
          else if (error.includes('cost')) errorMap.cost_breakdown = error;
          else if (error.includes('Valid until')) errorMap.valid_until = error;
        });
        setErrors(errorMap);
        return;
      }

      await onSave(formData);
    } catch (error) {
      console.error('Error saving proposal:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    onPreview(formData);
  };

  const completionPercentage = ProposalService.calculateCompletionPercentage(formData);
  const selectedClient = clients.find(client => client.id === formData.client_id);
  const clientProjects = projects.filter(project => project.client_id === formData.client_id);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {formData.id ? 'Edit Proposal' : 'Create New Proposal'}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Draft and manage your project proposals with detailed cost breakdowns
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={completionPercentage === 100 ? 'default' : 'secondary'}>
                {completionPercentage}% Complete
              </Badge>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  disabled={completionPercentage < 50}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || completionPercentage < 50}
                  className="btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Bar */}
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Proposal Title *</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Website Development Proposal"
                    className={errors.title ? 'border-destructive' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_id">Client *</Label>
                  <Select
                    value={formData.client_id || ''}
                    onValueChange={(value) => handleInputChange('client_id', value)}
                  >
                    <SelectTrigger className={errors.client_id ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.full_name || client.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.client_id && (
                    <p className="text-sm text-destructive">{errors.client_id}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the proposal"
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              {selectedClient && clientProjects.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="project_id">Related Project (Optional)</Label>
                  <Select
                    value={formData.project_id || ''}
                    onValueChange={(value) => handleInputChange('project_id', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No project</SelectItem>
                      {clientProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rich Text Content */}
          <Card>
            <CardHeader>
              <CardTitle>Proposal Content</CardTitle>
              <p className="text-sm text-muted-foreground">
                Write the detailed content of your proposal using the rich text editor
              </p>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={formData.content || ''}
                onChange={(content) => handleInputChange('content', content)}
                placeholder="Start writing your proposal content here..."
                className={errors.content ? 'border-destructive' : ''}
              />
              {errors.content && (
                <p className="text-sm text-destructive mt-2">{errors.content}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing">
          <CostEstimator
            items={formData.cost_breakdown?.items || []}
            onItemsChange={handleCostItemsChange}
            onBreakdownChange={handleCostBreakdownChange}
            taxRate={formData.cost_breakdown?.tax_rate || 0}
            discountRate={formData.cost_breakdown?.discount_rate || 0}
            currency={formData.currency || 'USD'}
          />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency || 'USD'}
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valid_until">Valid Until *</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until ? formData.valid_until.split('T')[0] : ''}
                    onChange={(e) => handleInputChange('valid_until', e.target.value + 'T23:59:59.999Z')}
                    min={new Date().toISOString().split('T')[0]}
                    className={errors.valid_until ? 'border-destructive' : ''}
                  />
                  {errors.valid_until && (
                    <p className="text-sm text-destructive">{errors.valid_until}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.cost_breakdown?.tax_rate || 0}
                    onChange={(e) => {
                      const taxRate = parseFloat(e.target.value) || 0;
                      const breakdown = ProposalService.calculateCostBreakdown(
                        formData.cost_breakdown?.items || [],
                        taxRate,
                        formData.cost_breakdown?.discount_rate || 0
                      );
                      handleInputChange('cost_breakdown', breakdown);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_rate">Discount Rate (%)</Label>
                  <Input
                    id="discount_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.cost_breakdown?.discount_rate || 0}
                    onChange={(e) => {
                      const discountRate = parseFloat(e.target.value) || 0;
                      const breakdown = ProposalService.calculateCostBreakdown(
                        formData.cost_breakdown?.items || [],
                        formData.cost_breakdown?.tax_rate || 0,
                        discountRate
                      );
                      handleInputChange('cost_breakdown', breakdown);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Preview</CardTitle>
              <p className="text-sm text-muted-foreground">
                This is how your proposal will appear to clients
              </p>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <h1>{formData.title || 'Untitled Proposal'}</h1>
                <p className="text-muted-foreground">{formData.description}</p>
                <div dangerouslySetInnerHTML={{ __html: formData.content || '' }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}