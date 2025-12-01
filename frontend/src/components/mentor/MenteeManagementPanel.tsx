/**
 * Mentee Management Panel
 * UI for traders to invite mentors by email and manage access
 */

"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMentorships, InviteMentorInput } from "@/hooks/mentor/useMentorships";
import { UserPlus, Shield, Eye, EyeOff, Ban, CheckCircle2, Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AVAILABLE_TABS } from "@/lib/mentor/constants";
import { useAccounts } from "@/hooks/useAccounts";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const MenteeManagementPanel: React.FC = () => {
  const { myMentors, isLoading, inviteMentor, revokeAccess, updatePermissions } = useMentorships();
  const { user } = useAuthContext();
  const { data: accounts } = useAccounts(user?.id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMentorship, setEditingMentorship] = useState<typeof myMentors[0] | null>(null);
  const [formData, setFormData] = useState<InviteMentorInput>({
    mentor_email: "",
    message: "",
    permissions: {
      show_pnl: false,
      show_account_balance: false,
      allowed_tabs: AVAILABLE_TABS.map(tab => tab.id),  // Default: all tabs
      allowed_accounts: [],  // Will populate on dialog open
    },
  });

  const handleInvite = async () => {
    if (!formData.mentor_email.trim()) return;

    const result = await inviteMentor(formData);
    if (result) {
      setIsDialogOpen(false);
      setFormData({
        mentor_email: "",
        message: "",
        permissions: { 
          show_pnl: false, 
          show_account_balance: false,
          allowed_tabs: AVAILABLE_TABS.map(tab => tab.id),
          allowed_accounts: accounts?.map(a => a.id) || [],
        },
      });
    }
  };

  // Handle tab toggle
  const handleTabToggle = (tabId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions!,
        allowed_tabs: checked 
          ? [...(prev.permissions?.allowed_tabs || []), tabId]
          : (prev.permissions?.allowed_tabs || []).filter(t => t !== tabId)
      }
    }));
  };

  // Handle account toggle
  const handleAccountToggle = (accountId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions!,
        allowed_accounts: checked
          ? [...(prev.permissions?.allowed_accounts || []), accountId]
          : (prev.permissions?.allowed_accounts || []).filter(a => a !== accountId)
      }
    }));
  };

  // Populate default accounts when dialog opens
  const handleDialogOpenChange = (open: boolean) => {
    if (open && accounts) {
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions!,
          allowed_accounts: accounts.map(a => a.id)
        }
      }));
    }
    setIsDialogOpen(open);
  };

  // Handle edit permissions
  const handleEditPermissions = (mentorship: typeof myMentors[0]) => {
    setEditingMentorship(mentorship);
    setFormData({
      mentor_email: mentorship.mentor_email || '',
      message: mentorship.invite_message || '',
      permissions: {
        show_pnl: mentorship.permissions.show_pnl,
        show_account_balance: mentorship.permissions.show_account_balance,
        allowed_tabs: mentorship.permissions.allowed_tabs || AVAILABLE_TABS.map(t => t.id),
        allowed_accounts: mentorship.permissions.allowed_accounts || accounts?.map(a => a.id) || [],
      }
    });
    setIsEditDialogOpen(true);
  };

  // Save permission updates
  const handleSavePermissions = async () => {
    if (!editingMentorship) return;
    
    const result = await updatePermissions(editingMentorship.id, formData.permissions!);
    if (result) {
      setIsEditDialogOpen(false);
      setEditingMentorship(null);
    }
  };

  // Restore access (reactivate revoked mentorship)
  const handleRestoreAccess = async (mentorshipId: string) => {
    try {
      const { error } = await supabase
        .from('mentorships')
        .update({ 
          status: 'active',
          revoked_at: null 
        })
        .eq('id', mentorshipId);
      
      if (error) throw error;
      
      // Refresh the page to update the list
      window.location.reload();
    } catch (error) {
      console.error('Failed to restore access:', error);
    }
  };

  // Delete mentorship permanently
  const handleDelete = async (mentorshipId: string) => {
    if (!confirm('Are you sure you want to permanently delete this mentorship?')) return;
    
    try {
      const { error } = await supabase
        .from('mentorships')
        .delete()
        .eq('id', mentorshipId);
      
      if (error) throw error;
      
      // Remove from local state
      // Update based on whether it's myMentors or myMentees
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      console.error('Failed to delete mentorship:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "revoked":
        return <Badge variant="secondary">Revoked</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            My Mentors
          </h2>
          <p className="text-sm text-muted-foreground">
            Invite and manage mentors who can access your trading journal.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-brand-gradient text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Mentor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a Mentor</DialogTitle>
              <DialogDescription>
                Enter your mentor's email address to send them an invitation.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Mentor's Email</label>
                <Input
                  type="email"
                  placeholder="mentor@example.com"
                  value={formData.mentor_email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, mentor_email: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Message (Optional)</label>
                <Textarea
                  placeholder="Hi, I'd like you to be my trading mentor..."
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-4 pt-2 border-t">
                <div className="text-sm font-semibold">Access Permissions</div>

                {/* Tab Selection */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Accessible Tabs</label>
                    <p className="text-xs text-muted-foreground">Select which sections your mentor can view</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_TABS.map(tab => (
                      <div key={tab.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tab-${tab.id}`}
                          checked={formData.permissions?.allowed_tabs?.includes(tab.id)}
                          onCheckedChange={(checked) => handleTabToggle(tab.id, !!checked)}
                        />
                        <label htmlFor={`tab-${tab.id}`} className="text-sm cursor-pointer">
                          {tab.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account Selection */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Accessible Accounts</label>
                    <p className="text-xs text-muted-foreground">Select which trading accounts your mentor can see</p>
                  </div>
                  {accounts && accounts.length > 0 ? (
                    <div className="space-y-2">
                      {accounts.map(account => (
                        <div key={account.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`account-${account.id}`}
                            checked={formData.permissions?.allowed_accounts?.includes(account.id)}
                            onCheckedChange={(checked) => handleAccountToggle(account.id, !!checked)}
                          />
                          <label htmlFor={`account-${account.id}`} className="text-sm cursor-pointer">
                            {account.alias || `MT5 ${account.mt5_login} (${account.mt5_server})`}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No accounts found. Add an account first.</p>
                  )}
                </div>

                {/* Data Visibility */}
                <div className="space-y-3">
                  <div className="text-sm font-medium">Data Visibility</div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Show P&L Values</label>
                      <p className="text-xs text-muted-foreground">Allow mentor to see actual dollar amounts</p>
                    </div>
                    <Switch
                      checked={formData.permissions?.show_pnl}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          permissions: { ...prev.permissions, show_pnl: checked },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Show Account Balance</label>
                      <p className="text-xs text-muted-foreground">Allow mentor to see total account equity</p>
                    </div>
                    <Switch
                      checked={formData.permissions?.show_account_balance}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          permissions: { ...prev.permissions, show_account_balance: checked },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} className="bg-brand-gradient text-white">
                  Send Invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Permissions Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Mentor Permissions</DialogTitle>
              <DialogDescription>
                Update what {editingMentorship?.mentor_email} can access
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-4 pt-2 border-t">
                <div className="text-sm font-semibold">Access Permissions</div>

                {/* Tab Selection */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Accessible Tabs</label>
                    <p className="text-xs text-muted-foreground">Select which sections your mentor can view</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_TABS.map(tab => (
                      <div key={tab.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-tab-${tab.id}`}
                          checked={formData.permissions?.allowed_tabs?.includes(tab.id)}
                          onCheckedChange={(checked) => handleTabToggle(tab.id, !!checked)}
                        />
                        <label htmlFor={`edit-tab-${tab.id}`} className="text-sm cursor-pointer">
                          {tab.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account Selection */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Accessible Accounts</label>
                    <p className="text-xs text-muted-foreground">Select which trading accounts your mentor can see</p>
                  </div>
                  {accounts && accounts.length > 0 ? (
                    <div className="space-y-2">
                      {accounts.map(account => (
                        <div key={account.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-account-${account.id}`}
                            checked={formData.permissions?.allowed_accounts?.includes(account.id)}
                            onCheckedChange={(checked) => handleAccountToggle(account.id, !!checked)}
                          />
                          <label htmlFor={`edit-account-${account.id}`} className="text-sm cursor-pointer">
                            {account.alias || `MT5 ${account.mt5_login} (${account.mt5_server})`}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No accounts found.</p>
                  )}
                </div>

                {/* Data Visibility */}
                <div className="space-y-3">
                  <div className="text-sm font-medium">Data Visibility</div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Show P&L Values</label>
                      <p className="text-xs text-muted-foreground">Allow mentor to see actual dollar amounts</p>
                    </div>
                    <Switch
                      checked={formData.permissions?.show_pnl}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          permissions: { ...prev.permissions, show_pnl: checked },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Show Account Balance</label>
                      <p className="text-xs text-muted-foreground">Allow mentor to see total account equity</p>
                    </div>
                    <Switch
                      checked={formData.permissions?.show_account_balance}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          permissions: { ...prev.permissions, show_account_balance: checked },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePermissions} className="bg-brand-gradient text-white">
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card className="p-8 text-center text-muted-foreground">Loading...</Card>
        ) : myMentors.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No Mentors Yet</h3>
            <p className="text-muted-foreground mb-4">Invite a mentor to get personalized guidance on your trading.</p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              Invite Your First Mentor
            </Button>
          </Card>
        ) : (
          myMentors.map((mentorship) => (
            <Card key={mentorship.id} className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{mentorship.mentor_email || "Mentor"}</h3>
                    {getStatusBadge(mentorship.status)}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Invited {dayjs(mentorship.created_at).fromNow()}
                    </div>
                    <div className="flex items-center gap-1">
                      {mentorship.permissions.show_pnl ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <Eye className="h-3 w-3" /> P&L Visible
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <EyeOff className="h-3 w-3" /> P&L Hidden
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {mentorship.status === "active" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPermissions(mentorship)}
                      >
                        Edit Permissions
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        onClick={() => revokeAccess(mentorship.id)}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Revoke Access
                      </Button>
                    </>
                  )}
                  {mentorship.status === "revoked" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleRestoreAccess(mentorship.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Restore Access
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(mentorship.id)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
