import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
// import { TradezellaRightSidebar } from "./TradezellaRightSidebar";
// import { MetricCard } from "./MetricCard";
import { TradezellaProfitFactorCard } from "./TradezellaProfitFactorCard";
import { TradezellaCalendar } from "./TradezellaCalendar";
import { ChartsGrid } from "./ChartsGrid";
import { AccountsManager } from "./AccountsManager";
// import { AccountOverview } from "./AccountOverview";
import { AccountProvider, useAccountContext } from "@/contexts/AccountContext";
import { UIProvider, useUI } from "@/contexts/UIContext";
import { TimeOfDayHeatmap } from "./widgets/TimeOfDayHeatmap";
import { useParams, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTrades } from "@/hooks/useTrades";
import { AccountBalanceWidget } from "./widgets/AccountBalanceWidget";
import { TradeWinWidget } from "./widgets/TradeWinWidget";
// import { ProfileForm } from "./ProfileForm";
// import { LargestGainLossGauge } from "./widgets/LargestGainLossGauge";
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
const DashboardContent = () => {
  const { selectedAccountId, accounts, isLoadingAccounts } = useAccountContext();
  const { activeView, setActiveView } = useUI();
  const { id } = useParams();
  const location = useLocation();
  const accountId = id ? Number(id) : undefined;

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


  // if (trades.length === 0) {
  //   return (
  //     <div className="p-6 text-muted-foreground">
  //       No trades found for this account.
  //     </div>
  //   );

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
        if (isLoadingAccounts) {
          return (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Loading your accounts...</p>
              </div>
            </div>
          );
        }
        return (
          
          <>
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* <MetricCard title="Net P&L" value="$7,032.50" subtitle="Net P&L: $5" showInfo /> */}
              <AccountBalanceWidget
                accountId={selectedAccountId ?? undefined}
              />
              <TradezellaProfitFactorCard
                accountId={selectedAccountId ?? undefined}
              />
              <TradeWinWidget accountId={selectedAccountId ?? undefined} />
            </div>
            {/* <LargestGainLossGauge accountId={selectedAccountId ?? undefined}/> */}
            <WinLossSymbolDistribution accountId={selectedAccountId ?? undefined} />
            <TradezellaCalendar accountId={selectedAccountId ?? undefined} />
            <TimeOfDayHeatmap
              trades={trades}
              accountId={selectedAccountId ?? undefined}
            />
            <ChartsGrid accountId={selectedAccountId ?? undefined} />
            {/* <UserProfile/> */}
          </>
        );

      case "addAccount":
        return <AccountsManager />;

      case "trades":  if (!selectedAccountId) {
    return (
      <div className="text-center text-muted-foreground p-10">
        No account selected — choose an account from the top bar.
      </div>
    );
  }
        return <TradesTable accountId={selectedAccountId} />;

      case "profile":
        return <UserProfile />;

        case "insights":  if (!selectedAccountId) {
    return (
      <div className="text-center text-muted-foreground p-10">
        No account selected — choose an account from the top bar.
      </div>
    );
  }
        return <NewsFeed />;
        
        case "notebook":  if (!selectedAccountId) {
    return (
      <div className="text-center text-muted-foreground p-10">
        No account selected — choose an account from the top bar.
      </div>
    );
  }
        return <NotebookContainer />;
        
        case "reports":  if (!selectedAccountId) {
    return (
      <div className="text-center text-muted-foreground p-10">
        No account selected — choose an account from the top bar.
      </div>
    );
  }
        return <ExportReport/>

        case "tradeReplay":
        return <TradeReplay />;

        case "mentorMode":
        return <MentorModeDashboard />;
        
        case "menteeView":
        return <MenteeDetailView />;
        
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
          {/* <TradezellaRightSidebar /> */}
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
