// components/dashboard/LayoutBuilder.tsx
/**
 * Advanced Custom Layout Builder
 * Create empty box layouts with various slot sizes and insert widgets
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
import { Plus, Grid3x3, Trash2, Save, Square, RectangleHorizontal, RectangleVertical, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardWidget, WidgetSize } from '@/hooks/useDashboardPreferences';

interface LayoutSlot {
  id: string;
  widgetId: string | null;
  colSpan: number; // 1, 2, 3, or 4
  rowSpan: number; // 1 or 2
}

interface CustomLayout {
  id: string;
  name: string;
  gridColumns: number;
  slots: LayoutSlot[];
}

interface LayoutBuilderProps {
  availableWidgets: { id: string; name: string }[];
  onSaveLayout: (layout: CustomLayout) => void;
}

// Slot size presets
const SLOT_SIZES = [
  { id: '1x1', label: '1×1', icon: Square, colSpan: 1, rowSpan: 1 },
  { id: '2x1', label: '2×1', icon: RectangleHorizontal, colSpan: 2, rowSpan: 1 },
  { id: '3x1', label: '3×1', icon: RectangleHorizontal, colSpan: 3, rowSpan: 1 },
  { id: '4x1', label: '4×1', icon: RectangleHorizontal, colSpan: 4, rowSpan: 1 },
  { id: '1x2', label: '1×2', icon: RectangleVertical, colSpan: 1, rowSpan: 2 },
  { id: '2x2', label: '2×2', icon: Square, colSpan: 2, rowSpan: 2 },
  { id: '3x2', label: '3×2', icon: RectangleHorizontal, colSpan: 3, rowSpan: 2 },
  { id: 'full', label: 'Full Width', icon: Maximize, colSpan: 12, rowSpan: 1 },
  { id: 'full-tall', label: 'Full Tall', icon: Maximize, colSpan: 12, rowSpan: 2 },
];

export const LayoutBuilder = ({ availableWidgets, onSaveLayout }: LayoutBuilderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [layoutName, setLayoutName] = useState('');
  const [gridColumns, setGridColumns] = useState<number>(12); // CSS Grid with 12 columns
  const [slots, setSlots] = useState<LayoutSlot[]>([]);

  // Add slot with specific size
  const handleAddSlot = (colSpan: number, rowSpan: number) => {
    const newSlot: LayoutSlot = {
      id: `slot-${Date.now()}-${Math.random()}`,
      widgetId: null,
      colSpan,
      rowSpan,
    };
    setSlots([...slots, newSlot]);
  };

  // Remove slot
  const handleRemoveSlot = (slotId: string) => {
    setSlots(slots.filter(s => s.id !== slotId));
  };

  // Save layout (without widgets assigned)
  const handleSave = () => {
    if (!layoutName.trim()) {
      alert('Please enter a layout name');
      return;
    }

    const newLayout: CustomLayout = {
      id: `custom-${Date.now()}`,
      name: layoutName,
      gridColumns,
      slots,
    };

    onSaveLayout(newLayout);
    setIsOpen(false);
    setLayoutName('');
    setSlots([]);
  };

  // Quick create templates
  const handleQuickCreate = (type: 'dashboard' | 'analytics' | 'minimal' | 'sidebar') => {
    let quickSlots: LayoutSlot[] = [];
    
    switch (type) {
      case 'dashboard':
        quickSlots = [
          { id: 'slot-1', widgetId: null, colSpan: 4, rowSpan: 1 },
          { id: 'slot-2', widgetId: null, colSpan: 4, rowSpan: 1 },
          { id: 'slot-3', widgetId: null, colSpan: 4, rowSpan: 1 },
          { id: 'slot-4', widgetId: null, colSpan: 12, rowSpan: 1 },
          { id: 'slot-5', widgetId: null, colSpan: 6, rowSpan: 1 },
          { id: 'slot-6', widgetId: null, colSpan: 6, rowSpan: 1 },
        ];
        break;
      case 'analytics':
        quickSlots = [
          { id: 'slot-1', widgetId: null, colSpan: 3, rowSpan: 1 },
          { id: 'slot-2', widgetId: null, colSpan: 3, rowSpan: 1 },
          { id: 'slot-3', widgetId: null, colSpan: 3, rowSpan: 1 },
          { id: 'slot-4', widgetId: null, colSpan: 3, rowSpan: 1 },
          { id: 'slot-5', widgetId: null, colSpan: 8, rowSpan: 2 },
          { id: 'slot-6', widgetId: null, colSpan: 4, rowSpan: 2 },
        ];
        break;
      case 'minimal':
        quickSlots = [
          { id: 'slot-1', widgetId: null, colSpan: 6, rowSpan: 1 },
          { id: 'slot-2', widgetId: null, colSpan: 6, rowSpan: 1 },
          { id: 'slot-3', widgetId: null, colSpan: 12, rowSpan: 1 },
        ];
        break;
      case 'sidebar':
        quickSlots = [
          { id: 'slot-1', widgetId: null, colSpan: 3, rowSpan: 2 },
          { id: 'slot-2', widgetId: null, colSpan: 9, rowSpan: 1 },
          { id: 'slot-3', widgetId: null, colSpan: 9, rowSpan: 1 },
        ];
        break;
    }
    
    setSlots(quickSlots);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Grid3x3 className="h-4 w-4" />
          Create Custom Layout
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Layout</DialogTitle>
          <DialogDescription>
            Design your perfect dashboard by adding empty slots. You'll assign widgets after saving.
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

          {/* Quick Create Templates */}
          <div className="space-y-2">
            <Label>Quick Templates</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickCreate('dashboard')}
              >
                📊 Dashboard
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickCreate('analytics')}
              >
                📈 Analytics
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickCreate('minimal')}
              >
                ✨ Minimal
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickCreate('sidebar')}
              >
                📑 Sidebar
              </Button>
            </div>
          </div>

          {/* Slot Size Buttons */}
          <div className="space-y-2">
            <Label>Add Slots</Label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {SLOT_SIZES.map((size) => {
                const Icon = size.icon;
                return (
                  <Button
                    key={size.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSlot(size.colSpan, size.rowSpan)}
                    className="flex flex-col items-center gap-1 h-auto py-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{size.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Layout Preview */}
          <div className="space-y-2">
            <Label>Layout Preview ({slots.length} slots)</Label>
            <div 
              className="p-4 bg-muted/30 rounded-lg border-2 border-dashed min-h-[300px]"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
                gap: '1rem',
                gridAutoRows: 'minmax(100px, auto)'
              }}
            >
              <AnimatePresence>
                {slots.map((slot, index) => (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      gridColumn: `span ${slot.colSpan}`,
                      gridRow: `span ${slot.rowSpan}`,
                    }}
                  >
                    <Card className="p-4 h-full relative bg-card/50 border-2 border-dashed flex items-center justify-center">
                      {/* Slot Info */}
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Slot {index + 1}</div>
                        <div className="text-sm font-medium">
                          {slot.colSpan}×{slot.rowSpan}
                        </div>
                        <Plus className="h-6 w-6 mx-auto mt-2 text-muted-foreground" />
                      </div>

                      {/* Remove Button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => handleRemoveSlot(slot.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {slots.length === 0 && (
                <div className="col-span-full flex items-center justify-center text-muted-foreground text-sm py-12">
                  Choose a template or click the slot size buttons above to start building
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} className="gap-2" disabled={slots.length === 0}>
            <Save className="h-4 w-4" />
            Save Layout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
