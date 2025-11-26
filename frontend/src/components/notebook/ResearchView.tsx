/**
 * Research Clippings View
 * Save and organize trading education, articles, and resources
 */

"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useResearch, CreateResearchInput } from "@/hooks/notebook/useResearch";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  BookOpen,
  Link as LinkIcon,
  Video,
  FileText,
  Twitter,
  Star,
  Trash2,
  ExternalLink,
  CheckCircle,
  Clock,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { ContentType } from "@/lib/notebook/types";

dayjs.extend(relativeTime);

export const ResearchView: React.FC = () => {
  const { 
    clippings, 
    isLoading, 
    createClipping, 
    deleteClipping, 
    toggleFavorite, 
    updateStatus 
  } = useResearch();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateResearchInput>({
    title: "",
    url: "",
    content_type: "article",
    category: "general",
    tags: [],
    notes: "",
  });
  const [tagInput, setTagInput] = useState("");

  const filteredClippings = clippings.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    if (!formData.title.trim()) return;

    const result = await createClipping(formData);
    if (result) {
      setIsCreateDialogOpen(false);
      setFormData({
        title: "",
        url: "",
        content_type: "article",
        category: "general",
        tags: [],
        notes: "",
      });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const getIcon = (type?: ContentType | null) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />;
      case "tweet": return <Twitter className="h-4 w-4" />;
      case "pdf": return <FileText className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Loading research library...</p>
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
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-gradient text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Research Resource</DialogTitle>
              <DialogDescription>Save articles, videos, or notes for future study</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  placeholder="e.g., Understanding Market Structure"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">URL (Optional)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://..."
                    value={formData.url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select
                    value={formData.content_type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, content_type: value as ContentType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="tweet">Tweet/Thread</SelectItem>
                      <SelectItem value="pdf">PDF/Book</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Input
                    placeholder="e.g., Technical Analysis"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notes / Summary</label>
                <Textarea
                  placeholder="Key takeaways or summary..."
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g., Psychology, Strategy"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">
                      {tag}
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            tags: prev.tags?.filter((_, i) => i !== idx),
                          }))
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} className="bg-brand-gradient text-white">
                  Save Resource
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredClippings.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getIcon(item.content_type)}
                        <span className="capitalize">{item.content_type}</span>
                      </Badge>
                      {item.category && (
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={`h-6 w-6 ${item.is_favorite ? "text-yellow-500" : "text-muted-foreground"}`}
                      onClick={() => toggleFavorite(item.id, item.is_favorite)}
                    >
                      <Star className={`h-4 w-4 ${item.is_favorite ? "fill-current" : ""}`} />
                    </Button>
                  </div>

                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                        {item.title}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      item.title
                    )}
                  </h3>

                  {item.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {item.notes}
                    </p>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-muted/30 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.reading_status === "completed" ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Read
                      </Badge>
                    ) : item.reading_status === "reading" ? (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
                        <Clock className="h-3 w-3 mr-1" />
                        Reading
                      </Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 text-xs"
                        onClick={() => updateStatus(item.id, "reading")}
                      >
                        Start Reading
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.reading_status !== "completed" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => updateStatus(item.id, "completed")}
                        title="Mark as Read"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteClipping(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredClippings.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Resources Found</h3>
          <p className="text-muted-foreground mb-4">
            Start building your knowledge base by adding articles, videos, and notes.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-brand-gradient text-white">
            Add Resource
          </Button>
        </Card>
      )}
    </div>
  );
};
