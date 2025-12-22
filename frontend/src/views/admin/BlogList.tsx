// views/admin/BlogList.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlogPosts, useDeletePost, useRevertPost, useUnpublishPost } from '@/hooks/useBlog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const BlogList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const { data, isLoading, refetch } = useBlogPosts(page, 10, filterStatus);
  const deletePost = useDeletePost();
  const revertPost = useRevertPost();
  const unpublishPost = useUnpublishPost();
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePost.mutateAsync(deleteId);
      setDeleteId(null);
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500 hover:bg-green-600">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your blog content and publications</p>
        </div>
        <Button 
          onClick={() => navigate('/admin/blog/new')}
          className="bg-brand-gradient hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filterStatus === undefined ? "secondary" : "ghost"}
            onClick={() => setFilterStatus(undefined)}
            size="sm"
          >
            All
          </Button>
          <Button 
            variant={filterStatus === 'published' ? "secondary" : "ghost"}
            onClick={() => setFilterStatus('published')}
            size="sm"
          >
            Published
          </Button>
          <Button 
            variant={filterStatus === 'draft' ? "secondary" : "ghost"}
            onClick={() => setFilterStatus('draft')}
            size="sm"
          >
            Drafts
          </Button>
        </div>
      </div>

      {/* Content */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[400px]">Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="h-8 w-8 opacity-50" />
                    <p>No blog posts found</p>
                    <Button variant="link" onClick={() => navigate('/admin/blog/new')}>
                      Create your first post
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.posts.map((post) => (
                <TableRow key={post.id} className="group">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium truncate max-w-[350px]" title={post.title}>
                        {post.title}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[350px]">
                        /{post.slug}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(post.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-500 flex items-center justify-center text-[10px] text-white font-bold">
                        {post.author?.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {post.author?.name || post.author?.email?.split('@')[0]}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {post.views || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                      </span>
                      {post.published_at && (
                        <span className="text-[10px] opacity-70">
                          Pub: {format(new Date(post.published_at), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(`/admin/blog/edit/${post.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            const reason = window.prompt('Enter reason to unpublish');
                            if (!reason) return;
                            try {
                              await unpublishPost.mutateAsync({ id: post.id, reason });
                              refetch();
                            } catch (e) {
                              toast.error('Failed to unpublish');
                            }
                          }}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Unpublish
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={async () => {
                            const reason = window.prompt('Enter reason to revert to previous version');
                            if (!reason) return;
                            try {
                              await revertPost.mutateAsync({ id: post.id, reason });
                              refetch();
                            } catch (e) {
                              toast.error('Failed to revert');
                            }
                          }}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Revert
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(post.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deletePost.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
