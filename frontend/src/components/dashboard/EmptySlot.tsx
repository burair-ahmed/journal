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
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="h-full"
      >
        <Card
          onClick={() => setIsPickerOpen(true)}
          className={cn(
            "h-full min-h-[150px] cursor-pointer",
            "border-2 border-dashed border-muted-foreground/30",
            "hover:border-primary/50 hover:bg-primary/5",
            "transition-all duration-200",
            "flex items-center justify-center",
            "group"
          )}
        >
          <div className="text-center">
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
              className="mx-auto"
            >
              <Plus className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.div>
            <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors mt-2">
              Add Widget
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {colSpan}×{rowSpan} slot
            </p>
          </div>
        </Card>
      </motion.div>

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
