"use client";

import React from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { ProfileContainer, ProfileLoadingSkeleton } from "@/components/user-profile/ProfileContainer";

/**
 * UserProfile Component
 * 
 * Premium institutional-grade user identity module with Bloomberg-level polish.
 * This component serves as a clean orchestrator that delegates all functionality
 * to modular subcomponents.
 * 
 * Architecture:
 * - ProfileContainer: Main orchestrator with state management
 * - IdentityHeader: Executive identity panel with user info and badges
 * - AvatarControl: Premium avatar upload module with validation
 * - IdentityForm: Institutional KYC-grade form with two-column layout
 * - ProfileActions: CTA button row with shimmer animations
 * 
 * Business Logic:
 * - /lib/profile/updateProfile.ts: Profile update logic
 * - /lib/profile/uploadAvatar.ts: Avatar upload and validation
 * - /lib/profile/types.ts: TypeScript interfaces
 */
export const UserProfile: React.FC = () => {
  const { user, setUser, loading } = useAuthContext();

  // Loading state
  if (loading) {
    return <ProfileLoadingSkeleton />;
  }

  // No user state
  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No user found. Please log in to view your profile.</p>
      </div>
    );
  }

  // Render profile container with all subcomponents
  return <ProfileContainer user={user} setUser={setUser} />;
};
