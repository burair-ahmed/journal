import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Shield, AlertTriangle, Target } from "lucide-react";
import { DisciplineMetrics } from "@/lib/analytics/psychology";
import { useEffect, useState } from "react";

interface DisciplineScorePanelProps extends DisciplineMetrics {}

export const DisciplineScorePanel = ({ 
  overallScore, 
  tpslAdherence, 
  overtradingDays, 
  revengeTrades 
}: DisciplineScorePanelProps) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = overallScore / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= overallScore) {
        setDisplayScore(overallScore);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [overallScore]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-profit";
    if (score >= 60) return "text-primary";
    return "text-loss";
  };

  const getProgressColor = (score: number): string => {
    if (score >= 80) return "from-profit/60 to-profit";
    if (score >= 60) return "from-primary/60 to-primary";
    return "from-loss/60 to-loss";
  };

  const scoreColor = getScoreColor(overallScore);
  const progressColor = getProgressColor(overallScore);

  return (
    <Card className="p-6 rounded-2xl shadow-lg">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className={`h-6 w-6 ${scoreColor}`} />
            <h3 className="text-xl font-semibold">Overall Discipline Score</h3>
          </div>
          <Badge className={`${scoreColor} bg-transparent border-current text-base px-3 py-1`}>
            {overallScore >= 80 ? "Excellent" : overallScore >= 60 ? "Good" : "Needs Work"}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="text-center">
            <div className={`text-5xl font-bold ${scoreColor}`}>
              {displayScore.toFixed(0)}/100
            </div>
          </div>

          <div className="h-4 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${progressColor} transition-all duration-1000`}
              style={{ width: `${displayScore}%` }}
            />
          </div>
        </div>

        {/* Sub-metrics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-secondary/20 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">TP/SL Usage</span>
            </div>
            <div className="text-2xl font-bold">{tpslAdherence.toFixed(0)}%</div>
          </div>

          <div className="p-4 bg-secondary/20 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-loss" />
              <span className="text-xs text-muted-foreground">Overtrading</span>
            </div>
            <div className="text-2xl font-bold">{overtradingDays}</div>
            <div className="text-xs text-muted-foreground">days</div>
          </div>

          <div className="p-4 bg-secondary/20 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-4 w-4 text-loss" />
              <span className="text-xs text-muted-foreground">Revenge</span>
            </div>
            <div className="text-2xl font-bold">{revengeTrades}</div>
            <div className="text-xs text-muted-foreground">trades</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
