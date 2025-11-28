/**
 * Custom hook for managing notifications
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthContext } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  type: 'mentor_invite' | 'assignment' | 'assignment_submission' | 'assignment_review' | 'question' | 'question_response' | 'request_reviewed';
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
        // Fetch emails for each invite
        for (const invite of invites) {
          const { data: email } = await supabase.rpc('get_user_email_by_id', { user_uuid: invite.mentee_id });
          
          allNotifications.push({
            id: `invite-${invite.id}`,
            type: 'mentor_invite',
            title: 'New Mentor Invitation',
            message: `${email || 'A student'} wants you to be their mentor`,
            created_at: invite.created_at,
            read: false,
            link: '/mentorship?tab=my-mentees',
            metadata: invite,
          });
        }
      }

      // 2. Fetch new assignments (where I'm the mentee)
      const { data: assignments, error: assignmentsError } = await supabase
        .from('mentor_assignments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'assigned') // Changed from 'pending' to 'assigned' based on new schema
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

      // 3. Fetch assignment submissions (where I'm the mentor)
      const { data: submissions, error: submissionsError } = await supabase
        .from('mentor_assignments')
        .select('*')
        .eq('mentor_id', user.id)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false })
        .limit(5);

      if (!submissionsError && submissions) {
        for (const submission of submissions) {
          const { data: mentee } = await supabase.from('users').select('email').eq('id', submission.user_id).single();
          allNotifications.push({
            id: `submission-${submission.id}`,
            type: 'assignment_submission',
            title: 'Assignment Submitted',
            message: `${mentee?.email || 'Mentee'} submitted "${submission.title}"`,
            created_at: submission.submitted_at || submission.updated_at,
            read: false,
            link: '/mentorship?tab=my-mentees&subtab=assignments',
            metadata: submission,
          });
        }
      }

      // 4. Fetch assignment reviews (where I'm the mentee)
      const { data: reviews, error: reviewsError } = await supabase
        .from('mentor_assignments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'reviewed')
        .order('reviewed_at', { ascending: false })
        .limit(5);

      if (!reviewsError && reviews) {
        reviews.forEach((review) => {
          allNotifications.push({
            id: `review-${review.id}`,
            type: 'assignment_review',
            title: 'Assignment Reviewed',
            message: `Your assignment "${review.title}" has been reviewed`,
            created_at: review.reviewed_at || review.updated_at,
            read: false,
            link: '/mentorship?tab=assignments',
            metadata: review,
          });
        });
      }

      // 5. Fetch new questions (where I'm the mentor)
      const { data: questions, error: questionsError } = await supabase
        .from('mentor_requests')
        .select('*')
        .eq('mentor_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!questionsError && questions) {
        for (const question of questions) {
          const { data: mentee } = await supabase.from('users').select('email').eq('id', question.user_id).single();
          allNotifications.push({
            id: `question-${question.id}`,
            type: 'question',
            title: 'New Question',
            message: `${mentee?.email || 'Mentee'} asked: "${question.question.substring(0, 30)}..."`,
            created_at: question.created_at,
            read: false,
            link: '/mentorship?tab=my-mentees&subtab=questions',
            metadata: question,
          });
        }
      }

      // 6. Fetch question responses (where I'm the mentee)
      const { data: responses, error: responsesError } = await supabase
        .from('mentor_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'reviewed')
        .order('responded_at', { ascending: false })
        .limit(5);

      if (!responsesError && responses) {
        responses.forEach((response) => {
          allNotifications.push({
            id: `response-${response.id}`,
            type: 'question_response',
            title: 'Question Answered',
            message: `Mentor answered: "${response.question.substring(0, 30)}..."`,
            created_at: response.responded_at || response.updated_at,
            read: false,
            link: '/mentorship?tab=ask-mentor',
            metadata: response,
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

    // Set up real-time subscription for new invites, assignments, and requests
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
        () => fetchNotifications()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mentor_assignments',
          filter: `user_id=eq.${user?.id}`,
        },
        () => fetchNotifications()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mentor_assignments',
          filter: `mentor_id=eq.${user?.id}`,
        },
        () => fetchNotifications()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mentor_requests',
          filter: `mentor_id=eq.${user?.id}`,
        },
        () => fetchNotifications()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mentor_requests',
          filter: `user_id=eq.${user?.id}`,
        },
        () => fetchNotifications()
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
