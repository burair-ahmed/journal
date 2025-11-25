import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import { AlertTriangle, Shield, TrendingDown, TrendingUp, ArrowUp, ArrowDown, Brain } from "lucide-react";
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
        rrRatios: [],
        equityCurve: [],
        streakSequence: [],
        volumeTrend: 'neutral' as 'up' | 'down' | 'neutral',
        rrDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 }
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
    const streakSequence: Array<'W' | 'L'> = [];
    
    trades.forEach(t => {
      const isWin = Number(t.profit) > 0;
      streakSequence.push(isWin ? 'W' : 'L');
      
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

    // R:R Distribution
    const rrDistribution = {
      excellent: rrRatios.filter(r => r >= 3).length,
      good: rrRatios.filter(r => r >= 2 && r < 3).length,
      fair: rrRatios.filter(r => r >= 1.5 && r < 2).length,
      poor: rrRatios.filter(r => r < 1.5).length
    };

    // Position sizing
    const volumes = trades.map(t => Number(t.volume));
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const maxVolume = Math.max(...volumes);
    const minVolume = Math.min(...volumes);

    // Volume trend (last 10 trades vs previous)
    const last10 = volumes.slice(-10);
    const prev10 = volumes.slice(-20, -10);
    const avgLast10 = last10.length > 0 ? last10.reduce((a, b) => a + b, 0) / last10.length : 0;
    const avgPrev10 = prev10.length > 0 ? prev10.reduce((a, b) => a + b, 0) / prev10.length : 0;
    const volumeTrend = avgLast10 > avgPrev10 * 1.1 ? 'up' : avgLast10 < avgPrev10 * 0.9 ? 'down' : 'neutral';

    return {
      maxDrawdown,
      currentDrawdown,
      longestWinStreak,
      longestLossStreak,
      avgRR,
      avgVolume,
      maxVolume,
      minVolume,
      rrRatios,
      equityCurve,
      streakSequence: streakSequence.slice(-50), // Last 50 trades
      volumeTrend,
      rrDistribution
    };
  }, [trades]);

  // Generate AI-style risk summary
  const riskSummary = useMemo(() => {
    if (!trades || trades.length === 0) return "Insufficient data for risk analysis.";

    const ddSeverity = riskMetrics.maxDrawdown > 2000 ? "severe" : riskMetrics.maxDrawdown > 1000 ? "moderate" : "low";
    const rrQuality = riskMetrics.avgRR >= 2 ? "excellent" : riskMetrics.avgRR >= 1.5 ? "good" : "needs improvement";
    const streakRisk = riskMetrics.longestLossStreak > 5 ? "high emotional risk" : "manageable";
    
    let summary = `Your risk profile shows ${ddSeverity} drawdown exposure with ${rrQuality} risk-reward ratios. `;
    
    if (riskMetrics.maxDrawdown > 1000) {
      summary += `Maximum drawdown of $${riskMetrics.maxDrawdown.toFixed(0)} suggests position sizing review is needed. `;
    }
    
    if (riskMetrics.avgRR < 1.5) {
      summary += `Average R:R of ${riskMetrics.avgRR.toFixed(2)}:1 is below optimal threshold. `;
    } else {
      summary += `Strong R:R management at ${riskMetrics.avgRR.toFixed(2)}:1. `;
    }
    
    if (riskMetrics.longestLossStreak > 5) {
      summary += `${riskMetrics.longestLossStreak}-trade losing streak indicates ${streakRisk}. Consider implementing cooldown periods.`;
    } else {
      summary += `Streak management appears disciplined.`;
    }
    
    return summary;
  }, [trades, riskMetrics]);

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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Risk Management</h2>
        <p className="text-muted-foreground">Comprehensive risk analysis and exposure monitoring</p>
      </div>

      {/* Section A: KPI Overview Strip */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-max justify-between">
          {/* Max Drawdown */}
          <Card className="px-6 py-4 rounded-2xl hover:scale-105 transition-transform duration-200 min-w-[180px]">
            <div className="text-xs text-muted-foreground mb-1">Max Drawdown</div>
            <div className="text-2xl font-bold text-loss">${riskMetrics.maxDrawdown.toFixed(0)}</div>
          </Card>

          {/* Current Drawdown */}
          <Card className="px-6 py-4 rounded-2xl hover:scale-105 transition-transform duration-200 min-w-[180px]">
            <div className="text-xs text-muted-foreground mb-1">Current Drawdown</div>
            <div className="text-2xl font-bold">${riskMetrics.currentDrawdown.toFixed(0)}</div>
          </Card>

          {/* Avg R:R */}
          <Card className="px-6 py-4 rounded-2xl hover:scale-105 transition-transform duration-200 min-w-[180px]">
            <div className="text-xs text-muted-foreground mb-1">Avg R:R</div>
            <div className="text-2xl font-bold text-primary">{riskMetrics.avgRR.toFixed(2)}:1</div>
          </Card>

          {/* Longest Win Streak */}
          <Card className="px-6 py-4 rounded-2xl hover:scale-105 transition-transform duration-200 min-w-[180px]">
            <div className="text-xs text-muted-foreground mb-1">Win Streak</div>
            <div className="text-2xl font-bold text-profit">{riskMetrics.longestWinStreak}</div>
          </Card>

          {/* Avg Volume */}
          <Card className="px-6 py-4 rounded-2xl hover:scale-105 transition-transform duration-200 min-w-[180px]">
            <div className="text-xs text-muted-foreground mb-1">Avg Volume</div>
            <div className="text-2xl font-bold">{riskMetrics.avgVolume.toFixed(2)}</div>
          </Card>
        </div>
      </div>

      {/* Section B: Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Drawdown Analysis */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-loss" />
            <h3 className="text-lg font-semibold">Drawdown Analysis</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Maximum</div>
              <div className="text-3xl font-bold text-loss">${riskMetrics.maxDrawdown.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Current</div>
              <div className="text-3xl font-bold">${riskMetrics.currentDrawdown.toFixed(2)}</div>
            </div>
          </div>

          {/* Mini Equity Curve Sparkline */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Equity Curve</div>
            <div className="h-16 flex items-end gap-0.5">
              {riskMetrics.equityCurve.slice(-30).map((point, i) => {
                const maxEquity = Math.max(...riskMetrics.equityCurve.map(p => p.equity));
                const minEquity = Math.min(...riskMetrics.equityCurve.map(p => p.equity));
                const range = maxEquity - minEquity || 1;
                const height = ((point.equity - minEquity) / range) * 100;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t ${point.equity >= 0 ? 'bg-profit/60' : 'bg-loss/60'}`}
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                );
              })}
            </div>
          </div>

          {riskMetrics.maxDrawdown > 1000 && (
            <div className="p-3 bg-loss/10 border border-loss/20 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-loss mt-0.5 flex-shrink-0" />
              <div className="text-sm text-loss">
                <strong>High Risk Alert:</strong> Maximum drawdown exceeds $1,000. Consider reducing position sizes.
              </div>
            </div>
          )}
        </Card>

        {/* Right Panel: Risk-Reward Analysis */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Risk-Reward Analysis</h3>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Average R:R Ratio</div>
            <div className="text-4xl font-bold text-primary">{riskMetrics.avgRR.toFixed(2)}:1</div>
            <div className="text-sm text-muted-foreground">{riskMetrics.rrRatios.length} trades with R:R data</div>
          </div>

          {/* R:R Distribution Mini-Bars */}
          <div className="space-y-2">
            <div className="text-sm font-medium">R:R Distribution</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground w-20">≥3:1</div>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-profit" 
                    style={{ width: `${(riskMetrics.rrDistribution.excellent / riskMetrics.rrRatios.length) * 100}%` }}
                  />
                </div>
                <div className="text-xs font-medium w-8">{riskMetrics.rrDistribution.excellent}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground w-20">2-3:1</div>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${(riskMetrics.rrDistribution.good / riskMetrics.rrRatios.length) * 100}%` }}
                  />
                </div>
                <div className="text-xs font-medium w-8">{riskMetrics.rrDistribution.good}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground w-20">1.5-2:1</div>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-muted" 
                    style={{ width: `${(riskMetrics.rrDistribution.fair / riskMetrics.rrRatios.length) * 100}%` }}
                  />
                </div>
                <div className="text-xs font-medium w-8">{riskMetrics.rrDistribution.fair}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground w-20">&lt;1.5:1</div>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-loss" 
                    style={{ width: `${(riskMetrics.rrDistribution.poor / riskMetrics.rrRatios.length) * 100}%` }}
                  />
                </div>
                <div className="text-xs font-medium w-8">{riskMetrics.rrDistribution.poor}</div>
              </div>
            </div>
          </div>

          {riskMetrics.avgRR < 1.5 && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary">
              💡 <strong>Guidance:</strong> Aim for at least 1.5:1 R:R ratio to improve profitability
            </div>
          )}
        </Card>
      </div>

      {/* Section C: Streaks Panel */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Win/Loss Streaks</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-profit/10 rounded-xl border border-profit/20">
            <div className="text-sm text-profit mb-1">Longest Win Streak</div>
            <div className="text-4xl font-bold text-profit">{riskMetrics.longestWinStreak}</div>
          </div>
          <div className="p-4 bg-loss/10 rounded-xl border border-loss/20">
            <div className="text-sm text-loss mb-1">Longest Loss Streak</div>
            <div className="text-4xl font-bold text-loss">{riskMetrics.longestLossStreak}</div>
          </div>
        </div>

        {/* Streak Heatmap */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Recent Streak Pattern (Last 50 Trades)</div>
          <div className="flex flex-wrap gap-1">
            {riskMetrics.streakSequence.map((result, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-sm ${result === 'W' ? 'bg-profit' : 'bg-loss'}`}
                title={`Trade ${i + 1}: ${result === 'W' ? 'Win' : 'Loss'}`}
              />
            ))}
          </div>
        </div>

        {riskMetrics.longestLossStreak > 3 && (
          <div className="p-3 bg-secondary/20 rounded-lg text-sm text-muted-foreground">
            💡 After a {riskMetrics.longestLossStreak}-trade losing streak, consider taking a break to reset emotionally and review your strategy.
          </div>
        )}
      </Card>

      {/* Section D: Position Sizing Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 space-y-2 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Avg Volume</div>
            {riskMetrics.volumeTrend === 'up' && <ArrowUp className="h-4 w-4 text-profit" />}
            {riskMetrics.volumeTrend === 'down' && <ArrowDown className="h-4 w-4 text-loss" />}
          </div>
          <div className="text-3xl font-bold">{riskMetrics.avgVolume.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">
            {riskMetrics.volumeTrend === 'up' && 'Increasing'}
            {riskMetrics.volumeTrend === 'down' && 'Decreasing'}
            {riskMetrics.volumeTrend === 'neutral' && 'Stable'}
          </div>
        </Card>

        <Card className="p-6 space-y-2 hover:shadow-lg transition-shadow">
          <div className="text-sm text-muted-foreground">Max Volume</div>
          <div className="text-3xl font-bold text-primary">{riskMetrics.maxVolume.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Peak position size</div>
        </Card>

        <Card className="p-6 space-y-2 hover:shadow-lg transition-shadow">
          <div className="text-sm text-muted-foreground">Min Volume</div>
          <div className="text-3xl font-bold text-muted">{riskMetrics.minVolume.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Minimum position size</div>
        </Card>
      </div>

      {/* Section E: Risk Posture Summary */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Brain className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Risk Posture Analysis</h3>
            <p className="text-sm leading-relaxed text-foreground/90">{riskSummary}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
