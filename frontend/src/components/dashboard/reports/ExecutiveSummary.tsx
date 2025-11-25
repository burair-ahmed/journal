import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useFilteredTrades } from "@/hooks/useTrades";
import { DollarSign, Target, Award, TrendingUp, TrendingDown, Calendar } from "lucide-react";

// Import analytics utilities
import {
  calculateKPIMetrics,
  calculateYTDMetrics,
  calculateMonthlyBreakdown,
  calculateTradeDistribution,
  calculateProfitFactor,
  generateExecutiveSummary
} from "@/lib/analytics/executiveSummary";

// Import executive components
import { KPICard } from "@/components/executive/KPICard";
import { YTDPanel } from "@/components/executive/YTDPanel";
import { MonthlyBreakdown } from "@/components/executive/MonthlyBreakdown";
import { TradeDistribution } from "@/components/executive/TradeDistribution";
import { ProfitFactorPanel } from "@/components/executive/ProfitFactorPanel";
import { ExecutiveAISummary } from "@/components/executive/ExecutiveAISummary";

interface ExecutiveSummaryProps {
  accountId?: number;
}

export const ExecutiveSummary = ({ accountId }: ExecutiveSummaryProps) => {
  const { trades = [], isLoading } = useFilteredTrades(accountId);

  // Calculate all metrics using analytics utilities
  const kpiMetrics = useMemo(() => calculateKPIMetrics(trades), [trades]);
  const ytdMetrics = useMemo(() => calculateYTDMetrics(trades), [trades]);
  const monthlyData = useMemo(() => calculateMonthlyBreakdown(trades), [trades]);
  const tradeDistribution = useMemo(() => calculateTradeDistribution(trades), [trades]);
  const profitFactorData = useMemo(() => calculateProfitFactor(trades), [trades]);
  
  const executiveSummary = useMemo(() => {
    // Calculate average quality (simplified for summary)
    const avgQuality = trades.length > 0 ? 70 : 0; // Placeholder
    const maxDrawdown = 0; // Would need to calculate from equity curve
    
    return generateExecutiveSummary(
      profitFactorData.profitFactor,
      ytdMetrics.ytdPnL,
      kpiMetrics.winRate,
      avgQuality,
      maxDrawdown
    );
  }, [trades, kpiMetrics, ytdMetrics, profitFactorData]);

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
        <h2 className="text-3xl font-bold tracking-tight mb-2">Executive Summary</h2>
        <p className="text-muted-foreground">Institutional-grade performance overview and analytics</p>
      </div>

      {/* A. KPI Grid - Institutional Header Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          label="Total P&L"
          value={`$${kpiMetrics.totalPnL.toFixed(2)}`}
          icon={DollarSign}
          colorScheme={kpiMetrics.totalPnL >= 0 ? "profit" : "loss"}
          sparklineData={kpiMetrics.sparklineData}
        />
        <KPICard
          label="Win Rate"
          value={`${kpiMetrics.winRate.toFixed(1)}%`}
          icon={Target}
          colorScheme={kpiMetrics.winRate >= 50 ? "profit" : "loss"}
        />
        <KPICard
          label="Profit Factor"
          value={kpiMetrics.profitFactor.toFixed(2)}
          icon={Award}
          colorScheme={kpiMetrics.profitFactor >= 1.5 ? "profit" : kpiMetrics.profitFactor >= 1 ? "neutral" : "loss"}
        />
        <KPICard
          label="Average Win"
          value={`$${kpiMetrics.avgWin.toFixed(2)}`}
          icon={TrendingUp}
          colorScheme="profit"
        />
        <KPICard
          label="Average Loss"
          value={`$${kpiMetrics.avgLoss.toFixed(2)}`}
          icon={TrendingDown}
          colorScheme="loss"
        />
        <KPICard
          label="This Month"
          value={`$${kpiMetrics.thisMonthPnL.toFixed(2)}`}
          icon={Calendar}
          colorScheme={kpiMetrics.thisMonthPnL >= 0 ? "profit" : "loss"}
        />
      </div>

      {/* B. YTD Performance Panel */}
      <YTDPanel
        ytdPnL={ytdMetrics.ytdPnL}
        ytdTrades={ytdMetrics.ytdTrades}
        avgPerTrade={ytdMetrics.avgPerTrade}
        bestMonth={ytdMetrics.bestMonth}
        worstMonth={ytdMetrics.worstMonth}
        monthlyData={ytdMetrics.monthlyData}
      />

      {/* C. Monthly P&L Breakdown */}
      <MonthlyBreakdown monthlyData={monthlyData} />

      {/* D & E. Trade Distribution and Profit Factor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TradeDistribution {...tradeDistribution} />
        <ProfitFactorPanel {...profitFactorData} />
      </div>

      {/* F. Executive AI Summary */}
      <ExecutiveAISummary
        summary={executiveSummary}
        profitFactor={profitFactorData.profitFactor}
        ytdPnL={ytdMetrics.ytdPnL}
      />
    </div>
  );
};
