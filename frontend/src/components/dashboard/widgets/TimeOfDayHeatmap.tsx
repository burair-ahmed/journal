import { Card } from "@/components/ui/card";
import { Info, Clock } from "lucide-react";
import { Trade } from "@/hooks/useTrades";

interface TimeOfDayHeatmapProps {
  trades: Trade[];
}

export const TimeOfDayHeatmap = ({ trades }: TimeOfDayHeatmapProps) => {
  // Calculate P&L by hour (0-23)
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourTrades = trades.filter(trade => {
      if (!trade.close_time) return false;
      const tradeHour = new Date(trade.close_time).getHours();
      return tradeHour === hour;
    });

    const totalPnL = hourTrades.reduce((sum, trade) => sum + trade.profit, 0);
    const tradeCount = hourTrades.length;

    return {
      hour,
      pnl: totalPnL,
      tradeCount,
      avgPnL: tradeCount > 0 ? totalPnL / tradeCount : 0
    };
  });

  // Find min/max for color scaling
  const allPnL = hourlyData.map(d => d.pnl);
  const maxPnL = Math.max(...allPnL, 0);
  const minPnL = Math.min(...allPnL, 0);
  const maxAbsPnL = Math.max(Math.abs(maxPnL), Math.abs(minPnL));

  // Get color intensity based on P&L
  const getColorIntensity = (pnl: number) => {
    if (maxAbsPnL === 0) return 0;
    return Math.abs(pnl) / maxAbsPnL;
  };

  // Get background color based on P&L (using primary color theme)
  const getCellStyle = (pnl: number, tradeCount: number) => {
    if (tradeCount === 0) {
      return "bg-muted/20";
    }

    const intensity = getColorIntensity(pnl);
    
    if (pnl > 0) {
      // Profitable - use primary color with varying opacity
      const opacity = 0.2 + (intensity * 0.8); // 0.2 to 1.0
      return `bg-primary`;
    } else if (pnl < 0) {
      // Loss - use destructive color with varying opacity
      const opacity = 0.2 + (intensity * 0.8);
      return `bg-destructive`;
    }
    return "bg-muted/30";
  };

  const getCellOpacity = (pnl: number, tradeCount: number) => {
    if (tradeCount === 0) return 1;
    const intensity = getColorIntensity(pnl);
    return 0.2 + (intensity * 0.8);
  };

  // Group hours into 4 rows of 6 hours each
  const rows = [
    hourlyData.slice(0, 6),   // 00:00 - 05:00
    hourlyData.slice(6, 12),  // 06:00 - 11:00
    hourlyData.slice(12, 18), // 12:00 - 17:00
    hourlyData.slice(18, 24), // 18:00 - 23:00
  ];

  return (
    <Card className="p-6 widget-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Time-of-Day Performance</h3>
        </div>
        <Info className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Heatmap Grid */}
      <div className="space-y-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2">
            {row.map((data) => (
              <div
                key={data.hour}
                className="flex-1 relative group cursor-pointer"
                style={{ paddingBottom: "16.66%" }} // Aspect ratio
              >
                <div
                  className={`absolute inset-0 rounded-md transition-all duration-200 hover:scale-105 ${getCellStyle(data.pnl, data.tradeCount)}`}
                  style={{
                    opacity: getCellOpacity(data.pnl, data.tradeCount)
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-foreground">
                      {String(data.hour).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-xs whitespace-nowrap">
                    <div className="font-semibold mb-1">{String(data.hour).padStart(2, '0')}:00</div>
                    <div className="text-muted-foreground">Trades: {data.tradeCount}</div>
                    <div className={data.pnl >= 0 ? "text-profit" : "text-loss"}>
                      P&L: ${data.pnl.toFixed(2)}
                    </div>
                    {data.tradeCount > 0 && (
                      <div className="text-muted-foreground">
                        Avg: ${data.avgPnL.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive opacity-80"></div>
          <span>Loss</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted/30"></div>
          <span>No trades</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary opacity-80"></div>
          <span>Profit</span>
        </div>
      </div>

      {/* Summary */}
      {trades.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Best Hour: <span className="font-semibold text-foreground">
              {hourlyData.reduce((best, curr) => 
                curr.pnl > best.pnl ? curr : best
              ).hour.toString().padStart(2, '0')}:00
            </span>
            {" "}(${hourlyData.reduce((best, curr) => 
              curr.pnl > best.pnl ? curr : best
            ).pnl.toFixed(2)})
          </div>
        </div>
      )}
    </Card>
  );
};
