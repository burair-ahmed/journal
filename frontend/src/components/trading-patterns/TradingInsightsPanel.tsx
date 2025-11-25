import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, AlertTriangle, Info } from "lucide-react";
import { TradingInsight } from "@/lib/analytics/tradingPatterns";

interface TradingInsightsPanelProps {
  insights: TradingInsight[];
}

export const TradingInsightsPanel = ({ insights }: TradingInsightsPanelProps) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case "symbol": return TrendingUp;
      case "day": return Info;
      case "duration": return Info;
      case "pattern": return AlertTriangle;
      default: return Lightbulb;
    }
  };

  const getInsightColor = (importance: string) => {
    switch (importance) {
      case "high": return "text-profit border-profit/30 bg-profit/5";
      case "medium": return "text-primary border-primary/30 bg-primary/5";
      case "low": return "text-muted-foreground border-muted bg-muted/5";
      default: return "text-foreground border-border bg-card";
    }
  };

  return (
    <Card className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Lightbulb className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Trading Insights & Patterns</h3>
      </div>

      <div className="space-y-3">
        {insights.length > 0 ? (
          insights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            const colorClass = getInsightColor(insight.importance);

            return (
              <div
                key={index}
                className={`p-4 rounded-xl border ${colorClass} transition-all duration-200 hover:scale-[1.02]`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{insight.message}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {insight.importance}
                  </Badge>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No significant patterns detected yet. Keep trading to generate insights!</p>
          </div>
        )}
      </div>
    </Card>
  );
};
