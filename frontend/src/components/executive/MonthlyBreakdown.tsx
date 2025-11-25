import { MonthCard } from "./MonthCard";
import { MonthlyData } from "@/lib/analytics/executiveSummary";

interface MonthlyBreakdownProps {
  monthlyData: MonthlyData[];
}

export const MonthlyBreakdown = ({ monthlyData }: MonthlyBreakdownProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Monthly P&L Breakdown</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {monthlyData.map((month, index) => (
          <MonthCard
            key={index}
            month={month.month}
            pnl={month.pnl}
            winRate={month.winRate}
            trades={month.trades}
          />
        ))}
      </div>
    </div>
  );
};
