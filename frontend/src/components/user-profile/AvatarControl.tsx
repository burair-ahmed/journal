"use client";

import React, { useRef, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Upload, Loader2 } from "lucide-react";
import { uploadUserAvatar } from "@/lib/profile/uploadAvatar";
import { useToast } from "@/components/ui/use-toast";

interface AvatarControlProps {
  avatarUrl: string | null;
  userName: string;
  userEmail: string;
  userId: string;
  onUploadComplete: (url: string) => void;
}

export const AvatarControl: React.FC<AvatarControlProps> = ({
  avatarUrl,
  userName,
  userEmail,
  userId,
  onUploadComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const result = await uploadUserAvatar(userId, file);

      if (result.error) {
        throw result.error;
      }

      if (result.publicUrl) {
        setPreview(result.publicUrl);
        onUploadComplete(result.publicUrl);
        toast({
          title: "Profile picture updated",
          description: "Avatar successfully uploaded.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-4">
      <motion.button
        type="button"
        onClick={() => !uploading && fileInputRef.current?.click()}
        aria-label="Upload profile picture"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
        disabled={uploading}
        className="relative p-[2px] rounded-full bg-brand-gradient shadow-[0_6px_30px_rgba(217,70,239,0.25)] 
          hover:shadow-[0_8px_40px_rgba(217,70,239,0.35)] transition-shadow duration-300"
      >
        <div className="rounded-full w-40 h-40 bg-sidebar overflow-hidden border border-sidebar-border">
          <Avatar className="w-full h-full rounded-full">
            <AvatarImage src={preview || undefined} alt="User Avatar" />
            <AvatarFallback className="rounded-full bg-brand-gradient text-white text-3xl">
              {userName?.charAt(0) || userEmail.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Upload Overlay */}
        <div
          className="absolute inset-0 rounded-full bg-black/60 opacity-0 hover:opacity-100 
            transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-white" />
          )}
        </div>

        {/* Shimmer Effect */}
        <span
          className="absolute inset-0 rounded-full bg-[linear-gradient(120deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0)_100%)] 
            animate-[shimmer_2.5s_infinite] bg-[length:200%_100%] pointer-events-none"
        />
      </motion.button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};
