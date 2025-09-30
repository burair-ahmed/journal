import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { MetricCard } from "./MetricCard";
import { TradezellaProfitFactorCard } from "./TradezellaProfitFactorCard";
import { TradezellaCalendar } from "./TradezellaCalendar";
import { TradezellaRightSidebar } from "./TradezellaRightSidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Dashboard = () => {
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
            {/* Dropdown Menu */}
            <div className="mb-6">
              <Select defaultValue="dollar">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dollar">Dollar</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="pips">Pips</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            {/* Calendar Section */}
            <TradezellaCalendar />
          </div>

          {/* Right Sidebar */}
          <TradezellaRightSidebar />
        </div>
      </div>
    </div>
  );
};