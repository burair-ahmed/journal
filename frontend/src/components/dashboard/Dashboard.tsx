import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import toast from 'react-hot-toast';
import { TradezellaProfitFactorCard } from "./TradezellaProfitFactorCard";
import { TradezellaCalendar } from "./TradezellaCalendar";
import { ChartsGrid } from "./ChartsGrid";
import { AccountsManager } from "./AccountsManager";
import { AccountProvider, useAccountContext } from "@/contexts/AccountContext";
import { UIProvider, useUI } from "@/contexts/UIContext";
import { TimeOfDayHeatmap } from "./widgets/TimeOfDayHeatmap";
import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTrades } from "@/hooks/useTrades";
import { AccountBalanceWidget } from "./widgets/AccountBalanceWidget";
import { TradeWinWidget } from "./widgets/TradeWinWidget";
import { UserProfile } from "./UserProfile";
import { TradesTable } from "./TradesTable";
import { WinLossSymbolDistribution } from "./widgets/WinLossSymbolDistribution";
import { NewsFeed } from "./NewsFeed";
import { ExportReport } from "./ExportReport";
import { NotebookContainer } from "@/components/notebook/NotebookContainer";
import { MentorModeDashboard } from "@/components/mentor/MentorModeDashboard";
import { MenteeDetailView } from "@/components/mentor/MenteeDetailView";
import { ImpersonationBanner } from "@/components/mentor/ImpersonationBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TradeReplay } from "@/views/TradeReplay";
import { AdminDashboard } from "@/views/admin/AdminDashboard";
import { UserDirectory } from "@/views/admin/UserDirectory";
import { UserDetail } from "@/views/admin/UserDetail";

// ✨ Dashboard Personalization imports
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { DraggableWidget } from './DraggableWidget';
import { DashboardCustomizationBar } from './DashboardCustomizationBar';
import { EmptySlot } from './EmptySlot';
import {
  useDashboardPreferences,
  useUpdateDashboardLayout,
  useToggleWidgetVisibility,
  useUpdateWidgetSize,
  useApplyPresetLayout,
  useResetDashboardLayout,
  DashboardWidget,
  WidgetSize,
} from '@/hooks/useDashboardPreferences';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardContent = () => {
  const { selectedAccountId, accounts, isLoadingAccounts } = useAccountContext();
  const { activeView, setActiveView } = useUI();
  const { id } = useParams();
  const location = useLocation();
  const accountId = id ? Number(id) : undefined;

  // ✨ Dashboard customization state
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null); // For drag overlay
  const [activeCustomLayout, setActiveCustomLayout] = useState<any | null>(null); // Custom layout
  const { data: preferences, isLoading: prefsLoading } = useDashboardPreferences();
  const updateLayout = useUpdateDashboardLayout();
  const toggleVisibility = useToggleWidgetVisibility();
  const updateSize = useUpdateWidgetSize();
  const applyPreset = useApplyPresetLayout();
  const resetLayout = useResetDashboardLayout();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync activeView with URL path
  useEffect(() => {
    if (location.pathname === '/mentorship') {
      setActiveView('mentorMode');
    } else if (location.pathname === '/trade-replay') {
      setActiveView('tradeReplay');
    }
  }, [location.pathname, setActiveView]);

  // Fetch trades for this account
  const { data: trades = [], isLoading, error } = useTrades(accountId);

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading trades...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-destructive">
        Error fetching trades: {(error as Error).message}
      </div>
    );
  }

  // ✨ Handle drag start (for overlay)
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // ✨ Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && preferences) {
      const oldIndex = preferences.layout.findIndex((w) => w.id === active.id);
      const newIndex = preferences.layout.findIndex((w) => w.id === over.id);

      const newLayout = arrayMove(preferences.layout, oldIndex, newIndex).map((w, idx) => ({
        ...w,
        order: idx,
      }));

      updateLayout.mutate(newLayout);
    }

    setActiveId(null); // Clear overlay
  };

  // ✨ Handle widget visibility toggle
  const handleToggleVisibility = (widgetId: string, visible: boolean) => {
    toggleVisibility.mutate({ widgetId, visible });
  };

  // ✨ Handle widget size toggle
  const handleToggleSize = (widgetId: string) => {
    if (!preferences) return;
    
    const widget = preferences.layout.find(w => w.id === widgetId);
    if (!widget) return;

    const sizes: WidgetSize[] = ['compact', 'normal', 'expanded'];
    const currentIndex = sizes.indexOf(widget.size);
    const nextSize = sizes[(currentIndex + 1) % sizes.length];

    updateSize.mutate({ widgetId, size: nextSize });
  };

  // ✨ Handle custom layout save
  const handleSaveCustomLayout = (customLayout: any) => {
    console.log('Custom layout saved:', customLayout);
    // Store in local state for now
    setActiveCustomLayout(customLayout);
    toast.success(`Layout "${customLayout.name}" created! Assign widgets by clicking the + icons.`);
  };

  // ✨ Handle widget assignment to empty slot
  const handleAssignWidget = (slotId: string, widgetId: string) => {
    if (!activeCustomLayout) return;

    const updatedSlots = activeCustomLayout.slots.map((slot: any) =>
      slot.id === slotId ? { ...slot, widgetId } : slot
    );

    setActiveCustomLayout({
      ...activeCustomLayout,
      slots: updatedSlots,
    });

    toast.success('Widget added to layout!');
  };

  // ✨ Widget map
  const getWidgetComponent = (widgetId: string) => {
    switch (widgetId) {
      case 'account_balance':
        return <AccountBalanceWidget accountId={selectedAccountId ?? undefined} />;
      case 'profit_factor':
        return <TradezellaProfitFactorCard accountId={selectedAccountId ?? undefined} />;
      case 'trade_win':
        return <TradeWinWidget accountId={selectedAccountId ?? undefined} />;
      case 'symbol_distribution':
        return <WinLossSymbolDistribution accountId={selectedAccountId ?? undefined} />;
      case 'calendar':
        return <TradezellaCalendar accountId={selectedAccountId ?? undefined} />;
      case 'time_heatmap':
        return <TimeOfDayHeatmap trades={trades} accountId={selectedAccountId ?? undefined} />;
      case 'charts_grid':
        return <ChartsGrid accountId={selectedAccountId ?? undefined} />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        // Show welcome card for new users without accounts
        if (!selectedAccountId && !isLoadingAccounts && (!accounts || accounts.length === 0)) {
          return (
            <div className="max-w-3xl mx-auto mt-20">
              <Card className="p-8 border-2 border-dashed border-primary/30">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold">Welcome to Your Trading Journal! 🎉</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Get started by connecting your MT5 trading account. Once connected, your trades will automatically sync and you'll unlock powerful analytics.
                  </p>
                  <Button 
                    className="bg-brand-gradient text-white mt-4"
                    onClick={() => setActiveView('addAccount')}
                  >
                    Connect Your First Account
                  </Button>
                </div>
              </Card>
            </div>
          );
        }

        // Show loading state
        if (isLoadingAccounts || prefsLoading) {
          return (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Loading your dashboard...</p>
              </div>
            </div>
          );
        }

        // ✨ Customizable Dashboard
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Customization Toolbar */}
            <DashboardCustomizationBar
              isCustomizing={isCustomizing}
              activePreset={preferences?.activePreset || 'default'}
              onToggleCustomizing={() => setIsCustomizing(!isCustomizing)}
              onApplyPreset={(preset) => applyPreset.mutate(preset)}
              onReset={() => resetLayout.mutate()}
              onSaveCustomLayout={handleSaveCustomLayout}
            />

            {/* ✨ Custom Layout View */}
            {activeCustomLayout ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{activeCustomLayout.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Click + to add widgets to your layout
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveCustomLayout(null);
                      toast.success('Returned to standard layout');
                    }}
                  >
                    Exit Custom Layout
                  </Button>
                </div>

                {/* Custom Layout Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${activeCustomLayout.gridColumns}, minmax(0, 1fr))`,
                    gap: '1.5rem',
                    gridAutoRows: 'minmax(150px, auto)',
                  }}
                >
                  {activeCustomLayout.slots.map((slot: any) => (
                    <div
                      key={slot.id}
                      style={{
                        gridColumn: `span ${slot.colSpan}`,
                        gridRow: `span ${slot.rowSpan}`,
                      }}
                    >
                      {slot.widgetId ? (
                        // Render assigned widget
                        <div className="h-full">
                          {getWidgetComponent(slot.widgetId)}
                        </div>
                      ) : (
                        // Render empty slot with + icon
                        <EmptySlot
                          slotId={slot.id}
                          colSpan={slot.colSpan}
                          rowSpan={slot.rowSpan}
                          onSelectWidget={handleAssignWidget}
                          renderWidget={getWidgetComponent}
                          availableWidgets={[
                            { id: 'account_balance', name: 'Account Balance' },
                            { id: 'profit_factor', name: 'Profit Factor' },
                            { id: 'trade_win', name: 'Win Rate' },
                            { id: 'symbol_distribution', name: 'Symbol Distribution' },
                            { id: 'calendar', name: 'Trading Calendar' },
                            { id: 'time_heatmap', name: 'Time Heatmap' },
                            { id: 'charts_grid', name: 'Performance Charts' },
                          ]}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Standard Draggable Widget Grid */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={preferences?.layout.map(w => w.id) || []}
                strategy={rectSortingStrategy}
              >
                <AnimatePresence mode="sync">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {preferences?.layout.map((widget: DashboardWidget) => (
                      <DraggableWidget
                        key={widget.id}
                        id={widget.id}
                        visible={widget.visible}
                        size={widget.size}
                        isCustomizing={isCustomizing}
                        onToggleVisibility={handleToggleVisibility}
                        onToggleSize={handleToggleSize}
                      >
                        {getWidgetComponent(widget.id)}
                      </DraggableWidget>
                    ))}
                  </div>
                </AnimatePresence>
              </SortableContext>

              {/* ✨ Drag Overlay - follows cursor */}
              <DragOverlay>
                {activeId ? (
                  <div className="opacity-80 cursor-grabbing shadow-2xl rounded-xl overflow-hidden border-2 border-primary">
                    {getWidgetComponent(activeId)}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
            </>
          )}
          </motion.div>
        );

      case "addAccount":
        return <AccountsManager />;

      case "trades":
        if (!selectedAccountId) {
          return (
            <div className="text-center text-muted-foreground p-10">
              No account selected — choose an account from the top bar.
            </div>
          );
        }
        return <TradesTable accountId={selectedAccountId} />;

      case "profile":
        return <UserProfile />;

      case "insights":
        if (!selectedAccountId) {
          return (
            <div className="text-center text-muted-foreground p-10">
              No account selected — choose an account from the top bar.
            </div>
          );
        }
        return <NewsFeed />;

      case "notebook":
        if (!selectedAccountId) {
          return (
            <div className="text-center text-muted-foreground p-10">
              No account selected — choose an account from the top bar.
            </div>
          );
        }
        return <NotebookContainer />;

      case "reports":
        if (!selectedAccountId) {
          return (
            <div className="text-center text-muted-foreground p-10">
              No account selected — choose an account from the top bar.
            </div>
          );
        }
        return <ExportReport />;

      case "tradeReplay":
        return <TradeReplay />;

      case "mentorMode":
        return <MentorModeDashboard />;

      case "menteeView":
        return <MenteeDetailView />;

      case "adminDashboard":
        return <AdminDashboard />;

      case "adminUsers":
        return <UserDirectory />;

      case "adminUserDetail":
        return <UserDetail />;

      case "adminAnalytics":
        return (
          <div className="text-center text-foreground mt-20">
            <h1 className="text-2xl font-semibold mb-2">Advanced Analytics</h1>
            <p className="text-muted-foreground">Coming soon</p>
          </div>
        );

      default:
        return (
          <div className="text-center text-foreground mt-20">
            <h1 className="text-2xl font-semibold mb-2 capitalize">
              {activeView}
            </h1>
            <p className="text-muted-foreground">This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <TopHeader />
        <div className="flex flex-1">
          <div className="flex-1 p-6">{renderContent()}</div>
        </div>
      </div>
      <ImpersonationBanner />
    </div>
  );
};

export const Dashboard = () => (
  <AccountProvider>
    <UIProvider>
      <DashboardContent />
    </UIProvider>
  </AccountProvider>
);
