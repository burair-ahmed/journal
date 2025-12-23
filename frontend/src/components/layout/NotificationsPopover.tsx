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
import { Bell, Users, ClipboardList, CheckCircle2, XCircle, MessageCircle, Check } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

export const NotificationsPopover: React.FC = () => {
  const { notifications, unreadCount, isLoading, refetch, markAsRead, markAllAsRead } = useNotifications();
  const { acceptInvite, rejectInvite } = useMentorships();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case "mentor_invite":
        return <Users className="h-4 w-4 text-primary" />;
      case "assignment":
        return <ClipboardList className="h-4 w-4 text-secondary" />;
      case "assignment_submission":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "assignment_review":
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case "question":
        return <MessageCircle className="h-4 w-4 text-yellow-500" />;
      case "question_response":
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleAcceptInvite = async (e: React.MouseEvent, notificationId: string, mentorshipId: string) => {
    e.stopPropagation();
    await acceptInvite(mentorshipId);
    markAsRead(notificationId);
    refetch();
  };

  const handleRejectInvite = async (e: React.MouseEvent, notificationId: string, mentorshipId: string) => {
    e.stopPropagation();
    await rejectInvite(mentorshipId);
    markAsRead(notificationId);
    refetch();
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between border-b p-4 bg-gradient-to-r from-primary/10 to-secondary/10">
          <h3 className="font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-auto bg-background/50 hover:bg-background/80 transition-colors">
                {unreadCount} new
              </Badge>
            )}
          </h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllAsRead()} 
              className="h-7 px-2 text-xs hover:bg-background/50"
            >
              <Check className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-[80vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">All caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 transition-colors cursor-pointer relative group",
                    !notification.is_read && "bg-muted/20 border-l-2 border-l-primary"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className="mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <p className={cn("text-sm font-medium leading-none", !notification.is_read && "text-foreground")}>
                            {notification.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                          {dayjs(notification.created_at).fromNow()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>

                      {/* Action buttons for mentor invites */}
                      {notification.type === "mentor_invite" && notification.metadata?.mentorship_id && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            className="h-7 text-xs flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={(e) => handleAcceptInvite(e, notification.id, notification.metadata.mentorship_id)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs flex-1 text-destructive hover:bg-destructive/10"
                            onClick={(e) => handleRejectInvite(e, notification.id, notification.metadata.mentorship_id)}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  {!notification.is_read && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-full" 
                            title="Mark as read"
                            onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                        >
                            <span className="h-2 w-2 rounded-full bg-primary" />
                        </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
