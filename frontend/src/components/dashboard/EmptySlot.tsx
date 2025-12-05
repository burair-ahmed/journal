// components/dashboard/EmptySlot.tsx
/**
 * Empty Slot Component - Shows + icon to add widgets
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WidgetPickerDialog } from './WidgetPickerDialog';

interface EmptySlotProps {
  slotId: string;
  colSpan: number;
  rowSpan: number;
  onSelectWidget: (slotId: string, widgetId: string) => void;
  renderWidget: (widgetId: string) => React.ReactNode;
  availableWidgets: { id: string; name: string }[];
}

export const EmptySlot = ({
  slotId,
  colSpan,
  rowSpan,
  onSelectWidget,
  renderWidget,
  availableWidgets,
}: EmptySlotProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleSelectWidget = (widgetId: string) => {
    onSelectWidget(slotId, widgetId);
  };

  return (
    <>
      <Card
        onClick={() => setIsPickerOpen(true)}
        className={cn(
          "h-full min-h-[150px] cursor-pointer",
          "border-2 border-dashed",
          "bg-gradient-to-br from-muted/30 to-muted/10",
          "hover:from-primary/5 hover:to-primary/10",
          "border-muted-foreground/20 hover:border-primary/40",
          "transition-all duration-300 ease-out",
          "flex items-center justify-center",
          "group relative overflow-hidden"
        )}
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Content */}
        <div className="relative text-center z-10">
          <div className="relative inline-block">
            {/* Outer ring animation */}
            <div className="absolute inset-0 rounded-full bg-primary/10 scale-100 group-hover:scale-150 opacity-100 group-hover:opacity-0 transition-all duration-500" />
            
            {/* Plus icon */}
            <div className="relative w-14 h-14 flex items-center justify-center rounded-full bg-muted group-hover:bg-primary/20 border-2 border-muted-foreground/30 group-hover:border-primary/50 transition-all duration-300">
              <Plus className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:scale-110" />
            </div>
          </div>
          
          <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors duration-300 mt-3">
            Add Widget
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {colSpan}×{rowSpan}
          </p>
        </div>
      </Card>

      {/* Widget Picker Dialog */}
      <WidgetPickerDialog
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectWidget={handleSelectWidget}
        renderWidget={renderWidget}
        availableWidgets={availableWidgets}
      />
    </>
  );
};
