"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Edit2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { updateUserProfile } from "@/lib/profile/updateProfile";
import type { User, ProfileFormData } from "@/lib/profile/types";
import { AvatarControl } from "./AvatarControl";
import { IdentityHeader } from "./IdentityHeader";
import { IdentityForm } from "./IdentityForm";
import { ProfileActions } from "./ProfileActions";

interface ProfileContainerProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const ProfileContainer: React.FC<ProfileContainerProps> = ({ user, setUser }) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name ?? "",
    username: user?.username ?? "",
    phone: user?.phone ?? "",
    bio: user?.bio ?? "",
  });

  // Reset form when user changes
  useEffect(() => {
    setFormData({
      name: user?.name ?? "",
      username: user?.username ?? "",
      phone: user?.phone ?? "",
      bio: user?.bio ?? "",
    });
    setIsEditMode(false);
    setHasChanges(false);
  }, [user]);

  // Detect changes
  useEffect(() => {
    if (!user) return;
    const changed =
      formData.name !== (user.name ?? "") ||
      formData.username !== (user.username ?? "") ||
      formData.phone !== (user.phone ?? "") ||
      formData.bio !== (user.bio ?? "");
    setHasChanges(changed);
  }, [formData, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      const result = await updateUserProfile(user.id, formData);

      if (result.error) {
        throw result.error;
      }

      if (result.data) {
        setUser((prev) => (prev ? { ...prev, ...result.data } : prev));
        toast({
          title: "Profile updated",
          description: "Your profile changes have been saved successfully.",
        });
        setIsEditMode(false);
        setHasChanges(false);
      }
    } catch (err: any) {
      toast({
        title: "Error updating profile",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name ?? "",
      username: user?.username ?? "",
      phone: user?.phone ?? "",
      bio: user?.bio ?? "",
    });
    setIsEditMode(false);
    setHasChanges(false);
  };

  const handleAvatarUploadComplete = (url: string) => {
    setUser((prev) => (prev ? { ...prev, profile_picture: url } : prev));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="p-6 w-full flex justify-center"
    >
      <Card
        className="max-w-5xl w-full bg-sidebar/40 backdrop-blur-[12px] border border-sidebar-border/30
          shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(255,255,255,0.05)]
          before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px]
          before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)]
          after:content-[''] after:absolute after:top-0 after:left-0 after:w-[1px] after:h-full
          after:bg-[linear-gradient(180deg,rgba(255,255,255,0.4),transparent,rgba(255,255,255,0.1))]
          p-6 md:p-10 relative"
      >
        {/* Edit Button */}
        {!isEditMode && (
          <motion.button
            onClick={() => setIsEditMode(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-6 right-6 p-2 rounded-full bg-brand-gradient text-white 
              shadow-lg hover:brightness-110 transition-all z-10"
            aria-label="Edit profile"
          >
            <Edit2 className="w-5 h-5" />
          </motion.button>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left Column: Avatar & Identity Header */}
          <div className="col-span-1 flex flex-col items-center gap-6">
            <AvatarControl
              avatarUrl={user.profile_picture}
              userName={user.name || ""}
              userEmail={user.email}
              userId={user.id}
              onUploadComplete={handleAvatarUploadComplete}
            />
            <IdentityHeader user={user} showBadges={false} />
          </div>

          {/* Right Column: Form & Actions */}
          <div className="md:col-span-2 space-y-6">
            <IdentityForm
              formData={formData}
              userEmail={user.email}
              isEditMode={isEditMode}
              onChange={handleInputChange}
            />

            <ProfileActions
              isEditMode={isEditMode}
              hasChanges={hasChanges}
              saving={saving}
              onCancel={handleCancel}
              onSave={handleProfileUpdate}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Loading Skeleton Component
export const ProfileLoadingSkeleton: React.FC = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-44 rounded-3xl bg-sidebar/30 animate-pulse" />
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-8 w-2/3 rounded-2xl animate-pulse" />
          <Skeleton className="h-12 rounded-2xl animate-pulse" />
          <Skeleton className="h-12 rounded-2xl animate-pulse" />
          <Skeleton className="h-32 rounded-3xl animate-pulse" />
        </div>
      </div>
    </div>
  );
};
