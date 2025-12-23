import { useParams, useNavigate } from 'react-router-dom';
import { useBlogPostBySlug } from '@/hooks/useBlog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, ArrowLeft, Loader2, Share2, Clock, Bookmark } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: post, isLoading, error } = useBlogPostBySlug(slug || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 bg-primary/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in zoom-in duration-500">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Article Not Found</h1>
        <p className="text-muted-foreground text-lg">The article you're looking for seems to have vanished.</p>
        <Button onClick={() => navigate('/resources')} size="lg" className="gap-2 shadow-lg hover:shadow-primary/25">
          <ArrowLeft className="h-4 w-4" />
          Back to Resources
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      {/* Scroll Progress Bar (Optional enhancement) */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 z-50 origin-left" />

      {/* Navigation Bar */}
      <div className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/resources')}
            className="text-muted-foreground hover:text-foreground gap-2 group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Resources
          </Button>
          
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
               <Bookmark className="w-5 h-5" />
             </Button>
             <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
               <Share2 className="w-5 h-5" />
             </Button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-12">
        
        {/* Header Section */}
        <div className="space-y-6 text-center md:text-left">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {post.categories.map((cat, i) => (
              <Badge 
                key={cat} 
                variant="outline" 
                className="rounded-full px-4 py-1 border-primary/20 bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
              >
                {cat}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
            {post.title}
          </h1>

          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 pt-4 justify-center md:justify-start">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-background ring-2 ring-border/50">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.name || 'User'}`} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                  {post.author?.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold text-foreground text-sm">{post.author?.name || 'Unknown Author'}</p>
                <p className="text-xs text-muted-foreground">Editor in Chief</p>
              </div>
            </div>

            <div className="h-8 w-px bg-border hidden md:block" />

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary/70" />
                <time dateTime={post.published_at || post.created_at}>
                  {format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary/70" />
                <span>5 min read</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Image - Wide and immersive */}
        {post.featured_image && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
          >
            <img 
              src={post.featured_image} 
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 will-change-transform"
            />
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.2)] rounded-2xl pointer-events-none" />
          </motion.div>
        )}

        {/* Content Body */}
        <article className="prose prose-lg dark:prose-invert max-w-none 
          prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-20
          prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:bg-clip-text prose-h2:text-transparent prose-h2:bg-gradient-to-r prose-h2:from-foreground prose-h2:to-foreground/70
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline hover:prose-a:text-primary/80 
          prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-border/50
          prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
          prose-p:leading-relaxed prose-p:text-muted-foreground/90
          prose-li:marker:text-primary"
        >
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        <div className="border-t pt-8 mt-12 flex justify-center">
            <p className="text-muted-foreground italic text-sm">
                Thanks for reading! Keep mastering your trade.
            </p>
        </div>
      </main>
    </motion.div>
  );
};

export default BlogPost;
