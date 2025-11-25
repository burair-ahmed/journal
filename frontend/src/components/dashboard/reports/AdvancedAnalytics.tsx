import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import dayjs from "dayjs";
import { TrendingUp, Target, Zap } from "lucide-react";
import { useFilteredTrades } from "@/hooks/useTrades";

interface AdvancedAnalyticsProps {
  accountId?: number;
}

export const AdvancedAnalytics = ({ accountId }: AdvancedAnalyticsProps) => {
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
  const advanced = useMemo(() => {
    // Monte Carlo Simulation (simplified)
    const returns = trades.map(t => Number(t.profit));
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
    
    // Simulate 1000 scenarios
    const simulations = 100;
    const futureTradesCount = 50;
    const outcomes = [];
    
    for (let i = 0; i < simulations; i++) {
      let total = 0;
      for (let j = 0; j < futureTradesCount; j++) {
        // Random return based on historical distribution
        const randomReturn = avgReturn + (Math.random() - 0.5) * stdDev * 2;
        total += randomReturn;
      }
      outcomes.push(total);
    }
    
    outcomes.sort((a, b) => a - b);
    const best = outcomes[Math.floor(outcomes.length * 0.95)];
    const worst = outcomes[Math.floor(outcomes.length * 0.05)];
    const median = outcomes[Math.floor(outcomes.length * 0.5)];
    
    // Current month projection
    const now = dayjs();
    const monthTrades = trades.filter(t => dayjs(t.close_time).isSame(now, 'month'));
    const daysInMonth = now.daysInMonth();
    const daysPassed = now.date();
    const monthProfit = monthTrades.reduce((sum, t) => sum + Number(t.profit), 0);
    const projectedMonthEnd = (monthProfit / daysPassed) * daysInMonth;
    
    // Goal tracking (example goals)
    const monthlyGoal = 1000;
    const yearlyGoal = 12000;
    const ytdTrades = trades.filter(t => dayjs(t.close_time).year() === now.year());
    const ytdProfit = ytdTrades.reduce((sum, t) => sum + Number(t.profit), 0);
    
    return {
      avgReturn,
      stdDev,
      monteCarlo: { best, worst, median },
      monthProfit,
      projectedMonthEnd,
      monthlyGoal,
      yearlyGoal,
      ytdProfit,
      daysPassed,
      daysInMonth
    };
  }, [trades]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Advanced Analytics</h2>
        <p className="text-muted-foreground">Predictive insights and goal tracking</p>
      </div>

      {/* Current Month Review */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">📊 Current Month Mid-Month Review</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-muted-foreground">MTD Performance</div>
            <div className={`text-3xl font-bold ${advanced.monthProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${advanced.monthProfit.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Day {advanced.daysPassed} of {advanced.daysInMonth}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Projected Month-End</div>
            <div className={`text-3xl font-bold ${advanced.projectedMonthEnd >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${advanced.projectedMonthEnd.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Based on current pace
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          💡 {advanced.projectedMonthEnd >= advanced.monthlyGoal ? 
            `On track to exceed monthly goal of $${advanced.monthlyGoal}!` :
            `Need $${(advanced.monthlyGoal - advanced.projectedMonthEnd).toFixed(2)} more to hit monthly goal.`}
        </div>
      </Card>

      {/* Goal Progress */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">🎯 Goal Progress Report</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Monthly Goal</span>
              <span className="text-sm text-muted-foreground">
                ${advanced.monthProfit.toFixed(2)} / ${advanced.monthlyGoal}
              </span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{ width: `${Math.min(100, (advanced.monthProfit / advanced.monthlyGoal) * 100)}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Yearly Goal</span>
              <span className="text-sm text-muted-foreground">
                ${advanced.ytdProfit.toFixed(2)} / ${advanced.yearlyGoal}
              </span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                style={{ width: `${Math.min(100, (advanced.ytdProfit / advanced.yearlyGoal) * 100)}%` }}
              />
            </div>
          </div>
        </div>
        
        {advanced.ytdProfit >= advanced.yearlyGoal && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            🏆 <strong>Congratulations!</strong> You've achieved your yearly goal!
          </div>
        )}
      </Card>

      {/* Monte Carlo Simulation */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">🎲 Monte Carlo Simulation</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Based on your trading statistics, here's what could happen in the next 50 trades:
        </p>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <div className="text-sm text-green-700 mb-1">Best Case (95%)</div>
            <div className="text-2xl font-bold text-green-600">
              ${advanced.monteCarlo.best.toFixed(2)}
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <div className="text-sm text-blue-700 mb-1">Expected (50%)</div>
            <div className="text-2xl font-bold text-blue-600">
              ${advanced.monteCarlo.median.toFixed(2)}
            </div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg text-center">
            <div className="text-sm text-red-700 mb-1">Worst Case (5%)</div>
            <div className="text-2xl font-bold text-red-600">
              ${advanced.monteCarlo.worst.toFixed(2)}
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-secondary/20 rounded-lg text-sm">
          <strong>Risk of Ruin:</strong> {advanced.monteCarlo.worst < -5000 ? 
            'High - Consider reducing position sizes' : 
            'Low - Current risk management is adequate'}
        </div>
      </Card>

      {/* Trading Frequency */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📅 Trading Frequency Analysis</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-secondary/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Trades/Day</div>
            <div className="text-2xl font-bold">
              {(trades.length / Math.max(1, dayjs().diff(dayjs(trades[trades.length - 1]?.close_time), 'day'))).toFixed(1)}
            </div>
          </div>
          <div className="text-center p-4 bg-secondary/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Trades/Week</div>
            <div className="text-2xl font-bold">
              {(trades.length / Math.max(1, dayjs().diff(dayjs(trades[trades.length - 1]?.close_time), 'week'))).toFixed(1)}
            </div>
          </div>
          <div className="text-center p-4 bg-secondary/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Trades/Month</div>
            <div className="text-2xl font-bold">
              {(trades.length / Math.max(1, dayjs().diff(dayjs(trades[trades.length - 1]?.close_time), 'month'))).toFixed(1)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
