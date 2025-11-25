import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QualityRing } from "./QualityRing";
import { CheckCircle2, Target, Shield, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface QualityScorePanelProps {
  score: number;
  totalTrades: number;
  breakdown: {
    withSL: number;
    withTP: number;
    profitable: number;
    avgRR: number;
  };
}

export const QualityScorePanel = ({ score, totalTrades, breakdown }: QualityScorePanelProps) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const getGrade = (score: number): string => {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    return "D";
  };

  const getGradeColor = (grade: string): string => {
    if (grade === "A+" || grade === "A") return "bg-profit text-profit-foreground";
    if (grade === "B") return "bg-primary text-primary-foreground";
    if (grade === "C") return "bg-muted text-muted-foreground";
    return "bg-loss text-loss-foreground";
  };

  const grade = getGrade(score);
  const slPercentage = (breakdown.withSL / totalTrades) * 100;
  const tpPercentage = (breakdown.withTP / totalTrades) * 100;
  const profitablePercentage = (breakdown.profitable / totalTrades) * 100;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Trade Quality Score</h3>
        <Badge className={`text-lg px-4 py-1 ${getGradeColor(grade)}`}>
          {grade}
        </Badge>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <QualityRing percentage={score} size={160} strokeWidth={12} color="primary" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold">{displayScore.toFixed(0)}</div>
            <div className="text-sm text-muted-foreground">/ 100</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Average quality across {totalTrades} trades
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Trades with Stop Loss</span>
          </div>
          <span className="text-sm font-bold">{slPercentage.toFixed(1)}%</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Trades with Take Profit</span>
          </div>
          <span className="text-sm font-bold">{tpPercentage.toFixed(1)}%</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-profit" />
            <span className="text-sm font-medium">Profitable Trades</span>
          </div>
          <span className="text-sm font-bold text-profit">{profitablePercentage.toFixed(1)}%</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Average R:R Ratio</span>
          </div>
          <span className="text-sm font-bold">{breakdown.avgRR.toFixed(2)}:1</span>
        </div>
      </div>
    </Card>
  );
};
