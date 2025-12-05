// components/dashboard/WidgetPickerDialog.tsx
/**
 * Widget Picker Dialog - Shows live previews of all widgets
 * Users can visually select which widget to add to a slot
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WidgetPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWidget: (widgetId: string) => void;
  renderWidget: (widgetId: string) => React.ReactNode;
  availableWidgets: { id: string; name: string }[];
}

export const WidgetPickerDialog = ({
  isOpen,
  onClose,
  onSelectWidget,
  renderWidget,
  availableWidgets,
}: WidgetPickerDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredWidget, setHoveredWidget] = useState<string | null>(null);

  const filteredWidgets = availableWidgets.filter(widget =>
    widget.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectWidget = (widgetId: string) => {
    onSelectWidget(widgetId);
    onClose();
    setSearchQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose a Widget</DialogTitle>
          <DialogDescription>
            Click on any widget to add it to your dashboard
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search widgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Widget Grid with Live Previews */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
            {filteredWidgets.map((widget) => (
              <motion.div
                key={widget.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                onMouseEnter={() => setHoveredWidget(widget.id)}
                onMouseLeave={() => setHoveredWidget(null)}
                onClick={() => handleSelectWidget(widget.id)}
                className={cn(
                  "relative cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden",
                  hoveredWidget === widget.id
                    ? "border-primary shadow-lg scale-[1.02]"
                    : "border-border hover:border-primary/50"
                )}
              >
                {/* Widget Name Badge */}
                <div className="absolute top-2 left-2 z-10 bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border shadow-sm">
                  <p className="text-sm font-semibold">{widget.name}</p>
                </div>

                {/* Selection Indicator */}
                {hoveredWidget === widget.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground rounded-full p-2"
                  >
                    <Check className="h-4 w-4" />
                  </motion.div>
                )}

                {/* Live Widget Preview */}
                <div 
                  className="pointer-events-none scale-90 origin-top-left"
                  style={{ 
                    transform: 'scale(0.9)',
                    transformOrigin: 'top left',
                    width: '111%',
                    height: 'auto'
                  }}
                >
                  {renderWidget(widget.id)}
                </div>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
              </motion.div>
            ))}
          </div>

          {filteredWidgets.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              No widgets found matching "{searchQuery}"
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
