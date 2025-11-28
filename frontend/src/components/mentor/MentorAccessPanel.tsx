/**
 * Mentor Access Panel
 * UI for managing "Ghost Access" links
 */

"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMentorMode, CreateTokenInput } from "@/hooks/mentor/useMentorMode";
import { 
  Users, 
  Plus, 
  Copy, 
  Clock, 
  Shield, 
  Eye, 
  EyeOff, 
  Trash2, 
  Ban,
  CheckCircle2
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useToast } from "@/components/ui/use-toast";

dayjs.extend(relativeTime);

export const MentorAccessPanel: React.FC = () => {
  const { tokens, isLoading, generateToken, revokeToken, deleteToken } = useMentorMode();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState<CreateTokenInput>({
    label: "",
    show_pnl: false,
    show_account_balance: false,
    expires_in_hours: 48,
  });

  const handleGenerate = async () => {
    const result = await generateToken(formData);
    if (result) {
      setIsDialogOpen(false);
      setFormData({
        label: "",
        show_pnl: false,
        show_account_balance: false,
        expires_in_hours: 48,
      });
    }
  };

  const copyLink = (token: string) => {
    // In a real app, this would be the actual URL to the shared page
    const link = `${window.location.origin}/mentor/access/${token}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link Copied", description: "Share this URL with your mentor." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Active Access Links
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage temporary access links for your mentors.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-gradient text-white">
              <Plus className="h-4 w-4 mr-2" />
              Generate New Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grant Mentor Access</DialogTitle>
              <DialogDescription>
                Create a secure, temporary link for your mentor to view your journal.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Label (Optional)</label>
                <Input 
                  placeholder="e.g., Coach Mike" 
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Duration</label>
                <Select 
                  value={String(formData.expires_in_hours)} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, expires_in_hours: Number(val) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 Hours</SelectItem>
                    <SelectItem value="48">48 Hours</SelectItem>
                    <SelectItem value="168">7 Days</SelectItem>
                    <SelectItem value="720">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Show P&L Values</label>
                    <p className="text-xs text-muted-foreground">Allow mentor to see actual dollar amounts</p>
                  </div>
                  <Switch 
                    checked={formData.show_pnl}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_pnl: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Show Account Balance</label>
                    <p className="text-xs text-muted-foreground">Allow mentor to see total account equity</p>
                  </div>
                  <Switch 
                    checked={formData.show_account_balance}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_account_balance: checked }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleGenerate} className="bg-brand-gradient text-white">Generate Link</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card className="p-8 text-center text-muted-foreground">Loading...</Card>
        ) : tokens.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No Active Links</h3>
            <p className="text-muted-foreground mb-4">
              You haven't shared your journal with anyone yet.
            </p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              Create First Link
            </Button>
          </Card>
        ) : (
          tokens.map((token) => {
            const isExpired = new Date(token.expires_at) < new Date();
            const isActive = token.is_active && !isExpired;

            return (
              <Card key={token.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{token.label || "Mentor Access"}</h3>
                    {isActive ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {isActive ? (
                        <span>Expires {dayjs(token.expires_at).fromNow()}</span>
                      ) : (
                        <span>Expired {dayjs(token.expires_at).fromNow()}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {token.show_pnl ? (
                        <span className="flex items-center gap-1 text-green-600"><Eye className="h-3 w-3" /> P&L Visible</span>
                      ) : (
                        <span className="flex items-center gap-1"><EyeOff className="h-3 w-3" /> P&L Hidden</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  {isActive && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => copyLink(token.token)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        onClick={() => revokeToken(token.id)}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Revoke
                      </Button>
                    </>
                  )}
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deleteToken(token.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
