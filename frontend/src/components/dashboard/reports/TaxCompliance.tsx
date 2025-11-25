import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useFilteredTrades } from "@/hooks/useTrades";
import dayjs from "dayjs";

// Import analytics utilities
import {
  calculateAnnualSummary,
  calculateQuarterlyBreakdown,
  calculateHistoricalYears,
  prepareAuditTrail,
  calculateAccountComparison,
  generateTaxCSV
} from "@/lib/analytics/tax";

// Import tax-compliance components
import { TaxYearSummaryPanel } from "@/components/tax-compliance/TaxYearSummaryPanel";
import { HistoricalYearsPanel } from "@/components/tax-compliance/HistoricalYearsPanel";
import { AuditTrailPanel } from "@/components/tax-compliance/AuditTrailPanel";
import { ExportTaxReportButton } from "@/components/tax-compliance/ExportTaxReportButton";
import { BrokerAccountComparisonPanel } from "@/components/tax-compliance/BrokerAccountComparisonPanel";

interface TaxComplianceProps {
  accountId?: number;
}

export const TaxCompliance = ({ accountId }: TaxComplianceProps) => {
  const { trades = [], isLoading } = useFilteredTrades(accountId);
  const currentYear = dayjs().year();

  // Calculate all metrics using analytics utilities
  const annualSummary = useMemo(() => calculateAnnualSummary(trades, currentYear), [trades, currentYear]);
  const quarterlyData = useMemo(() => calculateQuarterlyBreakdown(trades, currentYear), [trades, currentYear]);
  const historicalYears = useMemo(() => calculateHistoricalYears(trades), [trades]);
  const auditTrail = useMemo(() => prepareAuditTrail(trades, currentYear), [trades, currentYear]);
  const accountComparison = useMemo(() => calculateAccountComparison(trades), [trades]);
  const csvContent = useMemo(() => generateTaxCSV(trades, currentYear), [trades, currentYear]);

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Tax Compliance Report</h2>
          <p className="text-muted-foreground">Professional tax reporting and audit trail for {currentYear}</p>
        </div>
        <ExportTaxReportButton csvContent={csvContent} year={currentYear} />
      </div>

      {/* A. Tax Year Summary Panel */}
      <TaxYearSummaryPanel
        annualSummary={annualSummary}
        quarterlyData={quarterlyData}
        year={currentYear}
      />

      {/* B & C. Historical Years and Account Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HistoricalYearsPanel yearlyData={historicalYears} />
        <BrokerAccountComparisonPanel accounts={accountComparison} />
      </div>

      {/* D. Audit Trail Panel */}
      <AuditTrailPanel auditTrail={auditTrail} />
    </div>
  );
};
