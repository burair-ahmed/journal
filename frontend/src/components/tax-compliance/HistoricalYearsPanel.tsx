import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { YearlyData } from "@/lib/analytics/tax";
import dayjs from "dayjs";

interface HistoricalYearsPanelProps {
  yearlyData: YearlyData[];
}

export const HistoricalYearsPanel = ({ yearlyData }: HistoricalYearsPanelProps) => {
  const currentYear = dayjs().year();

  return (
    <Card className="p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Historical Years</h3>
      </div>

      <div className="space-y-3">
        {yearlyData.map((yearData, index) => {
          const isProfit = yearData.netPnL >= 0;
          const isCurrent = yearData.year === currentYear;

          return (
            <div
              key={index}
              className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                isCurrent 
                  ? 'bg-primary/10 border-primary/30' 
                  : 'bg-secondary/10 border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold">{yearData.year}</div>
                  {isCurrent && (
                    <Badge className="bg-primary text-primary-foreground">Current</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isProfit ? (
                    <TrendingUp className="h-5 w-5 text-profit" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-loss" />
                  )}
                  <div className={`text-xl font-bold ${isProfit ? 'text-profit' : 'text-loss'}`}>
                    ${Math.abs(yearData.netPnL).toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>{yearData.tradeCount} trades</span>
                <span>•</span>
                <span>Gross: ${yearData.totalPnL.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
