/**
 * Mentee Assignments Tab
 * Allows mentors to create and track assignments for their mentees
 */

"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMentorAssignments, CreateAssignmentInput } from "@/hooks/mentor/useMentorAssignments";
import { useMentorships } from "@/hooks/mentor/useMentorships";
import { ClipboardList, Plus, Calendar, User, CheckCircle2, Clock, FileText } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const MenteeAssignmentsTab: React.FC = () => {
  const { assignments, isLoading, createAssignment, updateAssignment } = useMentorAssignments();
  const { myMentees } = useMentorships();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateAssignmentInput>>({
    mentee_id: "",
    title: "",
    description: "",
    due_date: "",
  });

  // Filter for active mentees only
  const activeMentees = myMentees.filter((m) => m.status === "active");

  const handleSubmit = async () => {
    if (!formData.mentee_id || !formData.title?.trim() || !formData.description?.trim()) {
      return;
    }

    const result = await createAssignment(formData as CreateAssignmentInput);
    if (result) {
      setIsDialogOpen(false);
      setFormData({ mentee_id: "", title: "", description: "", due_date: "" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reviewed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Reviewed</Badge>;
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Submitted</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">In Progress</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;
      default:
        return <Badge variant="outline">Assigned</Badge>;
    }
  };

  const pendingAssignments = assignments.filter((a) => a.status === "assigned" || a.status === "in_progress" || a.status === "pending");
  const submittedAssignments = assignments.filter((a) => a.status === "submitted");
  const reviewedAssignments = assignments.filter((a) => a.status === "reviewed");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Mentee Assignments
          </h2>
          <p className="text-sm text-muted-foreground">
            Create and track assignments for your mentees.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-gradient text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Assignment</DialogTitle>
              <DialogDescription>
                Assign a task or exercise to one of your mentees.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Mentee *</label>
                {activeMentees.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-md text-center">
                    You don't have any active mentees yet.
                  </div>
                ) : (
                  <Select
                    value={formData.mentee_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, mentee_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a mentee..." />
                    </SelectTrigger>
                    <SelectContent>
                      {activeMentees.map((mentee) => (
                        <SelectItem key={mentee.id} value={mentee.mentee_id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {mentee.mentee_email || 'Mentee'}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Assignment Title *</label>
                <Input
                  placeholder="e.g., Analyze 10 winning trades"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description *</label>
                <Textarea
                  placeholder="Provide detailed instructions for the assignment..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Due Date (Optional)</label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-brand-gradient text-white"
                  disabled={!formData.mentee_id || !formData.title?.trim() || !formData.description?.trim() || activeMentees.length === 0}
                >
                  Create Assignment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending & In Progress */}
      {pendingAssignments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-yellow-700">
            Active ({pendingAssignments.length})
          </h3>
          <div className="grid gap-3">
            {pendingAssignments.map((assignment) => (
              <Card key={assignment.id} className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getStatusBadge(assignment.status)}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {assignment.mentee_email}
                      </Badge>
                      {assignment.due_date && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {dayjs(assignment.due_date).format("MMM D, YYYY")}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold mb-1">{assignment.title}</h4>
                    <p className="text-sm text-muted-foreground">{assignment.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Created {dayjs(assignment.created_at).fromNow()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Submitted Assignments */}
      {submittedAssignments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-blue-700">
            Awaiting Review ({submittedAssignments.length})
          </h3>
          <div className="grid gap-3">
            {submittedAssignments.map((assignment) => (
              <Card key={assignment.id} className="p-4 border-blue-200 bg-blue-50/30">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getStatusBadge(assignment.status)}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {assignment.mentee_email}
                      </Badge>
                      {assignment.submitted_at && (
                        <span className="text-xs text-muted-foreground">
                          Submitted {dayjs(assignment.submitted_at).fromNow()}
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold mb-1">{assignment.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{assignment.description}</p>
                    
                    {assignment.submission_text && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-xs font-semibold text-blue-800 mb-1">Submission:</p>
                        <p className="text-sm text-blue-900">{assignment.submission_text}</p>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => updateAssignment(assignment.id, { status: "reviewed" })}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Reviewed
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reviewed Assignments */}
      {reviewedAssignments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-green-700">
            Reviewed ({reviewedAssignments.length})
          </h3>
          <div className="grid gap-3">
            {reviewedAssignments.map((assignment) => (
              <Card key={assignment.id} className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getStatusBadge(assignment.status)}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {assignment.mentee_email}
                      </Badge>
                    </div>
                    <h4 className="font-semibold mb-1">{assignment.title}</h4>
                    <p className="text-sm text-muted-foreground">{assignment.description}</p>
                    {assignment.reviewed_at && (
                      <p className="text-xs text-green-700 mt-2">
                        Reviewed {dayjs(assignment.reviewed_at).fromNow()}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {isLoading ? (
        <Card className="p-8 text-center text-muted-foreground">Loading assignments...</Card>
      ) : assignments.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No Assignments Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first assignment to help guide your mentees.
          </p>
          {activeMentees.length > 0 && (
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          )}
        </Card>
      ) : null}
    </div>
  );
};
