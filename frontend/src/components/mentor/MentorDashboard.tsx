/**
 * Mentor Dashboard
 * Central hub for mentors to view and manage their mentees
 */

"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMentorships } from "@/hooks/mentor/useMentorships";
import { Users, CheckCircle2, XCircle, Clock, Eye } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useUI } from "@/contexts/UIContext";

dayjs.extend(relativeTime);

export const MentorDashboard: React.FC = () => {
  const { myMentees, isLoading, acceptInvite, rejectInvite } = useMentorships();
  const { setActiveView, setMenteeViewId } = useUI();

  const pendingInvites = myMentees.filter((m) => m.status === "pending");
  const activeMentees = myMentees.filter((m) => m.status === "active");

  const handleViewDashboard = (menteeId: string) => {
    setMenteeViewId(menteeId);
    setActiveView('menteeView');
  };

  return (
    <div className="h-full flex flex-col space-y-6 p-6 overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-brand-gradient">Mentor Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your mentees and provide guidance on their trading journey.</p>
      </div>

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Pending Invitations ({pendingInvites.length})
          </h2>
          <div className="grid gap-4">
            {pendingInvites.map((mentorship) => (
              <Card key={mentorship.id} className="p-4 border-yellow-200 bg-yellow-50/50">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{mentorship.mentee_email || "Student"}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Invited you {dayjs(mentorship.created_at).fromNow()}</p>
                    {mentorship.invite_message && (
                      <p className="text-sm mt-2 italic text-muted-foreground">"{mentorship.invite_message}"</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => acceptInvite(mentorship.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => rejectInvite(mentorship.id)}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Active Mentees */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          My Mentees ({activeMentees.length})
        </h2>

        {isLoading ? (
          <Card className="p-8 text-center text-muted-foreground">Loading...</Card>
        ) : activeMentees.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No Active Mentees</h3>
            <p className="text-muted-foreground">You'll see your students here once they invite you and you accept.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {activeMentees.map((mentorship) => (
              <Card key={mentorship.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{mentorship.mentee_email || "Student"}</h3>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div>Started {dayjs(mentorship.accepted_at).fromNow()}</div>
                      <div className="flex items-center gap-1">
                        {mentorship.permissions.show_pnl ? (
                          <span className="text-green-600">Can view P&L</span>
                        ) : (
                          <span>P&L hidden</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewDashboard(mentorship.mentee_id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Dashboard
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
