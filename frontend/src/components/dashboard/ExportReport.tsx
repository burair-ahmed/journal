import { forwardRef, useState, useMemo } from "react";
import { useFilteredTrades } from "@/hooks/useTrades";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Shield, Brain, Calendar, Target, BarChart3, FileText } from "lucide-react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

// Analytics Components
import { PerformanceAnalytics } from "./reports/PerformanceAnalytics";
import { RiskManagement } from "./reports/RiskManagement";
import { TradingPatterns } from "./reports/TradingPatterns";
import { PsychologyReports } from "./reports/PsychologyReports";
import { TaxCompliance } from "./reports/TaxCompliance";
import { ExecutiveSummary } from "./reports/ExecutiveSummary";
import { AdvancedAnalytics } from "./reports/AdvancedAnalytics";
import { AccountProvider, useAccountContext } from "@/contexts/AccountContext";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface ExportReportProps {
  accountId?: number;
}

export const ExportReport = forwardRef<HTMLDivElement, ExportReportProps>(
  ({ accountId }, ref) => {
    const { trades = [], isLoading } = useFilteredTrades(accountId);
    const [activeTab, setActiveTab] = useState("executive");
const { selectedAccountId } = useAccountContext();
    if (isLoading) {
      return (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">Loading reports...</div>
        </Card>
      );
    }

    if (!trades || trades.length === 0) {
      return (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            No trades available to generate reports.
          </div>
        </Card>
      );
    }

    return (
      <div ref={ref} className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trading Reports</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive analytics and insights • {trades.length} trades analyzed
            </p>
          </div>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export All Reports
          </Button>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 h-auto">
            <TabsTrigger value="executive" className="gap-2 py-3">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Executive</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2 py-3">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="risk" className="gap-2 py-3">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Risk</span>
            </TabsTrigger>
            <TabsTrigger value="patterns" className="gap-2 py-3">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Patterns</span>
            </TabsTrigger>
            <TabsTrigger value="psychology" className="gap-2 py-3">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Psychology</span>
            </TabsTrigger>
            <TabsTrigger value="tax" className="gap-2 py-3">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Tax</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2 py-3">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="mt-6">
            <ExecutiveSummary trades={trades} accountId={selectedAccountId?? undefined} />
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <PerformanceAnalytics trades={trades} accountId={accountId} />
          </TabsContent>

          <TabsContent value="risk" className="mt-6">
            <RiskManagement trades={trades} accountId={accountId} />
          </TabsContent>

          <TabsContent value="patterns" className="mt-6">
            <TradingPatterns trades={trades} accountId={accountId} />
          </TabsContent>

          <TabsContent value="psychology" className="mt-6">
            <PsychologyReports trades={trades} accountId={accountId} />
          </TabsContent>

          <TabsContent value="tax" className="mt-6">
            <TaxCompliance trades={trades} accountId={accountId} />
          </TabsContent>

          <TabsContent value="advanced" className="mt-6">
            <AdvancedAnalytics trades={trades} accountId={accountId} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }
);

ExportReport.displayName = "ExportReport";
