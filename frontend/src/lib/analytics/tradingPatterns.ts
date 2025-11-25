import dayjs from "dayjs";

interface Trade {
  symbol: string;
  profit: number;
  close_time: string;
  open_time: string;
}

export interface SymbolStats {
  symbol: string;
  trades: number;
  winRate: number;
  profit: number;
  sparklineData: number[];
}

export interface DayStats {
  day: string;
  trades: number;
  profit: number;
  winRate: number;
}

export interface DurationStats {
  scalps: number;
  intraday: number;
  swing: number;
  position: number;
}

export interface PatternStats {
  nextWins: number;
  nextLosses: number;
  winRate: number;
}

export interface TradingInsight {
  type: "symbol" | "day" | "duration" | "pattern";
  message: string;
  importance: "high" | "medium" | "low";
}

export const calculateSymbolPerformance = (trades: Trade[]): SymbolStats[] => {
  if (!trades || trades.length === 0) return [];

  const symbolMap: Record<string, { trades: number; wins: number; profit: number; profits: number[] }> = {};

  trades.forEach(t => {
    if (!symbolMap[t.symbol]) {
      symbolMap[t.symbol] = { trades: 0, wins: 0, profit: 0, profits: [] };
    }
    symbolMap[t.symbol].trades += 1;
    symbolMap[t.symbol].profit += Number(t.profit);
    symbolMap[t.symbol].profits.push(Number(t.profit));
    if (Number(t.profit) > 0) symbolMap[t.symbol].wins += 1;
  });

  return Object.entries(symbolMap)
    .map(([symbol, data]) => ({
      symbol,
      trades: data.trades,
      winRate: (data.wins / data.trades) * 100,
      profit: data.profit,
      sparklineData: data.profits.slice(-10) // Last 10 trades for sparkline
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 10);
};

export const calculateDayOfWeekStats = (trades: Trade[]): DayStats[] => {
  if (!trades || trades.length === 0) {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => ({
      day,
      trades: 0,
      profit: 0,
      winRate: 0
    }));
  }

  const dayMap: Record<string, { trades: number; wins: number; profit: number }> = {};

  trades.forEach(t => {
    const day = dayjs(t.close_time).format('dddd');
    if (!dayMap[day]) {
      dayMap[day] = { trades: 0, wins: 0, profit: 0 };
    }
    dayMap[day].trades += 1;
    dayMap[day].profit += Number(t.profit);
    if (Number(t.profit) > 0) dayMap[day].wins += 1;
  });

  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => ({
    day,
    trades: dayMap[day]?.trades || 0,
    profit: dayMap[day]?.profit || 0,
    winRate: dayMap[day] ? (dayMap[day].wins / dayMap[day].trades) * 100 : 0
  }));
};

export const calculateTradeDuration = (trades: Trade[]): DurationStats => {
  if (!trades || trades.length === 0) {
    return { scalps: 0, intraday: 0, swing: 0, position: 0 };
  }

  const stats = { scalps: 0, intraday: 0, swing: 0, position: 0 };

  trades.forEach(t => {
    const duration = dayjs(t.close_time).diff(dayjs(t.open_time), 'minute');
    if (duration < 15) stats.scalps++;
    else if (duration < 240) stats.intraday++;
    else if (duration < 1440) stats.swing++;
    else stats.position++;
  });

  return stats;
};

export const calculateWinLossPatterns = (trades: Trade[]): { afterWin: PatternStats; afterLoss: PatternStats } => {
  if (!trades || trades.length < 2) {
    return {
      afterWin: { nextWins: 0, nextLosses: 0, winRate: 0 },
      afterLoss: { nextWins: 0, nextLosses: 0, winRate: 0 }
    };
  }

  const afterWin = { nextWins: 0, nextLosses: 0 };
  const afterLoss = { nextWins: 0, nextLosses: 0 };

  for (let i = 1; i < trades.length; i++) {
    const prevWin = Number(trades[i - 1].profit) > 0;
    const currWin = Number(trades[i].profit) > 0;

    if (prevWin) {
      if (currWin) afterWin.nextWins++;
      else afterWin.nextLosses++;
    } else {
      if (currWin) afterLoss.nextWins++;
      else afterLoss.nextLosses++;
    }
  }

  const afterWinTotal = afterWin.nextWins + afterWin.nextLosses;
  const afterLossTotal = afterLoss.nextWins + afterLoss.nextLosses;

  return {
    afterWin: {
      ...afterWin,
      winRate: afterWinTotal > 0 ? (afterWin.nextWins / afterWinTotal) * 100 : 0
    },
    afterLoss: {
      ...afterLoss,
      winRate: afterLossTotal > 0 ? (afterLoss.nextWins / afterLossTotal) * 100 : 0
    }
  };
};

export const generateTradingInsights = (
  symbolStats: SymbolStats[],
  dayStats: DayStats[],
  durationStats: DurationStats,
  patterns: { afterWin: PatternStats; afterLoss: PatternStats }
): TradingInsight[] => {
  const insights: TradingInsight[] = [];

  // Top symbol insight
  if (symbolStats.length > 0) {
    const topSymbol = symbolStats[0];
    insights.push({
      type: "symbol",
      message: `${topSymbol.symbol} is your top performer with $${topSymbol.profit.toFixed(2)} profit across ${topSymbol.trades} trades (${topSymbol.winRate.toFixed(1)}% win rate)`,
      importance: "high"
    });
  }

  // Best day insight
  const bestDay = dayStats.reduce((best, day) => day.profit > best.profit ? day : best, dayStats[0]);
  if (bestDay && bestDay.trades > 0) {
    insights.push({
      type: "day",
      message: `${bestDay.day} is your most profitable day with $${bestDay.profit.toFixed(2)} profit and ${bestDay.winRate.toFixed(1)}% win rate`,
      importance: "high"
    });
  }

  // Duration insight
  const totalDuration = durationStats.scalps + durationStats.intraday + durationStats.swing + durationStats.position;
  const dominantDuration = Object.entries(durationStats).reduce((max, [key, val]) => 
    val > max.count ? { type: key, count: val } : max, 
    { type: '', count: 0 }
  );
  
  if (dominantDuration.count > 0) {
    const percentage = ((dominantDuration.count / totalDuration) * 100).toFixed(0);
    insights.push({
      type: "duration",
      message: `${dominantDuration.type.charAt(0).toUpperCase() + dominantDuration.type.slice(1)} trades dominate your strategy (${percentage}% of all trades)`,
      importance: "medium"
    });
  }

  // Pattern insight
  if (patterns.afterLoss.winRate > patterns.afterWin.winRate + 10) {
    insights.push({
      type: "pattern",
      message: `Strong recovery pattern detected: ${patterns.afterLoss.winRate.toFixed(1)}% win rate after losses vs ${patterns.afterWin.winRate.toFixed(1)}% after wins`,
      importance: "high"
    });
  } else if (patterns.afterWin.winRate < 50) {
    insights.push({
      type: "pattern",
      message: `Caution: Win rate drops to ${patterns.afterWin.winRate.toFixed(1)}% after winning trades. Consider taking breaks after wins.`,
      importance: "medium"
    });
  }

  return insights;
};
