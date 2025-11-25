import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import { AlertTriangle, Shield, TrendingDown } from "lucide-react";
import { useFilteredTrades } from "@/hooks/useTrades";

interface RiskManagementProps {
  accountId?: number;
}

export const RiskManagement = ({ accountId }: RiskManagementProps) => {
  const { trades = [], isLoading } = useFilteredTrades(accountId);

  const riskMetrics = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        maxDrawdown: 0,
        currentDrawdown: 0,
        longestWinStreak: 0,
        longestLossStreak: 0,
        avgRR: 0,
        avgVolume: 0,
        maxVolume: 0,
        minVolume: 0,
        rrRatios: []
      };
    }

    // Drawdown calculation
    let peak = 0;
    let maxDrawdown = 0;
    let currentDrawdown = 0;
    let runningTotal = 0;
    
    const equityCurve = trades.map(t => {
      runningTotal += Number(t.profit);
      if (runningTotal > peak) peak = runningTotal;
      currentDrawdown = peak - runningTotal;
      if (currentDrawdown > maxDrawdown) maxDrawdown = currentDrawdown;
      return { equity: runningTotal, drawdown: currentDrawdown };
    });

    // Consecutive wins/losses
    let currentStreak = 0;
    let streakType = '';
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    
    trades.forEach(t => {
      const isWin = Number(t.profit) > 0;
      if ((isWin && streakType === 'win') || (!isWin && streakType === 'loss')) {
        currentStreak++;
      } else {
        if (streakType === 'win') longestWinStreak = Math.max(longestWinStreak, currentStreak);
        if (streakType === 'loss') longestLossStreak = Math.max(longestLossStreak, currentStreak);
        currentStreak = 1;
        streakType = isWin ? 'win' : 'loss';
      }
    });

    // R:R Analysis
    const rrRatios = trades.filter(t => {
      const tp = Number(t.tp_price || 0);
      const sl = Number(t.sl_price || 0);
      const entry = Number(t.open_price);
      return tp > 0 && sl > 0 && entry > 0;
    }).map(t => {
      const tp = Number(t.tp_price);
      const sl = Number(t.sl_price);
      const entry = Number(t.open_price);
      const reward = Math.abs(tp - entry);
      const risk = Math.abs(entry - sl);
      return risk > 0 ? reward / risk : 0;
    });

    const avgRR = rrRatios.length > 0 ? rrRatios.reduce((a, b) => a + b, 0) / rrRatios.length : 0;

    // Position sizing
    const volumes = trades.map(t => Number(t.volume));
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const maxVolume = Math.max(...volumes);
    const minVolume = Math.min(...volumes);

    return {
      maxDrawdown,
      currentDrawdown,
      longestWinStreak,
      longestLossStreak,
      avgRR,
      avgVolume,
      maxVolume,
      minVolume,
      rrRatios
    };
  }, [trades]);

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">Loading data...</div>
      </Card>
    );
  }

  if (!trades || trades.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">No trades available</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Risk Management</h2>
        <p className="text-muted-foreground">Analyze your risk exposure and management</p>
      </div>

      {/* Drawdown Analysis */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="h-5 w-5 text-loss" />
          <h3 className="text-lg font-semibold">Drawdown Analysis</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Maximum Drawdown</div>
            <div className="text-2xl font-bold text-loss">
              ${riskMetrics.maxDrawdown.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Current Drawdown</div>
            <div className="text-2xl font-bold">
              ${riskMetrics.currentDrawdown.toFixed(2)}
            </div>
          </div>
        </div>
        {riskMetrics.maxDrawdown > 1000 && (
          <div className="mt-4 p-3 bg-loss/10 border border-loss/20 rounded-lg flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-loss mt-0.5" />
            <div className="text-sm text-loss">
              <strong>High Risk Alert:</strong> Your maximum drawdown exceeds $1,000. Consider reducing position sizes.
            </div>
          </div>
        )}
      </Card>

      {/* Consecutive Streaks */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Consecutive Wins/Losses</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-profit/10 rounded-lg">
            <div className="text-sm text-profit mb-1">Longest Win Streak</div>
            <div className="text-3xl font-bold text-profit">{riskMetrics.longestWinStreak}</div>
          </div>
          <div className="p-4 bg-loss/10 rounded-lg">
            <div className="text-sm text-loss mb-1">Longest Loss Streak</div>
            <div className="text-3xl font-bold text-loss">{riskMetrics.longestLossStreak}</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          💡 After a {riskMetrics.longestLossStreak}-trade losing streak, consider taking a break to reset emotionally.
        </p>
      </Card>

      {/* Risk-Reward */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Risk-Reward Analysis</h3>
        </div>
        <div className="mb-4">
          <div className="text-sm text-muted-foreground">Average R:R Ratio</div>
          <div className="text-3xl font-bold">{riskMetrics.avgRR.toFixed(2)}:1</div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Trades with R:R data</span>
            <span className="font-medium">{riskMetrics.rrRatios.length}</span>
          </div>
          {riskMetrics.avgRR < 1.5 && (
            <div className="p-3 bg-secondary/20 border border-secondary/20 rounded-lg text-sm text-muted-foreground">
              💡 Aim for at least 1.5:1 R:R ratio to improve profitability
            </div>
          )}
        </div>
      </Card>

      {/* Position Sizing */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Position Sizing Analysis</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Avg Volume</div>
            <div className="text-xl font-bold">{riskMetrics.avgVolume.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Max Volume</div>
            <div className="text-xl font-bold">{riskMetrics.maxVolume.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Min Volume</div>
            <div className="text-xl font-bold">{riskMetrics.minVolume.toFixed(2)}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
