/**
 * Chart Library View
 * Visual library of trading charts and screenshots
 */

"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Upload,
  Search,
  Grid3x3,
  List,
  Image as ImageIcon,
  Calendar,
  Tag,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const ChartLibraryView: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Placeholder data - will be replaced with actual hook
  const charts: any[] = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search charts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              size="icon"
              variant={viewMode === "grid" ? "default" : "ghost"}
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={viewMode === "list" ? "default" : "ghost"}
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-gradient text-white">
                <Plus className="h-4 w-4 mr-2" />
                Upload Chart
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Chart Screenshot</DialogTitle>
                <DialogDescription>
                  Add charts to your visual library for future reference
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Title (Optional)</label>
                  <Input placeholder="Chart title..." />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Symbol</label>
                  <Input placeholder="e.g., EURUSD" />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Timeframe</label>
                  <Input placeholder="e.g., 1H, 4H, Daily" />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-brand-gradient text-white">
                    Upload Chart
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Empty State */}
      {charts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">No Charts Yet</h3>
            <p className="text-muted-foreground">
              Start building your visual library by uploading chart screenshots. Track patterns, setups, and trade entries.
            </p>
            <Button className="bg-brand-gradient text-white" onClick={() => setIsUploadDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Your First Chart
            </Button>
          </div>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
          {/* Charts will be rendered here */}
        </div>
      )}

      {/* Coming Soon Notice */}
      <Card className="p-6 bg-muted/50 border-dashed">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <ImageIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold mb-1">Chart Library Coming Soon</h4>
            <p className="text-sm text-muted-foreground">
              Full chart upload functionality with Supabase storage integration will be available shortly. 
              You can implement this using the provided implementation guide.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
