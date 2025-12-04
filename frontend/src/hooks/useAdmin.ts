// hooks/useAdmin.ts
/**
 * Admin hooks for user management and analytics
 * Uses Supabase client-side queries with RLS
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './useAuth';

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin' | 'super_admin' | 'support';
  created_at: string;
  last_sign_in_at?: string;
}

export interface AnalyticsOverview {
  total_users: number;
  active_users_24h: number;
  new_users_today: number;
  total_trades: number;
}

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
      // Update role to suspended
      const { error } = await supabase
        .from('users')
        .update({ role: 'suspended' })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Log action
      await logAdminAction('suspend_user', userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

// Delete user (super admin only)
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      // Log action
      await logAdminAction('delete_user', userId, { permanent: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

// Get analytics overview
export const useAnalyticsOverview = () => {
  return useQuery({
    queryKey: ['admin-analytics-overview'],
    queryFn: async () => {
      // Total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });
      
      // Active users (last 24h)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const { count: activeUsers } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('last_sign_in_at', yesterday.toISOString());
      
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
      
      return {
        total_users: totalUsers || 0,
        active_users_24h: activeUsers || 0,
        new_users_today: newUsers || 0,
        total_trades: totalTrades || 0,
      };
    },
  });
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
