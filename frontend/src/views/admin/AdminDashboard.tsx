// views/admin/AdminDashboard.tsx
/**
 * Admin Dashboard - Overview with key metrics and real activity tracking
 * Uses global color theme (pink/fuchsia)
 */

import { Card } from '@/components/ui/card';
import { useAnalyticsOverview, useRecentActivity, formatActivityAction } from '@/hooks/useAdmin';
import { Users, Activity, TrendingUp, BarChart3, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const AdminDashboard = () => {
  const { data: analytics, isLoading: analyticsLoading } = useAnalyticsOverview();
  const { data: recentActivity, isLoading: activityLoading, refetch: refetchActivity } = useRecentActivity(5);

  if (analyticsLoading) {
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
      change: null, // No change tracking for total
      icon: Users,
      gradient: 'from-fuchsia-500 to-pink-500',
    },
    {
      title: 'Active (24h)',
      value: analytics?.active_users_24h || 0,
      change: analytics?.trends?.active_change,
      icon: Activity,
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      title: 'New Today',
      value: analytics?.new_users_today || 0,
      change: analytics?.trends?.new_users_change,
      icon: TrendingUp,
      gradient: 'from-purple-500 to-fuchsia-500',
    },
    {
      title: 'Total Trades',
      value: analytics?.total_trades || 0,
      change: null,
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
          const hasChange = metric.change !== null && metric.change !== undefined;
          const isPositive = hasChange && metric.change >= 0;
          
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
                  {hasChange && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPositive ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {isPositive ? '+' : ''}{metric.change}%
                    </div>
                  )}
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
            <button 
              onClick={() => refetchActivity()}
              className="text-sm text-primary cursor-pointer hover:underline flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          </div>
          <div className="space-y-4">
            {activityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4 p-3">
                    <div className="w-10 h-10 rounded-full bg-muted"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity) => {
                const formatted = formatActivityAction(activity);
                return (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-lg">
                      {formatted.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{formatted.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{formatted.description}</p>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-xs mt-1">Activity will appear here when users interact with the platform</p>
              </div>
            )}
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
