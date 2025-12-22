import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuditLog } from '@/hooks/useAdmin';
import { Search, Download, Filter } from 'lucide-react';
import Papa from 'papaparse';

type AuditEntry = {
  id: string;
  created_at: string;
  admin?: { email?: string; name?: string } | null;
  admin_user_id: string;
  action: string;
  metadata?: Record<string, unknown> | null;
  target_user_id?: string | null;
};

export const AuditLog = () => {
  const [actorId, setActorId] = useState<string>('');
  const [action, setAction] = useState<string>('all');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  
  const filters = useMemo(() => ({
    actorId: actorId || undefined,
    action: action === 'all' ? undefined : action,
    from: from || undefined,
    to: to || undefined,
  }), [actorId, action, from, to]);
  
  const { data: entries = [], isLoading, refetch } = useAuditLog(filters);
  
  const handleExport = () => {
    const csv = Papa.unparse((entries as AuditEntry[]).map((e) => ({
      created_at: e.created_at,
      admin_email: e.admin?.email || '',
      action: e.action,
      reason: (e.metadata as Record<string, unknown> | null)?.['reason'] ?? '',
      target_user_id: e.target_user_id || '',
      metadata: JSON.stringify(e.metadata || {}),
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-pink-600">
            Audit Log
          </h1>
          <p className="text-muted-foreground mt-1">
            View and export admin actions with reasons and metadata
          </p>
        </div>
        <Button onClick={handleExport} className="bg-brand-gradient">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      
      <Card className="p-4 border-0 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by admin user ID"
              value={actorId}
              onChange={(e) => setActorId(e.target.value)}
              className="pl-9"
            />
          </div>
          <div>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="suspend_user">Suspend User</SelectItem>
                <SelectItem value="unsuspend_user">Unsuspend User</SelectItem>
                <SelectItem value="delete_user">Delete User</SelectItem>
                <SelectItem value="restore_user">Restore User</SelectItem>
                <SelectItem value="update_setting">Update Setting</SelectItem>
                <SelectItem value="revert_setting">Revert Setting</SelectItem>
                <SelectItem value="update_blog_post">Update Blog Post</SelectItem>
                <SelectItem value="revert_blog_post">Revert Blog Post</SelectItem>
                <SelectItem value="unpublish_blog_post">Unpublish Blog Post</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            type="date"
            placeholder="From"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <Input
            type="date"
            placeholder="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => refetch()}>
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </Card>
      
      <Card className="border-0 shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">When</TableHead>
              <TableHead className="font-semibold">Who</TableHead>
              <TableHead className="font-semibold">Action</TableHead>
              <TableHead className="font-semibold">Reason</TableHead>
              <TableHead className="font-semibold">Metadata</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No entries
                </TableCell>
              </TableRow>
            ) : (
              (entries as AuditEntry[]).map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{new Date(e.created_at).toLocaleString()}</TableCell>
                  <TableCell>{e.admin?.email || e.admin_user_id}</TableCell>
                  <TableCell>{e.action}</TableCell>
                  <TableCell className="truncate max-w-[240px]">
                    {String((e.metadata as Record<string, unknown> | null)?.['reason'] ?? '')}
                  </TableCell>
                  <TableCell className="truncate max-w-[360px]">
                    <code className="text-xs">{JSON.stringify(e.metadata)}</code>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
