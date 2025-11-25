import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { EmotionalAlert } from "@/lib/analytics/psychology";

interface EmotionalStatePanelProps {
  alerts: EmotionalAlert[];
}

export const EmotionalStatePanel = ({ alerts }: EmotionalStatePanelProps) => {
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case "high": return "bg-loss/10 border-loss/30 text-loss";
      case "medium": return "bg-primary/10 border-primary/30 text-primary";
      case "low": return "bg-profit/10 border-profit/30 text-profit";
      default: return "bg-secondary/10 border-border text-foreground";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">😰 Emotional State & Alerts</h3>
      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const colorClass = getSeverityColor(alert.severity);
          const Icon = alert.type === "clean" ? CheckCircle2 : AlertCircle;

          return (
            <Card
              key={index}
              className={`p-4 rounded-xl border ${colorClass} hover:scale-[1.02] transition-all duration-200`}
            >
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium mb-1">
                    {alert.type === "revenge" && "Revenge Trading Detected"}
                    {alert.type === "overtrading" && "Overtrading Alert"}
                    {alert.type === "clean" && "Excellent Emotional Control"}
                  </div>
                  <p className="text-sm opacity-90">{alert.message}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
