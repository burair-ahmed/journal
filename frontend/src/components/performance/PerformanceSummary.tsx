import { Card } from "@/components/ui/card";
import { Brain, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { useMemo } from "react";

interface PerformanceSummaryProps {
  winRate: number;
  avgQuality: number;
  monthlyData: Record<string, { profit: number; trades: number; wins: number }>;
  worstTrades: any[];
  totalTrades: number;
}

export const PerformanceSummary = ({ 
  winRate, 
  avgQuality, 
  monthlyData, 
  worstTrades,
  totalTrades 
}: PerformanceSummaryProps) => {
  const summary = useMemo(() => {
    // Analyze profit trend (last 6 months)
    const months = Object.entries(monthlyData).slice(-6);
    const profitTrend = months.length > 0 
      ? months.filter(([, data]) => data.profit > 0).length / months.length 
      : 0;

    // Analyze quality
    const qualityLevel = avgQuality >= 75 ? "excellent" : avgQuality >= 60 ? "good" : avgQuality >= 45 ? "fair" : "poor";
    
    // Analyze worst trades severity
    const avgWorstLoss = worstTrades.length > 0
      ? Math.abs(worstTrades.reduce((sum, t) => sum + Number(t.profit), 0) / worstTrades.length)
      : 0;

    // Analyze win rate
    const winRateLevel = winRate >= 60 ? "strong" : winRate >= 50 ? "moderate" : "weak";

    // Generate summary
    let text = "";

    // Profitability trend
    if (profitTrend >= 0.66) {
      text += "Your profitability is trend-positive over the last 6 months";
    } else if (profitTrend >= 0.33) {
      text += "Your profitability shows mixed results over the last 6 months";
    } else {
      text += "Your profitability is concerning over the last 6 months";
    }

    // Risk control
    if (avgQuality >= 70) {
      text += ", with strong risk control";
    } else if (avgQuality >= 50) {
      text += ", with moderate risk control";
    } else {
      text += ", with weak risk control";
    }

    // Trade quality
    if (qualityLevel === "excellent") {
      text += " and excellent trade quality. ";
    } else if (qualityLevel === "good") {
      text += " and good trade quality. ";
    } else if (qualityLevel === "fair") {
      text += " but inconsistent trade quality. ";
    } else {
      text += " and poor trade quality. ";
    }

    // Identify leaks
    if (avgWorstLoss > 100) {
      text += `Your biggest leak is large losing trades averaging $${avgWorstLoss.toFixed(0)}. `;
    }

    if (winRate < 50) {
      text += `Your win rate of ${winRate.toFixed(1)}% needs improvement. `;
    }

    if (avgQuality < 60) {
      text += "Focus on improving execution discipline with proper stop losses and take profits. ";
    }

    // Recommendations
    if (worstTrades.length >= 10) {
      const bottomPercentage = ((worstTrades.length / totalTrades) * 100).toFixed(0);
      text += `Consider analyzing and removing patterns from your bottom ${bottomPercentage}% trades.`;
    }

    return text;
  }, [winRate, avgQuality, monthlyData, worstTrades, totalTrades]);

  const getSentiment = (): "positive" | "neutral" | "negative" => {
    if (winRate >= 55 && avgQuality >= 65) return "positive";
    if (winRate >= 45 && avgQuality >= 50) return "neutral";
    return "negative";
  };

  const sentiment = getSentiment();
  const sentimentConfig = {
    positive: {
      icon: TrendingUp,
      color: "text-profit",
      bgColor: "from-profit/10 to-profit/5",
      borderColor: "border-profit/20"
    },
    neutral: {
      icon: Brain,
      color: "text-primary",
      bgColor: "from-primary/10 to-primary/5",
      borderColor: "border-primary/20"
    },
    negative: {
      icon: AlertTriangle,
      color: "text-loss",
      bgColor: "from-loss/10 to-loss/5",
      borderColor: "border-loss/20"
    }
  };

  const config = sentimentConfig[sentiment];
  const Icon = config.icon;

  return (
    <Card className={`p-6 bg-gradient-to-br ${config.bgColor} border ${config.borderColor}`}>
      <div className="flex items-start gap-4">
        <Icon className={`h-7 w-7 ${config.color} mt-1 flex-shrink-0`} />
        <div className="space-y-2 flex-1">
          <h3 className="text-xl font-semibold">Performance Analysis</h3>
          <p className="text-sm leading-relaxed text-foreground/90">
            {summary}
          </p>
        </div>
      </div>
    </Card>
  );
};
