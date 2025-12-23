import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar } from "lucide-react";
import { useResourceCenter } from "@/hooks/useResourceCenter";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export const ResourceCenter = () => {
  const { blogs, isLoading } = useResourceCenter();

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
                <Card key={post.id} className="flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                      {post.featured_image && (
                        <div className="h-48 w-full overflow-hidden">
                            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                        </div>
                    )}
                    <CardHeader>
                        <div className="flex gap-2 mb-2">
                            {post.categories.slice(0, 2).map(cat => (
                                <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                            ))}
                        </div>
                        <CardTitle className="line-clamp-2 text-lg">{post.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 text-xs">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(post.published_at || post.created_at), 'MMM d, yyyy')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {post.excerpt || post.content.substring(0, 150)}...
                          </p>
                    </CardContent>
                      <div className="p-6 pt-0 mt-auto">
                        <Button variant="outline" className="w-full">Read Article</Button>
                      </div>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
};
