/**
 * Trading Goals View
 * Set and track trading objectives and milestones
 */

"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { useGoals, CreateGoalInput } from "@/hooks/notebook/useGoals";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Target,
  Trophy,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { GoalType } from "@/lib/notebook/types";

dayjs.extend(relativeTime);

export const GoalsView: React.FC = () => {
  const { goals, isLoading, createGoal, updateGoal, deleteGoal } = useGoals();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  
  const [formData, setFormData] = useState<CreateGoalInput>({
    title: "",
    description: "",
    goal_type: "profit",
    target_value: 0,
    target_unit: "USD",
    start_date: new Date().toISOString().split("T")[0],
    target_date: dayjs().add(1, "month").format("YYYY-MM-DD"),
    current_value: 0,
  });

  const [updateData, setUpdateData] = useState({
    current_value: 0,
    status: "active",
  });

  const handleCreate = async () => {
    if (!formData.title.trim()) return;

    const result = await createGoal(formData);
    if (result) {
      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleUpdate = async () => {
    if (!selectedGoal) return;

    const result = await updateGoal(selectedGoal.id, {
      current_value: Number(updateData.current_value),
      status: updateData.status as any,
    });

    if (result) {
      setIsUpdateDialogOpen(false);
      setSelectedGoal(null);
    }
  };

  const openUpdateDialog = (goal: any) => {
    setSelectedGoal(goal);
    setUpdateData({
      current_value: goal.current_value || 0,
      status: goal.status,
    });
    setIsUpdateDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      goal_type: "profit",
      target_value: 0,
      target_unit: "USD",
      start_date: new Date().toISOString().split("T")[0],
      target_date: dayjs().add(1, "month").format("YYYY-MM-DD"),
      current_value: 0,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700 border-green-200";
      case "failed": return "bg-red-100 text-red-700 border-red-200";
      case "cancelled": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getTypeIcon = (type: GoalType) => {
    switch (type) {
      case "profit": return <TrendingUp className="h-4 w-4" />;
      case "win_rate": return <Target className="h-4 w-4" />;
      case "consistency": return <Calendar className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Loading trading goals...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trading Goals</h2>
          <p className="text-muted-foreground">Set objectives and track your progress</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-gradient text-white">
              <Plus className="h-4 w-4 mr-2" />
              Set New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Set Trading Goal</DialogTitle>
              <DialogDescription>Define a clear, measurable objective</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Goal Title</label>
                <Input
                  placeholder="e.g., Reach $10k Account Balance"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select
                    value={formData.goal_type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, goal_type: value as GoalType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="profit">Profit Target</SelectItem>
                      <SelectItem value="win_rate">Win Rate</SelectItem>
                      <SelectItem value="consistency">Consistency</SelectItem>
                      <SelectItem value="risk_management">Risk Management</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Date</label>
                  <Input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, target_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Value</label>
                  <Input
                    type="number"
                    value={formData.target_value}
                    onChange={(e) => setFormData((prev) => ({ ...prev, target_value: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Unit</label>
                  <Input
                    placeholder="e.g., USD, %, Trades"
                    value={formData.target_unit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, target_unit: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Why is this goal important? How will you achieve it?"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} className="bg-brand-gradient text-white">
                  Create Goal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Progress</DialogTitle>
            <DialogDescription>Update current value for: {selectedGoal?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Current Value ({selectedGoal?.target_unit})
              </label>
              <Input
                type="number"
                value={updateData.current_value}
                onChange={(e) => setUpdateData((prev) => ({ ...prev, current_value: Number(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Target: {selectedGoal?.target_value} {selectedGoal?.target_unit}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={updateData.status}
                onValueChange={(value) => setUpdateData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} className="bg-brand-gradient text-white">
                Update Goal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goals List */}
      <div className="space-y-4">
        <AnimatePresence>
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  {/* Icon & Title */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {getTypeIcon(goal.goal_type as GoalType)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg truncate">{goal.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className={getStatusColor(goal.status)}>
                            {goal.status}
                          </Badge>
                          <span>•</span>
                          <span>Target: {dayjs(goal.target_date).format("MMM DD, YYYY")}</span>
                          <span>({dayjs(goal.target_date).fromNow()})</span>
                        </div>
                      </div>
                    </div>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground ml-13 line-clamp-2">
                        {goal.description}
                      </p>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="w-full md:w-1/3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Progress</span>
                      <span className="font-bold">{Math.round(goal.progress_percentage)}%</span>
                    </div>
                    <Progress value={goal.progress_percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{goal.current_value} {goal.target_unit}</span>
                      <span>{goal.target_value} {goal.target_unit}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 self-end md:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openUpdateDialog(goal)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Update
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteGoal(goal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {goals.length === 0 && (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Goals Set</h3>
            <p className="text-muted-foreground mb-4">
              Set clear, measurable trading goals to track your progress and stay motivated.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-brand-gradient text-white">
              Set Your First Goal
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};
