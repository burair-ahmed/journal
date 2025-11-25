import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { PatternStats } from "@/lib/analytics/tradingPatterns";
import { RadialRing } from "./RadialRing";

interface WinLossPatternPanelProps {
  afterWin: PatternStats;
  afterLoss: PatternStats;
}

export const WinLossPatternPanel = ({ afterWin, afterLoss }: WinLossPatternPanelProps) => {
  const getPatternStrength = (winRate: number): { label: string; color: string } => {
    if (winRate >= 60) return { label: "Strong", color: "text-profit" };
    if (winRate >= 50) return { label: "Moderate", color: "text-primary" };
    return { label: "Weak", color: "text-loss" };
  };

  const afterWinStrength = getPatternStrength(afterWin.winRate);
  const afterLossStrength = getPatternStrength(afterLoss.winRate);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Win/Loss Pattern Recognition</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* After Win Pattern */}
        <Card className="p-6 rounded-2xl hover:shadow-lg transition-all duration-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-profit" />
                <h4 className="font-semibold">After a Win</h4>
              </div>
              <Badge className={`${afterWinStrength.color} bg-transparent border-current`}>
                {afterWinStrength.label}
              </Badge>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative">
                <RadialRing percentage={afterWin.winRate} size={120} color="profit" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold">{afterWin.winRate.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Win Rate</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-profit/10 rounded-lg border border-profit/20">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-profit" />
                  <span className="text-xs text-muted-foreground">Next Win</span>
                </div>
                <div className="text-xl font-bold text-profit">{afterWin.nextWins}</div>
              </div>
              <div className="p-3 bg-loss/10 rounded-lg border border-loss/20">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-loss" />
                  <span className="text-xs text-muted-foreground">Next Loss</span>
                </div>
                <div className="text-xl font-bold text-loss">{afterWin.nextLosses}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* After Loss Pattern */}
        <Card className="p-6 rounded-2xl hover:shadow-lg transition-all duration-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-loss" />
                <h4 className="font-semibold">After a Loss</h4>
              </div>
              <Badge className={`${afterLossStrength.color} bg-transparent border-current`}>
                {afterLossStrength.label}
              </Badge>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative">
                <RadialRing percentage={afterLoss.winRate} size={120} color={afterLoss.winRate >= 50 ? "profit" : "loss"} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold">{afterLoss.winRate.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Win Rate</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-profit/10 rounded-lg border border-profit/20">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-profit" />
                  <span className="text-xs text-muted-foreground">Next Win</span>
                </div>
                <div className="text-xl font-bold text-profit">{afterLoss.nextWins}</div>
              </div>
              <div className="p-3 bg-loss/10 rounded-lg border border-loss/20">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-loss" />
                  <span className="text-xs text-muted-foreground">Next Loss</span>
                </div>
                <div className="text-xl font-bold text-loss">{afterLoss.nextLosses}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
