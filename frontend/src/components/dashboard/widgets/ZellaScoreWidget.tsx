import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { useTrades } from "@/hooks/useTrades";

// -------------------------
// Utility: Calculate Metrics
// -------------------------
function calculateMetrics(trades: any[]) {
  if (!trades || trades.length === 0) {
    return { winRate: 0, avgWinLoss: 0, profitFactor: 0, score: 0 };
  }

  const profits = trades.map((t) => Number(t.profit));
  const wins = profits.filter((p) => p > 0);
  const losses = profits.filter((p) => p < 0);

  const winRate = wins.length / trades.length;

  const avgWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
  const avgLoss =
    losses.length > 0
      ? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length)
      : 1;

  const avgWinLoss = avgLoss > 0 ? avgWin / avgLoss : 0;

  const grossProfit = wins.reduce((a, b) => a + b, 0);
  const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 10 : 0;

  // Normalize 0–1 (clamp to 1 for extreme values)
  const nWinRate = Math.min(1, winRate);
  const nAvgWinLoss = Math.min(1, avgWinLoss / 3); // scale avg win/loss up to 3x
  const nProfitFactor = Math.min(1, profitFactor / 3); // scale PF up to 3

  // Zella Score = simple weighted average
  const score = ((nWinRate + nAvgWinLoss + nProfitFactor) / 3) * 100;

  return { winRate: nWinRate, avgWinLoss: nAvgWinLoss, profitFactor: nProfitFactor, score };
}

// -------------------------
// Dynamic Zella Score Widget
// -------------------------
export const ZellaScoreWidget = () => {
  const { data: trades, isLoading } = useTrades();

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Loading Zella Score...</div>
      </Card>
    );
  }

  const { winRate, avgWinLoss, profitFactor, score } = calculateMetrics(trades || []);

  // Triangle vertices
  const top = { x: 50, y: 5 };
  const right = { x: 90, y: 55 };
  const left = { x: 10, y: 55 };

  // Scale function (interpolates point between two coords)
  const lerp = (a: any, b: any, t: number) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  });

  // Points for metrics
  const avgWinLossPoint = lerp(top, left, avgWinLoss);
  const profitFactorPoint = lerp(top, right, profitFactor);
  const winPoint = lerp(left, right, winRate);

  const polygonPoints = `
    ${avgWinLossPoint.x},${avgWinLossPoint.y}
    ${profitFactorPoint.x},${profitFactorPoint.y}
    ${winPoint.x},${winPoint.y}
  `;

  // Background grid layers
  const layers = [0.25, 0.5, 0.75, 1];

  return (
    <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">Zella Score</span>
        <Info className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="relative h-36 mb-3">
        <svg viewBox="0 0 100 60" className="w-full h-full">
          {/* Background layers */}
          {layers.map((lvl, i) => {
            const p1 = lerp(top, left, lvl);
            const p2 = lerp(top, right, lvl);
            const p3 = lerp(left, right, lvl);
            return (
              <polygon
                key={i}
                points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeOpacity="0.2"
              />
            );
          })}

          {/* Dynamic polygon */}
          <polygon
            points={polygonPoints}
            fill="url(#yellowGradient)"
            stroke="#f59e0b"
            strokeWidth="1.5"
          />

          <defs>
            <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>

        {/* Labels */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="text-xs text-muted-foreground">Win %</div>
        </div>
        <div className="absolute top-2 left-2">
          <div className="text-xs text-muted-foreground">Avg win/loss</div>
        </div>
        <div className="absolute top-2 right-2">
          <div className="text-xs text-muted-foreground">Profit factor</div>
        </div>
      </div>

      {/* Score */}
      <div className="text-center">
        <div className="text-sm text-muted-foreground">Your Zella Score</div>
        <div className="text-2xl font-bold text-yellow-600">{score.toFixed(2)}</div>
      </div>
    </Card>
  );
};
