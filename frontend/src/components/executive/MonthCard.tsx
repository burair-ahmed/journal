import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MiniBar } from "./MiniBar";

interface MonthCardProps {
  month: string;
  pnl: number;
  winRate: number;
  trades: number;
}

export const MonthCard = ({ month, pnl, winRate, trades }: MonthCardProps) => {
  const isProfit = pnl >= 0;
  const colorScheme = isProfit ? "profit" : "loss";

  return (
    <Card className="p-4 rounded-xl hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{month}</span>
          <MiniBar 
            value={pnl} 
            maxValue={Math.max(Math.abs(pnl), 100)} 
            color={colorScheme}
            height={30}
          />
        </div>

        <div className={`text-xl font-bold ${isProfit ? 'text-profit' : 'text-loss'}`}>
          ${Math.abs(pnl).toFixed(2)}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{trades} trades</span>
          <Badge variant="outline" className="text-xs">
            {winRate.toFixed(0)}% WR
          </Badge>
        </div>
      </div>
    </Card>
  );
};
