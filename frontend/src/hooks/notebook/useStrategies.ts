/**
 * Custom hook for managing Trading Strategies
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import type { TradingStrategy, CreateStrategyInput } from '@/lib/notebook/types';

export function useStrategies() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [strategies, setStrategies] = useState<TradingStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStrategies = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('trading_strategies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStrategies(data || []);
    } catch (err: any) {
      console.error('Error fetching strategies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, [user]);

  const createStrategy = async (input: CreateStrategyInput) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('trading_strategies')
        .insert({ user_id: user.id, ...input })
        .select()
        .single();

      if (error) throw error;
      setStrategies((prev) => [data, ...prev]);
      toast({ title: 'Strategy created', description: 'Your trading strategy has been saved.' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const updateStrategy = async (id: string, updates: Partial<TradingStrategy>) => {
    try {
      const { data, error } = await supabase
        .from('trading_strategies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setStrategies((prev) => prev.map((strategy) => (strategy.id === id ? data : strategy)));
      toast({ title: 'Strategy updated' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const deleteStrategy = async (id: string) => {
    try {
      const { error } = await supabase.from('trading_strategies').delete().eq('id', id);
      if (error) throw error;
      setStrategies((prev) => prev.filter((strategy) => strategy.id !== id));
      toast({ title: 'Strategy deleted' });
      return true;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    return updateStrategy(id, { is_active: !currentActive });
  };

  return {
    strategies,
    isLoading,
    createStrategy,
    updateStrategy,
    deleteStrategy,
    toggleActive,
    refetch: fetchStrategies,
  };
}
