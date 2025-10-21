"use client";

import React, { useRef, useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Loader2 } from "lucide-react";
import clsx from "clsx";

export const UserProfile: React.FC = () => {
  const { user, setUser, loading } = useAuthContext();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name ?? "",
    username: user?.username ?? "",
    phone: user?.phone ?? "",
    bio: user?.bio ?? "",
  });
  const [preview, setPreview] = useState<string | null>(user?.profile_picture || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useTransform(tiltY, (v) => v / 12);
  const rotateY = useTransform(tiltX, (v) => -v / 12);

  useEffect(() => {
    setFormData({
      name: user?.name ?? "",
      username: user?.username ?? "",
      phone: user?.phone ?? "",
      bio: user?.bio ?? "",
    });
    setPreview(user?.profile_picture || null);
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-44 rounded-3xl bg-gradient-to-r from-[#0B0D29]/30 via-[#17193C]/25 to-[#0B0D29]/30 animate-pulse" />
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-8 w-2/3 rounded-2xl animate-pulse" />
            <Skeleton className="h-12 rounded-2xl animate-pulse" />
            <Skeleton className="h-12 rounded-2xl animate-pulse" />
            <Skeleton className="h-32 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <div className="p-8 text-white/70">No user found.</div>;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      const { data, error } = await supabase
        .from("users")
        .update(formData)
        .eq("id", user.id)
        .select()
        .single();
      if (error) throw error;
      setUser((prev) => (prev ? { ...prev, ...data } : prev));
      toast({ title: "Profile updated", description: "Profile changes saved." });
    } catch (err: any) {
      toast({ title: "Error updating", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const filePath = `${user.id}/${file.name}`;
    try {
      const { error: uploadError } = await supabase.storage.from("profile_pictures").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("profile_pictures").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      const { error: updateError } = await supabase.from("users").update({ profile_picture: publicUrl }).eq("id", user.id);
      if (updateError) throw updateError;
      setPreview(publicUrl);
      setUser((prev) => (prev ? { ...prev, profile_picture: publicUrl } : prev));
      toast({ title: "Profile picture updated", description: "Avatar successfully uploaded." });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="p-6 w-full flex justify-center"
    >
      <Card className="max-w-5xl w-full bg-[#14163866] backdrop-blur-[12px] border border-[#141638]/30
  shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(255,255,255,0.05),inset_0_0_32px_16px_#141638]
  before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px]
  before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)]
  after:content-[''] after:absolute after:top-0 after:left-0 after:w-[1px] after:h-full
  after:bg-[linear-gradient(180deg,rgba(255,255,255,0.4),transparent,rgba(255,255,255,0.1))] p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Avatar Section */}
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
          className="tilt-zone relative col-span-1 flex flex-col items-center gap-6"
        >
          <motion.button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload profile picture"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="relative p-[2px] rounded-full bg-gradient-to-br from-[#7C3AED] via-[#DB2777] to-[#7C3AED] shadow-[0_6px_30px_rgba(124,58,237,0.25)]"
          >
            <div className="rounded-full w-40 h-40 bg-gradient-to-br from-[#0B0D29] to-[#17193C] overflow-hidden border border-[rgba(255,255,255,0.15)]">
              <Avatar className="w-full h-full rounded-full">
                <AvatarImage src={preview || undefined} alt="User Avatar" />
                <AvatarFallback className="rounded-full bg-gradient-to-r from-[#7C3AED] to-[#DB2777] text-white text-3xl">
                  {user.name?.charAt(0) || user.email.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
          </motion.button>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          <div className="text-center">
            <h3 className="text-white font-semibold text-lg">{user.name || "Unnamed User"}</h3>
            <p className="text-white/70 text-sm">@{user.username || "username"}</p>
            <p className="text-white/50 text-xs mt-1">
              Joined {new Date(user.created_at || "").toLocaleDateString()}
            </p>
          </div>
        </motion.div>

        {/* Form Section */}
        <div className="md:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: "name", label: "Full Name", value: formData.name },
              { id: "username", label: "Username", value: formData.username },
              { id: "phone", label: "Phone", value: formData.phone },
              { id: "email", label: "Email", value: user.email, disabled: true },
            ].map((field) => (
              <motion.div
                key={field.id}
                whileHover={{ y: -3 }}
                className="group"
              >
                <label htmlFor={field.id} className="block text-xs text-white/70 mb-2">
                  {field.label}
                </label>
                <Input
                  id={field.id}
                  name={field.id}
                  value={field.value}
                  disabled={field.disabled}
                  onChange={handleInputChange}
                  className={clsx(
                    "w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.2)] text-white rounded-2xl px-4 py-3 focus:ring-2 focus:ring-[#7C3AED]/40 transition-all",
                    "group-hover:bg-[rgba(255,255,255,0.1)]"
                  )}
                />
              </motion.div>
            ))}
          </div>

          <motion.div whileHover={{ y: -3 }}>
            <label htmlFor="bio" className="block text-xs text-white/70 mb-2">
              Bio
            </label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us something about you..."
              className="min-h-[100px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.2)] text-white rounded-2xl px-4 py-3 focus:ring-2 focus:ring-[#DB2777]/40 transition-all hover:bg-[rgba(255,255,255,0.1)]"
            />
          </motion.div>

          <div className="flex items-center justify-between pt-4">
            {/* <p className="text-white/60 text-sm">Profile settings are private.</p> */}

            <Button
              onClick={handleProfileUpdate}
              disabled={saving}
              className={clsx(
                "relative overflow-hidden rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7C3AED]/30 transition-all",
                "bg-gradient-to-r from-[#7C3AED] to-[#DB2777] hover:brightness-110",
                saving && "opacity-70 cursor-not-allowed"
              )}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {saving ? "Saving..." : "Save Changes"}
              <span className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0)_100%)] animate-[shimmer_2.5s_infinite] bg-[length:200%_100%]" />
            </Button>
          </div>
        </div>
      </Card>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </motion.div>
  );
};
