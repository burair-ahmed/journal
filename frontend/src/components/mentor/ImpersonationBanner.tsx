import React from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { X, Eye } from "lucide-react";

export const ImpersonationBanner = () => {
  const { isImpersonating, impersonatedUserEmail, stopImpersonation } = useAuthContext();

  if (!isImpersonating) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-indigo-600 text-white py-3 px-4 z-50 shadow-lg flex items-center justify-between animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-full">
          <Eye className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-sm md:text-base">
            Viewing as <span className="font-bold">{impersonatedUserEmail}</span>
          </p>
          <p className="text-xs text-indigo-200 hidden md:block">
            You are in read-only mode. Actions like creating, editing, or deleting are disabled.
          </p>
        </div>
      </div>
      
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={stopImpersonation}
        className="bg-white text-indigo-600 hover:bg-indigo-50 border-0 font-medium"
      >
        Exit View
        <X className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};
