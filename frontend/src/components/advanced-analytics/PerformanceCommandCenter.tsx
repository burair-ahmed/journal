import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, AlertCircle } from "lucide-react";
import { MTDMetrics } from "@/lib/analytics/performance";
import { useEffect, useState } from "react";

interface PerformanceCommandCenterProps extends MTDMetrics {}

export const PerformanceCommandCenter = ({
  mtdProfit,
  projectedMonthEnd,
  confidenceBand,
  paceStatus,
  goalDelta,
  sparklineData
}: PerformanceCommandCenterProps) => {
  const [displayProfit, setDisplayProfit] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = mtdProfit / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (Math.abs(current) >= Math.abs(mtdProfit)) {
        setDisplayProfit(mtdProfit);
        clearInterval(timer);
      } else {
        setDisplayProfit(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [mtdProfit]);

  const isProfit = mtdProfit >= 0;
  const paceConfig = {
    ahead: { color: "text-profit bg-profit/10 border-profit/30", icon: TrendingUp, label: "AHEAD" },
    "on-track": { color: "text-primary bg-primary/10 border-primary/30", icon: Target, label: "ON-TRACK" },
    behind: { color: "text-loss bg-loss/10 border-loss/30", icon: AlertCircle, label: "BEHIND" }
  };

  const config = paceConfig[paceStatus];
  const Icon = config.icon;

  return (
    <Card className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">Performance Command Center</h3>
          <Badge className={`${config.color} border px-3 py-1`}>
            <Icon className="h-4 w-4 mr-1 inline" />
            {config.label}
          </Badge>
        </div>

        {/* MTD Profit */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Month-to-Date Profit</div>
          <div className={`text-5xl font-bold ${isProfit ? 'text-profit' : 'text-loss'}`}>
            ${Math.abs(displayProfit).toFixed(2)}
          </div>
        </div>

        {/* Projected Month-End */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-secondary/20 rounded-xl">
            <div className="text-xs text-muted-foreground mb-1">Projected Month-End</div>
            <div className="text-2xl font-bold">${projectedMonthEnd.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Range: ${confidenceBand.low.toFixed(0)} - ${confidenceBand.high.toFixed(0)}
            </div>
          </div>

          <div className="p-4 bg-secondary/20 rounded-xl">
            <div className="text-xs text-muted-foreground mb-1">Goal Delta (per day)</div>
            <div className={`text-2xl font-bold ${goalDelta > 0 ? 'text-loss' : 'text-profit'}`}>
              ${Math.abs(goalDelta).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {goalDelta > 0 ? 'Required to hit target' : 'Ahead of target'}
            </div>
          </div>
        </div>

        {/* Sparkline */}
        {sparklineData.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">MTD P&L Curve</div>
            <div className="h-20">
              <svg width="100%" height="100%" viewBox="0 0 100 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="mtd-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={isProfit ? "hsl(142 76% 36%)" : "hsl(0 84% 60%)"} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={isProfit ? "hsl(142 76% 36%)" : "hsl(0 84% 60%)"} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline
                  points={sparklineData.map((val, i) => {
                    const x = (i / (sparklineData.length - 1)) * 100;
                    const max = Math.max(...sparklineData.map(Math.abs));
                    const y = 40 - (val / (max || 1)) * 30;
                    return `${x},${y}`;
                  }).join(" ")}
                  fill="url(#mtd-gradient)"
                  stroke={isProfit ? "hsl(142 76% 36%)" : "hsl(0 84% 60%)"}
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
