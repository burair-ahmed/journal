import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Brain, Heart, TrendingUp, Activity } from "lucide-react";
import { PsychologyInsight } from "@/lib/analytics/psychology";

interface PsychologyInsightsPanelProps {
  insights: PsychologyInsight[];
}

export const PsychologyInsightsPanel = ({ insights }: PsychologyInsightsPanelProps) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "discipline": return Brain;
      case "emotion": return Heart;
      case "consistency": return TrendingUp;
      case "frequency": return Activity;
      default: return Lightbulb;
    }
  };

  const getImportanceColor = (importance: string): string => {
    switch (importance) {
      case "high": return "text-profit border-profit/30 bg-profit/5";
      case "medium": return "text-primary border-primary/30 bg-primary/5";
      case "low": return "text-muted-foreground border-muted bg-muted/5";
      default: return "text-foreground border-border bg-card";
    }
  };

  return (
    <Card className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Actionable Psychology Insights</h3>
        </div>

        <div className="space-y-3">
          {insights.length > 0 ? (
            insights.map((insight, index) => {
              const Icon = getCategoryIcon(insight.category);
              const colorClass = getImportanceColor(insight.importance);

              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl border ${colorClass} hover:scale-[1.01] transition-all duration-200`}
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
              <p className="text-sm">Keep trading to generate behavioral insights!</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
