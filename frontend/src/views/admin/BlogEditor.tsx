// views/admin/BlogEditor.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCreatePost, useUpdatePost, useBlogPost, useUploadImage, BlogFormData } from '@/hooks/useBlog';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Upload, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const BlogEditor = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const isEditMode = !!postId;

  const { data: post, isLoading: isLoadingPost } = useBlogPost(postId || '');
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const uploadImage = useUploadImage();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BlogFormData>({
    defaultValues: {
      status: 'draft',
      categories: [],
      tags: [],
    }
  });

  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load data when editing
  useEffect(() => {
    if (post && isEditMode) {
      setValue('title', post.title);
      setValue('slug', post.slug);
      setValue('excerpt', post.excerpt);
      setValue('featured_image', post.featured_image);
      setValue('seo_title', post.seo_title);
      setValue('seo_description', post.seo_description);
      setValue('seo_keywords', post.seo_keywords);
      setValue('status', post.status);
      setContent(post.content);
    }
  }, [post, isEditMode, setValue]);

  // Auto-generate slug from title
  const title = watch('title');
  useEffect(() => {
    if (!isEditMode && title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', slug);
    }
  }, [title, isEditMode, setValue]);

  const onSubmit = async (data: BlogFormData) => {
    if (!content) {
      toast.error('Content is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = { ...data, content };
      
      if (isEditMode && postId) {
        await updatePost.mutateAsync({ id: postId, data: formData });
      } else {
        await createPost.mutateAsync(formData);
      }
      navigate('/admin/blog');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadImage.mutateAsync(file);
      setValue('featured_image', url);
      toast.success('Image uploaded');
    } catch (error) {
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  if (isEditMode && isLoadingPost) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/blog')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit Post' : 'Create New Post'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/blog')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-brand-gradient"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            {isEditMode ? 'Update Post' : 'Publish Post'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Post Title</Label>
              <Input
                id="title"
                placeholder="Enter post title"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="post-url-slug"
                {...register('slug', { required: 'Slug is required' })}
              />
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write your amazing content here..."
              />
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">SEO Settings</h3>
            <div className="space-y-2">
              <Label htmlFor="seo_title">SEO Title</Label>
              <Input
                id="seo_title"
                placeholder="Meta title (optional)"
                {...register('seo_title')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo_description">Meta Description</Label>
              <Textarea
                id="seo_description"
                placeholder="Brief description for search engines"
                {...register('seo_description')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo_keywords">Keywords</Label>
              <Input
                id="seo_keywords"
                placeholder="Comma separated keywords"
                {...register('seo_keywords')}
              />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Publishing</h3>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                onValueChange={(value: any) => setValue('status', value)}
                defaultValue={post?.status || 'draft'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Featured Image</h3>
            <div className="space-y-4">
              {watch('featured_image') ? (
                <div className="relative aspect-video rounded-lg overflow-hidden border">
                  <img
                    src={watch('featured_image')}
                    alt="Featured"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => setValue('featured_image', '')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/50">
                  <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                  <span className="text-sm">No image selected</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Label
                  htmlFor="image-upload"
                  className={`flex-1 flex items-center justify-center gap-2 h-9 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md cursor-pointer text-sm font-medium transition-colors ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {uploadingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Upload Image
                </Label>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Excerpt</h3>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Short Summary</Label>
              <Textarea
                id="excerpt"
                placeholder="A short summary of the post..."
                className="h-32"
                {...register('excerpt')}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
