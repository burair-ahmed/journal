/**
 * Psychology Log View
 * Track mental state, mood, and emotional patterns
 */

"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePsychology } from "@/hooks/notebook/usePsychology";
import { motion } from "framer-motion";
import {
  Plus,
  Smile,
  Meh,
  Frown,
  Brain,
  Heart,
  Moon,
  Dumbbell,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import dayjs from "dayjs";

export const PsychologyView: React.FC = () => {
  const { logs, isLoading, createLog, updateLog, getTodayLog } = usePsychology();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const todayLog = getTodayLog();

  const [formData, setFormData] = useState({
    log_date: new Date().toISOString().split("T")[0],
    mood_rating: 5,
    confidence_level: 5,
    stress_level: 5,
    sleep_quality: 5,
    sleep_hours: 7,
    exercise_minutes: 0,
    meditation_minutes: 0,
    emotional_triggers: [] as string[],
    trigger_description: "",
    trading_performance_notes: "",
    affirmations: [] as string[],
  });

  const [triggerInput, setTriggerInput] = useState("");
  const [affirmationInput, setAffirmationInput] = useState("");

  const handleCreateLog = async () => {
    const result = await createLog(formData);
    if (result) {
      setIsCreateDialogOpen(false);
      setFormData({
        log_date: new Date().toISOString().split("T")[0],
        mood_rating: 5,
        confidence_level: 5,
        stress_level: 5,
        sleep_quality: 5,
        sleep_hours: 7,
        exercise_minutes: 0,
        meditation_minutes: 0,
        emotional_triggers: [],
        trigger_description: "",
        trading_performance_notes: "",
        affirmations: [],
      });
    }
  };

  const addTrigger = () => {
    if (triggerInput.trim() && !formData.emotional_triggers.includes(triggerInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        emotional_triggers: [...prev.emotional_triggers, triggerInput.trim()],
      }));
      setTriggerInput("");
    }
  };

  const addAffirmation = () => {
    if (affirmationInput.trim() && !formData.affirmations.includes(affirmationInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        affirmations: [...prev.affirmations, affirmationInput.trim()],
      }));
      setAffirmationInput("");
    }
  };

  const getMoodIcon = (rating: number) => {
    if (rating >= 7) return <Smile className="h-5 w-5 text-green-600" />;
    if (rating >= 4) return <Meh className="h-5 w-5 text-yellow-600" />;
    return <Frown className="h-5 w-5 text-red-600" />;
  };

  // Prepare chart data
  const chartData = logs.slice(0, 30).reverse().map((log) => ({
    date: dayjs(log.log_date).format("MMM DD"),
    mood: log.mood_rating || 0,
    confidence: log.confidence_level || 0,
    stress: log.stress_level || 0,
  }));

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Loading psychology logs...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Psychology Log</h2>
          <p className="text-muted-foreground">Track your mental state and emotional patterns</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-gradient text-white">
              <Plus className="h-4 w-4 mr-2" />
              {todayLog ? "Update Today's Log" : "Log Today"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Daily Psychology Log</DialogTitle>
              <DialogDescription>Track your mental and emotional state</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Mood Rating */}
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Mood Rating: {formData.mood_rating}/10
                </label>
                <Slider
                  value={[formData.mood_rating]}
                  onValueChange={([value]) => setFormData((prev) => ({ ...prev, mood_rating: value }))}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>

              {/* Confidence Level */}
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Confidence Level: {formData.confidence_level}/10
                </label>
                <Slider
                  value={[formData.confidence_level]}
                  onValueChange={([value]) => setFormData((prev) => ({ ...prev, confidence_level: value }))}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Stress Level */}
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Stress Level: {formData.stress_level}/10
                </label>
                <Slider
                  value={[formData.stress_level]}
                  onValueChange={([value]) => setFormData((prev) => ({ ...prev, stress_level: value }))}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Relaxed</span>
                  <span>Very Stressed</span>
                </div>
              </div>

              {/* Sleep */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Sleep Quality: {formData.sleep_quality}/10
                  </label>
                  <Slider
                    value={[formData.sleep_quality]}
                    onValueChange={([value]) => setFormData((prev) => ({ ...prev, sleep_quality: value }))}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Sleep Hours</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={formData.sleep_hours}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sleep_hours: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              {/* Exercise & Meditation */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Dumbbell className="h-4 w-4" />
                    Exercise (minutes)
                  </label>
                  <Input
                    type="number"
                    value={formData.exercise_minutes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, exercise_minutes: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Meditation (minutes)</label>
                  <Input
                    type="number"
                    value={formData.meditation_minutes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, meditation_minutes: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              {/* Emotional Triggers */}
              <div>
                <label className="text-sm font-medium mb-2 block">Emotional Triggers</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g., FOMO, Revenge trading"
                    value={triggerInput}
                    onChange={(e) => setTriggerInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTrigger())}
                  />
                  <Button type="button" variant="outline" onClick={addTrigger}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.emotional_triggers.map((trigger, idx) => (
                    <Badge key={idx} variant="destructive">
                      {trigger}
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            emotional_triggers: prev.emotional_triggers.filter((_, i) => i !== idx),
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

              {/* Trigger Description */}
              <div>
                <label className="text-sm font-medium mb-2 block">Trigger Description</label>
                <Textarea
                  placeholder="What triggered these emotions?"
                  value={formData.trigger_description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, trigger_description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Trading Performance Notes */}
              <div>
                <label className="text-sm font-medium mb-2 block">Trading Performance Notes</label>
                <Textarea
                  placeholder="How did your mental state affect your trading today?"
                  value={formData.trading_performance_notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, trading_performance_notes: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Affirmations */}
              <div>
                <label className="text-sm font-medium mb-2 block">Daily Affirmations</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g., I trade with discipline and patience"
                    value={affirmationInput}
                    onChange={(e) => setAffirmationInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAffirmation())}
                  />
                  <Button type="button" variant="outline" onClick={addAffirmation}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.affirmations.map((affirmation, idx) => (
                    <Badge key={idx} className="bg-green-100 text-green-700">
                      {affirmation}
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            affirmations: prev.affirmations.filter((_, i) => i !== idx),
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
                <Button onClick={handleCreateLog} className="bg-brand-gradient text-white">
                  Save Log
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mood Trend Chart */}
      {chartData.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Mood Trends (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="mood" stroke="#22c55e" name="Mood" strokeWidth={2} />
              <Line type="monotone" dataKey="confidence" stroke="#3b82f6" name="Confidence" strokeWidth={2} />
              <Line type="monotone" dataKey="stress" stroke="#ef4444" name="Stress" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Recent Logs */}
      <div className="space-y-4">
        {logs.slice(0, 10).map((log) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getMoodIcon(log.mood_rating || 5)}
                  <div>
                    <h4 className="font-semibold">{dayjs(log.log_date).format("MMMM DD, YYYY")}</h4>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>Mood: {log.mood_rating}/10</span>
                      <span>Confidence: {log.confidence_level}/10</span>
                      <span>Stress: {log.stress_level}/10</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                {log.sleep_hours && (
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-muted-foreground" />
                    <span>{log.sleep_hours}h sleep</span>
                  </div>
                )}
                {log.exercise_minutes && log.exercise_minutes > 0 && (
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    <span>{log.exercise_minutes}min exercise</span>
                  </div>
                )}
                {log.meditation_minutes && log.meditation_minutes > 0 && (
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-muted-foreground" />
                    <span>{log.meditation_minutes}min meditation</span>
                  </div>
                )}
              </div>

              {log.emotional_triggers.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Triggers:</p>
                  <div className="flex flex-wrap gap-1">
                    {log.emotional_triggers.map((trigger, idx) => (
                      <Badge key={idx} variant="destructive" className="text-xs">
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {log.trading_performance_notes && (
                <p className="text-sm text-muted-foreground">{log.trading_performance_notes}</p>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {logs.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No psychology logs yet. Start tracking your mental state!</p>
        </Card>
      )}
    </div>
  );
};
