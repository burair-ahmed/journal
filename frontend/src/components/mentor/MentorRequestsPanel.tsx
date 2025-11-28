/**
 * Mentor Requests Panel
 * UI for users to submit questions/trades to their mentor
 */

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { useMentorRequests, CreateRequestInput } from "@/hooks/mentor/useMentorRequests";
import { useMentorships } from "@/hooks/mentor/useMentorships";
import { MessageCircle, Plus, Clock, CheckCircle2, Archive, User } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const MentorRequestsPanel: React.FC = () => {
  const { requests, isLoading, createRequest, updateRequestStatus } = useMentorRequests();
  const { myMentors } = useMentorships();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateRequestInput>>({
    question: "",
    mentor_id: "",
  });

  // Filter for active mentors only
  const activeMentors = myMentors.filter((m) => m.status === "active");

  const handleSubmit = async () => {
    if (!formData.question?.trim() || !formData.mentor_id) {
      return;
    }

    const result = await createRequest(formData as CreateRequestInput);
    if (result) {
      setIsDialogOpen(false);
      setFormData({ question: "", mentor_id: "" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reviewed": return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Reviewed</Badge>;
      case "archived": return <Badge variant="secondary">Archived</Badge>;
      default: return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Ask a Mentor
          </h2>
          <p className="text-sm text-muted-foreground">
            Submit questions or specific trades for review.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-gradient text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ask a Question</DialogTitle>
              <DialogDescription>
                Select a mentor and describe your question or situation.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Mentor *</label>
                {activeMentors.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-md text-center">
                    You don't have any active mentors yet. Invite a mentor from the "My Mentors" tab first.
                  </div>
                ) : (
                  <Select
                    value={formData.mentor_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, mentor_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a mentor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {activeMentors.map((mentor) => (
                        <SelectItem key={mentor.id} value={mentor.mentor_id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {mentor.mentor_email || 'Mentor'}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Question / Context *</label>
                <Textarea 
                  placeholder="e.g., I'm struggling with entry timing on this setup..." 
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  rows={4}
                />
              </div>
              
              <div className="text-xs text-muted-foreground">
                * You can link specific trades in the future updates.
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleSubmit} 
                  className="bg-brand-gradient text-white"
                  disabled={!formData.question?.trim() || !formData.mentor_id || activeMentors.length === 0}
                >
                  Submit Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card className="p-8 text-center text-muted-foreground">Loading requests...</Card>
        ) : requests.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No Requests Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start a conversation by asking your mentor a question.
            </p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              Ask Question
            </Button>
          </Card>
        ) : (
          requests.map((req) => (
            <Card key={req.id} className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {getStatusBadge(req.status)}
                    {req.mentor_email && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        To: {req.mentor_email}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {dayjs(req.created_at).fromNow()}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1">Your Question:</p>
                  <p className="text-sm">{req.question}</p>
                  {req.trades && (
                    <div className="mt-2 text-xs bg-muted/50 p-2 rounded inline-block">
                      Linked Trade: <span className="font-medium">{req.trades.symbol}</span>
                    </div>
                  )}
                  {req.mentor_response && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-xs font-semibold text-green-800 mb-1">Mentor's Response:</p>
                      <p className="text-sm text-green-900">{req.mentor_response}</p>
                      {req.responded_at && (
                        <p className="text-xs text-green-700 mt-1">
                          Responded {dayjs(req.responded_at).fromNow()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                {req.status !== 'archived' && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    title="Archive"
                    onClick={() => updateRequestStatus(req.id, 'archived')}
                  >
                    <Archive className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
