import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import dayjs from "dayjs";
import { useFilteredTrades } from "@/hooks/useTrades";

interface PerformanceAnalyticsProps {
  accountId?: number;
}

export const PerformanceAnalytics = ({ accountId }: PerformanceAnalyticsProps) => {
  const { trades = [], isLoading } = useFilteredTrades(accountId);

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
  const analytics = useMemo(() => {
    // Monthly Performance
    const monthlyData: Record<string, { profit: number; trades: number; wins: number }> = {};
    trades.forEach(t => {
      const month = dayjs(t.close_time).format('YYYY-MM');
      if (!monthlyData[month]) monthlyData[month] = { profit: 0, trades: 0, wins: 0 };
      monthlyData[month].profit += Number(t.profit);
      monthlyData[month].trades += 1;
      if (Number(t.profit) > 0) monthlyData[month].wins += 1;
    });

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

    const avgQuality = qualityScores.reduce((sum, t) => sum + t.qualityScore, 0) / qualityScores.length;

    // Best & Worst Trades
    const sortedByProfit = [...trades].sort((a, b) => Number(b.profit) - Number(a.profit));
    const bestTrades = sortedByProfit.slice(0, 10);
    const worstTrades = sortedByProfit.slice(-10).reverse();

    return { monthlyData, qualityScores, avgQuality, bestTrades, worstTrades };
  }, [trades]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Performance Analytics</h2>
        <p className="text-muted-foreground">Detailed performance breakdown</p>
      </div>

      {/* Trade Quality */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Trade Quality Score</h3>
        <div className="text-3xl font-bold mb-2">{analytics.avgQuality.toFixed(1)}/100</div>
        <p className="text-sm text-muted-foreground">
          Average quality across {trades.length} trades
        </p>
        <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
            style={{ width: `${analytics.avgQuality}%` }}
          />
        </div>
      </Card>

      {/* Monthly Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Performance</h3>
        <div className="space-y-2">
          {Object.entries(analytics.monthlyData).slice(-6).map(([month, data]) => (
            <div key={month} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
              <div>
                <div className="font-medium">{dayjs(month).format('MMMM YYYY')}</div>
                <div className="text-sm text-muted-foreground">
                  {data.trades} trades • {((data.wins / data.trades) * 100).toFixed(1)}% win rate
                </div>
              </div>
              <div className={`text-lg font-bold ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${data.profit.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Best Trades */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">🏆 Top 10 Winning Trades</h3>
        <div className="space-y-2">
          {analytics.bestTrades.map((t, i) => (
            <div key={i} className="flex items-center justify-between p-2 hover:bg-secondary/20 rounded">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-muted-foreground">#{i + 1}</div>
                <div>
                  <div className="font-medium">{t.symbol}</div>
                  <div className="text-xs text-muted-foreground">{dayjs(t.close_time).format('MMM DD, YYYY')}</div>
                </div>
              </div>
              <div className="text-green-600 font-bold">${Number(t.profit).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Worst Trades */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">😞 Top 10 Losing Trades</h3>
        <div className="space-y-2">
          {analytics.worstTrades.map((t, i) => (
            <div key={i} className="flex items-center justify-between p-2 hover:bg-secondary/20 rounded">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-muted-foreground">#{i + 1}</div>
                <div>
                  <div className="font-medium">{t.symbol}</div>
                  <div className="text-xs text-muted-foreground">{dayjs(t.close_time).format('MMM DD, YYYY')}</div>
                </div>
              </div>
              <div className="text-red-600 font-bold">${Number(t.profit).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
