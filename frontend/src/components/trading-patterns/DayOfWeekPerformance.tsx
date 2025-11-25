import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DayStats } from "@/lib/analytics/tradingPatterns";

interface DayOfWeekPerformanceProps {
  dayStats: DayStats[];
}

export const DayOfWeekPerformance = ({ dayStats }: DayOfWeekPerformanceProps) => {
  const maxProfit = Math.max(...dayStats.map(d => Math.abs(d.profit)), 1);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Day of Week Performance</h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {dayStats.map((day, index) => {
          const isProfit = day.profit >= 0;
          const barWidth = (Math.abs(day.profit) / maxProfit) * 100;

          return (
            <Card 
              key={index} 
              className="p-4 rounded-2xl hover:scale-105 transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="text-center">
                  <div className="font-semibold text-sm text-muted-foreground">{day.day}</div>
                  <div className={`text-2xl font-bold mt-1 ${isProfit ? 'text-profit' : 'text-loss'}`}>
                    ${Math.abs(day.profit).toFixed(2)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground text-center">
                    {day.trades} trades
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isProfit ? 'bg-gradient-to-r from-profit/60 to-profit' : 'bg-gradient-to-r from-loss/60 to-loss'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <Badge variant="outline" className="text-xs">
                    {day.winRate.toFixed(0)}% WR
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
