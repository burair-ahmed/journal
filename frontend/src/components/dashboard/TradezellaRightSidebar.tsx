// frontend/src/components/dashboard/TradezellaRightSidebar.tsx
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DraggableWidget } from "./DraggableWidget";
import { AccountBalanceWidget } from "./widgets/AccountBalanceWidget";
import { TradeWinWidget } from "./widgets/TradeWinWidget";
import { TradeExpectancyWidget } from "./widgets/TradeExpectancyWidget";
import { ZellaScoreWidget } from "./widgets/ZellaScoreWidget";
import { WeeklySummaryWidget } from "./widgets/WeeklySummaryWidget";
import { useState } from "react";
import { useAccountContext } from "@/contexts/AccountContext";

const initialWidgets = [
  { id: "account-balance", component: AccountBalanceWidget },
  { id: "trade-win", component: TradeWinWidget },
  { id: "trade-expectancy", component: TradeExpectancyWidget },
  { id: "zella-score", component: ZellaScoreWidget },
  // { id: "weekly-summary", component: WeeklySummaryWidget },
];

export const TradezellaRightSidebar = () => {
  const [widgets, setWidgets] = useState(initialWidgets);
  const { selectedAccountId } = useAccountContext();

  const moveWidget = (draggedId: string, hoverId: string) => {
    const draggedIndex = widgets.findIndex((w) => w.id === draggedId);
    const hoverIndex = widgets.findIndex((w) => w.id === hoverId);

    if (draggedIndex === -1 || hoverIndex === -1) return;

    const newWidgets = [...widgets];
    const draggedWidget = newWidgets[draggedIndex];

    newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(hoverIndex, 0, draggedWidget);

    setWidgets(newWidgets);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-80 p-4 space-y-4 bg-muted/30 min-h-screen">
        <div className="text-sm text-muted-foreground mb-4">
          Drag widgets to reorder
        </div>
        {widgets.map((widget) => {
          const WidgetComponent = widget.component;
          return (
            <DraggableWidget
              key={widget.id}
              id={widget.id}
              onMove={moveWidget}
            >
              {/* ✅ Pass selected accountId down */}
              <WidgetComponent accountId={selectedAccountId ?? undefined} />
            </DraggableWidget>
          );
        })}
      </div>
    </DndProvider>
  );
};
