"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import clsx from "clsx";

interface ProfileActionsProps {
  isEditMode: boolean;
  hasChanges: boolean;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  isEditMode,
  hasChanges,
  saving,
  onCancel,
  onSave,
}) => {
  return (
    <AnimatePresence>
      {isEditMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex items-center justify-end gap-3 pt-6"
        >
          {/* Cancel Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onCancel}
              variant="outline"
              className="rounded-full px-6 py-3 text-sm font-semibold border-sidebar-border 
                text-[#2d0620] hover:bg-sidebar-accent transition-all"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </motion.div>

          {/* Save Changes Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onSave}
              disabled={saving || !hasChanges}
              className={clsx(
                "relative overflow-hidden rounded-full px-6 py-3 text-sm font-semibold text-white",
                "shadow-lg shadow-primary/30 transition-all",
                "bg-brand-gradient hover:brightness-110",
                (saving || !hasChanges) && "opacity-70 cursor-not-allowed"
              )}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {saving ? "Saving..." : "Save Changes"}

              {/* Shimmer Effect */}
              {!saving && hasChanges && (
                <span
                  className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0)_100%)] 
                    animate-[shimmer_2.5s_infinite] bg-[length:200%_100%]"
                />
              )}
            </Button>
          </motion.div>
        </motion.div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </AnimatePresence>
  );
};
