import { Card } from "@/components/ui/card";
import { MiniBar } from "./MiniBar";
import { TrendingUp, TrendingDown, Target, Calendar } from "lucide-react";

interface YTDPanelProps {
  ytdPnL: number;
  ytdTrades: number;
  avgPerTrade: number;
  bestMonth: { month: string; profit: number };
  worstMonth: { month: string; profit: number };
  monthlyData: number[];
}

export const YTDPanel = ({ ytdPnL, ytdTrades, avgPerTrade, bestMonth, worstMonth, monthlyData }: YTDPanelProps) => {
  const isProfit = ytdPnL >= 0;
  const maxMonthly = Math.max(...monthlyData.map(Math.abs), 1);

  return (
    <Card className="overflow-hidden rounded-2xl shadow-lg">
      {/* Gradient Header */}
      <div className={`h-2 bg-gradient-to-r ${isProfit ? 'from-profit/50 to-profit' : 'from-loss/50 to-loss'}`} />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Year-to-Date Performance</h3>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">YTD P&L</div>
            <div className={`text-2xl font-bold ${isProfit ? 'text-profit' : 'text-loss'}`}>
              ${Math.abs(ytdPnL).toFixed(2)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">YTD Trades</div>
            <div className="text-2xl font-bold">{ytdTrades}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Avg per Trade</div>
            <div className="text-2xl font-bold">${avgPerTrade.toFixed(2)}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Best Month</div>
            <div className="text-2xl font-bold text-profit">
              {bestMonth.month}
            </div>
            <div className="text-xs text-muted-foreground">${bestMonth.profit.toFixed(0)}</div>
          </div>
        </div>

        {/* Worst Month */}
        <div className="p-3 bg-loss/5 rounded-lg border border-loss/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-loss" />
              <span className="text-sm font-medium">Worst Month: {worstMonth.month}</span>
            </div>
            <span className="text-sm font-bold text-loss">${Math.abs(worstMonth.profit).toFixed(2)}</span>
          </div>
        </div>

        {/* Monthly Performance Bar Chart */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Monthly Performance</div>
          <div className="flex items-end justify-between gap-1 h-16">
            {monthlyData.map((value, index) => (
              <MiniBar
                key={index}
                value={value}
                maxValue={maxMonthly}
                color={value >= 0 ? "profit" : "loss"}
                height={60}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
