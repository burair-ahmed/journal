import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, MinusCircle, Target, Clock } from "lucide-react";
import { TradeDistribution as TradeDistributionType } from "@/lib/analytics/executiveSummary";

interface TradeDistributionProps extends TradeDistributionType {}

export const TradeDistribution = ({ 
  winningTrades, 
  losingTrades, 
  breakevenTrades, 
  avgRR, 
  avgHoldTime,
  pnlDistribution 
}: TradeDistributionProps) => {
  const totalTrades = winningTrades + losingTrades + breakevenTrades;
  const maxCount = Math.max(...pnlDistribution.map(d => d.count), 1);

  return (
    <Card className="p-6 space-y-6 rounded-2xl">
      <h3 className="text-xl font-semibold">Trade Distribution</h3>

      {/* Win/Loss/Breakeven */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-profit/10 rounded-xl border border-profit/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-profit" />
            <span className="text-sm text-muted-foreground">Winning</span>
          </div>
          <div className="text-2xl font-bold text-profit">{winningTrades}</div>
          <div className="text-xs text-muted-foreground">
            {((winningTrades / totalTrades) * 100).toFixed(1)}%
          </div>
        </div>

        <div className="p-4 bg-loss/10 rounded-xl border border-loss/20">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-loss" />
            <span className="text-sm text-muted-foreground">Losing</span>
          </div>
          <div className="text-2xl font-bold text-loss">{losingTrades}</div>
          <div className="text-xs text-muted-foreground">
            {((losingTrades / totalTrades) * 100).toFixed(1)}%
          </div>
        </div>

        <div className="p-4 bg-muted/20 rounded-xl border border-muted">
          <div className="flex items-center gap-2 mb-2">
            <MinusCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Breakeven</span>
          </div>
          <div className="text-2xl font-bold">{breakevenTrades}</div>
          <div className="text-xs text-muted-foreground">
            {((breakevenTrades / totalTrades) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Avg R:R</span>
          </div>
          <span className="text-sm font-bold">{avgRR.toFixed(2)}:1</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Avg Hold</span>
          </div>
          <span className="text-sm font-bold">{avgHoldTime}</span>
        </div>
      </div>

      {/* P&L Distribution Histogram */}
      <div className="space-y-3">
        <div className="text-sm font-medium">P&L Distribution</div>
        {pnlDistribution.map((dist, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{dist.range}</span>
              <span className="font-medium">{dist.count}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(dist.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
