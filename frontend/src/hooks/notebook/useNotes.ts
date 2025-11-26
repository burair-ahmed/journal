/**
 * Custom hook for managing Trading Notes
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import type { TradingNote, CreateNoteInput, NoteFilters } from '@/lib/notebook/types';

export function useNotes(filters?: NoteFilters) {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [notes, setNotes] = useState<TradingNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch notes
  const fetchNotes = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      let query = supabase
        .from('trading_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.note_type) {
        query = query.eq('note_type', filters.note_type);
      }
      if (filters?.is_pinned !== undefined) {
        query = query.eq('is_pinned', filters.is_pinned);
      }
      if (filters?.is_archived !== undefined) {
        query = query.eq('is_archived', filters.is_archived);
      }
      if (filters?.symbols && filters.symbols.length > 0) {
        query = query.overlaps('symbols', filters.symbols);
      }
      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }
      if (filters?.search) {
        query = query.textSearch('search_vector', filters.search);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setNotes(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user, JSON.stringify(filters)]);

  // Create note
  const createNote = async (input: CreateNoteInput) => {
    if (!user) return null;

    try {
      const { data, error: createError } = await supabase
        .from('trading_notes')
        .insert({
          user_id: user.id,
          ...input,
        })
        .select()
        .single();

      if (createError) throw createError;

      setNotes((prev) => [data, ...prev]);
      toast({ title: 'Note created', description: 'Your note has been saved successfully.' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error creating note', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  // Update note
  const updateNote = async (id: string, updates: Partial<TradingNote>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('trading_notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setNotes((prev) => prev.map((note) => (note.id === id ? data : note)));
      toast({ title: 'Note updated', description: 'Your changes have been saved.' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error updating note', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  // Delete note
  const deleteNote = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('trading_notes')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setNotes((prev) => prev.filter((note) => note.id !== id));
      toast({ title: 'Note deleted', description: 'The note has been removed.' });
      return true;
    } catch (err: any) {
      toast({ title: 'Error deleting note', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  // Toggle pin
  const togglePin = async (id: string, currentPinned: boolean) => {
    return updateNote(id, { is_pinned: !currentPinned });
  };

  // Toggle archive
  const toggleArchive = async (id: string, currentArchived: boolean) => {
    return updateNote(id, { is_archived: !currentArchived });
  };

  return {
    notes,
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleArchive,
    refetch: fetchNotes,
  };
}
