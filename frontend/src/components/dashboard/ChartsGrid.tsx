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
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity } from "lucide-react";

// Mock data - will be replaced with API calls
const assetDistributionData = [
  { name: 'EURUSD', value: 40, color: '#10b981' },
  { name: 'GBPUSD', value: 25, color: '#3b82f6' },
  { name: 'USDJPY', value: 20, color: '#8b5cf6' },
  { name: 'GOLD', value: 15, color: '#f59e0b' },
];

const pnlByAssetData = [
  { symbol: 'EURUSD', pnl: 1500.50 },
  { symbol: 'GBPUSD', pnl: -320.25 },
  { symbol: 'USDJPY', pnl: 890.75 },
  { symbol: 'GOLD', pnl: 445.30 },
];

const equityCurveData = [
  { date: '2024-01', cumulative_pnl: 1000 },
  { date: '2024-02', cumulative_pnl: 1250 },
  { date: '2024-03', cumulative_pnl: 980 },
  { date: '2024-04', cumulative_pnl: 1400 },
  { date: '2024-05', cumulative_pnl: 1750 },
  { date: '2024-06', cumulative_pnl: 2150 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? 
              (entry.name === 'pnl' || entry.name === 'cumulative_pnl' ? 
                `$${entry.value.toFixed(2)}` : 
                entry.value.toFixed(1) + '%'
              ) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ChartsGrid = () => {
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
                <Cell key={`cell-${index}`} fill={entry.color} />
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
              <span>{item.name} ({item.value}%)</span>
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
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="pnl" 
              radius={[4, 4, 0, 0]}
            >
              {pnlByAssetData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.pnl >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'}
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
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
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