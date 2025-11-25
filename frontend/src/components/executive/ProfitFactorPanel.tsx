import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target } from "lucide-react";
import { ProfitFactorData } from "@/lib/analytics/executiveSummary";

interface ProfitFactorPanelProps extends ProfitFactorData {}

export const ProfitFactorPanel = ({ grossProfit, grossLoss, profitFactor }: ProfitFactorPanelProps) => {
  const total = grossProfit + grossLoss;
  const profitPercentage = total > 0 ? (grossProfit / total) * 100 : 50;
  const lossPercentage = total > 0 ? (grossLoss / total) * 100 : 50;

  const getProfitFactorGrade = (pf: number): { grade: string; color: string } => {
    if (pf >= 2) return { grade: "Excellent", color: "text-profit" };
    if (pf >= 1.5) return { grade: "Good", color: "text-primary" };
    if (pf >= 1) return { grade: "Fair", color: "text-muted-foreground" };
    return { grade: "Poor", color: "text-loss" };
  };

  const { grade, color } = getProfitFactorGrade(profitFactor);

  return (
    <Card className="p-6 space-y-6 rounded-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Profit Factor Analysis</h3>
        <Badge className={`${color} bg-transparent border-current`}>
          {grade}
        </Badge>
      </div>

      {/* Main Profit Factor */}
      <div className="text-center space-y-2">
        <div className="text-sm text-muted-foreground">Profit Factor</div>
        <div className={`text-5xl font-bold ${color}`}>
          {profitFactor.toFixed(2)}
        </div>
        <div className="text-xs text-muted-foreground">
          {profitFactor >= 1 ? "Profitable System" : "Losing System"}
        </div>
      </div>

      {/* Stacked Bar Graph */}
      <div className="space-y-3">
        <div className="text-sm font-medium">Gross Profit vs Loss</div>
        <div className="h-8 flex rounded-lg overflow-hidden">
          <div
            className="bg-profit flex items-center justify-center text-xs font-medium text-white transition-all duration-500"
            style={{ width: `${profitPercentage}%` }}
          >
            {profitPercentage > 15 && `${profitPercentage.toFixed(0)}%`}
          </div>
          <div
            className="bg-loss flex items-center justify-center text-xs font-medium text-white transition-all duration-500"
            style={{ width: `${lossPercentage}%` }}
          >
            {lossPercentage > 15 && `${lossPercentage.toFixed(0)}%`}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-profit/10 rounded-xl border border-profit/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-profit" />
            <span className="text-sm text-muted-foreground">Gross Profit</span>
          </div>
          <div className="text-2xl font-bold text-profit">${grossProfit.toFixed(2)}</div>
        </div>

        <div className="p-4 bg-loss/10 rounded-xl border border-loss/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-loss" />
            <span className="text-sm text-muted-foreground">Gross Loss</span>
          </div>
          <div className="text-2xl font-bold text-loss">${grossLoss.toFixed(2)}</div>
        </div>
      </div>

      {/* Break-even Point */}
      <div className="p-3 bg-secondary/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Break-even Point</span>
          </div>
          <span className="text-sm font-bold">
            {profitFactor >= 1 ? `+$${(grossProfit - grossLoss).toFixed(2)}` : `-$${(grossLoss - grossProfit).toFixed(2)}`}
          </span>
        </div>
      </div>
    </Card>
  );
};
