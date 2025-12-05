// components/dashboard/DraggableWidget.tsx
/**
 * Draggable wrapper for dashboard widgets
 * Allows drag-and-drop reordering
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WidgetSize } from '@/hooks/useDashboardPreferences';
import { motion } from 'framer-motion';

interface DraggableWidgetProps {
  id: string;
  children: React.ReactNode;
  visible: boolean;
  size: WidgetSize;
  isCustomizing: boolean;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onToggleSize: (id: string) => void;
}

export const DraggableWidget = ({
  id,
  children,
  visible,
  size,
  isCustomizing,
  onToggleVisibility,
  onToggleSize,
}: DraggableWidgetProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isCustomizing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sizeClasses = {
    compact: 'col-span-1',
    normal: 'col-span-1 md:col-span-2 lg:col-span-1',
    expanded: 'col-span-full',
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        sizeClasses[size],
        isDragging && 'z-50 opacity-50',
        !visible && isCustomizing && 'ring-2 ring-dashed ring-muted-foreground',
        'relative transition-all duration-200'
      )}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: !visible && !isCustomizing ? 0 : !visible && isCustomizing ? 0.5 : 1,
        scale: !visible && !isCustomizing ? 0 : 1,
        display: !visible && !isCustomizing ? 'none' : 'block'
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Customization Controls */}
      {isCustomizing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-background/95 backdrop-blur-sm p-1.5 rounded-lg border shadow-lg"
        >
          {/* Drag Handle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </Button>

          {/* Toggle Visibility */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onToggleVisibility(id, !visible)}
          >
            {visible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>

          {/* Toggle Size */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onToggleSize(id)}
          >
            {size === 'expanded' ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </motion.div>
      )}

      {/* Widget Content */}
      <div className={cn(!visible && isCustomizing && 'pointer-events-none')}>
        {children}
      </div>
    </motion.div>
  );
};