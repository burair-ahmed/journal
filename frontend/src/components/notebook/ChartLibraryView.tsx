/**
 * Chart Library View
 * Visual library of trading charts and screenshots
 */

"use client";

import React, { useState, useRef } from "react";
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
import { useCharts } from "@/hooks/notebook/useCharts";
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
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const ChartLibraryView: React.FC = () => {
  const { charts, isLoading, isUploading, uploadChart, deleteChart } = useCharts();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    symbol: "",
    timeframe: "",
    patterns: [] as string[],
    description: "",
  });
  const [patternInput, setPatternInput] = useState("");

  const filteredCharts = charts.filter(chart => 
    chart.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chart.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chart.patterns?.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const result = await uploadChart(selectedFile, {
      title: formData.title || selectedFile.name,
      symbol: formData.symbol.toUpperCase(),
      timeframe: formData.timeframe,
      patterns: formData.patterns,
      description: formData.description,
    });

    if (result) {
      setIsUploadDialogOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData({
      title: "",
      symbol: "",
      timeframe: "",
      patterns: [],
      description: "",
    });
    setPatternInput("");
  };

  const addPattern = () => {
    if (patternInput.trim() && !formData.patterns.includes(patternInput.trim())) {
      setFormData(prev => ({
        ...prev,
        patterns: [...prev.patterns, patternInput.trim()]
      }));
      setPatternInput("");
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Loading charts...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search charts by symbol, title, or pattern..."
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

          <Dialog open={isUploadDialogOpen} onOpenChange={(open) => {
            setIsUploadDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-brand-gradient text-white">
                <Plus className="h-4 w-4 mr-2" />
                Upload Chart
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload Chart Screenshot</DialogTitle>
                <DialogDescription>
                  Add charts to your visual library for future reference
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {!previewUrl ? (
                  <div 
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border">
                    <img src={previewUrl} alt="Preview" className="w-full max-h-[300px] object-contain bg-black/5" />
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">Title (Optional)</label>
                  <Input 
                    placeholder="Chart title..." 
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Symbol</label>
                    <Input 
                      placeholder="e.g., EURUSD" 
                      value={formData.symbol}
                      onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Timeframe</label>
                    <Input 
                      placeholder="e.g., 1H, 4H" 
                      value={formData.timeframe}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeframe: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Patterns</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="e.g., Head & Shoulders, Breakout"
                      value={patternInput}
                      onChange={(e) => setPatternInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPattern())}
                    />
                    <Button type="button" variant="outline" onClick={addPattern}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.patterns.map((pattern, idx) => (
                      <Badge key={idx} variant="secondary">
                        {pattern}
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, patterns: prev.patterns.filter((_, i) => i !== idx) }))}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpload} 
                    className="bg-brand-gradient text-white"
                    disabled={!selectedFile || isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload Chart"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Empty State */}
      {filteredCharts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">No Charts Found</h3>
            <p className="text-muted-foreground">
              {charts.length === 0 
                ? "Start building your visual library by uploading chart screenshots." 
                : "No charts match your search query."}
            </p>
            {charts.length === 0 && (
              <Button className="bg-brand-gradient text-white" onClick={() => setIsUploadDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Your First Chart
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
          <AnimatePresence>
            {filteredCharts.map((chart) => (
              <motion.div
                key={chart.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={viewMode === "list" ? "w-full" : ""}
              >
                <Card className={`overflow-hidden group ${viewMode === "list" ? "flex" : ""}`}>
                  <div className={`relative ${viewMode === "list" ? "w-48 h-32" : "aspect-video"}`}>
                    <img 
                      src={chart.image_url} 
                      alt={chart.title || "Chart"} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a 
                        href={chart.image_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button 
                        onClick={() => deleteChart(chart.id, chart.image_url)}
                        className="p-2 bg-red-500/80 backdrop-blur-sm rounded-full text-white hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold line-clamp-1">{chart.title || "Untitled Chart"}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {dayjs(chart.created_at).fromNow()}
                        </div>
                      </div>
                      {chart.symbol && (
                        <Badge variant="outline">{chart.symbol}</Badge>
                      )}
                    </div>
                    
                    {chart.patterns && chart.patterns.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {chart.patterns.slice(0, 3).map((pattern, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[10px]">
                            {pattern}
                          </Badge>
                        ))}
                        {chart.patterns.length > 3 && (
                          <Badge variant="secondary" className="text-[10px]">+{chart.patterns.length - 3}</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
