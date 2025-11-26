import dayjs from "dayjs";

interface Trade {
  profit: number;
  close_time: string;
}

export interface MTDMetrics {
  mtdProfit: number;
  projectedMonthEnd: number;
  confidenceBand: { low: number; high: number };
  paceStatus: "ahead" | "on-track" | "behind";
  goalDelta: number;
  sparklineData: number[];
}

export const calculateMTDMetrics = (trades: Trade[], monthlyGoal: number = 5000): MTDMetrics => {
  const now = dayjs();
  const currentMonth = now.month();
  const currentYear = now.year();
  
  const mtdTrades = trades.filter(t => {
    const date = dayjs(t.close_time);
    return date.year() === currentYear && date.month() === currentMonth;
  });

  const mtdProfit = mtdTrades.reduce((sum, t) => sum + Number(t.profit), 0);
  
  // Calculate daily average and project to month end
  const daysElapsed = now.date();
  const daysInMonth = now.daysInMonth();
  const dailyAvg = mtdProfit / daysElapsed;
  const projectedMonthEnd = dailyAvg * daysInMonth;
  
  // Confidence band (±20%)
  const confidenceBand = {
    low: projectedMonthEnd * 0.8,
    high: projectedMonthEnd * 1.2
  };

  // Pace status
  const expectedProgress = (daysElapsed / daysInMonth) * monthlyGoal;
  let paceStatus: "ahead" | "on-track" | "behind";
  if (mtdProfit > expectedProgress * 1.1) paceStatus = "ahead";
  else if (mtdProfit < expectedProgress * 0.9) paceStatus = "behind";
  else paceStatus = "on-track";

  // Goal delta (required per remaining day)
  const remainingDays = daysInMonth - daysElapsed;
  const remainingToGoal = monthlyGoal - mtdProfit;
  const goalDelta = remainingDays > 0 ? remainingToGoal / remainingDays : 0;

  // Sparkline data (daily cumulative)
  const sparklineData: number[] = [];
  let cumulative = 0;
  for (let day = 1; day <= daysElapsed; day++) {
    const dayTrades = mtdTrades.filter(t => dayjs(t.close_time).date() === day);
    cumulative += dayTrades.reduce((sum, t) => sum + Number(t.profit), 0);
    sparklineData.push(cumulative);
  }

  return {
    mtdProfit,
    projectedMonthEnd,
    confidenceBand,
    paceStatus,
    goalDelta,
    sparklineData
  };
};

export const calculateTradeVelocity = (trades: Trade[]) => {
  if (!trades || trades.length === 0) {
    return {
      tradesPerDay: 0,
      tradesPerWeek: 0,
      tradesPerMonth: 0,
      activityHeatmap: [],
      frequencyLevel: "low" as "low" | "optimal" | "high"
    };
  }

  const now = dayjs();
  const thirtyDaysAgo = now.subtract(30, 'day');
  
  const recentTrades = trades.filter(t => dayjs(t.close_time).isAfter(thirtyDaysAgo));
  
  const tradesPerDay = recentTrades.length / 30;
  const tradesPerWeek = tradesPerDay * 7;
  const tradesPerMonth = tradesPerDay * 30;

  // Activity heatmap (last 30 days)
  const activityHeatmap: number[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = now.subtract(i, 'day').format('YYYY-MM-DD');
    const count = recentTrades.filter(t => dayjs(t.close_time).format('YYYY-MM-DD') === date).length;
    activityHeatmap.push(count);
  }

  // Frequency level
  let frequencyLevel: "low" | "optimal" | "high";
  if (tradesPerDay > 10) frequencyLevel = "high";
  else if (tradesPerDay >= 3) frequencyLevel = "optimal";
  else frequencyLevel = "low";

  return {
    tradesPerDay,
    tradesPerWeek,
    tradesPerMonth,
    activityHeatmap,
    frequencyLevel
  };
};

export interface AlphaInsight {
  category: "pace" | "volatility" | "goal" | "behavior";
  severity: "success" | "warning" | "danger";
  message: string;
}

export const generateAlphaInsights = (
  mtdMetrics: MTDMetrics,
  goalCompletion: number,
  volatility: number
): AlphaInsight[] => {
  const insights: AlphaInsight[] = [];

  // Pace assessment
  if (mtdMetrics.paceStatus === "ahead") {
    insights.push({
      category: "pace",
      severity: "success",
      message: `Exceptional pace: ${mtdMetrics.paceStatus.toUpperCase()}. Current trajectory exceeds monthly target by ${((mtdMetrics.projectedMonthEnd / 5000 - 1) * 100).toFixed(0)}%.`
    });
  } else if (mtdMetrics.paceStatus === "behind") {
    insights.push({
      category: "pace",
      severity: "warning",
      message: `Pace deficit detected. Require $${Math.abs(mtdMetrics.goalDelta).toFixed(2)}/day over remaining ${dayjs().daysInMonth() - dayjs().date()} days to hit target.`
    });
  }

  // Goal completion odds
  if (goalCompletion >= 80) {
    insights.push({
      category: "goal",
      severity: "success",
      message: `High probability (${goalCompletion.toFixed(0)}%) of goal achievement based on current momentum.`
    });
  } else if (goalCompletion < 50) {
    insights.push({
      category: "goal",
      severity: "danger",
      message: `Goal completion probability low (${goalCompletion.toFixed(0)}%). Consider strategy adjustment or risk recalibration.`
    });
  }

  // Volatility stress
  if (volatility > 500) {
    insights.push({
      category: "volatility",
      severity: "warning",
      message: `Elevated return variance detected (σ=$${volatility.toFixed(0)}). High volatility increases drawdown risk.`
    });
  }

  return insights;
};
