/**
 * Notifications Popover
 * Displays mentor invites, assignments, and other notifications
 */

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/hooks/useNotifications";
import { useMentorships } from "@/hooks/mentor/useMentorships";
import { Bell, Users, ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);

export const NotificationsPopover: React.FC = () => {
  const { notifications, unreadCount, isLoading, refetch } = useNotifications();
  const { acceptInvite, rejectInvite } = useMentorships();
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case "mentor_invite":
        return <Users className="h-4 w-4 text-primary" />;
      case "assignment":
        return <ClipboardList className="h-4 w-4 text-secondary" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleAcceptInvite = async (mentorshipId: string) => {
    await acceptInvite(mentorshipId);
    refetch();
  };

  const handleRejectInvite = async (mentorshipId: string) => {
    await rejectInvite(mentorshipId);
    refetch();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent hover:bg-accent text-white text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="border-b p-4 bg-gradient-to-r from-primary/10 to-secondary/10">
          <h3 className="font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {unreadCount} new
              </Badge>
            )}
          </h3>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">All caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex gap-3">
                    <div className="mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {dayjs(notification.created_at).fromNow()}
                        </p>
                      </div>

                      {/* Action buttons for mentor invites */}
                      {notification.type === "mentor_invite" && notification.metadata && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
                            onClick={() => handleAcceptInvite(notification.metadata.id)}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-destructive hover:bg-destructive/10"
                            onClick={() => handleRejectInvite(notification.metadata.id)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      )}

                      {/* View button for assignments */}
                      {notification.type === "assignment" && notification.link && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(notification.link!)}
                        >
                          View Assignment
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
