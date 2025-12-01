/**
 * Mentor Assignments Panel
 * UI for users to view and manage tasks assigned by their mentor
 */

"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMenteeAssignments, SubmitAssignmentInput } from "@/hooks/mentor/useMentorAssignments";
import { ClipboardList, CheckCircle2, Circle, Clock, Calendar, Send, ExternalLink } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const MentorAssignmentsPanel: React.FC = () => {
  const { assignments, isLoading, submitAssignment, updateStatus } = useMenteeAssignments();
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [submissionData, setSubmissionData] = useState<SubmitAssignmentInput>({
    submission_text: "",
    submission_url: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "reviewed": return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "submitted": return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
      case "in_progress": return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reviewed": return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Reviewed</Badge>;
      case "submitted": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Submitted</Badge>;
      case "in_progress": return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">In Progress</Badge>;
      default: return <Badge variant="outline">Assigned</Badge>;
    }
  };

  const handleOpenSubmit = (id: string) => {
    setSelectedAssignment(id);
    setSubmissionData({ submission_text: "", submission_url: "" });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) return;
    
    const result = await submitAssignment(selectedAssignment, submissionData);
    if (result) {
      setIsDialogOpen(false);
      setSelectedAssignment(null);
      setSubmissionData({ submission_text: "", submission_url: "" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          My Assignments
        </h2>
        <p className="text-sm text-muted-foreground">
          Tasks and goals assigned by your mentor.
        </p>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card className="p-8 text-center text-muted-foreground">Loading assignments...</Card>
        ) : assignments.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No Assignments</h3>
            <p className="text-muted-foreground">
              You're all caught up! Wait for your mentor to assign new tasks.
            </p>
          </Card>
        ) : (
          assignments.map((task) => (
            <Card key={task.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getStatusIcon(task.status)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h3 className="font-semibold text-lg">{task.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(task.status)}
                        {task.due_date && (
                          <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Due {dayjs(task.due_date).format("MMM DD")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {task.description && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-md text-sm">
                      <p className="font-medium text-xs text-muted-foreground mb-1">INSTRUCTIONS</p>
                      {task.description}
                    </div>
                  )}

                  {/* Submission Details Display */}
                  {(task.status === 'submitted' || task.status === 'reviewed') && task.submission_text && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
                      <p className="font-medium text-xs text-blue-700 mb-1">YOUR SUBMISSION</p>
                      <p className="text-blue-900">{task.submission_text}</p>
                      {task.submission_url && (
                        <a 
                          href={task.submission_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline mt-2 text-xs"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Attachment
                        </a>
                      )}
                    </div>
                  )}

                  {/* Feedback Display */}
                  {task.status === 'reviewed' && task.feedback && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-md text-sm">
                      <p className="font-medium text-xs text-green-700 mb-1">MENTOR FEEDBACK</p>
                      <p className="text-green-900">{task.feedback}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-4">
                    {(task.status === 'assigned' || task.status === 'pending') && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateStatus(task.id, 'in_progress')}
                      >
                        Start Task
                      </Button>
                    )}
                    
                    {task.status === 'in_progress' && (
                      <Button 
                        size="sm" 
                        className="bg-brand-gradient text-white"
                        onClick={() => handleOpenSubmit(task.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark as Done
                      </Button>
                    )}

                    {task.status === 'submitted' && (
                      <span className="text-xs text-blue-600 flex items-center gap-1 font-medium bg-blue-50 px-2 py-1 rounded">
                        <Clock className="h-3 w-3" />
                        Waiting for review
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Submission Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              Share your progress with your mentor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Submission Details</label>
              <Textarea
                placeholder="Describe what you did, key takeaways, or any questions..."
                value={submissionData.submission_text}
                onChange={(e) => setSubmissionData(prev => ({ ...prev, submission_text: e.target.value }))}
                rows={5}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Link (Optional)</label>
              <Input
                placeholder="https://..."
                value={submissionData.submission_url}
                onChange={(e) => setSubmissionData(prev => ({ ...prev, submission_url: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Link to a trade, screenshot, or external document.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-brand-gradient text-white"
                disabled={!submissionData.submission_text?.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
