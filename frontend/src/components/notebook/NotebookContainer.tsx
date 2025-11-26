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
  Plus,
  Mic
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

// Import feature components
import { TradingNotesView } from "./TradingNotesView";
import { LessonsView } from "./LessonsView";
import { ChartLibraryView } from "./ChartLibraryView";
import { TradeIdeasView } from "./TradeIdeasView";
import { StrategiesView } from "./StrategiesView";
import { PsychologyView } from "./PsychologyView";
import { MarketJournalView } from "./MarketJournalView";
import { VoiceNotesView } from "./VoiceNotesView";
import { ResearchView } from "./ResearchView";
import { GoalsView } from "./GoalsView";

export const NotebookContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState("notes");

  interface TabItem {
    id: string;
    label: string;
    icon: any;
    component: React.FC;
    badge?: string;
  }

  const tabs: TabItem[] = [
    { id: "notes", label: "Trading Notes", icon: BookOpen, component: TradingNotesView },
    { id: "lessons", label: "Lessons Learned", icon: Lightbulb, component: LessonsView },
    { id: "charts", label: "Chart Library", icon: Image, component: ChartLibraryView },
    { id: "ideas", label: "Trade Ideas", icon: TrendingUp, component: TradeIdeasView },
    { id: "strategies", label: "Strategies", icon: Book, component: StrategiesView },
    { id: "psychology", label: "Psychology", icon: Brain, component: PsychologyView },
    { id: "market", label: "Market Journal", icon: Globe, component: MarketJournalView },
    { id: "voice", label: "Voice Notes", icon: Mic, component: VoiceNotesView },
    { id: "research", label: "Research", icon: BookOpen, component: ResearchView },
    { id: "goals", label: "Goals", icon: Target, component: GoalsView },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-brand-gradient">
            Trading Notebook
          </h1>
          <p className="text-muted-foreground mt-1">
            Your personal trading journal and knowledge base
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 overflow-x-auto flex-wrap">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex gap-2 items-center px-4 py-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.badge && (
                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">
                  {tab.badge}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 mt-6 overflow-y-auto pr-2">
          <TabsContent value="notes" className="mt-0 h-full">
            <TradingNotesView />
          </TabsContent>

          <TabsContent value="lessons" className="mt-0 h-full">
            <LessonsView />
          </TabsContent>

          <TabsContent value="charts" className="mt-0 h-full">
            <ChartLibraryView />
          </TabsContent>

          <TabsContent value="ideas" className="mt-0 h-full">
            <TradeIdeasView />
          </TabsContent>

          <TabsContent value="strategies" className="mt-0 h-full">
            <StrategiesView />
          </TabsContent>

          <TabsContent value="psychology" className="mt-0 h-full">
            <PsychologyView />
          </TabsContent>

          <TabsContent value="market" className="mt-0 h-full">
            <MarketJournalView />
          </TabsContent>

          <TabsContent value="voice" className="mt-0 h-full">
            <VoiceNotesView />
          </TabsContent>

          <TabsContent value="research" className="mt-0 h-full">
            <ResearchView />
          </TabsContent>

          <TabsContent value="goals" className="mt-0 h-full">
            <GoalsView />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
