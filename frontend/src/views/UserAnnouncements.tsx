
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useActiveAnnouncements } from "@/hooks/useAnnouncements";
import { Loader2 } from "lucide-react";

export const UserAnnouncements = () => {
  const { data: announcements, isLoading } = useActiveAnnouncements();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white hover:bg-red-600';
      case 'high': return 'bg-orange-500 text-white hover:bg-orange-600';
      case 'medium': return 'bg-blue-500 text-white hover:bg-blue-600';
      default: return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground">Stay updated with the latest news and important alerts.</p>
      </div>

      <div className="space-y-4">
        {announcements?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No active announcements</div>
        ) : (
            announcements?.map(announcement => (
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
      </div>
    </div>
  );
};
