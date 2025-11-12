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
import { useParams } from "react-router-dom";
import { useTrades } from "@/hooks/useTrades";
import { AccountBalanceWidget } from "./widgets/AccountBalanceWidget";
import { TradeWinWidget } from "./widgets/TradeWinWidget";
// import { ProfileForm } from "./ProfileForm";
// import { LargestGainLossGauge } from "./widgets/LargestGainLossGauge";
import { UserProfile } from "./UserProfile";
import { TradesTable } from "./TradesTable";
import { WinLossSymbolDistribution } from "./widgets/WinLossSymbolDistribution";
import { NewsFeed } from "./NewsFeed";
const DashboardContent = () => {
  const { selectedAccountId } = useAccountContext();
  const { activeView } = useUI();
  const { id } = useParams();
  const accountId = id ? Number(id) : undefined;

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

  if (trades.length === 0) {
    return (
      <div className="p-6 text-muted-foreground">
        No trades found for this account.
      </div>
    );
  }
  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
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

      case "trades":
        return <TradesTable accountId={selectedAccountId} />;

      case "profile":
        return <UserProfile />;

        case "insights":
        return <NewsFeed />;
      default:
        return (
          <div className="text-center text-white mt-20">
            <h1 className="text-2xl font-semibold mb-2 capitalize">
              {activeView}
            </h1>
            <p className="text-black">This section is under development.</p>
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
