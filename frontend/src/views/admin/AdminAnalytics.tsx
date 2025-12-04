// views/admin/AdminAnalytics.tsx
/**
 * Admin Analytics - Advanced charts and insights
 * Uses recharts for visualization
 */

import { Card } from '@/components/ui/card';
import { useAnalyticsHistory, useAnalyticsOverview } from '@/hooks/useAdmin';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Loader2, TrendingUp, Users, BarChart3 } from 'lucide-react';

export const AdminAnalytics = () => {
  const { data: history, isLoading: historyLoading } = useAnalyticsHistory();
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();

  if (historyLoading || overviewLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-pink-600">
          Platform Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Deep dive into user growth and platform usage
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{overview?.total_users.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Trades</p>
              <p className="text-2xl font-bold">{overview?.total_trades.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Users (Today)</p>
              <p className="text-2xl font-bold">{overview?.new_users_today.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">User Growth (30 Days)</h3>
            <p className="text-sm text-muted-foreground">New user registrations over time</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d946ef" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  className="text-xs text-muted-foreground" 
                />
                <YAxis className="text-xs text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#d946ef" 
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                  name="New Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Trade Volume Chart */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Trade Volume (30 Days)</h3>
            <p className="text-sm text-muted-foreground">Number of trades recorded daily</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  className="text-xs text-muted-foreground" 
                />
                <YAxis className="text-xs text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="trades" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Trades" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
