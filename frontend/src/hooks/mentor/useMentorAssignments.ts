/**
 * Custom hook for managing Mentor Assignments
 * Allows mentors to create, track, and manage assignments for their mentees
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface Assignment {
  id: string;
  mentor_id: string;
  mentee_id: string;
  title: string;
  description: string;
  due_date: string;
  status: 'assigned' | 'in_progress' | 'submitted' | 'reviewed';
  submission_text?: string;
  submission_url?: string;
  feedback?: string;
  created_at: string;
  submitted_at?: string;
  reviewed_at?: string;
  updated_at: string;
  // Joined fields
  mentee?: { email: string };
  mentee_email?: string;
}

export interface CreateAssignmentInput {
  mentee_id: string;
  title: string;
  description: string;
  due_date: string;
}

export interface UpdateAssignmentInput {
  title?: string;
  description?: string;
  due_date?: string;
  status?: Assignment['status'];
  feedback?: string;
}

export interface SubmitAssignmentInput {
  submission_text?: string;
  submission_url?: string;
}

/**
 * Hook for mentors to manage assignments they've created
 */
export function useMentorAssignments() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignments = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('mentor_assignments')
        .select('*')
        .eq('mentor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch mentee emails separately
      const assignmentsWithEmails = await Promise.all(
        (data || []).map(async (assignment) => {
          const { data: menteeData } = await supabase
            .from('users')
            .select('email')
            .eq('id', assignment.mentee_id || assignment.user_id)
            .single();

          return {
            ...assignment,
            mentee_email: menteeData?.email || 'Unknown',
          };
        })
      );

      setAssignments(assignmentsWithEmails);
    } catch (err: any) {
      console.error('Error fetching mentor assignments:', err);
      toast({ 
        title: 'Error', 
        description: 'Failed to load assignments', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const createAssignment = async (input: CreateAssignmentInput) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('mentor_assignments')
        .insert({
          mentor_id: user.id,
          user_id: input.mentee_id, // Set user_id to mentee_id for backward compatibility
          mentee_id: input.mentee_id,
          title: input.title,
          description: input.description,
          due_date: input.due_date,
          status: 'assigned',
        })
        .select()
        .single();

      if (error) throw error;

      fetchAssignments();
      toast({ 
        title: 'Assignment Created', 
        description: 'The assignment has been sent to your mentee.' 
      });
      return data;
    } catch (err: any) {
      toast({ 
        title: 'Error', 
        description: err.message, 
        variant: 'destructive' 
      });
      return null;
    }
  };

  const updateAssignment = async (id: string, input: UpdateAssignmentInput) => {
    try {
      const { data, error } = await supabase
        .from('mentor_assignments')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAssignments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...data } : a))
      );
      toast({ title: 'Assignment Updated' });
      return data;
    } catch (err: any) {
      toast({ 
        title: 'Error', 
        description: err.message, 
        variant: 'destructive' 
      });
      return null;
    }
  };

  const deleteAssignment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mentor_assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAssignments((prev) => prev.filter((a) => a.id !== id));
      toast({ title: 'Assignment Deleted' });
      return true;
    } catch (err: any) {
      toast({ 
        title: 'Error', 
        description: err.message, 
        variant: 'destructive' 
      });
      return false;
    }
  };

  return {
    assignments,
    isLoading,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    refetch: fetchAssignments,
  };
}

/**
 * Hook for mentees to view and submit their assignments
 */
export function useMenteeAssignments() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignments = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('mentor_assignments')
        .select('*')
        .eq('mentee_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch mentor emails separately
      const assignmentsWithEmails = await Promise.all(
        (data || []).map(async (assignment) => {
          const { data: mentorData } = await supabase
            .from('users')
            .select('email')
            .eq('id', assignment.mentor_id)
            .single();

          return {
            ...assignment,
            mentor_email: mentorData?.email || 'Unknown',
          };
        })
      );

      setAssignments(assignmentsWithEmails);
    } catch (err: any) {
      console.error('Error fetching mentee assignments:', err);
      toast({ 
        title: 'Error', 
        description: 'Failed to load assignments', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const submitAssignment = async (id: string, input: SubmitAssignmentInput) => {
    try {
      const { data, error } = await supabase
        .from('mentor_assignments')
        .update({
          ...input,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAssignments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...data } : a))
      );
      toast({ 
        title: 'Assignment Submitted', 
        description: 'Your mentor will review your submission.' 
      });
      return data;
    } catch (err: any) {
      toast({ 
        title: 'Error', 
        description: err.message, 
        variant: 'destructive' 
      });
      return null;
    }
  };

  const updateStatus = async (id: string, status: Assignment['status']) => {
    try {
      const { data, error } = await supabase
        .from('mentor_assignments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAssignments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      toast({ title: 'Status Updated' });
      return data;
    } catch (err: any) {
      toast({ 
        title: 'Error', 
        description: err.message, 
        variant: 'destructive' 
      });
      return null;
    }
  };

  return {
    assignments,
    isLoading,
    submitAssignment,
    updateStatus,
    refetch: fetchAssignments,
  };
}
