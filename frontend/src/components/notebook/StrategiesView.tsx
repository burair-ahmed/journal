/**
 * Trading Strategies View
 * Document and track trading strategy performance
 */

"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStrategies } from "@/hooks/notebook/useStrategies";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  TrendingUp,
  Target,
  Activity,
  BarChart3,
  CheckCircle2,
  XCircle,
  Trash2,
  Power,
  PowerOff,
} from "lucide-react";
import type { CreateStrategyInput } from "@/lib/notebook/types";
import dayjs from "dayjs";

export const StrategiesView: React.FC = () => {
  const { strategies, isLoading, createStrategy, updateStrategy, deleteStrategy, toggleActive } = useStrategies();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateStrategyInput>({
    name: "",
    description: "",
    entry_rules: "",
    exit_rules: "",
    risk_management_rules: "",
    market_conditions: [],
    timeframes: [],
    symbols: [],
  });
  const [conditionInput, setConditionInput] = useState("");
  const [timeframeInput, setTimeframeInput] = useState("");
  const [symbolInput, setSymbolInput] = useState("");

  const handleCreateStrategy = async () => {
    if (!formData.name.trim()) return;

    const result = await createStrategy(formData);
    if (result) {
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        entry_rules: "",
        exit_rules: "",
        risk_management_rules: "",
        market_conditions: [],
        timeframes: [],
        symbols: [],
      });
    }
  };

  const addCondition = () => {
    if (conditionInput.trim() && !formData.market_conditions?.includes(conditionInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        market_conditions: [...(prev.market_conditions || []), conditionInput.trim()],
      }));
      setConditionInput("");
    }
  };

  const addTimeframe = () => {
    if (timeframeInput.trim() && !formData.timeframes?.includes(timeframeInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        timeframes: [...(prev.timeframes || []), timeframeInput.trim()],
      }));
      setTimeframeInput("");
    }
  };

  const addSymbol = () => {
    if (symbolInput.trim() && !formData.symbols?.includes(symbolInput.trim().toUpperCase())) {
      setFormData((prev) => ({
        ...prev,
        symbols: [...(prev.symbols || []), symbolInput.trim().toUpperCase()],
      }));
      setSymbolInput("");
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Loading strategies...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trading Strategies</h2>
          <p className="text-muted-foreground">Document your trading strategies and track their performance</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-gradient text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Strategy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Trading Strategy</DialogTitle>
              <DialogDescription>Document your strategy rules and conditions</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Strategy Name *</label>
                <Input
                  placeholder="e.g., Trend Following Strategy"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Brief overview of the strategy..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Entry Rules</label>
                <Textarea
                  placeholder="When do you enter a trade with this strategy?"
                  value={formData.entry_rules}
                  onChange={(e) => setFormData((prev) => ({ ...prev, entry_rules: e.target.value }))}
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Exit Rules</label>
                <Textarea
                  placeholder="When do you exit a trade?"
                  value={formData.exit_rules}
                  onChange={(e) => setFormData((prev) => ({ ...prev, exit_rules: e.target.value }))}
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Risk Management Rules</label>
                <Textarea
                  placeholder="Position sizing, stop loss rules, etc."
                  value={formData.risk_management_rules}
                  onChange={(e) => setFormData((prev) => ({ ...prev, risk_management_rules: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Market Conditions</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g., Trending, Ranging, High Volatility"
                    value={conditionInput}
                    onChange={(e) => setConditionInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCondition())}
                  />
                  <Button type="button" variant="outline" onClick={addCondition}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.market_conditions?.map((condition, idx) => (
                    <Badge key={idx} variant="secondary">
                      {condition}
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            market_conditions: prev.market_conditions?.filter((_, i) => i !== idx),
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Timeframes</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="e.g., 1H, 4H, Daily"
                      value={timeframeInput}
                      onChange={(e) => setTimeframeInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTimeframe())}
                    />
                    <Button type="button" variant="outline" onClick={addTimeframe}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.timeframes?.map((tf, idx) => (
                      <Badge key={idx} variant="outline">
                        {tf}
                        <button
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              timeframes: prev.timeframes?.filter((_, i) => i !== idx),
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

                <div>
                  <label className="text-sm font-medium mb-2 block">Symbols</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="e.g., EURUSD, GBPUSD"
                      value={symbolInput}
                      onChange={(e) => setSymbolInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSymbol())}
                    />
                    <Button type="button" variant="outline" onClick={addSymbol}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.symbols?.map((symbol, idx) => (
                      <Badge key={idx} className="bg-brand-gradient text-white">
                        {symbol}
                        <button
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              symbols: prev.symbols?.filter((_, i) => i !== idx),
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
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateStrategy} className="bg-brand-gradient text-white">
                  Create Strategy
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Strategies Grid */}
      {strategies.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No strategies yet. Document your first trading strategy!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {strategies.map((strategy) => (
              <motion.div
                key={strategy.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`p-6 ${!strategy.is_active ? "opacity-60" : ""}`}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-xl">{strategy.name}</h3>
                        <Badge variant={strategy.is_active ? "default" : "secondary"} className="text-xs">
                          v{strategy.version}
                        </Badge>
                      </div>
                      {strategy.description && (
                        <p className="text-sm text-muted-foreground">{strategy.description}</p>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => toggleActive(strategy.id, strategy.is_active)}
                      >
                        {strategy.is_active ? (
                          <Power className="h-4 w-4 text-green-600" />
                        ) : (
                          <PowerOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteStrategy(strategy.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Performance Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{strategy.total_trades}</div>
                      <div className="text-xs text-muted-foreground">Total Trades</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {strategy.win_rate ? `${strategy.win_rate.toFixed(1)}%` : "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {strategy.expectancy ? strategy.expectancy.toFixed(2) : "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">Expectancy</div>
                    </div>
                  </div>

                  {/* Win/Loss Stats */}
                  {strategy.total_trades > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          <span className="font-semibold">{strategy.winning_trades}</span> wins
                        </span>
                        {strategy.avg_profit && (
                          <span className="text-xs text-green-600">
                            (avg: ${strategy.avg_profit.toFixed(2)})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm">
                          <span className="font-semibold">{strategy.losing_trades}</span> losses
                        </span>
                        {strategy.avg_loss && (
                          <span className="text-xs text-red-600">
                            (avg: ${strategy.avg_loss.toFixed(2)})
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rules */}
                  {strategy.entry_rules && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-green-600 mb-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Entry Rules
                      </p>
                      <p className="text-sm line-clamp-2">{strategy.entry_rules}</p>
                    </div>
                  )}

                  {strategy.exit_rules && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-red-600 mb-1 flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Exit Rules
                      </p>
                      <p className="text-sm line-clamp-2">{strategy.exit_rules}</p>
                    </div>
                  )}

                  {/* Market Conditions & Timeframes */}
                  <div className="space-y-2">
                    {strategy.market_conditions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {strategy.market_conditions.map((condition, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {strategy.timeframes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {strategy.timeframes.map((tf, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tf}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {strategy.symbols.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {strategy.symbols.slice(0, 5).map((symbol, idx) => (
                          <Badge key={idx} className="bg-brand-gradient text-white text-xs">
                            {symbol}
                          </Badge>
                        ))}
                        {strategy.symbols.length > 5 && (
                          <Badge className="bg-brand-gradient text-white text-xs">
                            +{strategy.symbols.length - 5}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 mt-3 border-t">
                    <span>Created {dayjs(strategy.created_at).fromNow()}</span>
                    {strategy.is_active && (
                      <Badge variant="default" className="bg-green-600 text-xs">
                        Active
                      </Badge>
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
