// views/admin/AdminDashboard.tsx
/**
 * Admin Dashboard - Overview with key metrics
 * Uses global color theme (pink/fuchsia)
 */

import { Card } from '@/components/ui/card';
import { useAnalyticsOverview } from '@/hooks/useAdmin';
import { Users, Activity, TrendingUp, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const AdminDashboard = () => {
  const { data: analytics, isLoading } = useAnalyticsOverview();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Users',
      value: analytics?.total_users || 0,
      change: '+12%',
      positive: true,
      icon: Users,
      gradient: 'from-fuchsia-500 to-pink-500',
    },
    {
      title: 'Active (24h)',
      value: analytics?.active_users_24h || 0,
      change: '+8%',
      positive: true,
      icon: Activity,
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      title: 'New Today',
      value: analytics?.new_users_today || 0,
      change: '+5%',
      positive: true,
      icon: TrendingUp,
      gradient: 'from-purple-500 to-fuchsia-500',
    },
    {
      title: 'Total Trades',
      value: analytics?.total_trades || 0,
      change: '+23%',
      positive: true,
      icon: BarChart3,
      gradient: 'from-violet-500 to-purple-500',
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-pink-600">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's your platform overview.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.title}
              className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-10`}></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.gradient}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    metric.positive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.positive ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {metric.change}
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold">{metric.value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">{metric.title}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats / Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <span className="text-sm text-primary cursor-pointer hover:underline">View All</span>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-muted-foreground">user@example.com • 5 mins ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* System Health */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">System Health</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-green-600 font-medium">All Systems Operational</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="w-1/4 h-full bg-gradient-to-r from-fuchsia-500 to-pink-500"></div>
                </div>
                <span className="text-sm font-medium">25%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">API Requests</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-gradient-to-r from-fuchsia-500 to-pink-500"></div>
                </div>
                <span className="text-sm font-medium">50%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Storage</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-gradient-to-r from-fuchsia-500 to-pink-500"></div>
                </div>
                <span className="text-sm font-medium">33%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
