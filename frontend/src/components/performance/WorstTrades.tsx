import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingDown } from "lucide-react";
import dayjs from "dayjs";

interface Trade {
  symbol: string;
  profit: number;
  close_time: string;
  tp_price?: number;
  sl_price?: number;
  open_price: number;
}

interface WorstTradesProps {
  trades: Trade[];
}

export const WorstTrades = ({ trades }: WorstTradesProps) => {
  const calculateRR = (trade: Trade): number | null => {
    if (!trade.tp_price || !trade.sl_price) return null;
    const reward = Math.abs(Number(trade.tp_price) - Number(trade.open_price));
    const risk = Math.abs(Number(trade.open_price) - Number(trade.sl_price));
    return risk > 0 ? reward / risk : null;
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingDown className="h-5 w-5 text-loss" />
        <h3 className="text-xl font-semibold">Top 10 Losing Trades</h3>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {trades.map((trade, index) => {
          const rr = calculateRR(trade);
          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-secondary/10 hover:bg-secondary/20 rounded-lg transition-all duration-200 hover:scale-[1.02] group"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-loss/10 text-loss font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="font-semibold text-left hover:text-primary transition-colors">
                          {trade.symbol}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click for trade details</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="text-xs text-muted-foreground">
                    {dayjs(trade.close_time).format("MMM DD, YYYY")}
                  </div>
                </div>
                {rr && (
                  <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground border-muted">
                    {rr.toFixed(1)}:1 RR
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-loss/10 text-loss border-loss/20 hover:bg-loss/20 text-base font-bold px-3 py-1">
                  ${Number(trade.profit).toFixed(2)}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
