import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, FileText, CreditCard, TrendingUp } from "lucide-react";
import { AnnualSummary, QuarterlyData } from "@/lib/analytics/tax";
import { useEffect, useState } from "react";

interface TaxYearSummaryPanelProps {
  annualSummary: AnnualSummary;
  quarterlyData: QuarterlyData[];
  year: number;
}

export const TaxYearSummaryPanel = ({ annualSummary, quarterlyData, year }: TaxYearSummaryPanelProps) => {
  const [displayPnL, setDisplayPnL] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = annualSummary.totalPnL / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (Math.abs(current) >= Math.abs(annualSummary.totalPnL)) {
        setDisplayPnL(annualSummary.totalPnL);
        clearInterval(timer);
      } else {
        setDisplayPnL(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [annualSummary.totalPnL]);

  const isProfit = annualSummary.netPnL >= 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Tax Year {year} Summary</h3>
        <p className="text-sm text-muted-foreground">Complete financial overview for tax reporting</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 rounded-2xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total P&L</span>
            </div>
            <div className={`text-3xl font-bold ${isProfit ? 'text-profit' : 'text-loss'}`}>
              ${Math.abs(displayPnL).toFixed(2)}
            </div>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Trade Count</span>
            </div>
            <div className="text-3xl font-bold">{annualSummary.tradeCount}</div>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-loss" />
              <span className="text-sm text-muted-foreground">Commissions</span>
            </div>
            <div className="text-3xl font-bold text-loss">${annualSummary.totalCommissions.toFixed(2)}</div>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Net P&L</span>
            </div>
            <div className={`text-3xl font-bold ${isProfit ? 'text-profit' : 'text-loss'}`}>
              ${Math.abs(annualSummary.netPnL).toFixed(2)}
            </div>
          </div>
        </Card>
      </div>

      {/* Quarterly Breakdown */}
      <Card className="p-6 rounded-2xl">
        <h4 className="text-lg font-semibold mb-4">Quarterly Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quarterlyData.map((quarter, index) => {
            const isQProfit = quarter.pnl >= 0;
            return (
              <div key={index} className="p-4 bg-secondary/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{quarter.quarter}</span>
                  <Badge variant={isQProfit ? "default" : "destructive"} className="text-xs">
                    {quarter.trades}
                  </Badge>
                </div>
                <div className={`text-2xl font-bold mb-2 ${isQProfit ? 'text-profit' : 'text-loss'}`}>
                  ${Math.abs(quarter.pnl).toFixed(2)}
                </div>
                {/* Mini Sparkline */}
                {quarter.sparklineData.length > 0 && (
                  <div className="h-8">
                    <svg width="100%" height="100%" viewBox="0 0 60 30" preserveAspectRatio="none">
                      <polyline
                        points={quarter.sparklineData.map((val, i) => {
                          const x = (i / (quarter.sparklineData.length - 1)) * 60;
                          const max = Math.max(...quarter.sparklineData.map(Math.abs));
                          const y = 15 - (val / (max || 1)) * 10;
                          return `${x},${y}`;
                        }).join(" ")}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={isQProfit ? "text-profit" : "text-loss"}
                        opacity="0.6"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
