// src/components/dashboard/Dashboard.tsx
import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { MetricCard } from "./MetricCard";
import { TradezellaProfitFactorCard } from "./TradezellaProfitFactorCard";
import { TradezellaCalendar } from "./TradezellaCalendar";
import { TradezellaRightSidebar } from "./TradezellaRightSidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartsGrid } from "./ChartsGrid";
import { AccountsManager } from "./AccountsManager";
import { AccountProvider, useAccountContext } from "@/contexts/AccountContext";
import { AccountOverview } from "./AccountOverview";

const DashboardContent = () => {
  const { selectedAccountId } = useAccountContext();

  return (
    <div className="flex bg-background min-h-screen">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <TopHeader />

        {/* Dashboard Content */}
        <div className="flex-1 flex">
          {/* Center Content */}
          <div className="flex-1 p-6">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <MetricCard
                title="Net P&L"
                value="$7,032.50"
                subtitle="Net P&L: $5"
                showInfo
                className="border-green-200"
              />
              <TradezellaProfitFactorCard />
            </div>

            {/* Calendar Section (account-specific) */}
            <TradezellaCalendar accountId={selectedAccountId ?? undefined} />

            {/* Charts */}
            <ChartsGrid accountId={selectedAccountId ?? undefined} />

            {/* Account specific overview (performance + trade history) */}
            {selectedAccountId ? (
              <AccountOverview accountId={selectedAccountId} />
            ) : (
              <AccountsManager />
            )}
          </div>

          {/* Right Sidebar */}
          <TradezellaRightSidebar />
        </div>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  return (
    <AccountProvider>
      <DashboardContent />
    </AccountProvider>
  );
};
