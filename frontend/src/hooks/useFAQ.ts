
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type FAQFormData = Omit<FAQItem, 'id' | 'created_at' | 'updated_at'>;

// Fetch active FAQs (User View)
export const useActiveFAQs = () => {
  return useQuery({
    queryKey: ['active-faqs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faq_items')
        .select('*')
        .eq('is_published', true)
        .order('priority', { ascending: false }) // Critical first
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FAQItem[];
    },
  });
};

// Fetch All FAQs (Admin View)
export const useAdminFAQs = () => {
  return useQuery({
    queryKey: ['admin-faqs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faq_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FAQItem[];
    },
  });
};

// Create FAQ
export const useCreateFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FAQFormData) => {
      const { data, error } = await supabase
        .from('faq_items')
        .insert(formData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('FAQ created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['active-faqs'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create FAQ');
    },
  });
};

// Update FAQ
export const useUpdateFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FAQFormData> }) => {
      const { error } = await supabase
        .from('faq_items')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('FAQ updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['active-faqs'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update FAQ');
    },
  });
};

// Delete FAQ
export const useDeleteFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('faq_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('FAQ deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['active-faqs'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete FAQ');
    },
  });
};
