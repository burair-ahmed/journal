import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { useAuth } from './useAuth';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: 'all' | 'admin' | 'user';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_at: string;
  expires_at?: string | null;
  is_active: boolean;
  created_at: string;
  created_by?: string;
}

export interface AnnouncementFormData {
  title: string;
  content: string;
  audience: 'all' | 'admin' | 'user';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_at: string;
  expires_at?: string | null;
  is_active: boolean;
}

// Fetch active announcements for the current user
export const useActiveAnnouncements = () => {
  return useQuery({
    queryKey: ['active-announcements'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .lte('start_at', now)
        .order('priority', { ascending: false }) // Critical first
        .order('start_at', { ascending: false });

      if (error) throw error;
      return data as Announcement[];
    },
  });
};

// Admin: Fetch ALL announcements
export const useAdminAnnouncements = () => {
  return useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Announcement[];
    },
  });
};

// Admin: Create Announcement
export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (formData: AnnouncementFormData) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          ...formData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Announcement created');
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create announcement');
    }
  });
};

// Admin: Update Announcement
export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AnnouncementFormData> }) => {
      const { error } = await supabase
        .from('announcements')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Announcement updated');
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update announcement');
    }
  });
};

// Admin: Delete Announcement
export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Announcement deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete announcement');
    }
  });
};
