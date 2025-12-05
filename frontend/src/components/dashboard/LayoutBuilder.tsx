// components/dashboard/LayoutBuilder.tsx
/**
 * Custom Layout Builder - Create empty box layouts and insert widgets
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Grid3x3, Trash2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardWidget, WidgetSize } from '@/hooks/useDashboardPreferences';

interface LayoutSlot {
  id: string;
  widgetId: string | null; // null = empty slot
  size: WidgetSize;
}

interface CustomLayout {
  id: string;
  name: string;
  slots: LayoutSlot[];
}

interface LayoutBuilderProps {
  availableWidgets: { id: string; name: string }[];
  onSaveLayout: (layout: CustomLayout) => void;
}

export const LayoutBuilder = ({ availableWidgets, onSaveLayout }: LayoutBuilderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [layoutName, setLayoutName] = useState('');
  const [gridColumns, setGridColumns] = useState<'2' | '3' | '4'>('3');
  const [slots, setSlots] = useState<LayoutSlot[]>([]);

  // Add empty slot
  const handleAddSlot = () => {
    const newSlot: LayoutSlot = {
      id: `slot-${Date.now()}-${Math.random()}`,
      widgetId: null,
      size: 'normal',
    };
    setSlots([...slots, newSlot]);
  };

  // Remove slot
  const handleRemoveSlot = (slotId: string) => {
    setSlots(slots.filter(s => s.id !== slotId));
  };

  // Assign widget to slot
  const handleAssignWidget = (slotId: string, widgetId: string | null) => {
    setSlots(slots.map(s => s.id === slotId ? { ...s, widgetId } : s));
  };

  // Change slot size
  const handleChangeSize = (slotId: string, size: WidgetSize) => {
    setSlots(slots.map(s => s.id === slotId ? { ...s, size } : s));
  };

  // Save layout
  const handleSave = () => {
    if (!layoutName.trim()) {
      alert('Please enter a layout name');
      return;
    }

    const newLayout: CustomLayout = {
      id: `custom-${Date.now()}`,
      name: layoutName,
      slots,
    };

    onSaveLayout(newLayout);
    setIsOpen(false);
    setLayoutName('');
    setSlots([]);
  };

  // Quick create layouts
  const handleQuickCreate = (type: '2col' | '3col' | 'sidebar') => {
    let quickSlots: LayoutSlot[] = [];
    
    switch (type) {
      case '2col':
        quickSlots = [
          { id: 'slot-1', widgetId: null, size: 'normal' },
          { id: 'slot-2', widgetId: null, size: 'normal' },
          { id: 'slot-3', widgetId: null, size: 'expanded' },
          { id: 'slot-4', widgetId: null, size: 'normal' },
        ];
        setGridColumns('2');
        break;
      case '3col':
        quickSlots = [
          { id: 'slot-1', widgetId: null, size: 'normal' },
          { id: 'slot-2', widgetId: null, size: 'normal' },
          { id: 'slot-3', widgetId: null, size: 'normal' },
          { id: 'slot-4', widgetId: null, size: 'expanded' },
          { id: 'slot-5', widgetId: null, size: 'normal' },
          { id: 'slot-6', widgetId: null, size: 'normal' },
        ];
        setGridColumns('3');
        break;
      case 'sidebar':
        quickSlots = [
          { id: 'slot-1', widgetId: null, size: 'compact' },
          { id: 'slot-2', widgetId: null, size: 'expanded' },
          { id: 'slot-3', widgetId: null, size: 'compact' },
          { id: 'slot-4', widgetId: null, size: 'expanded' },
        ];
        setGridColumns('4');
        break;
    }
    
    setSlots(quickSlots);
  };

  const sizeClasses = {
    compact: 'col-span-1',
    normal: 'col-span-1 md:col-span-2 lg:col-span-1',
    expanded: 'col-span-full',
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Grid3x3 className="h-4 w-4" />
          Create Custom Layout
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Layout</DialogTitle>
          <DialogDescription>
            Design your perfect dashboard layout by adding empty slots and assigning widgets
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Layout Name */}
          <div className="space-y-2">
            <Label htmlFor="layout-name">Layout Name</Label>
            <Input
              id="layout-name"
              placeholder="e.g., My Custom Layout"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
            />
          </div>

          {/* Grid Columns */}
          <div className="space-y-2">
            <Label htmlFor="grid-columns">Grid Columns</Label>
            <Select value={gridColumns} onValueChange={(v) => setGridColumns(v as '2' | '3' | '4')}>
              <SelectTrigger id="grid-columns">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Columns</SelectItem>
                <SelectItem value="3">3 Columns</SelectItem>
                <SelectItem value="4">4 Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Create Templates */}
          <div className="space-y-2">
            <Label>Quick Templates</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickCreate('2col')}
              >
                2 Column Layout
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickCreate('3col')}
              >
                3 Column Layout
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickCreate('sidebar')}
              >
                Sidebar Layout
              </Button>
            </div>
          </div>

          {/* Add Slot Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddSlot}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Empty Slot
          </Button>

          {/* Layout Preview */}
          <div className="space-y-2">
            <Label>Layout Preview</Label>
            <div className={cn(
              "grid gap-4 p-4 bg-muted/30 rounded-lg border-2 border-dashed min-h-[200px]",
              gridColumns === '2' && 'grid-cols-2',
              gridColumns === '3' && 'grid-cols-3',
              gridColumns === '4' && 'grid-cols-4'
            )}>
              <AnimatePresence>
                {slots.map((slot, index) => (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={cn(sizeClasses[slot.size])}
                  >
                    <Card className="p-4 h-full min-h-[120px] relative">
                      {/* Slot Controls */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemoveSlot(slot.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Slot Content */}
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">Slot {index + 1}</div>

                        {/* Widget Selector */}
                        <Select
                          value={slot.widgetId || 'none'}
                          onValueChange={(v) => handleAssignWidget(slot.id, v === 'none' ? null : v)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Choose widget..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Empty Slot</SelectItem>
                            {availableWidgets.map((widget) => (
                              <SelectItem key={widget.id} value={widget.id}>
                                {widget.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Size Selector */}
                        <Select
                          value={slot.size}
                          onValueChange={(v) => handleChangeSize(slot.id, v as WidgetSize)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="compact">Compact</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="expanded">Expanded</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {slots.length === 0 && (
                <div className="col-span-full flex items-center justify-center text-muted-foreground text-sm py-12">
                  Add slots to start building your layout
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Layout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
