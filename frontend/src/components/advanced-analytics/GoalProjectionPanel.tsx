import { Card } from "@/components/ui/card";
import { Target } from "lucide-react";
import { GoalMetrics } from "@/lib/analytics/goalProjection";
import { useEffect, useState } from "react";

interface GoalProjectionPanelProps extends GoalMetrics {}

export const GoalProjectionPanel = ({
  monthlyGoalCompletion,
  ytdGoalCompletion,
  goalProbability,
  remainingToGoal,
  insights
}: GoalProjectionPanelProps) => {
  const [displayMonthly, setDisplayMonthly] = useState(0);
  const [displayYTD, setDisplayYTD] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    
    const monthlyIncrement = monthlyGoalCompletion / steps;
    const ytdIncrement = ytdGoalCompletion / steps;
    
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      if (current >= steps) {
        setDisplayMonthly(monthlyGoalCompletion);
        setDisplayYTD(ytdGoalCompletion);
        clearInterval(timer);
      } else {
        setDisplayMonthly(current * monthlyIncrement);
        setDisplayYTD(current * ytdIncrement);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [monthlyGoalCompletion, ytdGoalCompletion]);

  const RadialRing = ({ percentage, label }: { percentage: number; label: string }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

    return (
      <div className="relative">
        <svg width="120" height="120" className="transform -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-secondary"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="url(#goal-gradient)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
          <defs>
            <linearGradient id="goal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(300 85% 60%)" />
              <stop offset="100%" stopColor="hsl(142 76% 36%)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold">{percentage.toFixed(0)}%</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6 rounded-2xl">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Goal Projection & KPI Engine</h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col items-center">
            <RadialRing percentage={displayMonthly} label="Monthly" />
            <div className="mt-2 text-sm text-muted-foreground">
              ${remainingToGoal.toFixed(0)} remaining
            </div>
          </div>

          <div className="flex flex-col items-center">
            <RadialRing percentage={displayYTD} label="YTD" />
            <div className="mt-2 text-sm text-muted-foreground">
              {goalProbability.toFixed(0)}% probability
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div key={index} className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm">
              {insight}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
