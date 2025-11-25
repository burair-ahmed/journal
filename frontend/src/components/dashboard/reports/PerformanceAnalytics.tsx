import { useMemo } from "react";
import dayjs from "dayjs";
import { useFilteredTrades } from "@/hooks/useTrades";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Award, DollarSign, Target } from "lucide-react";

// Import performance subcomponents
import { KPIStat } from "@/components/performance/KPIStat";
import { MonthlyPerformanceCard } from "@/components/performance/MonthlyPerformanceCard";
import { QualityScorePanel } from "@/components/performance/QualityScorePanel";
import { BestTrades } from "@/components/performance/BestTrades";
import { WorstTrades } from "@/components/performance/WorstTrades";
import { PerformanceSummary } from "@/components/performance/PerformanceSummary";

interface PerformanceAnalyticsProps {
  accountId?: number;
}

export const PerformanceAnalytics = ({ accountId }: PerformanceAnalyticsProps) => {
  const { trades = [], isLoading } = useFilteredTrades(accountId);

  const analytics = useMemo(() => {
    if (!trades || trades.length === 0) {
      return { 
        monthlyData: {}, 
        avgQuality: 0, 
        bestTrades: [], 
        worstTrades: [],
        last30DaysPnL: 0,
        winRate: 0,
        bestTradeProfit: 0,
        monthlyProfitTrend: [],
        qualityBreakdown: {
          withSL: 0,
          withTP: 0,
          profitable: 0,
          avgRR: 0
        }
      };
    }

    // Monthly Performance
    const monthlyData: Record<string, { profit: number; trades: number; wins: number }> = {};
    trades.forEach(t => {
      const month = dayjs(t.close_time).format('YYYY-MM');
      if (!monthlyData[month]) monthlyData[month] = { profit: 0, trades: 0, wins: 0 };
      monthlyData[month].profit += Number(t.profit);
      monthlyData[month].trades += 1;
      if (Number(t.profit) > 0) monthlyData[month].wins += 1;
    });

    // Last 30 days P&L
    const thirtyDaysAgo = dayjs().subtract(30, 'day');
    const last30DaysPnL = trades
      .filter(t => dayjs(t.close_time).isAfter(thirtyDaysAgo))
      .reduce((sum, t) => sum + Number(t.profit), 0);

    // Win Rate
    const winningTrades = trades.filter(t => Number(t.profit) > 0);
    const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;

    // Best Trade Profit
    const bestTradeProfit = trades.length > 0 
      ? Math.max(...trades.map(t => Number(t.profit))) 
      : 0;

    // Monthly Profit Trend (last 6 months for sparkline)
    const monthlyProfitTrend = Object.entries(monthlyData)
      .slice(-6)
      .map(([, data]) => data.profit);

    // Trade Quality Scores
    const qualityScores = trades.map(t => {
      let score = 50; // Base score
      const profit = Number(t.profit);
      const hasTP = t.tp_price && Number(t.tp_price) > 0;
      const hasSL = t.sl_price && Number(t.sl_price) > 0;
      if (profit > 0) score += 30;
      if (hasTP && hasSL) score += 20;
      return { ...t, qualityScore: Math.min(100, score) };
    });
    const avgQuality = qualityScores.length > 0 
      ? qualityScores.reduce((sum, t) => sum + t.qualityScore, 0) / qualityScores.length 
      : 0;

    // Quality Breakdown
    const tradesWithSL = trades.filter(t => t.sl_price && Number(t.sl_price) > 0).length;
    const tradesWithTP = trades.filter(t => t.tp_price && Number(t.tp_price) > 0).length;
    const profitableTrades = winningTrades.length;

    // Average R:R
    const rrTrades = trades.filter(t => {
      const tp = Number(t.tp_price || 0);
      const sl = Number(t.sl_price || 0);
      const entry = Number(t.open_price);
      return tp > 0 && sl > 0 && entry > 0;
    });
    const avgRR = rrTrades.length > 0
      ? rrTrades.reduce((sum, t) => {
          const tp = Number(t.tp_price);
          const sl = Number(t.sl_price);
          const entry = Number(t.open_price);
          const reward = Math.abs(tp - entry);
          const risk = Math.abs(entry - sl);
          return sum + (risk > 0 ? reward / risk : 0);
        }, 0) / rrTrades.length
      : 0;

    // Best & Worst Trades
    const sortedByProfit = [...trades].sort((a, b) => Number(b.profit) - Number(a.profit));
    const bestTrades = sortedByProfit.slice(0, 10);
    const worstTrades = sortedByProfit.slice(-10).reverse();

    return { 
      monthlyData, 
      avgQuality, 
      bestTrades, 
      worstTrades,
      last30DaysPnL,
      winRate,
      bestTradeProfit,
      monthlyProfitTrend,
      qualityBreakdown: {
        withSL: tradesWithSL,
        withTP: tradesWithTP,
        profitable: profitableTrades,
        avgRR
      }
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Performance Analytics</h2>
        <p className="text-muted-foreground">Institutional-grade performance insights and trade analysis</p>
      </div>

      {/* A. KPI Header Strip */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-max">
          <KPIStat
            label="Avg Quality Score"
            value={analytics.avgQuality.toFixed(1)}
            icon={Award}
            color="primary"
          />
          <KPIStat
            label="Last 30 Days P&L"
            value={`$${analytics.last30DaysPnL.toFixed(2)}`}
            icon={DollarSign}
            color={analytics.last30DaysPnL >= 0 ? "profit" : "loss"}
          />
          <KPIStat
            label="Win Rate"
            value={`${analytics.winRate.toFixed(1)}%`}
            icon={Target}
            color={analytics.winRate >= 50 ? "profit" : "loss"}
          />
          <KPIStat
            label="Monthly Trend"
            value="6M"
            icon={TrendingUp}
            sparklineData={analytics.monthlyProfitTrend}
            color="primary"
          />
          <KPIStat
            label="Best Trade"
            value={`$${analytics.bestTradeProfit.toFixed(2)}`}
            icon={TrendingUp}
            color="profit"
          />
        </div>
      </div>

      {/* B. Monthly Performance Grid */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Monthly Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(analytics.monthlyData)
            .slice(-6)
            .map(([month, data]) => (
              <MonthlyPerformanceCard
                key={month}
                month={dayjs(month).format('MMMM YYYY')}
                profit={data.profit}
                trades={data.trades}
                winRate={(data.wins / data.trades) * 100}
              />
            ))}
        </div>
      </div>

      {/* C. Trade Quality Panel */}
      <QualityScorePanel
        score={analytics.avgQuality}
        totalTrades={trades.length}
        breakdown={analytics.qualityBreakdown}
      />

      {/* D. Best & Worst Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BestTrades trades={analytics.bestTrades} />
        <WorstTrades trades={analytics.worstTrades} />
      </div>

      {/* E. Performance Summary */}
      <PerformanceSummary
        winRate={analytics.winRate}
        avgQuality={analytics.avgQuality}
        monthlyData={analytics.monthlyData}
        worstTrades={analytics.worstTrades}
        totalTrades={trades.length}
      />
    </div>
  );
};
