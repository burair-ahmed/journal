import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import dayjs from "dayjs";
import { TrendingUp, TrendingDown, DollarSign, Target, Award, Calendar } from "lucide-react";
import { useFilteredTrades } from "@/hooks/useTrades";

interface ExecutiveSummaryProps {
  accountId?: number;
}

export const ExecutiveSummary = ({ accountId }: ExecutiveSummaryProps) => {
  const { trades = [], isLoading } = useFilteredTrades(accountId);

  const stats = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalProfit: 0,
        grossProfit: 0,
        grossLoss: 0,
        winRate: 0,
        profitFactor: 0,
        avgWin: 0,
        avgLoss: 0,
        monthTrades: 0,
        monthProfit: 0,
        ytdTrades: 0,
        ytdProfit: 0,
      };
    }

    const totalTrades = trades.length;
    const winningTrades = trades.filter((t) => Number(t.profit) > 0);
    const losingTrades = trades.filter((t) => Number(t.profit) < 0);
    
    const totalProfit = trades.reduce((sum, t) => sum + Number(t.profit), 0);
    const grossProfit = winningTrades.reduce((sum, t) => sum + Number(t.profit), 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + Number(t.profit), 0));
    
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
    
    const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;
    
    // Current month
    const now = dayjs();
    const monthTrades = trades.filter(t => dayjs(t.close_time).isSame(now, 'month'));
    const monthProfit = monthTrades.reduce((sum, t) => sum + Number(t.profit), 0);
    
    // YTD
    const ytdTrades = trades.filter(t => dayjs(t.close_time).year() === now.year());
    const ytdProfit = ytdTrades.reduce((sum, t) => sum + Number(t.profit), 0);
    
    return {
      totalTrades,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      totalProfit,
      grossProfit,
      grossLoss,
      winRate,
      profitFactor,
      avgWin,
      avgLoss,
      monthTrades: monthTrades.length,
      monthProfit,
      ytdTrades: ytdTrades.length,
      ytdProfit,
    };
  }, [trades, accountId]);

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

  const MetricCard = ({ icon: Icon, label, value, subValue, trend }: any) => (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Icon className="h-4 w-4" />
            {label}
          </div>
          <div className="text-2xl font-bold">{value}</div>
          {subValue && <div className="text-sm text-muted-foreground mt-1">{subValue}</div>}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Executive Summary</h2>
        <p className="text-muted-foreground">Quick performance snapshot</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          icon={DollarSign}
          label="Total P&L"
          value={`$${stats.totalProfit.toFixed(2)}`}
          subValue={`${stats.totalTrades} trades`}
        />
        <MetricCard
          icon={Target}
          label="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          subValue={`${stats.winningTrades}W / ${stats.losingTrades}L`}
        />
        <MetricCard
          icon={Award}
          label="Profit Factor"
          value={stats.profitFactor.toFixed(2)}
          subValue={`$${stats.grossProfit.toFixed(0)} / $${stats.grossLoss.toFixed(0)}`}
        />
        <MetricCard
          icon={TrendingUp}
          label="Avg Win"
          value={`$${stats.avgWin.toFixed(2)}`}
        />
        <MetricCard
          icon={TrendingDown}
          label="Avg Loss"
          value={`$${stats.avgLoss.toFixed(2)}`}
        />
        <MetricCard
          icon={Calendar}
          label="This Month"
          value={`$${stats.monthProfit.toFixed(2)}`}
          subValue={`${stats.monthTrades} trades`}
        />
      </div>

      {/* YTD Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Year-to-Date Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">YTD P&L</div>
            <div className="text-2xl font-bold">${stats.ytdProfit.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">YTD Trades</div>
            <div className="text-2xl font-bold">{stats.ytdTrades}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Avg per Trade</div>
            <div className="text-2xl font-bold">
              ${stats.ytdTrades > 0 ? (stats.ytdProfit / stats.ytdTrades).toFixed(2) : '0.00'}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Best Month</div>
            <div className="text-2xl font-bold">-</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
