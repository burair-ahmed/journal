/**
 * Voice Notes View
 * Record and manage audio notes for trading
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
import { useVoiceNotes } from "@/hooks/notebook/useVoiceNotes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Clock,
  Save,
  Loader2,
  Volume2,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const VoiceNotesView: React.FC = () => {
  const {
    notes,
    isLoading,
    isUploading,
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    saveRecording,
    deleteNote,
  } = useVoiceNotes();

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRefs = React.useRef<{ [key: string]: HTMLAudioElement }>({});

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStopRecording = async () => {
    const blob = await stopRecording();
    if (blob) {
      setRecordedBlob(blob);
      setIsSaveDialogOpen(true);
    }
  };

  const handleSave = async () => {
    if (!recordedBlob) return;

    const result = await saveRecording(recordedBlob, {
      title: formData.title || `Voice Note ${dayjs().format("MMM DD HH:mm")}`,
      tags: formData.tags,
    });

    if (result) {
      setIsSaveDialogOpen(false);
      setRecordedBlob(null);
      setFormData({ title: "", tags: [] });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const togglePlay = (id: string, url: string) => {
    const audio = audioRefs.current[id];
    if (!audio) return;

    if (playingId === id) {
      audio.pause();
      setPlayingId(null);
    } else {
      // Stop currently playing
      if (playingId && audioRefs.current[playingId]) {
        audioRefs.current[playingId].pause();
        audioRefs.current[playingId].currentTime = 0;
      }
      
      audio.play();
      setPlayingId(id);
      
      audio.onended = () => {
        setPlayingId(null);
      };
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Loading voice notes...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Voice Notes</h2>
          <p className="text-muted-foreground">Record quick thoughts and trading ideas</p>
        </div>

        {!isRecording ? (
          <Button 
            onClick={startRecording} 
            className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
          >
            <Mic className="h-4 w-4 mr-2" />
            Start Recording
          </Button>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-red-500 font-mono font-bold animate-pulse">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              {formatTime(recordingTime)}
            </div>
            <Button variant="outline" onClick={cancelRecording}>
              Cancel
            </Button>
            <Button onClick={handleStopRecording} className="bg-red-500 hover:bg-red-600 text-white">
              <Square className="h-4 w-4 mr-2 fill-current" />
              Stop
            </Button>
          </div>
        )}
      </div>

      {/* Save Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={(open) => !open && setIsSaveDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Voice Note</DialogTitle>
            <DialogDescription>Add a title and tags to your recording</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input 
                placeholder={`Voice Note ${dayjs().format("MMM DD HH:mm")}`}
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="e.g., Idea, Review, Psychology"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tag}
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== idx) }))}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                Discard
              </Button>
              <Button 
                onClick={handleSave} 
                className="bg-brand-gradient text-white"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Note
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${playingId === note.id ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
                      {playingId === note.id ? (
                        <Volume2 className="h-5 w-5 animate-pulse" />
                      ) : (
                        <Mic className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold line-clamp-1">{note.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {dayjs(note.created_at).fromNow()}
                        <span>•</span>
                        <span>{formatTime(note.duration_seconds)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteNote(note.id, note.audio_url)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Audio Player */}
                <div className="bg-muted/30 rounded-lg p-2 mb-3 flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                    onClick={() => togglePlay(note.id, note.audio_url)}
                  >
                    {playingId === note.id ? (
                      <Pause className="h-4 w-4 fill-current" />
                    ) : (
                      <Play className="h-4 w-4 fill-current" />
                    )}
                  </Button>
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-primary transition-all duration-300 ${playingId === note.id ? "w-full animate-[progress_linear_infinite]" : "w-0"}`} 
                      style={{ animationDuration: `${note.duration_seconds}s`, animationPlayState: playingId === note.id ? "running" : "paused" }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    {formatTime(note.duration_seconds)}
                  </span>
                  <audio
                    ref={(el) => { if (el) audioRefs.current[note.id] = el; }}
                    src={note.audio_url}
                    preload="none"
                  />
                </div>

                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {notes.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
            <Mic className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Voice Notes</h3>
          <p className="text-muted-foreground mb-4">
            Record your trading thoughts, ideas, and reviews on the go.
          </p>
          <Button onClick={startRecording} className="bg-red-500 hover:bg-red-600 text-white">
            Start Recording
          </Button>
        </Card>
      )}
    </div>
  );
};
