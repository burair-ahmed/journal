/**
 * Custom hook for managing Research Clippings
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import type { ResearchClipping, ContentType, ReadingStatus } from '@/lib/notebook/types';

export interface CreateResearchInput {
  title: string;
  url?: string;
  content?: string;
  excerpt?: string;
  source?: string;
  content_type?: ContentType;
  category?: string;
  tags?: string[];
  notes?: string;
}

export function useResearch() {
  const { effectiveUserId } = useAuthContext();
  const { toast } = useToast();
  const [clippings, setClippings] = useState<ResearchClipping[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClippings = async () => {
    if (!effectiveUserId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('research_clippings')
        .select('*')
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClippings(data || []);
    } catch (err: any) {
      console.error('Error fetching research clippings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClippings();
  }, [effectiveUserId]);

  const createClipping = async (input: CreateResearchInput) => {
    if (!effectiveUserId) return null;

    try {
      const { data, error } = await supabase
        .from('research_clippings')
        .insert({
          user_id: effectiveUserId,
          ...input,
          reading_status: 'to_read'
        })
        .select()
        .single();

      if (error) throw error;
      setClippings((prev) => [data, ...prev]);
      toast({ title: 'Research saved', description: 'Content added to your library.' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const updateClipping = async (id: string, updates: Partial<ResearchClipping>) => {
    try {
      const { data, error } = await supabase
        .from('research_clippings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setClippings((prev) => prev.map((item) => (item.id === id ? data : item)));
      toast({ title: 'Research updated' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const deleteClipping = async (id: string) => {
    try {
      const { error } = await supabase.from('research_clippings').delete().eq('id', id);
      if (error) throw error;
      setClippings((prev) => prev.filter((item) => item.id !== id));
      toast({ title: 'Research deleted' });
      return true;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const toggleFavorite = async (id: string, currentStatus: boolean) => {
    return updateClipping(id, { is_favorite: !currentStatus });
  };

  const updateStatus = async (id: string, status: ReadingStatus) => {
    const updates: Partial<ResearchClipping> = { reading_status: status };
    if (status === 'completed') {
      updates.read_at = new Date().toISOString();
    }
    return updateClipping(id, updates);
  };

  return {
    clippings,
    isLoading,
    createClipping,
    updateClipping,
    deleteClipping,
    toggleFavorite,
    updateStatus,
    refetch: fetchClippings,
  };
}
