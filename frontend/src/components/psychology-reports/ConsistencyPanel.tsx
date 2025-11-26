import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { ConsistencyMetrics } from "@/lib/analytics/psychology";
import { useEffect, useState } from "react";

interface ConsistencyPanelProps extends ConsistencyMetrics {}

export const ConsistencyPanel = ({ consistencyScore, stdDev, variance, trendData }: ConsistencyPanelProps) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const increment = consistencyScore / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= consistencyScore) {
        setDisplayScore(consistencyScore);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [consistencyScore]);

  return (
    <Card className="p-6 rounded-2xl">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Trading Consistency Report</h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Consistency Score</div>
            <div className="text-4xl font-bold">{displayScore.toFixed(0)}/100</div>
            <p className="text-xs text-muted-foreground">Higher is better - measures return stability</p>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Std Deviation</div>
            <div className="text-4xl font-bold">${stdDev.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lower is better - measures variance</p>
          </div>
        </div>

        {/* Mini Sparkline */}
        {trendData.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Return Trend (Last 30 Trades)</div>
            <div className="h-16 flex items-end gap-0.5">
              {trendData.map((val, i) => {
                const max = Math.max(...trendData.map(Math.abs));
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
        )}

        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary">
          <strong>Tip:</strong> Aim for consistent, steady profits rather than spectacular wins followed by big losses.
        </div>
      </div>
    </Card>
  );
};
