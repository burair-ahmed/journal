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
  const avgWin =
    wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
  const avgLoss =
    losses.length > 0
      ? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length)
      : 1;

  const avgWinLoss = avgLoss > 0 ? avgWin / avgLoss : 0;

  const grossProfit = wins.reduce((a, b) => a + b, 0);
  const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0));
  const profitFactor =
    grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 10 : 0;

  // Normalize 0–1
  const nWinRate = Math.min(1, winRate);
  const nAvgWinLoss = Math.min(1, avgWinLoss / 3);
  const nProfitFactor = Math.min(1, profitFactor / 3);

  // Simple weighted average
  const score = ((nWinRate + nAvgWinLoss + nProfitFactor) / 3) * 100;

  return { winRate: nWinRate, avgWinLoss: nAvgWinLoss, profitFactor: nProfitFactor, score };
}

// -------------------------
// Zella Score Widget
// -------------------------
export const ZellaScoreWidget = () => {
  const { data: trades, isLoading } = useTrades();

  if (isLoading) {
    return (
      <Card className="p-4 border border-primary/20 bg-primary/5 animate-pulse">
        <div className="text-sm text-muted-foreground">Loading Zella Score...</div>
      </Card>
    );
  }

  const { winRate, avgWinLoss, profitFactor, score } = calculateMetrics(trades || []);

  // Triangle base points
  const top = { x: 50, y: 5 };
  const left = { x: 10, y: 55 };
  const right = { x: 90, y: 55 };

  const lerp = (a: any, b: any, t: number) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  });

  // Radar fill points
  const p1 = lerp(top, left, avgWinLoss);
  const p2 = lerp(top, right, profitFactor);
  const p3 = lerp(left, right, winRate);
  const polygonPoints = `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;

  // Grid layers
  const layers = [0.25, 0.5, 0.75, 1];

  return (
    <Card className="relative p-4 border bg-card shadow-sm rounded-xl border-primary/20 bg-primary/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Zella Score</span>
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          BETA
        </span>
      </div>

      {/* Radar Chart */}
      <div className="relative h-36 mb-3 flex items-center justify-center">
        <svg viewBox="0 0 100 60" className="w-[80%] h-[80%]">
          {/* Grid Layers */}
          {layers.map((lvl, i) => {
            const a = lerp(top, left, lvl);
            const b = lerp(top, right, lvl);
            const c = lerp(left, right, lvl);
            return (
              <polygon
                key={i}
                points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y}`}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeOpacity={0.15}
              />
            );
          })}

          {/* Filled Area */}
          <polygon
            points={polygonPoints}
            fill="url(#primaryGradient)"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            opacity="0.7"
          />

          <defs>
            <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>

        {/* Labels */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">
          Win %
        </div>
        <div className="absolute top-[60%] left-[10%] text-[10px] text-muted-foreground">
          Avg win/loss
        </div>
        <div className="absolute top-[60%] right-[10%] text-[10px] text-muted-foreground">
          Profit factor
        </div>
      </div>

      {/* Score */}
      <div className="text-center">
        <div className="text-sm text-muted-foreground">Your Zella Score</div>
        <div className="text-2xl font-bold text-primary">{score.toFixed(2)}</div>
      </div>
    </Card>
  );
};
