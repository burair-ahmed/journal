/**
 * Custom hook for managing Chart Library with Storage
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import type { ChartLibrary, CreateChartInput } from '@/lib/notebook/types';

export function useCharts() {
  const { effectiveUserId } = useAuthContext();
  const { toast } = useToast();
  const [charts, setCharts] = useState<ChartLibrary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fetchCharts = async () => {
    if (!effectiveUserId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('chart_library')
        .select('*')
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCharts(data || []);
    } catch (err: any) {
      console.error('Error fetching charts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCharts();
  }, [effectiveUserId]);

  const uploadChart = async (file: File, metadata: Omit<CreateChartInput, 'image_url'>) => {
    if (!effectiveUserId) return null;

    try {
      setIsUploading(true);
      
      // 1. Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${effectiveUserId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('charts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('charts')
        .getPublicUrl(filePath);

      // 3. Create database entry
      const { data, error } = await supabase
        .from('chart_library')
        .insert({
          user_id: effectiveUserId,
          image_url: publicUrl,
          ...metadata
        })
        .select()
        .single();

      if (error) throw error;

      setCharts((prev) => [data, ...prev]);
      toast({ title: 'Chart uploaded', description: 'Your chart has been saved to the library.' });
      return data;
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteChart = async (id: string, imageUrl: string) => {
    try {
      // 1. Delete from database
      const { error: dbError } = await supabase
        .from('chart_library')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // 2. Delete from storage (optional, but good practice)
      // Extract path from URL: .../charts/user_id/filename
      const path = imageUrl.split('/charts/')[1];
      if (path) {
        await supabase.storage.from('charts').remove([path]);
      }

      setCharts((prev) => prev.filter((chart) => chart.id !== id));
      toast({ title: 'Chart deleted' });
      return true;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const updateChart = async (id: string, updates: Partial<ChartLibrary>) => {
    try {
      const { data, error } = await supabase
        .from('chart_library')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setCharts((prev) => prev.map((chart) => (chart.id === id ? data : chart)));
      toast({ title: 'Chart details updated' });
      return data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  return {
    charts,
    isLoading,
    isUploading,
    uploadChart,
    deleteChart,
    updateChart,
    refetch: fetchCharts,
  };
}
