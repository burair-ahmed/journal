/**
 * Mentee Questions Tab
 * Displays all questions from mentees for the mentor to review and respond
 */

"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMentorRequestsForMentor } from "@/hooks/mentor/useMentorRequests";
import { MessageCircle, Clock, Send, User } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const MenteeQuestionsTab: React.FC = () => {
  const { requests, isLoading, respondToRequest } = useMentorRequestsForMentor();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRespond = async () => {
    if (!selectedRequest || !response.trim()) return;

    const result = await respondToRequest(selectedRequest, response);
    if (result) {
      setIsDialogOpen(false);
      setResponse("");
      setSelectedRequest(null);
    }
  };

  const openResponseDialog = (requestId: string) => {
    setSelectedRequest(requestId);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reviewed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Reviewed</Badge>;
      case "archived":
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const reviewedRequests = requests.filter((r) => r.status === "reviewed");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Mentee Questions
        </h2>
        <p className="text-sm text-muted-foreground">
          Review and respond to questions from your mentees.
        </p>
      </div>

      {/* Pending Questions */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-yellow-700 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingRequests.length})
          </h3>
          <div className="grid gap-3">
            {pendingRequests.map((req) => (
              <Card key={req.id} className="p-4 border-yellow-200 bg-yellow-50/30">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getStatusBadge(req.status)}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        From: {(req as any).mentee_email || "Mentee"}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {dayjs(req.created_at).fromNow()}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">Question:</p>
                    <p className="text-sm">{req.question}</p>
                    {req.trades && (
                      <div className="mt-2 text-xs bg-muted/50 p-2 rounded inline-block">
                        Linked Trade: <span className="font-medium">{req.trades.symbol}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="bg-brand-gradient text-white"
                    onClick={() => openResponseDialog(req.id)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Respond
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reviewed Questions */}
      {reviewedRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-green-700">
            Reviewed ({reviewedRequests.length})
          </h3>
          <div className="grid gap-3">
            {reviewedRequests.map((req) => (
              <Card key={req.id} className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getStatusBadge(req.status)}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        From: {(req as any).mentee_email || "Mentee"}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {dayjs(req.created_at).fromNow()}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">Question:</p>
                    <p className="text-sm">{req.question}</p>
                    {req.mentor_response && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-xs font-semibold text-green-800 mb-1">Your Response:</p>
                        <p className="text-sm text-green-900">{req.mentor_response}</p>
                        {req.responded_at && (
                          <p className="text-xs text-green-700 mt-1">
                            Responded {dayjs(req.responded_at).fromNow()}
                          </p>
                        )}
                      </div>
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
        <Card className="p-8 text-center text-muted-foreground">Loading questions...</Card>
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No Questions Yet</h3>
          <p className="text-muted-foreground">
            Your mentees haven't asked any questions yet.
          </p>
        </Card>
      ) : null}

      {/* Response Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Question</DialogTitle>
            <DialogDescription>
              Provide guidance and feedback to your mentee.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Response</label>
              <Textarea
                placeholder="Share your insights and guidance..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={6}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRespond}
                className="bg-brand-gradient text-white"
                disabled={!response.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Response
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
