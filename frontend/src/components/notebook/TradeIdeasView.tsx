/**
 * Trade Ideas View - Kanban Board
 * Manage trade setups from idea to execution
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
import { useTradeIdeas } from "@/hooks/notebook/useTradeIdeas";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Calendar,
  Trash2,
  Edit,
} from "lucide-react";
import type { IdeaStatus, TradeDirection, CreateTradeIdeaInput } from "@/lib/notebook/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const TradeIdeasView: React.FC = () => {
  const { ideas, isLoading, createIdea, updateIdea, deleteIdea } = useTradeIdeas();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateTradeIdeaInput>({
    symbol: "",
    timeframe: "",
    direction: "long",
    entry_price: undefined,
    stop_loss: undefined,
    take_profit: undefined,
    setup_description: "",
    confluence_factors: [],
  });
  const [confluenceInput, setConfluenceInput] = useState("");

  // Group ideas by status
  const columns: { id: IdeaStatus; title: string; color: string }[] = [
    { id: "idea", title: "Ideas", color: "bg-blue-500" },
    { id: "watching", title: "Watching", color: "bg-yellow-500" },
    { id: "executed", title: "Executed", color: "bg-green-500" },
    { id: "closed", title: "Closed", color: "bg-gray-500" },
  ];

  const getIdeasByStatus = (status: IdeaStatus) => {
    return ideas.filter((idea) => idea.status === status);
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as IdeaStatus;

    await updateIdea(draggableId, { status: newStatus });
  };

  const handleCreateIdea = async () => {
    if (!formData.symbol.trim()) return;

    const result = await createIdea(formData);
    if (result) {
      setIsCreateDialogOpen(false);
      setFormData({
        symbol: "",
        timeframe: "",
        direction: "long",
        entry_price: undefined,
        stop_loss: undefined,
        take_profit: undefined,
        setup_description: "",
        confluence_factors: [],
      });
      setConfluenceInput("");
    }
  };

  const addConfluence = () => {
    if (confluenceInput.trim() && !formData.confluence_factors?.includes(confluenceInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        confluence_factors: [...(prev.confluence_factors || []), confluenceInput.trim()],
      }));
      setConfluenceInput("");
    }
  };

  const calculateRR = () => {
    if (formData.entry_price && formData.stop_loss && formData.take_profit) {
      const risk = Math.abs(formData.entry_price - formData.stop_loss);
      const reward = Math.abs(formData.take_profit - formData.entry_price);
      return risk > 0 ? (reward / risk).toFixed(2) : "0";
    }
    return "N/A";
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Loading trade ideas...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trade Ideas</h2>
          <p className="text-muted-foreground">Track your trade setups from idea to execution</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-gradient text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Idea
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Trade Idea</DialogTitle>
              <DialogDescription>Document your trade setup before execution</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Symbol *</label>
                  <Input
                    placeholder="e.g., EURUSD"
                    value={formData.symbol}
                    onChange={(e) => setFormData((prev) => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Timeframe</label>
                  <Input
                    placeholder="e.g., 1H, 4H, Daily"
                    value={formData.timeframe}
                    onChange={(e) => setFormData((prev) => ({ ...prev, timeframe: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Direction</label>
                <Select
                  value={formData.direction}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, direction: value as TradeDirection }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="long">Long (Buy)</SelectItem>
                    <SelectItem value="short">Short (Sell)</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Entry Price</label>
                  <Input
                    type="number"
                    step="0.00001"
                    placeholder="0.00000"
                    value={formData.entry_price || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, entry_price: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Stop Loss</label>
                  <Input
                    type="number"
                    step="0.00001"
                    placeholder="0.00000"
                    value={formData.stop_loss || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, stop_loss: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Take Profit</label>
                  <Input
                    type="number"
                    step="0.00001"
                    placeholder="0.00000"
                    value={formData.take_profit || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, take_profit: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  Risk:Reward Ratio: <span className="text-primary font-bold">{calculateRR()}</span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Setup Description</label>
                <Textarea
                  placeholder="Describe your trade setup..."
                  value={formData.setup_description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, setup_description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Confluence Factors</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add confluence factor..."
                    value={confluenceInput}
                    onChange={(e) => setConfluenceInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addConfluence())}
                  />
                  <Button type="button" variant="outline" onClick={addConfluence}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.confluence_factors?.map((factor, idx) => (
                    <Badge key={idx} variant="secondary">
                      {factor}
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            confluence_factors: prev.confluence_factors?.filter((_, i) => i !== idx),
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
                <Button onClick={handleCreateIdea} className="bg-brand-gradient text-white">
                  Create Idea
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col">
              <div className={`${column.color} text-white px-4 py-2 rounded-t-lg flex items-center justify-between`}>
                <h3 className="font-semibold">{column.title}</h3>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {getIdeasByStatus(column.id).length}
                </Badge>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 bg-muted/30 rounded-b-lg min-h-[400px] ${
                      snapshot.isDraggingOver ? "bg-muted/50" : ""
                    }`}
                  >
                    {getIdeasByStatus(column.id).map((idea, index) => (
                      <Draggable key={idea.id} draggableId={idea.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-2 ${snapshot.isDragging ? "opacity-50" : ""}`}
                          >
                            <Card className="p-3 hover:shadow-md transition-shadow cursor-move">
                              {/* Symbol & Direction */}
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-lg">{idea.symbol}</h4>
                                {idea.direction === "long" ? (
                                  <TrendingUp className="h-5 w-5 text-green-600" />
                                ) : idea.direction === "short" ? (
                                  <TrendingDown className="h-5 w-5 text-red-600" />
                                ) : null}
                              </div>

                              {/* Timeframe */}
                              {idea.timeframe && (
                                <Badge variant="outline" className="text-xs mb-2">
                                  {idea.timeframe}
                                </Badge>
                              )}

                              {/* Prices */}
                              {idea.entry_price && (
                                <div className="text-xs space-y-1 mb-2">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Entry:</span>
                                    <span className="font-medium">{idea.entry_price.toFixed(5)}</span>
                                  </div>
                                  {idea.stop_loss && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground flex items-center gap-1">
                                        <Shield className="h-3 w-3" />
                                        SL:
                                      </span>
                                      <span className="font-medium text-red-600">{idea.stop_loss.toFixed(5)}</span>
                                    </div>
                                  )}
                                  {idea.take_profit && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground flex items-center gap-1">
                                        <Target className="h-3 w-3" />
                                        TP:
                                      </span>
                                      <span className="font-medium text-green-600">{idea.take_profit.toFixed(5)}</span>
                                    </div>
                                  )}
                                  {idea.risk_reward_ratio && (
                                    <div className="flex justify-between pt-1 border-t">
                                      <span className="text-muted-foreground">R:R</span>
                                      <span className="font-bold text-primary">1:{idea.risk_reward_ratio.toFixed(2)}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Description */}
                              {idea.setup_description && (
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{idea.setup_description}</p>
                              )}

                              {/* Confluence */}
                              {idea.confluence_factors.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {idea.confluence_factors.slice(0, 2).map((factor, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-[10px]">
                                      {factor}
                                    </Badge>
                                  ))}
                                  {idea.confluence_factors.length > 2 && (
                                    <Badge variant="secondary" className="text-[10px]">
                                      +{idea.confluence_factors.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {/* Footer */}
                              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {dayjs(idea.created_at).fromNow()}
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-destructive"
                                  onClick={() => deleteIdea(idea.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Empty State */}
      {ideas.length === 0 && (
        <Card className="p-12 text-center mt-6">
          <p className="text-muted-foreground">No trade ideas yet. Create your first trade setup!</p>
        </Card>
      )}
    </div>
  );
};
