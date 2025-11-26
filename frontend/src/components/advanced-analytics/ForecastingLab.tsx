import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { MonteCarloResults } from "@/lib/analytics/monteCarlo";

interface ForecastingLabProps extends MonteCarloResults {}

export const ForecastingLab = ({
  percentiles,
  drawdownProbability,
  riskOfRuin,
  simulationData
}: ForecastingLabProps) => {
  const riskConfig = {
    minimal: { color: "text-profit bg-profit/10 border-profit/30", icon: CheckCircle2, label: "MINIMAL" },
    elevated: { color: "text-accent bg-accent/10 border-accent/30", icon: AlertTriangle, label: "ELEVATED" },
    critical: { color: "text-loss bg-loss/10 border-loss/30", icon: AlertCircle, label: "CRITICAL" }
  };

  const config = riskConfig[riskOfRuin];
  const Icon = config.icon;

  return (
    <Card className="p-6 rounded-2xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">Monte Carlo Forecasting Lab</h3>
          </div>
          <Badge className={`${config.color} border`}>
            <Icon className="h-4 w-4 mr-1 inline" />
            Risk: {config.label}
          </Badge>
        </div>

        {/* Percentile KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-loss/10 border border-loss/20 rounded-xl text-center">
            <div className="text-xs text-muted-foreground mb-1">5th Percentile</div>
            <div className="text-2xl font-bold text-loss">${percentiles.p5.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">Worst case</div>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-center">
            <div className="text-xs text-muted-foreground mb-1">50th Percentile</div>
            <div className="text-2xl font-bold text-primary">${percentiles.p50.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">Median</div>
          </div>

          <div className="p-4 bg-profit/10 border border-profit/20 rounded-xl text-center">
            <div className="text-xs text-muted-foreground mb-1">95th Percentile</div>
            <div className="text-2xl font-bold text-profit">${percentiles.p95.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">Best case</div>
          </div>
        </div>

        {/* Distribution Visualization */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Outcome Distribution (1000 scenarios)</div>
          <div className="h-24 flex items-end gap-0.5">
            {simulationData.map((val, i) => {
              const max = Math.max(...simulationData.map(Math.abs));
              const height = (Math.abs(val) / max) * 100;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-t ${val >= 0 ? 'bg-profit/60' : 'bg-loss/60'}`}
                  style={{ height: `${Math.max(height, 5)}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* Drawdown Probability */}
        <div className="p-4 bg-secondary/20 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Probability of Drawdown</span>
            <span className="text-2xl font-bold">{drawdownProbability.toFixed(1)}%</span>
          </div>
          <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-loss/60 to-loss transition-all duration-500"
              style={{ width: `${drawdownProbability}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
