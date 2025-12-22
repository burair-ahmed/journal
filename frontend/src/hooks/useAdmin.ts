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
  deleted_at?: string | null;
}

export interface AnalyticsOverview {
  total_users: number;
  active_users_24h: number;
  new_users_today: number;
  total_trades: number;
}

export interface AdminAuditLogEntry {
  id: string;
  admin_user_id: string;
  target_user_id?: string | null;
  action: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  admin?: { email?: string; name?: string } | null;
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
      const getResults = async (withSoftDeleteFilter: boolean) => {
        let query = supabase
          .from('users')
          .select('*', { count: 'exact' });
        
        if (withSoftDeleteFilter) {
          query = query.is('deleted_at', null);
        }
        if (search) {
          query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
        }
        if (roleFilter) {
          query = query.eq('role', roleFilter);
        }
        query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
        const { data, error, count } = await query;
        return { data, error, count };
      };
      
      let { data, error, count } = await getResults(true);
      
      if (error && /deleted_at/.test(error.message)) {
        const fallback = await getResults(false);
        data = fallback.data;
        count = fallback.count;
        error = fallback.error;
      }
      
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
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { error } = await supabase
        .from('users')
        .update({ role: 'suspended' })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Log to activity_log for Recent Activity display
      await logActivity('user_suspend', 'user', userId);
      await logAdminAction('suspend_user', userId, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user'] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-activity'] });
    },
  });
};

// Current role of authenticated user
export const useCurrentRole = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['currentRole', user?.id],
    queryFn: async () => {
      if (!user) return null as null | AdminUser['role'];
      const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
      return (data?.role || null) as null | AdminUser['role'];
    },
    enabled: !!user,
  });
};

// Does current user have one of the roles
export const useHasRole = (roles: AdminUser['role'][]) => {
  const { data: role } = useCurrentRole();
  return roles.includes(role || 'user');
};
// Unsuspend user (restore to regular user)
export const useUnsuspendUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { error } = await supabase
        .from('users')
        .update({ role: 'user' })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Log to activity_log for Recent Activity display
      await logActivity('user_unsuspend', 'user', userId);
      await logAdminAction('unsuspend_user', userId, { reason });
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
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single();
      if (me?.role !== 'super_admin') throw new Error('Insufficient permissions');
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('users')
        .update({ deleted_at: now })
        .eq('id', userId);
      
      if (error) {
        const { error: delError } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);
        if (delError) throw delError;
        await logActivity('user_delete', 'user', userId);
        await logAdminAction('delete_user', userId, { permanent: true, reason });
        return;
      }
      
      await logActivity('user_delete', 'user', userId);
      await logAdminAction('delete_user', userId, { permanent: false, reason, deleted_at: now });
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
    mutationFn: async ({ userIds, reason }: { userIds: string[]; reason: string }) => {
      const { error } = await supabase
        .from('users')
        .update({ role: 'suspended' })
        .in('id', userIds);
      
      if (error) throw error;
      
      // Log actions
      await Promise.all(userIds.map(id => logAdminAction('suspend_user', id, { bulk: true, reason })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Selected users suspended');
    },
  });
};

// Bulk Unsuspend Users
export const useBulkUnsuspendUsers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userIds, reason }: { userIds: string[]; reason: string }) => {
      const { error } = await supabase
        .from('users')
        .update({ role: 'user' })
        .in('id', userIds);
      
      if (error) throw error;
      
      await Promise.all(userIds.map(id => logAdminAction('unsuspend_user', id, { bulk: true, reason })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Selected users unsuspended');
    },
  });
};
// Bulk Delete Users
export const useBulkDeleteUsers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userIds, reason }: { userIds: string[]; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single();
      if (me?.role !== 'super_admin') throw new Error('Insufficient permissions');
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('users')
        .update({ deleted_at: now })
        .in('id', userIds);
      
      if (error) {
        const { error: delError } = await supabase
          .from('users')
          .delete()
          .in('id', userIds);
        if (delError) throw delError;
        await Promise.all(userIds.map(id => logAdminAction('delete_user', id, { bulk: true, permanent: true, reason })));
        return;
      }
      
      await Promise.all(userIds.map(id => logAdminAction('delete_user', id, { bulk: true, permanent: false, reason, deleted_at: now })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Selected users deleted');
    },
  });
};

// Restore soft-deleted user (super admin only)
export const useRestoreUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single();
      if (me?.role !== 'super_admin') throw new Error('Insufficient permissions');
      const { error } = await supabase
        .from('users')
        .update({ deleted_at: null })
        .eq('id', userId);
      
      if (error) throw error;
      
      await logActivity('user_restore', 'user', userId);
      await logAdminAction('restore_user', userId, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user'] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-activity'] });
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

// System Settings Interface
export interface SystemSetting {
  key: string;
  value: any;
  description?: string;
  updated_at: string;
}

// Get all system settings
export const useSystemSettings = () => {
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('key');
      
      if (error) throw error;
      return data as SystemSetting[];
    },
  });
};

// Update system setting
export const useUpdateSystemSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value, reason }: { key: string; value: any; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single();
      if (me?.role !== 'super_admin') throw new Error('Insufficient permissions');
      
      const { data: current } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', key)
        .single();

      const { error } = await supabase
        .from('system_settings')
        .update({ 
          value,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('key', key);
      
      if (error) throw error;
      
      await logAdminAction('update_setting', undefined, { key, before: current?.value, after: value, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Setting updated');
    },
    onError: (error: any) => {
      toast.error(`Failed to update setting: ${error.message}`);
    },
  });
};

// Revert a system setting to its previous value
export const useRevertSystemSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, reason }: { key: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single();
      if (me?.role !== 'super_admin') throw new Error('Insufficient permissions');
      
      const { data: entries, error: fetchError } = await supabase
        .from('admin_audit_log')
        .select('*')
        .eq('action', 'update_setting')
        .contains('metadata', { key })
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (fetchError) throw fetchError;
      const entry = entries?.[0];
      const before = entry?.metadata?.before;
      if (before === undefined) throw new Error('No previous value found');
      
      const { error } = await supabase
        .from('system_settings')
        .update({ value: before, updated_at: new Date().toISOString(), updated_by: user.id })
        .eq('key', key);
      
      if (error) throw error;
      
      await logAdminAction('revert_setting', undefined, { key, reverted_to: before, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Setting reverted');
    },
    onError: (error: any) => {
      toast.error(`Failed to revert setting: ${error.message}`);
    },
  });
};

// Audit log list for admin viewer
export const useAuditLog = (filters?: { actorId?: string; action?: string; from?: string; to?: string }) => {
  return useQuery({
    queryKey: ['admin-audit-log', filters],
    queryFn: async () => {
      const build = async (withJoin: boolean) => {
        const base = withJoin
          ? supabase.from('admin_audit_log').select(`*, admin:users!admin_user_id(email, name)`)
          : supabase.from('admin_audit_log').select(`*`);
        let q = base.order('created_at', { ascending: false }).limit(500);
        if (filters?.actorId) q = q.eq('admin_user_id', filters.actorId);
        if (filters?.action) q = q.eq('action', filters.action);
        if (filters?.from) q = q.gte('created_at', filters.from);
        if (filters?.to) q = q.lte('created_at', filters.to);
        return q;
      };
      const first = await build(true);
      let data = (first as any).data as AdminAuditLogEntry[] | null | undefined;
      let error = (first as any).error as any;
      if (error) {
        const fallback = await build(false);
        data = (fallback as any).data as AdminAuditLogEntry[] | null | undefined;
        error = (fallback as any).error as any;
      }
      if (error) throw error;
      return (data || []) as AdminAuditLogEntry[];
    },
  });
};

// Phase 6 — Entitlement Overrides
export const useGrantEntitlementOverride = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ targetUserId, type, value, expiresAt, reason }: { targetUserId: string; type: string; value: number; expiresAt?: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single();
      if (!me || (me.role !== 'super_admin' && me.role !== 'admin')) throw new Error('Insufficient permissions');
      
      const payload = { user_id: targetUserId, type, value, expires_at: expiresAt || null, granted_by: user.id, granted_at: new Date().toISOString() };
      const { error } = await supabase.from('entitlement_overrides').upsert(payload).select();
      if (error) {
        // Fallback to audit-only
        await logAdminAction('entitlement_override', targetUserId, { type, value, expires_at: expiresAt, reason, persisted: false });
        return;
      }
      await logAdminAction('entitlement_override', targetUserId, { type, value, expires_at: expiresAt, reason, persisted: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Entitlement override granted');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to grant override');
    },
  });
};

// Phase 6 — Trade Copier Moderation: Suspend Master (audit-only)
export const useSuspendCopierMaster = () => {
  return useMutation({
    mutationFn: async ({ masterId, reason }: { masterId: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single();
      if (!me || (me.role !== 'super_admin' && me.role !== 'admin')) throw new Error('Insufficient permissions');
      
      await logAdminAction('suspend_copier_master', undefined, { master_id: masterId, reason });
      await logActivity('copier_master_suspend', 'copier_master', masterId, { reason });
    },
  });
};

// Phase 6 — Trade Copier Moderation: Close All for Master (audit-only)
export const useCloseAllMasterTrades = () => {
  return useMutation({
    mutationFn: async ({ masterId, reason }: { masterId: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single();
      if (!me || (me.role !== 'super_admin' && me.role !== 'admin')) throw new Error('Insufficient permissions');
      
      await logAdminAction('close_all_master_trades', undefined, { master_id: masterId, reason });
      await logActivity('copier_master_close_all', 'copier_master', masterId, { reason });
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

export const useRecentActivityUnified = (limit = 10) => {
  return useQuery({
    queryKey: ['admin-recent-activity', 'unified', limit],
    queryFn: async () => {
      try {
        const { data: activity } = await supabase
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
        
        let adminEntries: AdminAuditLogEntry[] = [];
        const { data: auditData, error: auditError } = await supabase
          .from('admin_audit_log')
          .select(`
            *,
            admin:users!admin_user_id (
              email,
              name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (!auditError && auditData) {
          adminEntries = auditData as AdminAuditLogEntry[];
        }
        
        const mappedAdmin: ActivityLog[] = adminEntries.map((entry) => ({
          id: entry.id,
          user_id: entry.admin_user_id,
          action: entry.action,
          resource_type: 'admin_action',
          resource_id: entry.target_user_id || undefined,
          metadata: (entry.metadata as Record<string, any>) || {},
          created_at: entry.created_at,
          user: { email: entry.admin?.email || '', name: entry.admin?.name || '' },
        }));
        
        const combined = [...(activity || []), ...mappedAdmin]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit);
        
        return combined as ActivityLog[];
      } catch {
        return [];
      }
    },
    refetchInterval: 30000,
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
    case 'suspend_user':
      return {
        icon: '🚫',
        title: 'User suspended',
        description: activity.metadata?.reason ? `Reason: ${String(activity.metadata.reason)}` : 'Admin action',
      };
    case 'unsuspend_user':
      return {
        icon: '✅',
        title: 'User unsuspended',
        description: activity.metadata?.reason ? `Reason: ${String(activity.metadata.reason)}` : 'Admin action',
      };
    case 'delete_user':
      return {
        icon: '🗑️',
        title: 'User deleted',
        description: activity.metadata?.reason ? `Reason: ${String(activity.metadata.reason)}` : 'Admin action',
      };
    case 'update_setting':
      return {
        icon: '⚙️',
        title: 'Setting updated',
        description: activity.metadata?.key ? `Key: ${String(activity.metadata.key)}` : email,
      };
    case 'revert_setting':
      return {
        icon: '↩️',
        title: 'Setting reverted',
        description: activity.metadata?.key ? `Key: ${String(activity.metadata.key)}` : email,
      };
    case 'entitlement_override':
      return {
        icon: '🎟️',
        title: 'Entitlement override',
        description: activity.metadata?.type ? `Type: ${String(activity.metadata.type)}` : email,
      };
    case 'suspend_copier_master':
      return {
        icon: '🛑',
        title: 'Copier master suspended',
        description: activity.metadata?.master_id ? `Master: ${String(activity.metadata.master_id)}` : email,
      };
    case 'close_all_master_trades':
      return {
        icon: '🛑',
        title: 'Closed all master trades',
        description: activity.metadata?.master_id ? `Master: ${String(activity.metadata.master_id)}` : email,
      };
    default:
      return {
        icon: '⚡',
        title: activity.action.replace(/_/g, ' '),
        description: email,
      };
  }
};
