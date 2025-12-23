import { Sidebar } from "@/components/layout/Sidebar";
import { ResourceCenter } from "@/views/ResourceCenter";
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


// ✨ Dashboard Personalization imports
import { EmptySlot } from './EmptySlot';
import { useDashboardPreferences, DashboardWidget } from '@/hooks/useDashboardPreferences';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const DashboardContent = () => {
  const { selectedAccountId, accounts, isLoadingAccounts } = useAccountContext();
  const { activeView, setActiveView } = useUI();
  const { id } = useParams();
  const location = useLocation();
  const accountId = id ? Number(id) : undefined;

  // ✨ Dashboard state
  const [activeCustomLayout, setActiveCustomLayout] = useState<any | null>(null);
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const { data: preferences, isLoading: prefsLoading } = useDashboardPreferences();

  // Sync activeView with URL path
  useEffect(() => {
    if (location.pathname === '/mentorship') {
      setActiveView('mentorMode');
    } else if (location.pathname === '/trade-replay') {
      setActiveView('tradeReplay');
    }
  }, [location.pathname, setActiveView]);

  // Listen for custom layout creation from TopHeader
  useEffect(() => {
    const handleLayoutCreated = (event: any) => {
      handleSaveCustomLayout(event.detail);
    };
    window.addEventListener('customLayoutCreated', handleLayoutCreated);
    return () => window.removeEventListener('customLayoutCreated', handleLayoutCreated);
  }, []);
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

  // ✨ Handle custom layout save
  const handleSaveCustomLayout = (customLayout: any) => {
    console.log('Custom layout saved:', customLayout);
    setActiveCustomLayout(customLayout);
    setIsEditingLayout(true); // Enable edit mode
    toast.success(`Layout "${customLayout.name}" created! Add widgets now.`);
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
            {/* ✨ Custom Layout View */}
            {activeCustomLayout ? (
              <div className="space-y-4">
                {/* Show header only in edit mode */}
                {isEditingLayout && (
                  <div className="mb-4 p-4 bg-muted/30 rounded-lg border">
                    <h3 className="text-lg font-semibold">{activeCustomLayout.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Click + to add widgets to your layout
                    </p>
                  </div>
                )}

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
                        // Render empty slot with + icon (only in edit mode)
                        isEditingLayout && (
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
                        )
                      )}
                    </div>
                  ))}
                </div>

                {/* Save Button - Show only in edit mode */}
                {isEditingLayout && (
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => {
                        setIsEditingLayout(false);
                        toast.success('Layout saved!');
                      }}
                      size="lg"
                      className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700"
                    >
                      Save Layout
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Standard Widget Grid */}
                {/* Standard Widget Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {preferences?.layout
                    .filter((widget: DashboardWidget) => widget.visible)
                    .map((widget: DashboardWidget) => (
                      <div
                        key={widget.id}
                        className={cn(
                          widget.size === 'compact' && 'col-span-1',
                          widget.size === 'normal' && 'col-span-1 md:col-span-2 lg:col-span-1',
                          widget.size === 'expanded' && 'col-span-full'
                        )}
                      >
                        {getWidgetComponent(widget.id)}
                      </div>
                    ))}
                </div>
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


      
      case "resourceCenter":
        return <ResourceCenter />;



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
