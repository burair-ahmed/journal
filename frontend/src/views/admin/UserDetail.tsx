// views/admin/UserDetail.tsx
/**
 * User Detail View - Comprehensive information about a single user
 * Uses global color theme (pink/fuchsia)
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useUserDetail, useSuspendUser, useDeleteUser } from '@/hooks/useAdmin';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Ban,
  Trash2,
  Mail,
  Calendar,
  TrendingUp,
  Activity,
  Shield,
  CreditCard,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const UserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useUserDetail(userId!);
  const suspendUser = useSuspendUser();
  const deleteUser = useDeleteUser();

  const handleSuspend = async () => {
    if (!userId || !data) return;
    if (!confirm(`Are you sure you want to suspend ${data.user.email}?`)) return;

    try {
      await suspendUser.mutateAsync(userId);
      toast.success('User suspended');
    } catch (error) {
      toast.error('Failed to suspend user');
    }
  };

  const handleDelete = async () => {
    if (!userId || !data) return;
    const confirmText = `DELETE ${data.user.email}`;
    const input = prompt(
      `This action cannot be undone. Type "${confirmText}" to confirm:`
    );

    if (input !== confirmText) {
      toast.error('Deletion cancelled');
      return;
    }

    try {
      await deleteUser.mutateAsync(userId);
      toast.success('User deleted');
      navigate('/admin/users');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full">
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-xl font-medium text-muted-foreground">User not found</p>
        <Button className="mt-4" onClick={() => navigate('/admin/users')}>
          Back to Users
        </Button>
      </div>
    );
  }

  const { user, accounts, trade_count } = data;

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-0';
      case 'admin':
        return 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white border-0';
      case 'support':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/users')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSuspend}
            className="border-orange-500/50 text-orange-600 hover:bg-orange-50"
          >
            <Ban className="h-4 w-4 mr-2" />
            Suspend
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* User Header Card */}
      <Card className="p-6 border-0 shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-pink-500/10"></div>
        <div className="relative flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-brand-gradient flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {user.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.email}</h1>
            <p className="text-muted-foreground">{user.name || 'No name set'}</p>
            <div className="mt-2">
              <Badge className={getRoleBadgeStyle(user.role)}>
                {user.role}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">User ID</p>
            <code className="text-xs bg-muted px-2 py-1 rounded">{user.id.substring(0, 8)}...</code>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{accounts.length}</p>
              <p className="text-sm text-muted-foreground">Accounts</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{trade_count}</p>
              <p className="text-sm text-muted-foreground">Total Trades</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">{new Date(user.created_at).toLocaleDateString()}</p>
              <p className="text-sm text-muted-foreground">Joined</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString()
                  : 'Never'}
              </p>
              <p className="text-sm text-muted-foreground">Last Active</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Accounts Table */}
      <Card className="border-0 shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Connected Accounts</h2>
        </div>
        {accounts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No accounts connected</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">Alias</TableHead>
                <TableHead className="font-semibold">MT5 Login</TableHead>
                <TableHead className="font-semibold">Server</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account: any) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.alias || '-'}</TableCell>
                  <TableCell>{account.mt5_login}</TableCell>
                  <TableCell>{account.mt5_server}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(account.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};
