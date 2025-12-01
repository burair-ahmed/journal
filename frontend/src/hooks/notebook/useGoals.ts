/**
 * Custom hook for managing Trading Goals
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import type { TradingGoal, GoalType, GoalStatus } from '@/lib/notebook/types';

export interface CreateGoalInput {
  title: string;
  description?: string;
  goal_type: GoalType;
  target_value?: number;
  target_unit?: string;
  start_date: string;
  target_date: string;
  current_value?: number;
}

export function useGoals() {
  const { effectiveUserId } = useAuthContext();
  const { toast } = useToast();
  const [goals, setGoals] = useState<TradingGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGoals = async () => {
    if (!effectiveUserId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('trading_goals')
        .select('*')
        .eq('user_id', effectiveUserId)
        .order('target_date', { ascending: true });

      if (error) throw error;
      setGoals(data || []);
    } catch (err: any) {
      console.error('Error fetching trading goals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [effectiveUserId]);

  const createGoal = async (input: CreateGoalInput) => {
    if (!effectiveUserId) return null;

    try {
      const { data, error } = await supabase
        .from('trading_goals')
        .insert({
          user_id: effectiveUserId,
          ...input,
          status: 'active',
          progress_percentage: 0
        })
        .select()
        .single();

      if (error) throw error;
      setGoals((prev) => [data, ...prev]);
      toast({ title: 'Goal set', description: 'New trading goal created.' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const updateGoal = async (id: string, updates: Partial<TradingGoal>) => {
    try {
      // Calculate progress percentage if current or target value changes
      let progress_percentage = updates.progress_percentage;
      
      if (updates.current_value !== undefined || updates.target_value !== undefined) {
        // We need the current state to calculate percentage if only one value is updated
        const goal = goals.find(g => g.id === id);
        if (goal) {
          const current = updates.current_value ?? goal.current_value;
          const target = updates.target_value ?? goal.target_value;
          
          if (target && target !== 0) {
            progress_percentage = Math.min(100, Math.max(0, (current / target) * 100));
            updates.progress_percentage = progress_percentage;
          }
        }
      }

      // Auto-complete if progress is 100%
      if (progress_percentage === 100 && updates.status !== 'completed') {
        updates.status = 'completed';
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('trading_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setGoals((prev) => prev.map((item) => (item.id === id ? data : item)));
      toast({ title: 'Goal updated' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase.from('trading_goals').delete().eq('id', id);
      if (error) throw error;
      setGoals((prev) => prev.filter((item) => item.id !== id));
      toast({ title: 'Goal deleted' });
      return true;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  return {
    goals,
    isLoading,
    createGoal,
    updateGoal,
    deleteGoal,
    refetch: fetchGoals,
  };
}
