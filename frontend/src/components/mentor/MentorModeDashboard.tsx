/**
 * Mentor Mode Dashboard
 * Central hub for mentorship features
 */

"use client";

import React from "react";
import { MentorAccessPanel } from "./MentorAccessPanel";
import { MentorRequestsPanel } from "./MentorRequestsPanel";
import { MentorAssignmentsPanel } from "./MentorAssignmentsPanel";
import { MenteeManagementPanel } from "./MenteeManagementPanel";
import { MentorDashboard } from "./MentorDashboard";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, ClipboardList, FileText, UserCog, GraduationCap } from "lucide-react";
import { useMentorships } from "@/hooks/mentor/useMentorships";

export const MentorModeDashboard: React.FC = () => {
  const { myMentees, isLoading } = useMentorships();
  // Show "My Mentees" tab if user has ANY mentees (including pending invites)
  const isMentor = myMentees.length > 0;

  console.log('MentorModeDashboard - myMentees:', myMentees, 'isMentor:', isMentor);

  return (
    <div className="h-full flex flex-col space-y-6 p-6 overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-brand-gradient">
          Mentorship
        </h1>
        <p className="text-muted-foreground mt-1">
          {isMentor ? "Manage your mentees and your own mentors." : "Collaborate with your mentor and get personalized guidance."}
        </p>
      </div>

      <Tabs defaultValue="my-mentors" className="w-full">
        <TabsList className={`grid w-full ${isMentor ? 'grid-cols-5' : 'grid-cols-4'} max-w-3xl`}>
          <TabsTrigger value="my-mentors" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            My Mentors
          </TabsTrigger>
          {isMentor && (
            <TabsTrigger value="my-mentees" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              My Mentees
            </TabsTrigger>
          )}
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Ask Mentor
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="legacy" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Legacy Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-mentors" className="mt-6">
          <MenteeManagementPanel />
        </TabsContent>

        {isMentor && (
          <TabsContent value="my-mentees" className="mt-6">
            <MentorDashboard />
          </TabsContent>
        )}

        <TabsContent value="requests" className="mt-6">
          <MentorRequestsPanel />
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <MentorAssignmentsPanel />
        </TabsContent>

        <TabsContent value="legacy" className="mt-6">
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Magic links are now legacy. Use the "My Mentors" tab to invite mentors by email for persistent access.
              </p>
            </div>
            <MentorAccessPanel />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
