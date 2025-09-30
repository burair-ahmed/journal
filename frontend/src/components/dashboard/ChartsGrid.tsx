import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
} from "lucide-react";
import { useTrades } from "@/hooks/useTrades"; // ✅ import your hook

// Tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}:{" "}
            {typeof entry.value === "number"
              ? entry.name.includes("pnl")
                ? `$${entry.value.toFixed(2)}`
                : entry.value.toFixed(1) + "%"
              : entry.value}
          </p>
        ))}
        {/* If hovering "Other", show breakdown */}
        {payload[0]?.payload?.others &&
          payload[0].payload.others.map((o: any, i: number) => (
            <p key={i} className="text-xs ml-2">
              {o.name}: {o.value.toFixed(1)}%
            </p>
          ))}
      </div>
    );
  }
  return null;
};

export const ChartsGrid = () => {
  const { data: trades, isLoading, error } = useTrades();

  if (isLoading) return <div>Loading charts...</div>;
  if (error) return <div>Failed to load trades</div>;
  if (!trades) return null;

  // --- Asset Distribution (by count %) ---
  const symbolCounts: Record<string, number> = {};
  trades.forEach((t) => {
    symbolCounts[t.symbol] = (symbolCounts[t.symbol] || 0) + 1;
  });
  const totalTrades = trades.length;

  // Convert to array and sort by count (descending)
  const sortedSymbols = Object.entries(symbolCounts)
    .map(([symbol, count]) => ({
      name: symbol,
      value: (count / totalTrades) * 100,
    }))
    .sort((a, b) => b.value - a.value);

  const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

  // Take top 3, group rest into "Other"
  const top3 = sortedSymbols.slice(0, 3).map((s, i) => ({
    ...s,
    color: colors[i],
  }));
  const others = sortedSymbols.slice(3);
  const otherValue = others.reduce((sum, s) => sum + s.value, 0);

  const assetDistributionData =
    others.length > 0
      ? [
          ...top3,
          {
            name: "Other",
            value: otherValue,
            color: "#f59e0b", // yellow for "Other"
            others: others,
          },
        ]
      : top3;

  // --- P&L by Asset ---
 // --- P&L by Asset ---
const pnlByAsset: Record<string, number> = {};
trades
  .filter((t) => t.symbol && t.symbol.toLowerCase() !== "deposit") // 🚫 exclude deposits
  .forEach((t) => {
    pnlByAsset[t.symbol] = (pnlByAsset[t.symbol] || 0) + t.profit;
  });

const pnlByAssetData = Object.entries(pnlByAsset).map(([symbol, pnl]) => ({
  symbol,
  pnl,
}));


  // --- Equity Curve ---
  let cumulative = 0;
  const equityCurveData = trades
    .slice()
    .reverse() // trades are returned desc → reverse to ascending
    .map((t) => {
      cumulative += t.profit;
      return {
        date: new Date(t.close_time).toISOString().slice(0, 10),
        cumulative_pnl: cumulative,
      };
    });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Asset Distribution Pie Chart */}
      <Card className="widget-card p-6">
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
        <div className="flex flex-wrap gap-2 mt-4">
          {assetDistributionData.map((item, index) => (
            <div key={index} className="flex items-center gap-1 text-xs">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.color }}
              ></div>
              <span>
                {item.name} ({item.value.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* P&L by Asset Bar Chart */}
      <Card className="widget-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">P&L by Asset</h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={pnlByAssetData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="symbol"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {pnlByAssetData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.pnl >= 0
                      ? "hsl(var(--profit))"
                      : "hsl(var(--loss))"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Equity Curve Line Chart */}
      <Card className="widget-card p-6 lg:col-span-2">
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
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="cumulative_pnl"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#equityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
