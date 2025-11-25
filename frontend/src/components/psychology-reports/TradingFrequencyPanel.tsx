import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { FrequencyMetrics } from "@/lib/analytics/psychology";
import { useEffect, useState } from "react";

interface TradingFrequencyPanelProps extends FrequencyMetrics {}

export const TradingFrequencyPanel = ({ avgTradesPerDay, frequencyLevel }: TradingFrequencyPanelProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = avgTradesPerDay / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= avgTradesPerDay) {
        setDisplayValue(avgTradesPerDay);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [avgTradesPerDay]);

  const getFrequencyConfig = (level: string) => {
    switch (level) {
      case "high":
        return {
          icon: AlertTriangle,
          color: "text-loss border-loss/30 bg-loss/10",
          label: "High Frequency",
          message: "⚠️ High frequency - ensure you're not overtrading"
        };
      case "moderate":
        return {
          icon: Info,
          color: "text-primary border-primary/30 bg-primary/10",
          label: "Moderate Frequency",
          message: "✅ Moderate frequency - good balance"
        };
      case "low":
        return {
          icon: CheckCircle2,
          color: "text-profit border-profit/30 bg-profit/10",
          label: "Low Frequency",
          message: "✅ Low frequency - quality over quantity"
        };
      default:
        return {
          icon: Info,
          color: "text-foreground border-border bg-card",
          label: "Unknown",
          message: ""
        };
    }
  };

  const config = getFrequencyConfig(frequencyLevel);
  const Icon = config.icon;

  return (
    <Card className="p-6 rounded-2xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">📅 Trading Frequency Analysis</h3>
        </div>

        <div className="text-center space-y-3">
          <div className="text-sm text-muted-foreground">Average Trades per Day</div>
          <div className="text-5xl font-bold">{displayValue.toFixed(1)}</div>

          <Badge className={`${config.color} text-sm px-4 py-1`}>
            <Icon className="h-4 w-4 mr-2 inline" />
            {config.label}
          </Badge>
        </div>

        <p className="text-sm text-center text-muted-foreground mt-4">
          {config.message}
        </p>
      </div>
    </Card>
  );
};
