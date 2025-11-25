import dayjs from "dayjs";

interface Trade {
  profit: number;
  close_time: string;
  tp_price?: number;
  sl_price?: number;
  open_time?: string;
}

export interface KPIMetrics {
  totalPnL: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  thisMonthPnL: number;
  sparklineData: number[];
}

export interface YTDMetrics {
  ytdPnL: number;
  ytdTrades: number;
  avgPerTrade: number;
  bestMonth: { month: string; profit: number };
  worstMonth: { month: string; profit: number };
  monthlyData: number[];
}

export interface MonthlyData {
  month: string;
  pnl: number;
  winRate: number;
  trades: number;
}

export interface TradeDistribution {
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  avgRR: number;
  avgHoldTime: string;
  pnlDistribution: { range: string; count: number }[];
}

export interface ProfitFactorData {
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
}

export const calculateKPIMetrics = (trades: Trade[]): KPIMetrics => {
  if (!trades || trades.length === 0) {
    return {
      totalPnL: 0,
      winRate: 0,
      profitFactor: 0,
      avgWin: 0,
      avgLoss: 0,
      thisMonthPnL: 0,
      sparklineData: []
    };
  }

  const totalPnL = trades.reduce((sum, t) => sum + Number(t.profit), 0);
  const winningTrades = trades.filter(t => Number(t.profit) > 0);
  const losingTrades = trades.filter(t => Number(t.profit) < 0);
  
  const winRate = (winningTrades.length / trades.length) * 100;
  const grossProfit = winningTrades.reduce((sum, t) => sum + Number(t.profit), 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + Number(t.profit), 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
  const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;

  // This month P&L
  const now = dayjs();
  const thisMonthTrades = trades.filter(t => dayjs(t.close_time).isSame(now, 'month'));
  const thisMonthPnL = thisMonthTrades.reduce((sum, t) => sum + Number(t.profit), 0);

  // Sparkline data (last 30 days)
  const thirtyDaysAgo = now.subtract(30, 'day');
  const dailyPnL: Record<string, number> = {};
  trades.forEach(t => {
    const date = dayjs(t.close_time);
    if (date.isAfter(thirtyDaysAgo)) {
      const key = date.format('YYYY-MM-DD');
      dailyPnL[key] = (dailyPnL[key] || 0) + Number(t.profit);
    }
  });
  const sparklineData = Object.values(dailyPnL);

  return {
    totalPnL,
    winRate,
    profitFactor,
    avgWin,
    avgLoss,
    thisMonthPnL,
    sparklineData
  };
};

export const calculateYTDMetrics = (trades: Trade[]): YTDMetrics => {
  if (!trades || trades.length === 0) {
    return {
      ytdPnL: 0,
      ytdTrades: 0,
      avgPerTrade: 0,
      bestMonth: { month: '', profit: 0 },
      worstMonth: { month: '', profit: 0 },
      monthlyData: []
    };
  }

  const now = dayjs();
  const ytdTrades = trades.filter(t => dayjs(t.close_time).year() === now.year());
  const ytdPnL = ytdTrades.reduce((sum, t) => sum + Number(t.profit), 0);
  const avgPerTrade = ytdTrades.length > 0 ? ytdPnL / ytdTrades.length : 0;

  // Monthly breakdown for YTD
  const monthlyPnL: Record<string, number> = {};
  ytdTrades.forEach(t => {
    const month = dayjs(t.close_time).format('YYYY-MM');
    monthlyPnL[month] = (monthlyPnL[month] || 0) + Number(t.profit);
  });

  const monthlyEntries = Object.entries(monthlyPnL);
  const bestMonth = monthlyEntries.length > 0
    ? monthlyEntries.reduce((best, [month, profit]) => 
        profit > best.profit ? { month: dayjs(month).format('MMM'), profit } : best,
        { month: '', profit: -Infinity }
      )
    : { month: '-', profit: 0 };

  const worstMonth = monthlyEntries.length > 0
    ? monthlyEntries.reduce((worst, [month, profit]) => 
        profit < worst.profit ? { month: dayjs(month).format('MMM'), profit } : worst,
        { month: '', profit: Infinity }
      )
    : { month: '-', profit: 0 };

  const monthlyData = Object.values(monthlyPnL);

  return {
    ytdPnL,
    ytdTrades: ytdTrades.length,
    avgPerTrade,
    bestMonth,
    worstMonth,
    monthlyData
  };
};

export const calculateMonthlyBreakdown = (trades: Trade[]): MonthlyData[] => {
  if (!trades || trades.length === 0) return [];

  const monthlyData: Record<string, { pnl: number; wins: number; total: number }> = {};
  
  trades.forEach(t => {
    const month = dayjs(t.close_time).format('YYYY-MM');
    if (!monthlyData[month]) {
      monthlyData[month] = { pnl: 0, wins: 0, total: 0 };
    }
    monthlyData[month].pnl += Number(t.profit);
    monthlyData[month].total += 1;
    if (Number(t.profit) > 0) monthlyData[month].wins += 1;
  });

  return Object.entries(monthlyData)
    .slice(-12)
    .map(([month, data]) => ({
      month: dayjs(month).format('MMM YYYY'),
      pnl: data.pnl,
      winRate: (data.wins / data.total) * 100,
      trades: data.total
    }));
};

export const calculateTradeDistribution = (trades: Trade[]): TradeDistribution => {
  if (!trades || trades.length === 0) {
    return {
      winningTrades: 0,
      losingTrades: 0,
      breakevenTrades: 0,
      avgRR: 0,
      avgHoldTime: '0h',
      pnlDistribution: []
    };
  }

  const winningTrades = trades.filter(t => Number(t.profit) > 0).length;
  const losingTrades = trades.filter(t => Number(t.profit) < 0).length;
  const breakevenTrades = trades.filter(t => Number(t.profit) === 0).length;

  // Average R:R
  const rrTrades = trades.filter(t => t.tp_price && t.sl_price);
  const avgRR = rrTrades.length > 0
    ? rrTrades.reduce((sum, t) => {
        const reward = Math.abs(Number(t.tp_price) - Number(t.profit));
        const risk = Math.abs(Number(t.profit) - Number(t.sl_price));
        return sum + (risk > 0 ? reward / risk : 0);
      }, 0) / rrTrades.length
    : 0;

  // Average hold time
  const tradesWithTime = trades.filter(t => t.open_time);
  const avgHoldMinutes = tradesWithTime.length > 0
    ? tradesWithTime.reduce((sum, t) => {
        return sum + dayjs(t.close_time).diff(dayjs(t.open_time), 'minute');
      }, 0) / tradesWithTime.length
    : 0;
  
  const avgHoldTime = avgHoldMinutes < 60 
    ? `${Math.round(avgHoldMinutes)}m`
    : avgHoldMinutes < 1440
    ? `${Math.round(avgHoldMinutes / 60)}h`
    : `${Math.round(avgHoldMinutes / 1440)}d`;

  // P&L distribution
  const ranges = [
    { range: '< -$500', min: -Infinity, max: -500 },
    { range: '-$500 to -$100', min: -500, max: -100 },
    { range: '-$100 to $0', min: -100, max: 0 },
    { range: '$0 to $100', min: 0, max: 100 },
    { range: '$100 to $500', min: 100, max: 500 },
    { range: '> $500', min: 500, max: Infinity }
  ];

  const pnlDistribution = ranges.map(({ range, min, max }) => ({
    range,
    count: trades.filter(t => {
      const profit = Number(t.profit);
      return profit >= min && profit < max;
    }).length
  }));

  return {
    winningTrades,
    losingTrades,
    breakevenTrades,
    avgRR,
    avgHoldTime,
    pnlDistribution
  };
};

export const calculateProfitFactor = (trades: Trade[]): ProfitFactorData => {
  if (!trades || trades.length === 0) {
    return { grossProfit: 0, grossLoss: 0, profitFactor: 0 };
  }

  const grossProfit = trades
    .filter(t => Number(t.profit) > 0)
    .reduce((sum, t) => sum + Number(t.profit), 0);
  
  const grossLoss = Math.abs(
    trades
      .filter(t => Number(t.profit) < 0)
      .reduce((sum, t) => sum + Number(t.profit), 0)
  );

  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

  return { grossProfit, grossLoss, profitFactor };
};

export const generateExecutiveSummary = (
  profitFactor: number,
  ytdPnL: number,
  winRate: number,
  avgQuality: number,
  maxDrawdown: number
): string => {
  let summary = "";

  // Expectancy profile
  if (profitFactor >= 2) {
    summary += "Your system demonstrates a strong expectancy profile";
  } else if (profitFactor >= 1.5) {
    summary += "Your system demonstrates a stable expectancy profile";
  } else if (profitFactor >= 1) {
    summary += "Your system demonstrates a marginal expectancy profile";
  } else {
    summary += "Your system demonstrates a negative expectancy profile";
  }

  // YTD momentum
  if (ytdPnL > 0) {
    summary += " with improving YTD momentum. ";
  } else {
    summary += " with declining YTD momentum. ";
  }

  // Profit factor analysis
  if (profitFactor >= 2) {
    summary += "Profit factor remains structurally robust";
  } else if (profitFactor >= 1.5) {
    summary += "Profit factor remains structurally positive but is vulnerable to large losing clusters";
  } else if (profitFactor >= 1) {
    summary += "Profit factor is marginally positive and highly vulnerable to drawdown events";
  } else {
    summary += "Profit factor is negative, indicating systematic losses";
  }

  // Risk recommendations
  if (maxDrawdown > 2000) {
    summary += ". Severe drawdown exposure detected. Immediate position sizing reduction required.";
  } else if (maxDrawdown > 1000) {
    summary += ". Reducing tail-risk trades will significantly enhance equity curve smoothness.";
  } else {
    summary += ". Risk management appears adequate.";
  }

  // Quality recommendations
  if (avgQuality < 60) {
    summary += " Focus on improving execution discipline with proper stop losses and take profits.";
  } else if (winRate < 50) {
    summary += " Consider refining entry criteria to improve win rate consistency.";
  }

  return summary;
};
