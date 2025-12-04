// hooks/useBlog.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  categories: string[];
  tags: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  status: 'draft' | 'published' | 'scheduled';
  published_at?: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  author?: {
    email: string;
    name?: string;
  };
  views?: number;
  likes?: number;
}

export interface BlogFormData {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  categories: string[];
  tags: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  status: 'draft' | 'published' | 'scheduled';
  published_at?: string;
}

// Get all blog posts (admin view)
export const useBlogPosts = (page = 1, limit = 10, status?: string) => {
  return useQuery({
    queryKey: ['admin-blog-posts', page, limit, status],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          author:users!author_id(email, name),
          analytics:blog_analytics(views, likes)
        `, { count: 'exact' });

      if (status) {
        query = query.eq('status', status);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Transform data to flatten analytics
      const posts = data.map((post: any) => ({
        ...post,
        views: post.analytics?.[0]?.views || 0,
        likes: post.analytics?.[0]?.likes || 0,
      }));

      return {
        posts: posts as BlogPost[],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      };
    },
  });
};

// Get single blog post
export const useBlogPost = (id: string) => {
  return useQuery({
    queryKey: ['blog-post', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!id,
  });
};

// Create blog post
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (formData: BlogFormData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          ...formData,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Blog post created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create blog post');
    },
  });
};

// Update blog post
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BlogFormData> }) => {
      const { error } = await supabase
        .from('blog_posts')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      toast.success('Blog post updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-post', id] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update blog post');
    },
  });
};

// Delete blog post
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Blog post deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete blog post');
    },
  });
};

// Upload image helper
export const useUploadImage = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public') // Assuming a public bucket exists or needs to be created
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      return data.publicUrl;
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload image');
    },
  });
};
