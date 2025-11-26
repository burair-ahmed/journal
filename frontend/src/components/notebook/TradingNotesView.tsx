/**
 * Trading Notes View
 * Main interface for creating and managing trading notes
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
import { useNotes } from "@/hooks/notebook/useNotes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Pin,
  Archive,
  Edit,
  Trash2,
  Tag,
  Calendar,
  Filter,
} from "lucide-react";
import type { NoteType } from "@/lib/notebook/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const TradingNotesView: React.FC = () => {
  const { notes, isLoading, createNote, updateNote, deleteNote, togglePin, toggleArchive } = useNotes();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<NoteType | "all">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    note_type: "observation" as NoteType,
    tags: [] as string[],
    symbols: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [symbolInput, setSymbolInput] = useState("");

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchQuery === "" ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || note.note_type === filterType;
    return matchesSearch && matchesType && !note.is_archived;
  });

  const handleCreateNote = async () => {
    if (!formData.title.trim()) return;

    const result = await createNote(formData);
    if (result) {
      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleUpdateNote = async (id: string) => {
    if (!formData.title.trim()) return;

    const result = await updateNote(id, formData);
    if (result) {
      setEditingNote(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      note_type: "observation",
      tags: [],
      symbols: [],
    });
    setTagInput("");
    setSymbolInput("");
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const addSymbol = () => {
    if (symbolInput.trim() && !formData.symbols.includes(symbolInput.trim().toUpperCase())) {
      setFormData((prev) => ({ ...prev, symbols: [...prev.symbols, symbolInput.trim().toUpperCase()] }));
      setSymbolInput("");
    }
  };

  const noteTypeColors: Record<NoteType, string> = {
    observation: "bg-blue-100 text-blue-700",
    analysis: "bg-purple-100 text-purple-700",
    review: "bg-green-100 text-green-700",
    strategy: "bg-orange-100 text-orange-700",
    lesson: "bg-red-100 text-red-700",
    idea: "bg-yellow-100 text-yellow-700",
    market: "bg-indigo-100 text-indigo-700",
    psychology: "bg-pink-100 text-pink-700",
    goal: "bg-teal-100 text-teal-700",
    research: "bg-cyan-100 text-cyan-700",
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Loading notes...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={filterType} onValueChange={(value) => setFilterType(value as NoteType | "all")}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="observation">Observation</SelectItem>
              <SelectItem value="analysis">Analysis</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="strategy">Strategy</SelectItem>
              <SelectItem value="lesson">Lesson</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-gradient text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Trading Note</DialogTitle>
                <DialogDescription>
                  Document your trading observations, analysis, and insights
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    placeholder="Note title..."
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select
                    value={formData.note_type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, note_type: value as NoteType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="observation">Observation</SelectItem>
                      <SelectItem value="analysis">Analysis</SelectItem>
                      <SelectItem value="review">Trade Review</SelectItem>
                      <SelectItem value="strategy">Strategy</SelectItem>
                      <SelectItem value="lesson">Lesson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Content</label>
                  <Textarea
                    placeholder="Write your note here..."
                    value={formData.content}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    rows={8}
                    className="resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
                          }
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Symbols</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add symbol (e.g., EURUSD)..."
                      value={symbolInput}
                      onChange={(e) => setSymbolInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSymbol())}
                    />
                    <Button type="button" variant="outline" onClick={addSymbol}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.symbols.map((symbol) => (
                      <Badge key={symbol} className="bg-brand-gradient text-white gap-1">
                        {symbol}
                        <button
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, symbols: prev.symbols.filter((s) => s !== symbol) }))
                          }
                          className="ml-1 hover:opacity-80"
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
                  <Button onClick={handleCreateNote} className="bg-brand-gradient text-white">
                    Create Note
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No notes found. Create your first trading note!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-4 hover:shadow-lg transition-shadow relative group">
                  {/* Pin indicator */}
                  {note.is_pinned && (
                    <Pin className="absolute top-2 right-2 h-4 w-4 text-primary fill-primary" />
                  )}

                  {/* Note Type Badge */}
                  <Badge className={`${noteTypeColors[note.note_type]} mb-3`}>
                    {note.note_type}
                  </Badge>

                  {/* Title */}
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{note.title}</h3>

                  {/* Content Preview */}
                  {note.content && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{note.content}</p>
                  )}

                  {/* Symbols */}
                  {note.symbols.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.symbols.slice(0, 3).map((symbol) => (
                        <Badge key={symbol} variant="outline" className="text-xs">
                          {symbol}
                        </Badge>
                      ))}
                      {note.symbols.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{note.symbols.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{note.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {dayjs(note.created_at).fromNow()}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => togglePin(note.id, note.is_pinned)}
                      >
                        <Pin className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => toggleArchive(note.id, note.is_archived)}
                      >
                        <Archive className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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
