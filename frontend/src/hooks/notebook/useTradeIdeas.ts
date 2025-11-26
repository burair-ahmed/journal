/**
 * Custom hook for managing Trade Ideas
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import type { TradeIdea, CreateTradeIdeaInput, IdeaFilters } from '@/lib/notebook/types';

export function useTradeIdeas(filters?: IdeaFilters) {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [ideas, setIdeas] = useState<TradeIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIdeas = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      let query = supabase
        .from('trade_ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.symbol) query = query.eq('symbol', filters.symbol);
      if (filters?.direction) query = query.eq('direction', filters.direction);

      const { data, error } = await query;
      if (error) throw error;
      setIdeas(data || []);
    } catch (err: any) {
      console.error('Error fetching trade ideas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, [user, JSON.stringify(filters)]);

  const createIdea = async (input: CreateTradeIdeaInput) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('trade_ideas')
        .insert({ user_id: user.id, ...input })
        .select()
        .single();

      if (error) throw error;
      setIdeas((prev) => [data, ...prev]);
      toast({ title: 'Trade idea created' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const updateIdea = async (id: string, updates: Partial<TradeIdea>) => {
    try {
      const { data, error } = await supabase
        .from('trade_ideas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setIdeas((prev) => prev.map((idea) => (idea.id === id ? data : idea)));
      toast({ title: 'Trade idea updated' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const deleteIdea = async (id: string) => {
    try {
      const { error } = await supabase.from('trade_ideas').delete().eq('id', id);
      if (error) throw error;
      setIdeas((prev) => prev.filter((idea) => idea.id !== id));
      toast({ title: 'Trade idea deleted' });
      return true;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  return {
    ideas,
    isLoading,
    createIdea,
    updateIdea,
    deleteIdea,
    refetch: fetchIdeas,
  };
}
