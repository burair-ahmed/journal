/**
 * Custom hook for managing Lessons Learned
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import type { LessonLearned, CreateLessonInput, LessonFilters } from '@/lib/notebook/types';

export function useLessons(filters?: LessonFilters) {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [lessons, setLessons] = useState<LessonLearned[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLessons = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      let query = supabase
        .from('lessons_learned')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters?.category) query = query.eq('category', filters.category);
      if (filters?.severity) query = query.eq('severity', filters.severity);
      if (filters?.status) query = query.eq('status', filters.status);

      const { data, error } = await query;
      if (error) throw error;
      setLessons(data || []);
    } catch (err: any) {
      console.error('Error fetching lessons:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [user, JSON.stringify(filters)]);

  const createLesson = async (input: CreateLessonInput) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('lessons_learned')
        .insert({ user_id: user.id, ...input })
        .select()
        .single();

      if (error) throw error;
      setLessons((prev) => [data, ...prev]);
      toast({ title: 'Lesson saved', description: 'Your lesson has been documented.' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const updateLesson = async (id: string, updates: Partial<LessonLearned>) => {
    try {
      const { data, error } = await supabase
        .from('lessons_learned')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setLessons((prev) => prev.map((lesson) => (lesson.id === id ? data : lesson)));
      toast({ title: 'Lesson updated' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const deleteLesson = async (id: string) => {
    try {
      const { error } = await supabase.from('lessons_learned').delete().eq('id', id);
      if (error) throw error;
      setLessons((prev) => prev.filter((lesson) => lesson.id !== id));
      toast({ title: 'Lesson deleted' });
      return true;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  return {
    lessons,
    isLoading,
    createLesson,
    updateLesson,
    deleteLesson,
    refetch: fetchLessons,
  };
}
