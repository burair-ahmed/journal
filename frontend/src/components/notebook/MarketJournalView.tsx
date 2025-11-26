/**
 * Market Journal View
 * Track market events, daily observations, and macro analysis
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
import { useMarketJournal } from "@/hooks/notebook/useMarketJournal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Calendar,
  Globe,
  TrendingUp,
  AlertTriangle,
  Newspaper,
  Trash2,
  Clock,
} from "lucide-react";
import type { CreateMarketJournalInput, MarketEventType, ImpactLevel } from "@/lib/notebook/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const MarketJournalView: React.FC = () => {
  const { entries, isLoading, createEntry, deleteEntry } = useMarketJournal();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateMarketJournalInput>({
    event_date: new Date().toISOString().split("T")[0],
    event_type: "daily_summary",
    title: "",
    content: "",
    impact_level: "medium",
    affected_symbols: [],
  });
  const [symbolInput, setSymbolInput] = useState("");

  const handleCreateEntry = async () => {
    if (!formData.title.trim()) return;

    const result = await createEntry(formData);
    if (result) {
      setIsCreateDialogOpen(false);
      setFormData({
        event_date: new Date().toISOString().split("T")[0],
        event_type: "daily_summary",
        title: "",
        content: "",
        impact_level: "medium",
        affected_symbols: [],
      });
    }
  };

  const addSymbol = () => {
    if (symbolInput.trim() && !formData.affected_symbols?.includes(symbolInput.trim().toUpperCase())) {
      setFormData((prev) => ({
        ...prev,
        affected_symbols: [...(prev.affected_symbols || []), symbolInput.trim().toUpperCase()],
      }));
      setSymbolInput("");
    }
  };

  const getImpactColor = (impact: ImpactLevel) => {
    switch (impact) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getEventIcon = (type: MarketEventType) => {
    switch (type) {
      case "economic_data": return <TrendingUp className="h-4 w-4" />;
      case "central_bank": return <Globe className="h-4 w-4" />;
      case "geopolitical": return <AlertTriangle className="h-4 w-4" />;
      case "news": return <Newspaper className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Loading market journal...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Market Journal</h2>
          <p className="text-muted-foreground">Track macro events and daily market observations</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-gradient text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Market Entry</DialogTitle>
              <DialogDescription>Document market events or daily summaries</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date</label>
                  <Input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, event_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Event Type</label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, event_type: value as MarketEventType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily_summary">Daily Summary</SelectItem>
                      <SelectItem value="economic_data">Economic Data</SelectItem>
                      <SelectItem value="central_bank">Central Bank</SelectItem>
                      <SelectItem value="geopolitical">Geopolitical</SelectItem>
                      <SelectItem value="news">News Event</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  placeholder="e.g., FOMC Meeting Minutes"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Impact Level</label>
                <Select
                  value={formData.impact_level}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, impact_level: value as ImpactLevel }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Impact</SelectItem>
                    <SelectItem value="medium">Medium Impact</SelectItem>
                    <SelectItem value="high">High Impact</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Content</label>
                <Textarea
                  placeholder="Describe the event and its market implications..."
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  rows={5}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Affected Symbols</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g., EURUSD, SPX500"
                    value={symbolInput}
                    onChange={(e) => setSymbolInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSymbol())}
                  />
                  <Button type="button" variant="outline" onClick={addSymbol}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.affected_symbols?.map((symbol, idx) => (
                    <Badge key={idx} className="bg-brand-gradient text-white">
                      {symbol}
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            affected_symbols: prev.affected_symbols?.filter((_, i) => i !== idx),
                          }))
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
                <Button onClick={handleCreateEntry} className="bg-brand-gradient text-white">
                  Save Entry
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timeline View */}
      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
        {entries.length === 0 ? (
          <Card className="p-12 text-center relative z-10">
            <p className="text-muted-foreground">No market journal entries yet.</p>
          </Card>
        ) : (
          entries.map((entry, index) => (
            <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {getEventIcon(entry.event_type)}
              </div>
              
              {/* Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-lg border shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <time className="font-caveat font-medium text-indigo-500">
                      {dayjs(entry.event_date).format("MMM DD, YYYY")}
                    </time>
                    <Badge variant="outline" className={`text-xs capitalize ${getImpactColor(entry.impact_level)}`}>
                      {entry.impact_level} Impact
                    </Badge>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteEntry(entry.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-1">{entry.title}</h3>
                <p className="text-sm text-slate-600 mb-3 whitespace-pre-wrap">{entry.content}</p>
                
                {entry.affected_symbols && entry.affected_symbols.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.affected_symbols.map((symbol, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {symbol}
                      </Badge>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
