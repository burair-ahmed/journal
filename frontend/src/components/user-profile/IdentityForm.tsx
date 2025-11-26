"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import clsx from "clsx";

interface IdentityFormProps {
  formData: {
    name: string;
    username: string;
    phone: string;
    bio: string;
  };
  userEmail: string;
  isEditMode: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const IdentityForm: React.FC<IdentityFormProps> = ({
  formData,
  userEmail,
  isEditMode,
  onChange,
}) => {
  const fields = [
    { id: "name", label: "Full Name", value: formData.name, type: "text" },
    { id: "username", label: "Username", value: formData.username, type: "text" },
    { id: "phone", label: "Phone", value: formData.phone, type: "tel" },
    { id: "email", label: "Email", value: userEmail, type: "email", disabled: true },
  ];

  return (
    <div className="space-y-6">
      {/* Two-Column Grid for Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => (
          <motion.div
            key={field.id}
            whileHover={isEditMode && !field.disabled ? { y: -3 } : {}}
            className="group"
          >
            <label
              htmlFor={field.id}
              className={clsx(
                "block text-xs font-medium mb-2 transition-colors duration-200",
                isEditMode && !field.disabled
                  ? "text-muted-foreground group-hover:text-sidebar-foreground"
                  : "text-muted-foreground"
              )}
            >
              {field.label}
              {field.disabled && (
                <span className="ml-2 text-[10px] text-muted-foreground/50">(Protected)</span>
              )}
            </label>
            <Input
              id={field.id}
              name={field.id}
              type={field.type}
              value={field.value}
              disabled={field.disabled || !isEditMode}
              onChange={onChange}
              className={clsx(
                "w-full bg-muted/30 border border-muted/40 text-sidebar-foreground rounded-2xl px-4 py-3",
                "transition-all duration-200",
                "focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
                isEditMode && !field.disabled && "hover:bg-muted/50 hover:border-muted/60",
                field.disabled && "opacity-60 cursor-not-allowed bg-muted/20"
              )}
            />
          </motion.div>
        ))}
      </div>

      {/* Bio Field - Full Width */}
      <motion.div whileHover={isEditMode ? { y: -3 } : {}} className="group">
        <label
          htmlFor="bio"
          className={clsx(
            "block text-xs font-medium mb-2 transition-colors duration-200",
            isEditMode
              ? "text-muted-foreground group-hover:text-sidebar-foreground"
              : "text-muted-foreground"
          )}
        >
          Bio
        </label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={onChange}
          disabled={!isEditMode}
          placeholder="Tell us something about yourself..."
          className={clsx(
            "min-h-[120px] bg-muted/30 border border-muted/40 text-sidebar-foreground rounded-2xl px-4 py-3",
            "transition-all duration-200",
            "focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
            isEditMode && "hover:bg-muted/50 hover:border-muted/60",
            !isEditMode && "opacity-60 cursor-not-allowed"
          )}
        />
      </motion.div>
    </div>
  );
};
