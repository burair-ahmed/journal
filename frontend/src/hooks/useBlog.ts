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
          author:users!fk_blog_author(email, name),
          analytics:blog_analytics!fk_blog_analytics_post(views, likes)
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
    mutationFn: async ({ id, data, reason }: { id: string; data: Partial<BlogFormData>; reason?: string }) => {
      const { data: before } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();
      
      const { error } = await supabase
        .from('blog_posts')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('admin_audit_log').insert({
          admin_user_id: user.id,
          action: 'update_blog_post',
          metadata: { post_id: id, before, after: data, reason },
        });
      }
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

// Revert blog post to previous version based on audit log
export const useRevertPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data: entries, error: fetchError } = await supabase
        .from('admin_audit_log')
        .select('*')
        .eq('action', 'update_blog_post')
        .contains('metadata', { post_id: id })
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (fetchError) throw fetchError;
      const entry = entries?.[0];
      const before = entry?.metadata?.before;
      if (!before) throw new Error('No previous version found');
      
      const { error } = await supabase
        .from('blog_posts')
        .update({
          title: before.title,
          slug: before.slug,
          excerpt: before.excerpt,
          content: before.content,
          featured_image: before.featured_image,
          categories: before.categories,
          tags: before.tags,
          seo_title: before.seo_title,
          seo_description: before.seo_description,
          seo_keywords: before.seo_keywords,
          status: before.status,
          published_at: before.published_at || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('admin_audit_log').insert({
          admin_user_id: user.id,
          action: 'revert_blog_post',
          metadata: { post_id: id, reverted_to: before, reason },
        });
      }
    },
    onSuccess: () => {
      toast.success('Blog post reverted');
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to revert blog post');
    },
  });
};

// Unpublish blog post
export const useUnpublishPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { error } = await supabase
        .from('blog_posts')
        .update({ status: 'draft', published_at: null, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('admin_audit_log').insert({
          admin_user_id: user.id,
          action: 'unpublish_blog_post',
          metadata: { post_id: id, reason },
        });
      }
    },
    onSuccess: () => {
      toast.success('Blog post unpublished');
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to unpublish blog post');
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

// Get published blog posts (user view) - Optimized for Resource Center
export const usePublishedBlogPosts = (limit = 6) => {
  return useQuery({
    queryKey: ['published-blog-posts', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id, title, slug, excerpt, featured_image, categories, tags, published_at, created_at,
          author:users!fk_blog_author(name)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (error) throw error;
      
      // Transform author array to expected object shape
      return data.map((post: any) => ({
        ...post,
        author: Array.isArray(post.author) && post.author.length > 0 
          ? { name: post.author[0].name, email: '' } // Provide default empty email to satisfy type
          : { name: 'Unknown', email: '' }
      })) as Partial<BlogPost>[];
    },
  });
};

// Get single published blog post by slug (public view)
export const useBlogPostBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['blog-post-slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:users!fk_blog_author(name)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      
      return {
        ...data,
        author: Array.isArray(data.author) && data.author.length > 0
          ? { name: data.author[0].name }
          : { name: 'Unknown' }
      } as BlogPost;
    },
    enabled: !!slug,
  });
};
