"use client";

import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Crown, Activity } from "lucide-react";
import type { User } from "@/lib/profile/types";

interface IdentityHeaderProps {
  user: User;
  showBadges?: boolean;
}

export const IdentityHeader: React.FC<IdentityHeaderProps> = ({ user, showBadges = false }) => {
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useTransform(tiltY, (v) => v / 12);
  const rotateY = useTransform(tiltX, (v) => -v / 12);

  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown";

  return (
    <motion.div
      style={{ rotateX, rotateY }}
      onPointerMove={(e) => {
        const rect = (e.target as Element).closest(".tilt-zone")?.getBoundingClientRect();
        if (!rect) return;
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        tiltX.set(px - rect.width / 2);
        tiltY.set(py - rect.height / 2);
      }}
      onPointerLeave={() => {
        tiltX.set(0);
        tiltY.set(0);
      }}
      className="tilt-zone text-center space-y-4"
    >
      {/* User Name */}
      <div>
        <h1 className="text-3xl font-semibold text-sidebar-foreground tracking-tight">
          {user.name || "Unnamed User"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">@{user.username || "username"}</p>
      </div>

      {/* Join Date */}
      <p className="text-xs text-muted-foreground/50">Joined {joinDate}</p>

      {/* Optional Identity Badges */}
      {showBadges && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 text-primary-foreground flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </Badge>
          <Badge
            variant="outline"
            className="bg-gradient-to-r from-accent/10 to-secondary/10 border-accent/30 text-accent-foreground flex items-center gap-1"
          >
            <Crown className="w-3 h-3" />
            Pro
          </Badge>
          <Badge
            variant="outline"
            className="bg-gradient-to-r from-profit/10 to-profit/5 border-profit/30 text-profit-foreground flex items-center gap-1"
          >
            <Activity className="w-3 h-3" />
            Active
          </Badge>
        </div>
      )}
    </motion.div>
  );
};
