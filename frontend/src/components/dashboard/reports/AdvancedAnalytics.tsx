import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useFilteredTrades } from "@/hooks/useTrades";

// Import analytics utilities
import { calculateMTDMetrics, calculateTradeVelocity, generateAlphaInsights } from "@/lib/analytics/performance";
import { calculateGoalCompletion } from "@/lib/analytics/goalProjection";
import { runMonteCarloSimulation } from "@/lib/analytics/monteCarlo";

// Import advanced-analytics components
import { PerformanceCommandCenter } from "@/components/advanced-analytics/PerformanceCommandCenter";
import { GoalProjectionPanel } from "@/components/advanced-analytics/GoalProjectionPanel";
import { ForecastingLab } from "@/components/advanced-analytics/ForecastingLab";
import { TradeVelocityPanel } from "@/components/advanced-analytics/TradeVelocityPanel";
import { AlphaInsightsPanel } from "@/components/advanced-analytics/AlphaInsightsPanel";

interface AdvancedAnalyticsProps {
  accountId?: number;
}

export const AdvancedAnalytics = ({ accountId }: AdvancedAnalyticsProps) => {
  const { trades = [], isLoading } = useFilteredTrades(accountId);

  const monthlyGoal = 5000;
  const ytdGoal = 60000;

  // Calculate all metrics using analytics utilities
  const mtdMetrics = useMemo(() => calculateMTDMetrics(trades, monthlyGoal), [trades, monthlyGoal]);
  
  const ytdProfit = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return trades
      .filter(t => new Date(t.close_time).getFullYear() === currentYear)
      .reduce((sum, t) => sum + Number(t.profit), 0);
  }, [trades]);

  const goalMetrics = useMemo(() => 
    calculateGoalCompletion(mtdMetrics.mtdProfit, monthlyGoal, ytdProfit, ytdGoal),
    [mtdMetrics.mtdProfit, monthlyGoal, ytdProfit, ytdGoal]
  );

  const velocityMetrics = useMemo(() => calculateTradeVelocity(trades), [trades]);

  // Calculate average return and std dev for Monte Carlo
  const { avgReturn, stdDev } = useMemo(() => {
    if (trades.length === 0) return { avgReturn: 0, stdDev: 0 };
    const returns = trades.map(t => Number(t.profit));
    const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / returns.length;
    return { avgReturn: avg, stdDev: Math.sqrt(variance) };
  }, [trades]);

  const monteCarloResults = useMemo(() => 
    runMonteCarloSimulation(avgReturn, stdDev, 1000),
    [avgReturn, stdDev]
  );

  const alphaInsights = useMemo(() => 
    generateAlphaInsights(mtdMetrics, goalMetrics.goalProbability, stdDev),
    [mtdMetrics, goalMetrics.goalProbability, stdDev]
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
        <h2 className="text-3xl font-bold tracking-tight mb-2">Advanced Predictive Analytics</h2>
        <p className="text-muted-foreground">Institutional-grade forecasting and performance intelligence</p>
      </div>

      {/* A. Performance Command Center */}
      <PerformanceCommandCenter {...mtdMetrics} />

      {/* B & C. Goal Projection and Forecasting Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GoalProjectionPanel {...goalMetrics} />
        <ForecastingLab {...monteCarloResults} />
      </div>

      {/* D. Trade Velocity */}
      <TradeVelocityPanel {...velocityMetrics} />

      {/* E. Alpha Insights */}
      <AlphaInsightsPanel insights={alphaInsights} />
    </div>
  );
};
