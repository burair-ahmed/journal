/**
 * Lessons Learned View
 * Track mistakes and lessons to improve trading performance
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
import { useLessons } from "@/hooks/notebook/useLessons";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Trash2,
  Calendar,
} from "lucide-react";
import type { LessonCategory, LessonSeverity, LessonStatus } from "@/lib/notebook/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const LessonsView: React.FC = () => {
  const { lessons, isLoading, createLesson, updateLesson, deleteLesson } = useLessons();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<LessonCategory | "all">("all");
  const [filterStatus, setFilterStatus] = useState<LessonStatus | "all">("all");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "emotional" as LessonCategory,
    severity: "minor" as LessonSeverity,
    what_went_wrong: "",
    what_to_do_differently: "",
  });

  const filteredLessons = lessons.filter((lesson) => {
    const matchesCategory = filterCategory === "all" || lesson.category === filterCategory;
    const matchesStatus = filterStatus === "all" || lesson.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  const handleCreateLesson = async () => {
    if (!formData.title.trim()) return;

    const result = await createLesson(formData);
    if (result) {
      setIsCreateDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "emotional",
        severity: "minor",
        what_went_wrong: "",
        what_to_do_differently: "",
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: LessonStatus) => {
    await updateLesson(id, { 
      status: newStatus,
      mastered_at: newStatus === "mastered" ? new Date().toISOString() : null 
    });
  };

  const severityColors = {
    minor: "bg-yellow-100 text-yellow-700 border-yellow-300",
    major: "bg-orange-100 text-orange-700 border-orange-300",
    critical: "bg-red-100 text-red-700 border-red-300",
  };

  const categoryIcons: Record<LessonCategory, string> = {
    emotional: "🧠",
    technical: "⚙️",
    risk_management: "🛡️",
    strategy_violation: "📋",
    market_analysis: "📊",
    other: "📝",
  };

  const statusColors = {
    learning: "bg-blue-100 text-blue-700",
    improving: "bg-purple-100 text-purple-700",
    mastered: "bg-green-100 text-green-700",
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Loading lessons...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as LessonCategory | "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="emotional">Emotional</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="risk_management">Risk Management</SelectItem>
              <SelectItem value="strategy_violation">Strategy Violation</SelectItem>
              <SelectItem value="market_analysis">Market Analysis</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as LessonStatus | "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="learning">Learning</SelectItem>
              <SelectItem value="improving">Improving</SelectItem>
              <SelectItem value="mastered">Mastered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-gradient text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Lesson
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Document a Lesson</DialogTitle>
              <DialogDescription>
                Learn from your mistakes and track your progress
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  placeholder="What did you learn?"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value as LessonCategory }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emotional">Emotional</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="risk_management">Risk Management</SelectItem>
                      <SelectItem value="strategy_violation">Strategy Violation</SelectItem>
                      <SelectItem value="market_analysis">Market Analysis</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Severity</label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, severity: value as LessonSeverity }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="major">Major</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Describe the situation..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">What Went Wrong?</label>
                <Textarea
                  placeholder="Analyze what happened..."
                  value={formData.what_went_wrong}
                  onChange={(e) => setFormData((prev) => ({ ...prev, what_went_wrong: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">What to Do Differently?</label>
                <Textarea
                  placeholder="Action items for improvement..."
                  value={formData.what_to_do_differently}
                  onChange={(e) => setFormData((prev) => ({ ...prev, what_to_do_differently: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateLesson} className="bg-brand-gradient text-white">
                  Save Lesson
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lessons List */}
      {filteredLessons.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No lessons found. Start documenting your trading lessons!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredLessons.map((lesson) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`p-6 border-l-4 ${severityColors[lesson.severity]}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{categoryIcons[lesson.category]}</span>
                        <h3 className="font-semibold text-lg">{lesson.title}</h3>
                        {lesson.recurrence_count > 1 && (
                          <Badge variant="destructive" className="text-xs">
                            Repeated {lesson.recurrence_count}x
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2 mb-3">
                        <Badge variant="outline" className="text-xs capitalize">
                          {lesson.category.replace("_", " ")}
                        </Badge>
                        <Badge className={`text-xs ${severityColors[lesson.severity]}`}>
                          {lesson.severity}
                        </Badge>
                        <Badge className={`text-xs ${statusColors[lesson.status]}`}>
                          {lesson.status}
                        </Badge>
                      </div>

                      {lesson.description && (
                        <p className="text-sm text-muted-foreground mb-3">{lesson.description}</p>
                      )}

                      {lesson.what_went_wrong && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-red-600 mb-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            What Went Wrong
                          </p>
                          <p className="text-sm">{lesson.what_went_wrong}</p>
                        </div>
                      )}

                      {lesson.what_to_do_differently && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-green-600 mb-1 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Action Plan
                          </p>
                          <p className="text-sm">{lesson.what_to_do_differently}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteLesson(lesson.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {dayjs(lesson.created_at).fromNow()}
                      {lesson.mastered_at && (
                        <span className="ml-2 text-green-600">
                          • Mastered {dayjs(lesson.mastered_at).fromNow()}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={lesson.status === "learning" ? "default" : "outline"}
                        onClick={() => handleStatusChange(lesson.id, "learning")}
                        className="h-7 text-xs"
                      >
                        Learning
                      </Button>
                      <Button
                        size="sm"
                        variant={lesson.status === "improving" ? "default" : "outline"}
                        onClick={() => handleStatusChange(lesson.id, "improving")}
                        className="h-7 text-xs"
                      >
                        Improving
                      </Button>
                      <Button
                        size="sm"
                        variant={lesson.status === "mastered" ? "default" : "outline"}
                        onClick={() => handleStatusChange(lesson.id, "mastered")}
                        className="h-7 text-xs bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Mastered
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
