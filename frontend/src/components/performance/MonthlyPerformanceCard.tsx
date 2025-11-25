import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MonthlyPerformanceCardProps {
  month: string;
  profit: number;
  trades: number;
  winRate: number;
}

export const MonthlyPerformanceCard = ({ month, profit, trades, winRate }: MonthlyPerformanceCardProps) => {
  const isProfit = profit >= 0;
  const barWidth = Math.min(Math.abs(profit) / 10, 100); // Scale for visualization

  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-200 rounded-xl">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-base">{month}</h4>
            <p className="text-xs text-muted-foreground">{trades} trades</p>
          </div>
          <Badge variant={isProfit ? "default" : "destructive"} className="text-xs">
            {winRate.toFixed(1)}% WR
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {isProfit ? (
            <TrendingUp className="h-4 w-4 text-profit flex-shrink-0" />
          ) : (
            <TrendingDown className="h-4 w-4 text-loss flex-shrink-0" />
          )}
          <span className={`text-lg font-bold ${isProfit ? 'text-profit' : 'text-loss'}`}>
            ${Math.abs(profit).toFixed(2)}
          </span>
        </div>

        {/* Mini bar chart */}
        <div className="space-y-1">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full ${isProfit ? 'bg-profit' : 'bg-loss'} transition-all duration-500`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
