import { Card } from "@/components/ui/card";
import { Brain, TrendingUp, AlertTriangle, TrendingDown } from "lucide-react";

interface ExecutiveAISummaryProps {
  summary: string;
  profitFactor: number;
  ytdPnL: number;
}

export const ExecutiveAISummary = ({ summary, profitFactor, ytdPnL }: ExecutiveAISummaryProps) => {
  const getSentiment = (): "positive" | "neutral" | "negative" => {
    if (profitFactor >= 1.5 && ytdPnL > 0) return "positive";
    if (profitFactor >= 1 && ytdPnL >= 0) return "neutral";
    return "negative";
  };

  const sentiment = getSentiment();
  
  const sentimentConfig = {
    positive: {
      icon: TrendingUp,
      color: "text-profit",
      bgGradient: "from-profit/10 via-profit/5 to-transparent",
      borderColor: "border-profit/30"
    },
    neutral: {
      icon: Brain,
      color: "text-primary",
      bgGradient: "from-primary/10 via-primary/5 to-transparent",
      borderColor: "border-primary/30"
    },
    negative: {
      icon: AlertTriangle,
      color: "text-loss",
      bgGradient: "from-loss/10 via-loss/5 to-transparent",
      borderColor: "border-loss/30"
    }
  };

  const config = sentimentConfig[sentiment];
  const Icon = config.icon;

  return (
    <Card className={`p-6 rounded-2xl bg-gradient-to-br ${config.bgGradient} border ${config.borderColor}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-card border ${config.borderColor}`}>
          <Icon className={`h-6 w-6 ${config.color}`} />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-xl font-semibold">Executive Analysis</h3>
          <p className="text-sm leading-relaxed text-foreground/90">
            {summary}
          </p>
        </div>
      </div>
    </Card>
  );
};
