/**
 * Custom hook for managing notifications
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Notification {
  id: string; // UUID
  user_id?: string; // Optional because broadcasts don't have a specific user_id
  type: 'mentor_invite' | 'assignment' | 'assignment_submission' | 'assignment_review' | 'question' | 'question_response' | 'request_reviewed' | 'system';
  title: string;
  message: string;
  link?: string;
  metadata?: any;
  is_read: boolean;
  created_at: string;
  is_broadcast?: boolean; // Flag to distinguish
}

export function useNotifications() {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // 1. Fetch Personal Notifications
      const { data: personalData, error: personalError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (personalError) throw personalError;

      // 2. Fetch Broadcast Notifications
      const { data: broadcastData, error: broadcastError } = await supabase
        .from('broadcast_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20); // Limit global broadcasts to recent ones

      if (broadcastError) throw broadcastError;

      // 3. Fetch Read Status for Broadcasts
      const broadcastIds = broadcastData?.map(n => n.id) || [];
      let readBroadcastIds = new Set<string>();

      if (broadcastIds.length > 0) {
        const { data: readData, error: readError } = await supabase
          .from('broadcast_reads')
          .select('broadcast_id')
          .eq('user_id', user.id)
          .in('broadcast_id', broadcastIds);
        
        if (readError) throw readError;
        
        readData?.forEach((r: any) => readBroadcastIds.add(r.broadcast_id));
      }

      // 4. Merge and Transform
      const formattedPersonal = (personalData || []).map((n: any) => ({
        ...n,
        is_broadcast: false
      }));

      const formattedBroadcasts = (broadcastData || []).map((n: any) => ({
        id: n.id,
        user_id: user.id, // technically not the owner, but for type consistency
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        metadata: n.metadata,
        created_at: n.created_at,
        is_read: readBroadcastIds.has(n.id),
        is_broadcast: true
      }));

      const allNotifications = [...formattedPersonal, ...formattedBroadcasts]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.is_read).length);

    } catch (err: any) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    const target = notifications.find(n => n.id === id);
    if (!target) return;

    try {
      // Optimistic updat
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));

      if (target.is_broadcast) {
        // Insert into broadcast_reads
        const { error } = await supabase
          .from('broadcast_reads')
          .insert({ user_id: user?.id, broadcast_id: id });
        
        // Ignore duplicate key error (already read)
        if (error && error.code !== '23505') throw error; 

      } else {
        // Update notifications table
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id);

        if (error) throw error;
      }
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      toast.error('Failed to update notification');
      fetchNotifications(); // Revert on error
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);

      const unreadPersonal = notifications.filter(n => !n.is_read && !n.is_broadcast);
      const unreadBroadcasts = notifications.filter(n => !n.is_read && n.is_broadcast);

      // 1. Update personal notifications
      if (unreadPersonal.length > 0) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user?.id)
          .eq('is_read', false);
      }

      // 2. Insert broadcast reads
      if (unreadBroadcasts.length > 0) {
        const readsToInsert = unreadBroadcasts.map(n => ({
          user_id: user?.id,
          broadcast_id: n.id
        }));

        await supabase
          .from('broadcast_reads')
          .upsert(readsToInsert, { onConflict: 'user_id, broadcast_id' });
      }

      toast.success('All notifications marked as read');
    } catch (err: any) {
      console.error('Error marking all as read:', err);
      toast.error('Failed to update notifications');
      fetchNotifications();
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (!user) return;

    // Subscription for Personal Notifications
    const personalChannel = supabase
      .channel(`notifications:user:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchNotifications()
      )
      .subscribe();

    // Subscription for Broadcasts
    const broadcastChannel = supabase
      .channel('notifications:broadcast')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Only care about new broadcasts
          schema: 'public',
          table: 'broadcast_notifications',
        },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(personalChannel);
      supabase.removeChannel(broadcastChannel);
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    isLoading,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead
  };
}
