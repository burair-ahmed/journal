import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import dayjs from "dayjs";
import { useFilteredTrades } from "@/hooks/useTrades";

interface TradingPatternsProps {
  accountId?: number;
}

export const TradingPatterns = ({ accountId }: TradingPatternsProps) => {
  const { trades = [], isLoading } = useFilteredTrades(accountId);

  const patterns = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        symbolStats: {},
        dayStats: {},
        durationStats: { scalp: 0, intraday: 0, swing: 0, position: 0 },
        afterWinStats: { wins: 0, losses: 0 },
        afterLossStats: { wins: 0, losses: 0 }
      };
    }

    // Symbol Performance
    const symbolStats: Record<string, { wins: number; losses: number; profit: number; count: number }> = {};
    trades.forEach(t => {
      if (!symbolStats[t.symbol]) symbolStats[t.symbol] = { wins: 0, losses: 0, profit: 0, count: 0 };
      symbolStats[t.symbol].count++;
      symbolStats[t.symbol].profit += Number(t.profit);
      if (Number(t.profit) > 0) symbolStats[t.symbol].wins++;
      else symbolStats[t.symbol].losses++;
    });

    // Day of Week
    const dayStats: Record<string, { profit: number; count: number }> = {};
    trades.forEach(t => {
      const day = dayjs(t.close_time).format('dddd');
      if (!dayStats[day]) dayStats[day] = { profit: 0, count: 0 };
      dayStats[day].profit += Number(t.profit);
      dayStats[day].count++;
    });

    // Trade Duration
    const durationStats = { scalp: 0, intraday: 0, swing: 0, position: 0 };
    trades.forEach(t => {
      const duration = dayjs(t.close_time).diff(dayjs(t.open_time), 'minute');
      if (duration < 15) durationStats.scalp++;
      else if (duration < 240) durationStats.intraday++;
      else if (duration < 1440) durationStats.swing++;
      else durationStats.position++;
    });

    // Win/Loss Patterns
    let afterWinStats = { wins: 0, losses: 0 };
    let afterLossStats = { wins: 0, losses: 0 };
    for (let i = 1; i < trades.length; i++) {
      const prevWin = Number(trades[i-1].profit) > 0;
      const currWin = Number(trades[i].profit) > 0;
      if (prevWin) {
        if (currWin) afterWinStats.wins++;
        else afterWinStats.losses++;
      } else {
        if (currWin) afterLossStats.wins++;
        else afterLossStats.losses++;
      }
    }

    return { symbolStats, dayStats, durationStats, afterWinStats, afterLossStats };
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
        <h2 className="text-2xl font-bold mb-2">Trading Patterns</h2>
        <p className="text-muted-foreground">Discover your trading patterns and optimize your strategy</p>
      </div>

      {/* Symbol Performance Matrix */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Symbol Performance Matrix</h3>
        <div className="space-y-2">
          {Object.entries(patterns.symbolStats)
            .sort(([,a], [,b]) => b.profit - a.profit)
            .slice(0, 10)
            .map(([symbol, stats]) => {
              const winRate = (stats.wins / stats.count) * 100;
              return (
                <div key={symbol} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {stats.count} trades • {winRate.toFixed(1)}% win rate
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${stats.profit >= 0 ? 'text-profit' : 'text-loss'}`}>
                    ${stats.profit.toFixed(2)}
                  </div>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Day of Week Analysis */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📅 Day of Week Performance</h3>
        <div className="space-y-2">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
            const stats = patterns.dayStats[day] || { profit: 0, count: 0 };
            return (
              <div key={day} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{day}</div>
                  <div className="text-sm text-muted-foreground">{stats.count} trades</div>
                </div>
                <div className={`text-lg font-bold ${stats.profit >= 0 ? 'text-profit' : 'text-loss'}`}>
                  ${stats.profit.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Trade Duration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">⏱️ Trade Duration Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-secondary/20 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Scalps (\u003c15min)</div>
            <div className="text-2xl font-bold">{patterns.durationStats.scalp}</div>
          </div>
          <div className="p-4 bg-secondary/20 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Intraday (15min-4h)</div>
            <div className="text-2xl font-bold">{patterns.durationStats.intraday}</div>
          </div>
          <div className="p-4 bg-secondary/20 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Swing (4h-1d)</div>
            <div className="text-2xl font-bold">{patterns.durationStats.swing}</div>
          </div>
          <div className="p-4 bg-secondary/20 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Position (1d+)</div>
            <div className="text-2xl font-bold">{patterns.durationStats.position}</div>
          </div>
        </div>
      </Card>

      {/* Win/Loss Patterns */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">🔍 Win/Loss Pattern Recognition</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-secondary/20 rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">After a Win</div>
            <div className="flex gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Next Win</div>
                <div className="text-xl font-bold text-profit">{patterns.afterWinStats.wins}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Next Loss</div>
                <div className="text-xl font-bold text-loss">{patterns.afterWinStats.losses}</div>
              </div>
            </div>
            <div className="text-sm mt-2">
              Win rate: {((patterns.afterWinStats.wins / (patterns.afterWinStats.wins + patterns.afterWinStats.losses)) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="p-4 bg-secondary/20 rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">After a Loss</div>
            <div className="flex gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Next Win</div>
                <div className="text-xl font-bold text-profit">{patterns.afterLossStats.wins}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Next Loss</div>
                <div className="text-xl font-bold text-loss">{patterns.afterLossStats.losses}</div>
              </div>
            </div>
            <div className="text-sm mt-2">
              Win rate: {((patterns.afterLossStats.wins / (patterns.afterLossStats.wins + patterns.afterLossStats.losses)) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
