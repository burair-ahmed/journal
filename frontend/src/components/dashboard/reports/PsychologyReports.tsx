import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useFilteredTrades } from "@/hooks/useTrades";

// Import analytics utilities
import {
  calculateDisciplineMetrics,
  calculateEmotionalState,
  calculateConsistency,
  calculateTradingFrequency,
  generatePsychologyInsights
} from "@/lib/analytics/psychology";

// Import psychology-reports components
import { DisciplineScorePanel } from "@/components/psychology-reports/DisciplineScorePanel";
import { EmotionalStatePanel } from "@/components/psychology-reports/EmotionalStatePanel";
import { ConsistencyPanel } from "@/components/psychology-reports/ConsistencyPanel";
import { TradingFrequencyPanel } from "@/components/psychology-reports/TradingFrequencyPanel";
import { PsychologyInsightsPanel } from "@/components/psychology-reports/PsychologyInsightsPanel";

interface PsychologyReportsProps {
  accountId?: number;
}

export const PsychologyReports = ({ accountId }: PsychologyReportsProps) => {
  const { trades = [], isLoading } = useFilteredTrades(accountId);

  // Calculate all metrics using analytics utilities
  const disciplineMetrics = useMemo(() => calculateDisciplineMetrics(trades), [trades]);
  const emotionalAlerts = useMemo(() => 
    calculateEmotionalState(
      disciplineMetrics.revengeTrades, 
      disciplineMetrics.overtradingDays, 
      trades.length
    ), 
    [disciplineMetrics, trades.length]
  );
  const consistencyMetrics = useMemo(() => calculateConsistency(trades), [trades]);
  const frequencyMetrics = useMemo(() => calculateTradingFrequency(trades), [trades]);
  const insights = useMemo(() => 
    generatePsychologyInsights(disciplineMetrics, consistencyMetrics, frequencyMetrics), 
    [disciplineMetrics, consistencyMetrics, frequencyMetrics]
  );

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">Loading data...</div>
      </Card>
    );
  }

  if (!trades || trades.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">No trades available</div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Psychology & Discipline Report</h2>
        <p className="text-muted-foreground">Analyze your trading psychology and maintain discipline</p>
      </div>

      {/* A. Discipline Score Panel */}
      <DisciplineScorePanel {...disciplineMetrics} />

      {/* B. Emotional State & Alerts */}
      <EmotionalStatePanel alerts={emotionalAlerts} />

      {/* C & D. Consistency and Frequency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConsistencyPanel {...consistencyMetrics} />
        <TradingFrequencyPanel {...frequencyMetrics} />
      </div>

      {/* E. Psychology Insights Panel */}
      <PsychologyInsightsPanel insights={insights} />
    </div>
  );
};
