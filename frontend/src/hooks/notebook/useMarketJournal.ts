/**
 * Custom hook for managing Market Journal
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import type { MarketJournal, CreateMarketJournalInput } from '@/lib/notebook/types';

export function useMarketJournal() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [entries, setEntries] = useState<MarketJournal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntries = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('market_journal')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err: any) {
      console.error('Error fetching market journal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  const createEntry = async (input: CreateMarketJournalInput) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('market_journal')
        .insert({ user_id: user.id, ...input })
        .select()
        .single();

      if (error) throw error;
      setEntries((prev) => [data, ...prev]);
      toast({ title: 'Entry created', description: 'Market journal entry saved.' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const updateEntry = async (id: string, updates: Partial<MarketJournal>) => {
    try {
      const { data, error } = await supabase
        .from('market_journal')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setEntries((prev) => prev.map((entry) => (entry.id === id ? data : entry)));
      toast({ title: 'Entry updated' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase.from('market_journal').delete().eq('id', id);
      if (error) throw error;
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
      toast({ title: 'Entry deleted' });
      return true;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  return {
    entries,
    isLoading,
    createEntry,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries,
  };
}
