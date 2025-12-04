// views/admin/UserDirectory.tsx
/**
 * User Directory - List all users with search, filters, and bulk actions
 * Uses global color theme (pink/fuchsia)
 */

import { useState } from 'react';
import { useUsers, useSuspendUser, useBulkSuspendUsers, useBulkDeleteUsers, AdminUser } from '@/hooks/useAdmin';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { BulkActionsToolbar } from '@/components/admin/BulkActionsToolbar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronLeft, ChevronRight, Ban, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

export const UserDirectory = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const navigate = useNavigate();
  
  const { data, isLoading, refetch } = useUsers(
    page, 
    50, 
    search, 
    roleFilter === 'all' ? undefined : roleFilter
  );
  
  const suspendUser = useSuspendUser();
  const bulkSuspend = useBulkSuspendUsers();
  const bulkDelete = useBulkDeleteUsers();

  const handleSuspend = async (userId: string, email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to suspend ${email}?`)) return;
    
    try {
      await suspendUser.mutateAsync(userId);
      toast.success('User suspended');
      refetch();
    } catch (error) {
      toast.error('Failed to suspend user');
    }
  };

  const handleBulkSuspend = async () => {
    try {
      await bulkSuspend.mutateAsync(selectedUsers);
      setSelectedUsers([]);
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDelete.mutateAsync(selectedUsers);
      setSelectedUsers([]);
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const handleExport = () => {
    if (!data?.users) return;
    
    const usersToExport = selectedUsers.length > 0
      ? data.users.filter(u => selectedUsers.includes(u.id))
      : data.users;

    const csv = Papa.unparse(usersToExport.map(u => ({
      ID: u.id,
      Email: u.email,
      Name: u.name || '',
      Role: u.role,
      Joined: new Date(u.created_at).toLocaleDateString(),
      LastActive: u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : 'Never'
    })));

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelectAll = () => {
    if (!data?.users) return;
    if (selectedUsers.length === data.users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(data.users.map(u => u.id));
    }
  };

  const toggleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    } else {
      setSelectedUsers(prev => [...prev, userId]);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-0';
      case 'admin':
        return 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white border-0';
      case 'support':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0';
      case 'suspended':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6 relative">
      <BulkActionsToolbar
        selectedCount={selectedUsers.length}
        onClearSelection={() => setSelectedUsers([])}
        onSuspend={handleBulkSuspend}
        onDelete={handleBulkDelete}
        onExport={handleExport}
        isSuspending={bulkSuspend.isPending}
        isDeleting={bulkDelete.isPending}
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-pink-600">
          User Directory
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage and monitor all platform users
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4 border-0 shadow-lg">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-primary/20 focus:border-primary"
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px] border-primary/20">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* User Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={data?.users?.length > 0 && selectedUsers.length === data?.users?.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Joined</TableHead>
              <TableHead className="font-semibold">Last Active</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span>Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              data?.users.map((user: AdminUser) => (
                <TableRow 
                  key={user.id} 
                  className={`cursor-pointer transition-colors ${selectedUsers.includes(user.id) ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                  onClick={() => navigate(`/admin/users/${user.id}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => toggleSelectUser(user.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.name || '-'}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeStyle(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/users/${user.id}`);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {user.role !== 'suspended' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleSuspend(user.id, user.email, e)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, data.total)} of {data.total} users
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-primary/20"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= data.total_pages}
                className="border-primary/20"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
