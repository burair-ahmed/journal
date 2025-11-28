/**
 * Mentor Assignments Panel
 * UI for users to view and manage tasks assigned by their mentor
 */

"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMentorAssignments } from "@/hooks/mentor/useMentorAssignments";
import { ClipboardList, CheckCircle2, Circle, Clock, Calendar } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const MentorAssignmentsPanel: React.FC = () => {
  const { assignments, isLoading, updateAssignmentStatus } = useMentorAssignments();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "in_progress": return <Clock className="h-5 w-5 text-blue-500" />;
      default: return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Assignments
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
                  <div className="flex justify-between items-start">
                    <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h3>
                    {task.due_date && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due {dayjs(task.due_date).format("MMM DD")}
                      </Badge>
                    )}
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2 mt-4">
                    {task.status === 'pending' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateAssignmentStatus(task.id, 'in_progress')}
                      >
                        Start Task
                      </Button>
                    )}
                    {task.status === 'in_progress' && (
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => updateAssignmentStatus(task.id, 'completed')}
                      >
                        Mark Complete
                      </Button>
                    )}
                    {task.status === 'completed' && (
                      <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                        Completed {dayjs(task.completed_at).fromNow()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
