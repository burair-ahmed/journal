/**
 * Custom hook for managing Mentor Mode access
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface MentorToken {
  id: string;
  token: string;
  label: string | null;
  show_pnl: boolean;
  show_account_balance: boolean;
  is_active: boolean;
  expires_at: string;
  created_at: string;
  last_accessed_at: string | null;
}

export interface CreateTokenInput {
  label?: string;
  show_pnl?: boolean;
  show_account_balance?: boolean;
  expires_in_hours?: number;
}

export function useMentorMode() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [tokens, setTokens] = useState<MentorToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTokens = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('mentor_access_tokens')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTokens(data || []);
    } catch (err: any) {
      console.error('Error fetching mentor tokens:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, [user]);

  const generateToken = async (input: CreateTokenInput) => {
    if (!user) return null;

    try {
      // Default to 48 hours if not specified
      const hours = input.expires_in_hours || 48;
      const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('mentor_access_tokens')
        .insert({
          user_id: user.id,
          label: input.label || 'Mentor Access',
          show_pnl: input.show_pnl ?? false,
          show_account_balance: input.show_account_balance ?? false,
          expires_at: expiresAt,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      setTokens((prev) => [data, ...prev]);
      toast({ title: 'Access Link Generated', description: 'Share this link with your mentor.' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const revokeToken = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('mentor_access_tokens')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setTokens((prev) => prev.map((t) => (t.id === id ? data : t)));
      toast({ title: 'Access Revoked', description: 'The link is no longer active.' });
      return true;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const deleteToken = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mentor_access_tokens')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTokens((prev) => prev.filter((t) => t.id !== id));
      toast({ title: 'Token Deleted' });
      return true;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  return {
    tokens,
    isLoading,
    generateToken,
    revokeToken,
    deleteToken,
    refetch: fetchTokens
  };
}
