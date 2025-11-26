/**
 * Main Notebook Container
 * Orchestrates all notebook features with tab navigation
 */

"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Lightbulb, 
  Image, 
  TrendingUp, 
  Book, 
  Brain,
  Globe,
  Target,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";

// Import feature components
import { TradingNotesView } from "./TradingNotesView";
import { LessonsView } from "./LessonsView";
import { ChartLibraryView } from "./ChartLibraryView";
import { TradeIdeasView } from "./TradeIdeasView";
import { StrategiesView } from "./StrategiesView";
import { PsychologyView } from "./PsychologyView";

export const NotebookContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState("notes");

  const tabs = [
    { id: "notes", label: "Trading Notes", icon: BookOpen, component: TradingNotesView },
    { id: "lessons", label: "Lessons Learned", icon: Lightbulb, component: LessonsView },
    { id: "charts", label: "Chart Library", icon: Image, component: ChartLibraryView },
    { id: "ideas", label: "Trade Ideas", icon: TrendingUp, component: TradeIdeasView },
    { id: "strategies", label: "Strategies", icon: Book, component: StrategiesView },
    { id: "psychology", label: "Psychology", icon: Brain, component: PsychologyView },
    { id: "market", label: "Market Journal", icon: Globe, badge: "Soon" },
    { id: "goals", label: "Goals", icon: Target, badge: "Soon" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notebook</h1>
          <p className="text-muted-foreground mt-1">
            Document your trading journey, lessons, and insights
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto bg-muted/50">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary relative"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge && (
                <span className="absolute -top-1 -right-1 text-[10px] font-semibold bg-brand-gradient px-1.5 py-0.5 rounded-full text-white">
                  {tab.badge}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="notes" className="mt-6">
          <TradingNotesView />
        </TabsContent>

        <TabsContent value="lessons" className="mt-6">
          <LessonsView />
        </TabsContent>

        <TabsContent value="charts" className="mt-6">
          <ChartLibraryView />
        </TabsContent>

        <TabsContent value="ideas" className="mt-6">
          <TradeIdeasView />
        </TabsContent>

        <TabsContent value="strategies" className="mt-6">
          <StrategiesView />
        </TabsContent>

        <TabsContent value="psychology" className="mt-6">
          <PsychologyView />
        </TabsContent>

        {/* Placeholder for upcoming features */}
        {["market", "goals"].map((tabId) => (
          <TabsContent key={tabId} value={tabId} className="mt-6">
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  {tabs.find((t) => t.id === tabId)?.icon && 
                    React.createElement(tabs.find((t) => t.id === tabId)!.icon, { 
                      className: "h-8 w-8 text-primary" 
                    })
                  }
                </div>
                <h3 className="text-2xl font-semibold">Coming Soon</h3>
                <p className="text-muted-foreground">
                  This feature is under development. Check the implementation guide for details on how to build it.
                </p>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  );
};
