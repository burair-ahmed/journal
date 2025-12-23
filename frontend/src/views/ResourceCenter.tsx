import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, FileText, Megaphone, Calendar } from "lucide-react";
import { useResourceCenter } from "@/hooks/useResourceCenter";
import { format } from "date-fns";
// Reusing standard components
import { Button } from "@/components/ui/button";

export const ResourceCenter = () => {
  const { announcements, blogs, isLoading } = useResourceCenter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white hover:bg-red-600';
      case 'high': return 'bg-orange-500 text-white hover:bg-orange-600';
      case 'medium': return 'bg-blue-500 text-white hover:bg-blue-600';
      default: return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Resource Center</h1>
        <p className="text-muted-foreground">Latest updates, guides, and educational content.</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Updates</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="blogs">Articles & Guides</TabsTrigger>
          {/* <TabsTrigger value="faq">FAQ</TabsTrigger> Phase 2 */}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Featured / Critical Announcements */}
          {announcements.some(a => a.priority === 'critical' || a.priority === 'high') && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Important Updates
              </h2>
              <div className="grid gap-4">
                {announcements
                  .filter(a => a.priority === 'critical' || a.priority === 'high')
                  .map(announcement => (
                    <Card key={announcement.id} className="border-l-4 border-l-red-500 shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{announcement.title}</CardTitle>
                          <Badge className={getPriorityColor(announcement.priority)}>{announcement.priority}</Badge>
                        </div>
                        <CardDescription>
                          {format(new Date(announcement.start_at), 'PPP')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="prose dark:prose-invert max-w-none text-sm text-muted-foreground">
                            {announcement.content}
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recent Blogs Grid */}
          <div className="space-y-4">
             <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Latest Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.slice(0, 6).map(post => (
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
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
            {announcements.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">No active announcements</div>
            ) : (
                announcements.map(announcement => (
                    <Card key={announcement.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle>{announcement.title}</CardTitle>
                          <Badge className={getPriorityColor(announcement.priority)}>{announcement.priority}</Badge>
                        </div>
                        <CardDescription>
                          Posted on {format(new Date(announcement.start_at), 'PPP')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap">{announcement.content}</p>
                      </CardContent>
                    </Card>
                ))
            )}
        </TabsContent>

        <TabsContent value="blogs">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map(post => (
                    <Card key={post.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                        {post.featured_image && (
                            <div className="h-48 w-full overflow-hidden rounded-t-lg">
                                <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p className="text-sm text-muted-foreground line-clamp-3">
                                {post.excerpt}
                             </p>
                        </CardContent>
                    </Card>
                ))}
             </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
