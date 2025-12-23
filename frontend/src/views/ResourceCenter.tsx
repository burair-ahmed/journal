import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, ArrowRight } from "lucide-react";
import { useResourceCenter } from "@/hooks/useResourceCenter";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

import { useNavigate } from "react-router-dom";

export const ResourceCenter = () => {
  const { blogs, isLoading } = useResourceCenter();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Resource Center</h1>
        <p className="text-muted-foreground">Latest updates, guides, and educational content.</p>
      </div>

      <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Latest Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map(post => (
                <Card 
                  key={post.id} 
                  className="group relative flex flex-col h-full border-muted/20 bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer overflow-hidden rounded-2xl"
                  onClick={() => navigate(`/resources/${post.slug}`)}
                >
                      {/* Image Container with Overlay */}
                      <div className="relative h-52 w-full overflow-hidden">
                         {post.featured_image ? (
                            <img 
                              src={post.featured_image} 
                              alt={post.title} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                         ) : (
                            <div className="w-full h-full bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center">
                              <FileText className="w-12 h-12 text-muted-foreground/20" />
                            </div>
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
                         
                         {/* Floating Badges */}
                         <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                            {post.categories.slice(0, 2).map(cat => (
                                <Badge key={cat} className="bg-black/50 hover:bg-black/70 backdrop-blur-md border-white/10 text-white font-medium px-3 py-1">
                                  {cat}
                                </Badge>
                            ))}
                         </div>
                      </div>

                      <CardContent className="flex flex-col flex-1 p-6 space-y-4">
                          <div className="space-y-2">
                              <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                {post.title}
                              </CardTitle>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {format(new Date(post.published_at || post.created_at), 'MMM d, yyyy')}
                                  </div>
                                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                                  <span>5 min read</span>
                              </div>
                          </div>

                          <CardDescription className="text-sm text-muted-foreground/80 line-clamp-3 leading-relaxed">
                              {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                          </CardDescription>

                          <div className="pt-4 mt-auto">
                            <Button 
                              variant="ghost" 
                              className="group/btn w-full justify-between hover:bg-primary/10 hover:text-primary transition-colors p-0 h-auto font-medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/resources/${post.slug}`);
                              }}
                            >
                              Read Article
                              <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" />
                            </Button>
                          </div>
                      </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
};
