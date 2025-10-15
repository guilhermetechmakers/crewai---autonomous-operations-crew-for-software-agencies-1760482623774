import { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { ProposalService } from '@/services/ProposalService';
import type { CostItem, CostBreakdown } from '@/types';

interface CostEstimatorProps {
  items: CostItem[];
  onItemsChange: (items: CostItem[]) => void;
  onBreakdownChange: (breakdown: CostBreakdown) => void;
  taxRate?: number;
  discountRate?: number;
  currency?: string;
  className?: string;
}

const COST_CATEGORIES = [
  { value: 'development', label: 'Development', icon: 'Code' },
  { value: 'design', label: 'Design', icon: 'Palette' },
  { value: 'testing', label: 'Testing', icon: 'TestTube' },
  { value: 'deployment', label: 'Deployment', icon: 'Rocket' },
  { value: 'maintenance', label: 'Maintenance', icon: 'Wrench' },
  { value: 'consulting', label: 'Consulting', icon: 'Users' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal' },
] as const;

const DEFAULT_HOURLY_RATES = {
  development: 150,
  design: 120,
  testing: 100,
  deployment: 80,
  maintenance: 100,
  consulting: 200,
  other: 100,
};

export function CostEstimator({
  items,
  onItemsChange,
  onBreakdownChange,
  taxRate = 0,
  discountRate = 0,
  currency = 'USD',
  className,
}: CostEstimatorProps) {
  const [localItems, setLocalItems] = useState<CostItem[]>(items);
  const [breakdown, setBreakdown] = useState<CostBreakdown | null>(null);

  // Update breakdown when items change
  useEffect(() => {
    const newBreakdown = ProposalService.calculateCostBreakdown(localItems, taxRate, discountRate);
    setBreakdown(newBreakdown);
    onBreakdownChange(newBreakdown);
  }, [localItems, taxRate, discountRate, onBreakdownChange]);

  // Update parent when local items change
  useEffect(() => {
    onItemsChange(localItems);
  }, [localItems, onItemsChange]);

  const addItem = () => {
    const newItem: CostItem = {
      id: `item_${Date.now()}`,
      category: 'development',
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      estimated_hours: 0,
      hourly_rate: DEFAULT_HOURLY_RATES.development,
      is_optional: false,
    };
    setLocalItems([...localItems, newItem]);
  };

  const updateItem = (id: string, updates: Partial<CostItem>) => {
    setLocalItems(items =>
      items.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          
          // Recalculate total price if quantity or unit price changed
          if (updates.quantity !== undefined || updates.unit_price !== undefined) {
            updated.total_price = updated.quantity * updated.unit_price;
          }
          
          // Recalculate unit price if hours and hourly rate changed
          if (updates.estimated_hours !== undefined || updates.hourly_rate !== undefined) {
            if (updated.estimated_hours && updated.hourly_rate) {
              updated.unit_price = updated.estimated_hours * updated.hourly_rate;
              updated.total_price = updated.quantity * updated.unit_price;
            }
          }
          
          return updated;
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setLocalItems(items => items.filter(item => item.id !== id));
  };

  const duplicateItem = (id: string) => {
    const item = localItems.find(item => item.id === id);
    if (item) {
      const newItem = {
        ...item,
        id: `item_${Date.now()}`,
        name: `${item.name} (Copy)`,
      };
      setLocalItems([...localItems, newItem]);
    }
  };


  const totalHours = localItems.reduce((sum, item) => sum + (item.estimated_hours || 0) * item.quantity, 0);
  const totalValue = breakdown?.total || 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with summary */}
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <CardTitle>Cost Estimation</CardTitle>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Total Hours:</span>
                <span className="font-medium">{totalHours.toFixed(1)}h</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Total Value:</span>
                <span className="font-medium text-lg">
                  {ProposalService.formatCurrency(totalValue, currency)}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Cost Items */}
      <div className="space-y-4">
        {localItems.map((item) => (
          <Card key={item.id} className="card-hover">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Category */}
                <div className="lg:col-span-2">
                  <Label htmlFor={`category-${item.id}`}>Category</Label>
                  <Select
                    value={item.category}
                    onValueChange={(value) => updateItem(item.id, { 
                      category: value as CostItem['category'],
                      hourly_rate: DEFAULT_HOURLY_RATES[value as keyof typeof DEFAULT_HOURLY_RATES] || 100
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COST_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Item Name */}
                <div className="lg:col-span-3">
                  <Label htmlFor={`name-${item.id}`}>Item Name</Label>
                  <Input
                    id={`name-${item.id}`}
                    value={item.name}
                    onChange={(e) => updateItem(item.id, { name: e.target.value })}
                    placeholder="e.g., Frontend Development"
                  />
                </div>

                {/* Description */}
                <div className="lg:col-span-4">
                  <Label htmlFor={`description-${item.id}`}>Description</Label>
                  <Textarea
                    id={`description-${item.id}`}
                    value={item.description}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    placeholder="Brief description of the work"
                    className="min-h-[40px]"
                  />
                </div>

                {/* Actions */}
                <div className="lg:col-span-3 flex items-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateItem(item.id)}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Pricing Details */}
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                  {/* Quantity */}
                  <div>
                    <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                    <Input
                      id={`quantity-${item.id}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                    />
                  </div>

                  {/* Estimated Hours */}
                  <div>
                    <Label htmlFor={`hours-${item.id}`}>Hours</Label>
                    <Input
                      id={`hours-${item.id}`}
                      type="number"
                      min="0"
                      step="0.5"
                      value={item.estimated_hours || ''}
                      onChange={(e) => updateItem(item.id, { estimated_hours: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  {/* Hourly Rate */}
                  <div>
                    <Label htmlFor={`rate-${item.id}`}>Hourly Rate</Label>
                    <Input
                      id={`rate-${item.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.hourly_rate || ''}
                      onChange={(e) => updateItem(item.id, { hourly_rate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  {/* Unit Price */}
                  <div>
                    <Label htmlFor={`unit-price-${item.id}`}>Unit Price</Label>
                    <Input
                      id={`unit-price-${item.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(item.id, { unit_price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  {/* Total Price */}
                  <div>
                    <Label>Total</Label>
                    <div className="flex items-center h-10 px-3 py-2 text-sm font-medium bg-muted rounded-md">
                      {ProposalService.formatCurrency(item.total_price, currency)}
                    </div>
                  </div>
                </div>

                {/* Optional checkbox */}
                <div className="lg:col-span-12 flex items-center space-x-2">
                  <Checkbox
                    id={`optional-${item.id}`}
                    checked={item.is_optional}
                    onCheckedChange={(checked) => updateItem(item.id, { is_optional: !!checked })}
                  />
                  <Label htmlFor={`optional-${item.id}`} className="text-sm">
                    This is an optional item
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Item Button */}
        <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
          <CardContent className="p-6">
            <Button
              variant="outline"
              onClick={addItem}
              className="w-full h-12 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Cost Item
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Cost Summary */}
      {breakdown && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Cost Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="text-lg font-semibold">
                  {ProposalService.formatCurrency(breakdown.subtotal, currency)}
                </p>
              </div>
              
              {breakdown.discount_rate > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Discount ({breakdown.discount_rate}%)
                  </p>
                  <p className="text-lg font-semibold text-green-600">
                    -{ProposalService.formatCurrency(breakdown.discount_amount, currency)}
                  </p>
                </div>
              )}
              
              {breakdown.tax_rate > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Tax ({breakdown.tax_rate}%)
                  </p>
                  <p className="text-lg font-semibold">
                    {ProposalService.formatCurrency(breakdown.tax_amount, currency)}
                  </p>
                </div>
              )}
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold gradient-text">
                  {ProposalService.formatCurrency(breakdown.total, currency)}
                </p>
              </div>
            </div>

            {/* Optional items warning */}
            {localItems.some(item => item.is_optional) && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    This estimate includes optional items. The client can choose to include or exclude them.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}