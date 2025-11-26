import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, AlertTriangle } from "lucide-react";

interface TradeVelocityPanelProps {
  tradesPerDay: number;
  tradesPerWeek: number;
  tradesPerMonth: number;
  activityHeatmap: number[];
  frequencyLevel: "low" | "optimal" | "high";
}

export const TradeVelocityPanel = ({
  tradesPerDay,
  tradesPerWeek,
  tradesPerMonth,
  activityHeatmap,
  frequencyLevel
}: TradeVelocityPanelProps) => {
  const frequencyConfig = {
    low: { color: "text-primary bg-primary/10 border-primary/30", icon: TrendingUp, label: "Low Activity", message: "Potential missed opportunities" },
    optimal: { color: "text-profit bg-profit/10 border-profit/30", icon: Activity, label: "Optimal Zone", message: "Balanced trading frequency" },
    high: { color: "text-loss bg-loss/10 border-loss/30", icon: AlertTriangle, label: "High Frequency", message: "Risk of overtrading" }
  };

  const config = frequencyConfig[frequencyLevel];
  const Icon = config.icon;

  const maxActivity = Math.max(...activityHeatmap, 1);

  return (
    <Card className="p-6 rounded-2xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Trade Velocity & Behavior</h3>
          <Badge className={`${config.color} border`}>
            <Icon className="h-4 w-4 mr-1 inline" />
            {config.label}
          </Badge>
        </div>

        {/* Velocity Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-secondary/20 rounded-xl text-center">
            <div className="text-xs text-muted-foreground mb-1">Per Day</div>
            <div className="text-3xl font-bold">{tradesPerDay.toFixed(1)}</div>
          </div>
          <div className="p-4 bg-secondary/20 rounded-xl text-center">
            <div className="text-xs text-muted-foreground mb-1">Per Week</div>
            <div className="text-3xl font-bold">{tradesPerWeek.toFixed(0)}</div>
          </div>
          <div className="p-4 bg-secondary/20 rounded-xl text-center">
            <div className="text-xs text-muted-foreground mb-1">Per Month</div>
            <div className="text-3xl font-bold">{tradesPerMonth.toFixed(0)}</div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="space-y-2">
          <div className="text-sm font-medium">30-Day Activity Intensity</div>
          <div className="grid grid-cols-6 md:grid-cols-7 gap-1">
            {activityHeatmap.map((count, index) => {
              const intensity = count / maxActivity;
              const opacity = Math.max(0.1, intensity);
              return (
                <div
                  key={index}
                  className="aspect-square rounded-sm"
                  style={{
                    backgroundColor: `hsl(300 85% 60% / ${opacity})`
                  }}
                  title={`${count} trades`}
                />
              );
            })}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{config.message}</p>
      </div>
    </Card>
  );
};
