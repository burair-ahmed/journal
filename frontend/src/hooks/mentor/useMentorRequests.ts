/**
 * Custom hook for managing Mentor Requests
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface MentorRequest {
  id: string;
  user_id: string;
  mentor_id?: string; // The mentor who should respond to this request
  trade_id?: number;
  chart_id?: string;
  question: string;
  status: 'pending' | 'reviewed' | 'archived';
  mentor_response?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  trades?: {
    symbol: string;
    profit: number;
  };
  mentor_email?: string; // Email of the mentor
}


export interface CreateRequestInput {
  mentor_id: string; // Required: which mentor to send the question to
  question: string;
  trade_id?: number;
  chart_id?: string;
}


export function useMentorRequests() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('mentor_requests')
        .select(`
          *,
          trades (
            symbol,
            profit
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch mentor emails separately
      const requestsWithEmails = await Promise.all(
        (data || []).map(async (request) => {
          if (!request.mentor_id) return request;

          const { data: mentorData } = await supabase
            .from('users')
            .select('email')
            .eq('id', request.mentor_id)
            .single();

          return {
            ...request,
            mentor_email: mentorData?.email || 'Unknown',
          };
        })
      );

      setRequests(requestsWithEmails);
    } catch (err: any) {
      console.error('Error fetching mentor requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const createRequest = async (input: CreateRequestInput) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('mentor_requests')
        .insert({
          user_id: user.id,
          ...input
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh to get joined data
      fetchRequests();
      
      toast({ title: 'Request Sent', description: 'Your question has been submitted.' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const updateRequestStatus = async (id: string, status: 'pending' | 'reviewed' | 'archived') => {
    try {
      const { data, error } = await supabase
        .from('mentor_requests')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast({ title: 'Status Updated' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const respondToRequest = async (id: string, response: string) => {
    try {
      const { data, error } = await supabase
        .from('mentor_requests')
        .update({ 
          mentor_response: response,
          responded_at: new Date().toISOString(),
          status: 'reviewed'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
      toast({ title: 'Response Sent', description: 'Your response has been saved.' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  return {
    requests,
    isLoading,
    createRequest,
    updateRequestStatus,
    respondToRequest,
    refetch: fetchRequests
  };
}

/**
 * Hook for mentors to view and respond to questions from their mentees
 */
export function useMentorRequestsForMentor() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('mentor_requests')
        .select(`
          *,
          trades (
            symbol,
            profit
          )
        `)
        .eq('mentor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch mentee emails separately
      const requestsWithEmails = await Promise.all(
        (data || []).map(async (request) => {
          const { data: menteeData } = await supabase
            .from('users')
            .select('email')
            .eq('id', request.user_id)
            .single();

          return {
            ...request,
            mentee_email: menteeData?.email || 'Unknown',
          };
        })
      );

      setRequests(requestsWithEmails);
    } catch (err: any) {
      console.error('Error fetching mentor requests for mentor:', err);
      toast({ 
        title: 'Error', 
        description: 'Failed to load mentee questions', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const respondToRequest = async (id: string, response: string) => {
    try {
      const { data, error } = await supabase
        .from('mentor_requests')
        .update({ 
          mentor_response: response,
          responded_at: new Date().toISOString(),
          status: 'reviewed'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
      toast({ title: 'Response Sent', description: 'Your response has been saved.' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const updateRequestStatus = async (id: string, status: 'pending' | 'reviewed' | 'archived') => {
    try {
      const { data, error } = await supabase
        .from('mentor_requests')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast({ title: 'Status Updated' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  return {
    requests,
    isLoading,
    respondToRequest,
    updateRequestStatus,
    refetch: fetchRequests
  };
}
