/**
 * Custom hook for managing Mentor Assignments
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface MentorAssignment {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'verified';
  assigned_by_token_id?: string;
  created_at: string;
  completed_at?: string;
}

export function useMentorAssignments() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<MentorAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignments = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('mentor_assignments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (err: any) {
      console.error('Error fetching mentor assignments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const updateAssignmentStatus = async (id: string, status: MentorAssignment['status']) => {
    try {
      const updates: any = { status };
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('mentor_assignments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setAssignments((prev) => prev.map((a) => (a.id === id ? data : a)));
      toast({ title: 'Assignment Updated', description: `Status changed to ${status}` });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  return {
    assignments,
    isLoading,
    updateAssignmentStatus,
    refetch: fetchAssignments
  };
}
