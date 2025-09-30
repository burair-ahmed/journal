import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { useTrades } from "@/hooks/useTrades";

// ✅ Standard Profit Factor formula
function calculateProfitFactor(trades: { profit: number }[]): number {
  const grossProfit = trades
    .filter((t) => t.profit > 0)
    .reduce((sum, t) => sum + Number(t.profit), 0);

  const grossLoss = trades
    .filter((t) => t.profit < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.profit)), 0);

  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
  return grossProfit / grossLoss;
}

export const TradezellaProfitFactorCard = () => {
  const { data: trades, isLoading } = useTrades();

  if (isLoading) {
    return (
      <Card className="p-4 border-dashed border-2">
        <div className="text-center text-sm text-muted-foreground">
          Loading...
        </div>
      </Card>
    );
  }

  if (!trades || trades.length === 0) {
    return (
      <Card className="p-4 border-dashed border-2">
        <div className="text-center text-sm text-muted-foreground">
          No trades
        </div>
      </Card>
    );
  }

  // ✅ Compute Profit Factor
  const profitFactor = calculateProfitFactor(trades);

  // ✅ Scale progress bar relative to PF (capped at ~4.0 scale for UI)
  const cappedPF = Math.min(profitFactor, 4);
  const progress = Math.round((cappedPF / 4) * 100);

  return (
    <Card className="p-4 border-dashed border-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Profit Factor</span>
        <Info className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="text-2xl font-bold mb-3">
        {profitFactor === Infinity ? "∞" : profitFactor.toFixed(2)}
      </div>

      {/* Circular Progress */}
      <div className="relative w-16 h-16 mx-auto">
        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="6"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${
              2 * Math.PI * 28 * (1 - progress / 100)
            }`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium">{progress}%</span>
        </div>
      </div>
    </Card>
  );
};
