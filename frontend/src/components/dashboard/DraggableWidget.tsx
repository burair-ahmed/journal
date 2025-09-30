import { ReactNode } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Card } from "@/components/ui/card";

interface DraggableWidgetProps {
  id: string;
  children: ReactNode;
  onMove?: (draggedId: string, hoverId: string) => void;
  className?: string;
}

const ItemType = "WIDGET";

export const DraggableWidget = ({ id, children, onMove, className }: DraggableWidgetProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem: { id: string }) => {
      if (draggedItem.id !== id && onMove) {
        onMove(draggedItem.id, id);
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`transition-opacity ${isDragging ? "opacity-50" : "opacity-100"} ${className}`}
      style={{ cursor: "move" }}
    >
      {children}
    </div>
  );
};