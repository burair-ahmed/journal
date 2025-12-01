/**
 * Custom hook for managing Mentorships (persistent mentor-mentee relationships)
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface Mentorship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: 'pending' | 'active' | 'rejected' | 'revoked';
  permissions: {
    show_pnl: boolean;
    show_account_balance: boolean;
    can_assign: boolean;
    can_comment: boolean;
    allowed_tabs?: string[];  // Which tabs/views mentor can access
    allowed_accounts?: number[];  // Which account IDs mentor can view
  };
  invited_by: string;
  invite_message?: string;
  created_at: string;
  accepted_at?: string;
  revoked_at?: string;
  // Joined data
  mentor?: { email: string };
  mentee?: { email: string };
  // Email fields fetched separately
  mentor_email?: string;
  mentee_email?: string;
}

export interface InviteMentorInput {
  mentor_email: string;
  message?: string;
  permissions?: Partial<Mentorship['permissions']>;
}

export function useMentorships() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [myMentors, setMyMentors] = useState<Mentorship[]>([]);
  const [myMentees, setMyMentees] = useState<Mentorship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMentorships = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Fetch where I am the mentee (my mentors)
      const { data: mentorsData, error: mentorsError } = await supabase
        .from('mentorships')
        .select('*')
        .eq('mentee_id', user.id)
        .order('created_at', { ascending: false });

      if (mentorsError) throw mentorsError;

      // Fetch where I am the mentor (my mentees)
      const { data: menteesData, error: menteesError } = await supabase
        .from('mentorships')
        .select('*')
        .eq('mentor_id', user.id)
        .order('created_at', { ascending: false });

      if (menteesError) throw menteesError;

      // Fetch emails for mentors
      const mentorsWithEmails = await Promise.all(
        (mentorsData || []).map(async (m) => {
          const { data: email } = await supabase.rpc('get_user_email_by_id', { user_uuid: m.mentor_id });
          return { ...m, mentor_email: email };
        })
      );

      // Fetch emails for mentees
      const menteesWithEmails = await Promise.all(
        (menteesData || []).map(async (m) => {
          const { data: email } = await supabase.rpc('get_user_email_by_id', { user_uuid: m.mentee_id });
          return { ...m, mentee_email: email };
        })
      );

      console.log('useMentorships - Fetched data:', {
        user_id: user.id,
        mentorsWithEmails,
        menteesWithEmails
      });

      setMyMentors(mentorsWithEmails || []);
      setMyMentees(menteesWithEmails || []);
    } catch (err: any) {
      console.error('Error fetching mentorships:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorships();
  }, [user]);

  const inviteMentor = async (input: InviteMentorInput) => {
    if (!user) return null;

    try {
      // 1. Lookup mentor by email
      const { data: mentorIdData, error: lookupError } = await supabase
        .rpc('get_user_id_by_email', { lookup_email: input.mentor_email });

      if (lookupError) throw lookupError;
      if (!mentorIdData) {
        toast({ 
          title: 'User Not Found', 
          description: `No user with email ${input.mentor_email}`,
          variant: 'destructive' 
        });
        return null;
      }

      // 2. Create mentorship
      const { data, error } = await supabase
        .from('mentorships')
        .insert({
          mentor_id: mentorIdData,
          mentee_id: user.id,
          invited_by: user.id,
          invite_message: input.message,
          permissions: {
            show_pnl: input.permissions?.show_pnl ?? false,
            show_account_balance: input.permissions?.show_account_balance ?? false,
            can_assign: input.permissions?.can_assign ?? true,
            can_comment: input.permissions?.can_comment ?? true,
            allowed_tabs: input.permissions?.allowed_tabs ?? [],
            allowed_accounts: input.permissions?.allowed_accounts ?? [],
          },
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setMyMentors((prev) => [data, ...prev]);
      toast({ title: 'Invitation Sent', description: `Invite sent to ${input.mentor_email}` });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const acceptInvite = async (mentorshipId: string) => {
    try {
      const { data, error } = await supabase
        .from('mentorships')
        .update({ 
          status: 'active',
          accepted_at: new Date().toISOString()
        })
        .eq('id', mentorshipId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setMyMentees((prev) => prev.map((m) => (m.id === mentorshipId ? data : m)));
      toast({ title: 'Invitation Accepted' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const rejectInvite = async (mentorshipId: string) => {
    try {
      const { data, error } = await supabase
        .from('mentorships')
        .update({ status: 'rejected' })
        .eq('id', mentorshipId)
        .select()
        .single();

      if (error) throw error;

      setMyMentees((prev) => prev.map((m) => (m.id === mentorshipId ? data : m)));
      toast({ title: 'Invitation Rejected' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const revokeAccess = async (mentorshipId: string) => {
    try {
      const { data, error } = await supabase
        .from('mentorships')
        .update({ 
          status: 'revoked',
          revoked_at: new Date().toISOString()
        })
        .eq('id', mentorshipId)
        .select()
        .single();

      if (error) throw error;

      setMyMentors((prev) => prev.map((m) => (m.id === mentorshipId ? data : m)));
      toast({ title: 'Access Revoked' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const updatePermissions = async (mentorshipId: string, permissions: Partial<Mentorship['permissions']>) => {
    try {
      const { data, error } = await supabase
        .from('mentorships')
        .update({ permissions })
        .eq('id', mentorshipId)
        .select()
        .single();

      if (error) throw error;

      setMyMentors((prev) => prev.map((m) => (m.id === mentorshipId ? data : m)));
      toast({ title: 'Permissions Updated' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  return {
    myMentors,
    myMentees,
    isLoading,
    inviteMentor,
    acceptInvite,
    rejectInvite,
    revokeAccess,
    updatePermissions,
    refetch: fetchMentorships
  };
}
