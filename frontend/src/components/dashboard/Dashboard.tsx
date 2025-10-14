import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { TradezellaRightSidebar } from "./TradezellaRightSidebar";
import { MetricCard } from "./MetricCard";
import { TradezellaProfitFactorCard } from "./TradezellaProfitFactorCard";
import { TradezellaCalendar } from "./TradezellaCalendar";
import { ChartsGrid } from "./ChartsGrid";
import { AccountsManager } from "./AccountsManager";
import { AccountOverview } from "./AccountOverview";
import { AccountProvider, useAccountContext } from "@/contexts/AccountContext";
import { UIProvider, useUI } from "@/contexts/UIContext";

const DashboardContent = () => {
  const { selectedAccountId } = useAccountContext();
  const { activeView } = useUI();

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <MetricCard title="Net P&L" value="$7,032.50" subtitle="Net P&L: $5" showInfo />
              <TradezellaProfitFactorCard />
            </div>
            <TradezellaCalendar accountId={selectedAccountId ?? undefined} />
            <ChartsGrid accountId={selectedAccountId ?? undefined} />
            {selectedAccountId ? (
              <AccountOverview accountId={selectedAccountId} />
            ) : (
              <AccountsManager />
            )}
          </>
        );

      case "addAccount":
        return <AccountsManager />;

      default:
        return (
          <div className="text-center text-white mt-20">
            <h1 className="text-2xl font-semibold mb-2 capitalize">{activeView}</h1>
            <p className="text-white/60">This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopHeader />
        <div className="flex-1 flex">
          <div className="flex-1 p-6">{renderContent()}</div>
          <TradezellaRightSidebar />
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
