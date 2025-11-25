import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface SymbolPerformanceCardProps {
  symbol: string;
  trades: number;
  winRate: number;
  profit: number;
  sparklineData?: number[];
  rank: number;
}

export const SymbolPerformanceCard = ({ 
  symbol, 
  trades, 
  winRate, 
  profit, 
  sparklineData,
  rank 
}: SymbolPerformanceCardProps) => {
  const isProfit = profit >= 0;

  return (
    <Card className="p-4 rounded-2xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
            {rank}
          </div>
          <div>
            <div className="font-bold text-lg">{symbol}</div>
            <div className="text-xs text-muted-foreground">{trades} trades</div>
          </div>
        </div>
        {isProfit ? (
          <TrendingUp className="h-5 w-5 text-profit" />
        ) : (
          <TrendingDown className="h-5 w-5 text-loss" />
        )}
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className={`text-2xl font-bold ${isProfit ? 'text-profit' : 'text-loss'}`}>
          ${Math.abs(profit).toFixed(2)}
        </div>
        <Badge variant="outline" className="text-xs">
          {winRate.toFixed(0)}% WR
        </Badge>
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="h-8 mt-2">
          <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
            <polyline
              points={sparklineData.map((val, i) => {
                const x = (i / (sparklineData.length - 1)) * 100;
                const max = Math.max(...sparklineData);
                const min = Math.min(...sparklineData);
                const range = max - min || 1;
                const y = 30 - ((val - min) / range) * 30;
                return `${x},${y}`;
              }).join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={isProfit ? "text-profit" : "text-loss"}
              opacity="0.5"
            />
          </svg>
        </div>
      )}
    </Card>
  );
};
