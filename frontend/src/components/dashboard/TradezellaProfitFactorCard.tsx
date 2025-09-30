import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

export const TradezellaProfitFactorCard = () => {
  const progress = 52; // 2.10 out of ~4.0 scale

  return (
    <Card className="p-4 border-dashed border-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Profit Factor</span>
        <Info className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="text-2xl font-bold mb-3">2.10</div>
      
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
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
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