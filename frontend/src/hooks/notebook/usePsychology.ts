/**
 * Custom hook for managing Psychology Log
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import type { PsychologyLog } from '@/lib/notebook/types';

export function usePsychology() {
  const { effectiveUserId } = useAuthContext();
  const { toast } = useToast();
  const [logs, setLogs] = useState<PsychologyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    if (!effectiveUserId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('psychology_log')
        .select('*')
        .eq('user_id', effectiveUserId)
        .order('log_date', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err: any) {
      console.error('Error fetching psychology logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [effectiveUserId]);

  const createLog = async (input: Partial<PsychologyLog>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('psychology_log')
        .insert({ user_id: user.id, ...input })
        .select()
        .single();

      if (error) throw error;
      setLogs((prev) => [data, ...prev]);
      toast({ title: 'Log saved', description: 'Your daily psychology log has been saved.' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const updateLog = async (id: string, updates: Partial<PsychologyLog>) => {
    try {
      const { data, error } = await supabase
        .from('psychology_log')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setLogs((prev) => prev.map((log) => (log.id === id ? data : log)));
      toast({ title: 'Log updated' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const deleteLog = async (id: string) => {
    try {
      const { error } = await supabase.from('psychology_log').delete().eq('id', id);
      if (error) throw error;
      setLogs((prev) => prev.filter((log) => log.id !== id));
      toast({ title: 'Log deleted' });
      return true;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const getTodayLog = () => {
    const today = new Date().toISOString().split('T')[0];
    return logs.find((log) => log.log_date === today);
  };

  return {
    logs,
    isLoading,
    createLog,
    updateLog,
    deleteLog,
    getTodayLog,
    refetch: fetchLogs,
  };
}
