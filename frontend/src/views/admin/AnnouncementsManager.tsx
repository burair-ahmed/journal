import { useState } from 'react';
import { useAdminAnnouncements, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement, Announcement, AnnouncementFormData } from '@/hooks/useAnnouncements';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { Pencil, Trash2, Plus, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const AnnouncementsManager = () => {
    const { data: announcements, isLoading } = useAdminAnnouncements();
    const createMutation = useCreateAnnouncement();
    const updateMutation = useUpdateAnnouncement();
    const deleteMutation = useDeleteAnnouncement();
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [formData, setFormData] = useState<AnnouncementFormData>({
        title: '',
        content: '',
        audience: 'all',
        priority: 'medium',
        start_at: new Date().toISOString(),
        expires_at: null,
        is_active: true
    });

    const handleOpenDialog = (announcement?: Announcement) => {
        if (announcement) {
            setEditingAnnouncement(announcement);
            setFormData({
                title: announcement.title,
                content: announcement.content,
                audience: announcement.audience,
                priority: announcement.priority,
                start_at: announcement.start_at,
                expires_at: announcement.expires_at || null,
                is_active: announcement.is_active
            });
        } else {
            setEditingAnnouncement(null);
            setFormData({
                title: '',
                content: '',
                audience: 'all',
                priority: 'medium',
                start_at: new Date().toISOString(),
                expires_at: null,
                is_active: true
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        try {
            if (editingAnnouncement) {
                await updateMutation.mutateAsync({ id: editingAnnouncement.id, data: formData });
            } else {
                await createMutation.mutateAsync(formData);
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Failed to save', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this announcement?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Announcements Manager</h1>
                    <p className="text-muted-foreground">Create and manage systemic announcements.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-brand-gradient">
                    <Plus className="w-4 h-4 mr-2" /> New Announcement
                </Button>
            </div>

            <div className="grid gap-4">
                {announcements?.map((announcement) => (
                    <Card key={announcement.id} className="flex flex-row justify-between items-center p-4">
                        <div className="space-y-1">
                             <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{announcement.title}</h3>
                                <Badge variant={announcement.is_active ? 'default' : 'secondary'}>
                                    {announcement.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                <Badge variant="outline">{announcement.priority}</Badge>
                                <Badge variant="outline">{announcement.audience}</Badge>
                             </div>
                             <p className="text-sm text-muted-foreground line-clamp-1">{announcement.content}</p>
                             <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <CalendarIcon className="w-3 h-3"/> {format(new Date(announcement.start_at), 'PPP pp')}
                                {announcement.expires_at && ` - Expires: ${format(new Date(announcement.expires_at), 'PPP pp')}`}
                             </div>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(announcement)}>
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(announcement.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
                {announcements?.length === 0 && (
                     <div className="text-center py-10 text-muted-foreground">No announcements found.</div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
                        <DialogDescription>
                            Create notifications for users. Priority 'Critical' will show prominently.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                         <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea id="content" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="grid gap-2">
                                <Label htmlFor="audience">Audience</Label>
                                <Select value={formData.audience} onValueChange={(val: any) => setFormData({...formData, audience: val})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select audience" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Users</SelectItem>
                                        <SelectItem value="user">Regular Users</SelectItem>
                                        <SelectItem value="admin">Admins Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select value={formData.priority} onValueChange={(val: any) => setFormData({...formData, priority: val})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="grid gap-2">
                                <Label>Start Date</Label>
                                <Input type="datetime-local" value={formData.start_at.slice(0, 16)} onChange={(e) => setFormData({...formData, start_at: new Date(e.target.value).toISOString()})} />
                            </div>
                             <div className="grid gap-2">
                                <Label>Expires At (Optional)</Label>
                                <Input type="datetime-local" value={formData.expires_at?.slice(0, 16) || ''} onChange={(e) => setFormData({...formData, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null})} />
                            </div>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Switch id="active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({...formData, is_active: checked})} />
                            <Label htmlFor="active">Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} className="bg-brand-gradient">Save Announcement</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
