import { Card } from "@/components/ui/card";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { useFilteredTrades } from "@/hooks/useTrades";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg backdrop-blur-sm">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}:{" "}
            {typeof entry.value === "number"
              ? `$${entry.value.toFixed(2)}`
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ChartsGrid = ({ accountId }: { accountId?: number }) => {
  const { trades, isLoading, error } = useFilteredTrades(accountId);

  if (isLoading) return <div>Loading charts...</div>;
  if (error) return <div>Failed to load trades</div>;
  if (!trades?.length) return <div>No trades found</div>;

  const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);

  // --- PnL by Asset
  const pnlByAsset: Record<string, number> = {};
  trades.forEach((t) => {
    pnlByAsset[t.symbol] = (pnlByAsset[t.symbol] || 0) + t.profit;
  });
  const pnlByAssetData = Object.entries(pnlByAsset).map(([symbol, pnl]) => ({
    symbol,
    pnl,
  }));

  // --- Asset Distribution
  const counts: Record<string, number> = {};
  trades.forEach((t) => {
    counts[t.symbol] = (counts[t.symbol] || 0) + 1;
  });
  const totalTrades = trades.length;
  const colors = ["hsl(var(--primary))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#ef4444"];
  const sorted = Object.entries(counts)
    .map(([symbol, count]) => ({
      name: symbol,
      value: (count / totalTrades) * 100,
    }))
    .sort((a, b) => b.value - a.value);
  const top3 = sorted.slice(0, 3).map((s, i) => ({ ...s, color: colors[i] }));
  const others = sorted.slice(3);
  const otherVal = others.reduce((sum, o) => sum + o.value, 0);
  const assetDistributionData = others.length
    ? [...top3, { name: "Other", value: otherVal, color: "#f59e0b", others }]
    : top3;

  // --- Equity Curve
  let cumulative = 0;
  const equityCurveData = trades
    .slice()
    .reverse()
    .map((t) => {
      cumulative += t.profit;
      return {
        date: new Date(t.close_time).toISOString().slice(0, 10),
        cumulative_pnl: cumulative,
      };
    });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Asset Distribution */}
      <Card className="p-6 backdrop-blur-md bg-card/70 border border-border shadow-md">
        <div className="flex items-center gap-2 mb-6">
          <PieChartIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Asset Distribution</h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={assetDistributionData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {assetDistributionData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* PnL by Asset */}
      <Card className="p-6 backdrop-blur-md bg-card/70 border border-border shadow-md">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">P&L by Asset</h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={pnlByAssetData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="symbol" />
            <YAxis tickFormatter={(v) => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {pnlByAssetData.map((e, i) => (
                <Cell
                  key={i}
                  fill={
                    e.pnl >= 0
                      ? "hsl(var(--profit))"
                      : "hsl(var(--loss))"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Equity Curve */}
      <Card className="p-6 lg:col-span-2 backdrop-blur-md bg-card/70 border border-border shadow-md">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Equity Curve</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={equityCurveData}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(v) => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="cumulative_pnl"
              stroke="hsl(var(--primary))"
              fill="url(#equityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
