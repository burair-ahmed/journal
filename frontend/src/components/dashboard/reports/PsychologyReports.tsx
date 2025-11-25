import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import { Brain, AlertCircle, CheckCircle } from "lucide-react";
import dayjs from "dayjs";

interface PsychologyReportsProps {
  trades: any[];
  accountId?: number;
}

export const PsychologyReports = ({ trades }: PsychologyReportsProps) => {
  const psychMetrics = useMemo(() => {
    // Discipline Score
    const tradesWithTPSL = trades.filter(t => t.tp_price && t.sl_price);
    const tpslAdherence = (tradesWithTPSL.length / trades.length) * 100;
    
    // Overtrading detection
    const tradesByDay: Record<string, number> = {};
    trades.forEach(t => {
      const day = dayjs(t.close_time).format('YYYY-MM-DD');
      tradesByDay[day] = (tradesByDay[day] || 0) + 1;
    });
    const avgTradesPerDay = Object.values(tradesByDay).reduce((a, b) => a + b, 0) / Object.keys(tradesByDay).length;
    const overtradingDays = Object.entries(tradesByDay).filter(([, count]) => count > avgTradesPerDay * 2).length;
    
    // Revenge trading (losses followed by quick trades)
    let revengeTrades = 0;
    for (let i = 1; i < trades.length; i++) {
      const prevLoss = Number(trades[i-1].profit) < 0;
      const timeDiff = dayjs(trades[i].open_time).diff(dayjs(trades[i-1].close_time), 'minute');
      if (prevLoss && timeDiff < 30) revengeTrades++;
    }
    
    // Consistency (standard deviation of returns)
    const returns = trades.map(t => Number(t.profit));
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = Math.max(0, 100 - (stdDev / Math.abs(avgReturn)) * 10);
    
    // Overall discipline score
    const disciplineScore = (
      (tpslAdherence * 0.4) +
      (Math.max(0, 100 - (overtradingDays / Object.keys(tradesByDay).length) * 100) * 0.3) +
      (Math.max(0, 100 - (revengeTrades / trades.length) * 100) * 0.3)
    );
    
    return {
      tpslAdherence,
      avgTradesPerDay,
      overtradingDays,
      revengeTrades,
      stdDev,
      consistencyScore,
      disciplineScore
    };
  }, [trades]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Psychology & Discipline</h2>
        <p className="text-muted-foreground">Analyze your trading psychology and discipline</p>
      </div>

      {/* Discipline Score */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">Overall Discipline Score</h3>
        </div>
        <div className="text-4xl font-bold mb-2">{psychMetrics.disciplineScore.toFixed(1)}/100</div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden mb-4">
          <div 
            className={`h-full ${
              psychMetrics.disciplineScore >= 80 ? 'bg-green-500' :
              psychMetrics.disciplineScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${psychMetrics.disciplineScore}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-secondary/20 rounded-lg">
            <div className="text-sm text-muted-foreground">TP/SL Usage</div>
            <div className="text-xl font-bold">{psychMetrics.tpslAdherence.toFixed(1)}%</div>
          </div>
          <div className="text-center p-3 bg-secondary/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Overtrading Days</div>
            <div className="text-xl font-bold">{psychMetrics.overtradingDays}</div>
          </div>
          <div className="text-center p-3 bg-secondary/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Revenge Trades</div>
            <div className="text-xl font-bold">{psychMetrics.revengeTrades}</div>
          </div>
        </div>
      </Card>

      {/* Emotional State */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">😰 Emotional State Correlation</h3>
        
        {psychMetrics.revengeTrades > 5 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <div className="font-medium text-red-900">Revenge Trading Detected</div>
              <div className="text-sm text-red-700 mt-1">
                You've taken {psychMetrics.revengeTrades} trades within 30 minutes of a loss. 
                This suggests emotional trading. Consider implementing a cooldown period.
              </div>
            </div>
          </div>
        )}
        
        {psychMetrics.overtradingDays > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <div className="font-medium text-yellow-900">Overtrading Alert</div>
              <div className="text-sm text-yellow-700 mt-1">
                On {psychMetrics.overtradingDays} days, you traded more than 2x your daily average. 
                Quality over quantity!
              </div>
            </div>
          </div>
        )}
        
        {psychMetrics.revengeTrades === 0 && psychMetrics.overtradingDays === 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <div className="font-medium text-green-900">Excellent Emotional Control</div>
              <div className="text-sm text-green-700 mt-1">
                No signs of revenge trading or overtrading detected. Keep up the disciplined approach!
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Trading Consistency */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Trading Consistency Report</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Consistency Score</div>
            <div className="text-3xl font-bold">{psychMetrics.consistencyScore.toFixed(1)}/100</div>
            <p className="text-sm text-muted-foreground mt-2">
              Higher is better - measures return stability
            </p>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Std Deviation</div>
            <div className="text-3xl font-bold">${psychMetrics.stdDev.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Lower is better - measures variance
            </p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          💡 <strong>Tip:</strong> Aim for consistent, steady profits rather than spectacular wins followed by big losses.
        </div>
      </Card>

      {/* Trading Frequency */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📅 Trading Frequency Analysis</h3>
        <div className="text-center p-4 bg-secondary/20 rounded-lg">
          <div className="text-sm text-muted-foreground">Average Trades per Day</div>
          <div className="text-3xl font-bold">{psychMetrics.avgTradesPerDay.toFixed(1)}</div>
        </div>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          {psychMetrics.avgTradesPerDay > 10 ? 
            "⚠️ High frequency - ensure you're not overtrading" :
            psychMetrics.avgTradesPerDay > 5 ?
            "✅ Moderate frequency - good balance" :
            "✅ Low frequency - quality over quantity"}
        </p>
      </Card>
    </div>
  );
};
