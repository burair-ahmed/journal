/**
 * Custom hook for managing notifications
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthContext } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  type: 'mentor_invite' | 'assignment' | 'request_reviewed';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  link?: string;
  metadata?: any;
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
      const allNotifications: Notification[] = [];

      // 1. Fetch pending mentor invites (where I'm the mentor)
      const { data: invites, error: invitesError } = await supabase
        .from('mentorships')
        .select('*')
        .eq('mentor_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (invitesError) throw invitesError;

      if (invites) {
        invites.forEach((invite) => {
          allNotifications.push({
            id: `invite-${invite.id}`,
            type: 'mentor_invite',
            title: 'New Mentor Invitation',
            message: `You have a new mentorship request`,
            created_at: invite.created_at,
            read: false,
            link: '/mentorship?tab=my-mentees',
            metadata: invite,
          });
        });
      }

      // 2. Fetch new assignments (where I'm the mentee)
      const { data: assignments, error: assignmentsError } = await supabase
        .from('mentor_assignments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      if (assignmentsError) throw assignmentsError;

      if (assignments) {
        assignments.forEach((assignment) => {
          allNotifications.push({
            id: `assignment-${assignment.id}`,
            type: 'assignment',
            title: 'New Assignment',
            message: assignment.title,
            created_at: assignment.created_at,
            read: false,
            link: '/mentorship?tab=assignments',
            metadata: assignment,
          });
        });
      }

      // Sort by created_at
      allNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter((n) => !n.read).length);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscription for new invites
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mentorships',
          filter: `mentor_id=eq.${user?.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mentor_assignments',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    isLoading,
    refetch: fetchNotifications,
  };
}
