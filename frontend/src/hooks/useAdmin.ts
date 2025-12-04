// hooks/useAdmin.ts
/**
 * Admin hooks for user management and analytics
 * Uses Supabase client-side queries with RLS
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  user?: {
    email: string;
    name?: string;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin' | 'super_admin' | 'support' | 'suspended';
  created_at: string;
  last_sign_in_at?: string;
}

export interface AnalyticsOverview {
  total_users: number;
  active_users_24h: number;
  new_users_today: number;
  total_trades: number;
}

// Helper: Log user activity
export const logActivity = async (
  action: string,
  resourceType?: string,
  resourceId?: string,
  metadata?: Record<string, any>
) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return;
  
  try {
    await supabase.from('activity_log').insert({
      user_id: user.id,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// Helper: Log admin action to audit trail
const logAdminAction = async (
  action: string,
  targetUserId?: string,
  metadata?: Record<string, any>
) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return;
  
  await supabase.from('admin_audit_log').insert({
    admin_user_id: user.id,
    action,
    target_user_id: targetUserId,
    metadata: metadata || {},
  });
};

// Check if current user is admin
export const useIsAdmin = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error || !data) return false;
      
      return ['admin', 'super_admin', 'support'].includes(data.role);
    },
    enabled: !!user,
  });
};

// Get all users with pagination
export const useUsers = (page = 1, limit = 50, search?: string, roleFilter?: string) => {
  const offset = (page - 1) * limit;
  
  return useQuery({
    queryKey: ['admin-users', page, limit, search, roleFilter],
    queryFn: async () => {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' });
      
      // Search filter
      if (search) {
        query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
      }
      
      // Role filter
      if (roleFilter) {
        query = query.eq('role', roleFilter);
      }
      
      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return {
        users: data as AdminUser[],
        total: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
      };
    },
  });
};

// Get single user details
export const useUserDetail = (userId: string) => {
  return useQuery({
    queryKey: ['admin-user', userId],
    queryFn: async () => {
      // Get user info
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (userError) throw userError;
      
      // Get user's accounts
      const { data: accounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId);
      
      // Get trade count
      const accountIds = accounts?.map((acc: any) => acc.id) || [];
      const { count: tradeCount } = await supabase
        .from('trades')
        .select('id', { count: 'exact', head: true })
        .in('account_id', accountIds);
      
      return {
        user: user as AdminUser,
        accounts: accounts || [],
        trade_count: tradeCount || 0,
      };
    },
    enabled: !!userId,
  });
};

// Suspend user
export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('users')
        .update({ role: 'suspended' })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Log to activity_log for Recent Activity display
      await logActivity('user_suspend', 'user', userId);
      await logAdminAction('suspend_user', userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user'] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-activity'] });
    },
  });
};

// Unsuspend user (restore to regular user)
export const useUnsuspendUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('users')
        .update({ role: 'user' })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Log to activity_log for Recent Activity display
      await logActivity('user_unsuspend', 'user', userId);
      await logAdminAction('unsuspend_user', userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user'] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-activity'] });
    },
  });
};

// Delete user (super admin only)
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      // Log activity before delete (won't work after user is gone)
      await logActivity('user_delete', 'user', userId);
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      await logAdminAction('delete_user', userId, { permanent: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-activity'] });
    },
  });
};

// Bulk Suspend Users
export const useBulkSuspendUsers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userIds: string[]) => {
      const { error } = await supabase
        .from('users')
        .update({ role: 'suspended' })
        .in('id', userIds);
      
      if (error) throw error;
      
      // Log actions
      await Promise.all(userIds.map(id => logAdminAction('suspend_user', id, { bulk: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Selected users suspended');
    },
  });
};

// Bulk Delete Users
export const useBulkDeleteUsers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userIds: string[]) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .in('id', userIds);
      
      if (error) throw error;
      
      // Log actions
      await Promise.all(userIds.map(id => logAdminAction('delete_user', id, { bulk: true, permanent: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Selected users deleted');
    },
  });
};

// Get analytics overview with trends
export const useAnalyticsOverview = () => {
  return useQuery({
    queryKey: ['admin-analytics-overview'],
    queryFn: async () => {
      // Total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });
      
      // Active users (last 24h) - use last_sign_in_at (always available via auth)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Try last_active_at first, fallback to last_sign_in_at
      let activeUsers = 0;
      const { count: activeCount, error: activeError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('last_sign_in_at', yesterday.toISOString());
      
      activeUsers = activeCount || 0;
      
      // New users today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: newUsers } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());
      
      // Total trades
      const { count: totalTrades } = await supabase
        .from('trades')
        .select('id', { count: 'exact', head: true });

      // Calculate trends (compare to yesterday)
      const dayBeforeYesterday = new Date();
      dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
      
      const { count: activeYesterday } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('last_sign_in_at', dayBeforeYesterday.toISOString())
        .lt('last_sign_in_at', yesterday.toISOString());

      const yesterdayStart = new Date();
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      yesterdayStart.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date();
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
      yesterdayEnd.setHours(23, 59, 59, 999);
      
      const { count: newYesterday } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', yesterdayStart.toISOString())
        .lt('created_at', yesterdayEnd.toISOString());
      
      return {
        total_users: totalUsers || 0,
        active_users_24h: activeUsers,
        new_users_today: newUsers || 0,
        total_trades: totalTrades || 0,
        trends: {
          active_change: activeYesterday 
            ? Math.round((activeUsers - activeYesterday) / activeYesterday * 100)
            : 0,
          new_users_change: newYesterday
            ? Math.round(((newUsers || 0) - (newYesterday || 1)) / (newYesterday || 1) * 100)
            : 0,
        }
      };
    },
  });
};

// Get analytics history for charts (last 30 days)
export const useAnalyticsHistory = () => {
  return useQuery({
    queryKey: ['admin-analytics-history'],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      // Fetch users created in last 30 days
      const { data: users } = await supabase
        .from('users')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at');

      // Fetch trades created in last 30 days
      const { data: trades } = await supabase
        .from('trades')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at');

      // Process data by day
      const history = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dayUsers = users?.filter(u => u.created_at.startsWith(dateStr)).length || 0;
        const dayTrades = trades?.filter(t => t.created_at.startsWith(dateStr)).length || 0;
        
        history.push({
          date: dateStr,
          users: dayUsers,
          trades: dayTrades,
        });
      }

      return history;
    },
  });
};

// Get recent activity for admin dashboard
export const useRecentActivity = (limit = 10) => {
  return useQuery({
    queryKey: ['admin-recent-activity', limit],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('activity_log')
          .select(`
            *,
            user:users!user_id (
              email,
              name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (error) {
          // Table might not exist, return empty array
          console.warn('activity_log table may not exist:', error.message);
          return [];
        }
        
        return data as ActivityLog[];
      } catch (err) {
        console.warn('Failed to fetch activity log:', err);
        return [];
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// Format activity for display
export const formatActivityAction = (activity: ActivityLog): { 
  icon: string; 
  title: string; 
  description: string;
} => {
  const email = activity.user?.email || 'Unknown user';
  
  switch (activity.action) {
    case 'login':
      return {
        icon: '🔐',
        title: 'User logged in',
        description: email,
      };
    case 'register':
      return {
        icon: '👤',
        title: 'New user registered',
        description: email,
      };
    case 'trade_sync':
      return {
        icon: '📊',
        title: 'Trades synced',
        description: `${email} synced ${activity.metadata?.count || 'N/A'} trades`,
      };
    case 'account_add':
      return {
        icon: '💳',
        title: 'Account added',
        description: `${email} connected ${activity.metadata?.alias || 'new account'}`,
      };
    case 'trade_add':
      return {
        icon: '📈',
        title: 'Trade added',
        description: `${email} added a trade`,
      };
    case 'user_suspend':
      return {
        icon: '🚫',
        title: 'User suspended',
        description: `Admin suspended a user`,
      };
    case 'user_unsuspend':
      return {
        icon: '✅',
        title: 'User unsuspended',
        description: `Admin restored user access`,
      };
    case 'user_delete':
      return {
        icon: '🗑️',
        title: 'User deleted',
        description: `Admin deleted a user`,
      };
    default:
      return {
        icon: '⚡',
        title: activity.action.replace(/_/g, ' '),
        description: email,
      };
  }
};
