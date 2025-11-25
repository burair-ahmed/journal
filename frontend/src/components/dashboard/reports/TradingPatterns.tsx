import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useFilteredTrades } from "@/hooks/useTrades";

// Import analytics utilities
import {
  calculateSymbolPerformance,
  calculateDayOfWeekStats,
  calculateTradeDuration,
  calculateWinLossPatterns,
  generateTradingInsights
} from "@/lib/analytics/tradingPatterns";

// Import trading-patterns components
import { SymbolPerformanceCard } from "@/components/trading-patterns/SymbolPerformanceCard";
import { DayOfWeekPerformance } from "@/components/trading-patterns/DayOfWeekPerformance";
import { TradeDurationPanel } from "@/components/trading-patterns/TradeDurationPanel";
import { WinLossPatternPanel } from "@/components/trading-patterns/WinLossPatternPanel";
import { TradingInsightsPanel } from "@/components/trading-patterns/TradingInsightsPanel";

interface TradingPatternsProps {
  accountId?: number;
}

export const TradingPatterns = ({ accountId }: TradingPatternsProps) => {
  const { trades = [], isLoading } = useFilteredTrades(accountId);

  // Calculate all metrics using analytics utilities
  const symbolStats = useMemo(() => calculateSymbolPerformance(trades), [trades]);
  const dayStats = useMemo(() => calculateDayOfWeekStats(trades), [trades]);
  const durationStats = useMemo(() => calculateTradeDuration(trades), [trades]);
  const patterns = useMemo(() => calculateWinLossPatterns(trades), [trades]);
  const insights = useMemo(() => 
    generateTradingInsights(symbolStats, dayStats, durationStats, patterns), 
    [symbolStats, dayStats, durationStats, patterns]
  );

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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Trading Patterns</h2>
        <p className="text-muted-foreground">Discover patterns and optimize your trading strategy</p>
      </div>

      {/* A. Symbol Performance Panel */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">📊 Top 10 Symbol Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {symbolStats.map((symbol, index) => (
            <SymbolPerformanceCard
              key={symbol.symbol}
              symbol={symbol.symbol}
              trades={symbol.trades}
              winRate={symbol.winRate}
              profit={symbol.profit}
              sparklineData={symbol.sparklineData}
              rank={index + 1}
            />
          ))}
        </div>
      </div>

      {/* B. Day of Week Performance */}
      <DayOfWeekPerformance dayStats={dayStats} />

      {/* C. Trade Duration Analysis */}
      <TradeDurationPanel {...durationStats} />

      {/* D. Win/Loss Pattern Recognition */}
      <WinLossPatternPanel
        afterWin={patterns.afterWin}
        afterLoss={patterns.afterLoss}
      />

      {/* E. Trading Insights Panel */}
      <TradingInsightsPanel insights={insights} />
    </div>
  );
};
