import dayjs from "dayjs";

interface Trade {
  profit: number;
  close_time: string;
  open_time: string;
  tp_price?: number;
  sl_price?: number;
}

export interface DisciplineMetrics {
  overallScore: number;
  tpslAdherence: number;
  overtradingDays: number;
  revengeTrades: number;
}

export interface EmotionalAlert {
  type: "revenge" | "overtrading" | "clean";
  severity: "high" | "medium" | "low";
  message: string;
}

export interface ConsistencyMetrics {
  consistencyScore: number;
  stdDev: number;
  variance: number;
  trendData: number[];
}

export interface FrequencyMetrics {
  avgTradesPerDay: number;
  frequencyLevel: "high" | "moderate" | "low";
}

export interface PsychologyInsight {
  category: "discipline" | "emotion" | "consistency" | "frequency";
  message: string;
  importance: "high" | "medium" | "low";
}

export const calculateDisciplineMetrics = (trades: Trade[]): DisciplineMetrics => {
  if (!trades || trades.length === 0) {
    return {
      overallScore: 0,
      tpslAdherence: 0,
      overtradingDays: 0,
      revengeTrades: 0
    };
  }

  // TP/SL Adherence
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
    const prevLoss = Number(trades[i - 1].profit) < 0;
    const timeDiff = dayjs(trades[i].open_time).diff(dayjs(trades[i - 1].close_time), 'minute');
    if (prevLoss && timeDiff < 30) revengeTrades++;
  }

  // Overall discipline score
  const overallScore = (
    (tpslAdherence * 0.4) +
    (Math.max(0, 100 - (overtradingDays / Object.keys(tradesByDay).length) * 100) * 0.3) +
    (Math.max(0, 100 - (revengeTrades / trades.length) * 100) * 0.3)
  );

  return {
    overallScore,
    tpslAdherence,
    overtradingDays,
    revengeTrades
  };
};

export const calculateEmotionalState = (
  revengeTrades: number,
  overtradingDays: number,
  totalTrades: number
): EmotionalAlert[] => {
  const alerts: EmotionalAlert[] = [];

  if (revengeTrades > 5) {
    alerts.push({
      type: "revenge",
      severity: "high",
      message: `Revenge Trading Detected: You've taken ${revengeTrades} trades within 30 minutes of a loss. This suggests emotional trading. Consider implementing a cooldown period.`
    });
  } else if (revengeTrades > 2) {
    alerts.push({
      type: "revenge",
      severity: "medium",
      message: `${revengeTrades} potential revenge trades detected. Monitor your emotional state after losses.`
    });
  }

  if (overtradingDays > 5) {
    alerts.push({
      type: "overtrading",
      severity: "high",
      message: `Overtrading Alert: On ${overtradingDays} days, you traded more than 2x your daily average. Quality over quantity!`
    });
  } else if (overtradingDays > 0) {
    alerts.push({
      type: "overtrading",
      severity: "medium",
      message: `${overtradingDays} days of elevated trading activity detected. Ensure you're not forcing trades.`
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: "clean",
      severity: "low",
      message: "Excellent Emotional Control: No signs of revenge trading or overtrading detected. Keep up the disciplined approach!"
    });
  }

  return alerts;
};

export const calculateConsistency = (trades: Trade[]): ConsistencyMetrics => {
  if (!trades || trades.length === 0) {
    return {
      consistencyScore: 0,
      stdDev: 0,
      variance: 0,
      trendData: []
    };
  }

  const returns = trades.map(t => Number(t.profit));
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  const consistencyScore = Math.max(0, 100 - (stdDev / Math.abs(avgReturn || 1)) * 10);

  // Trend data (last 30 trades)
  const trendData = returns.slice(-30);

  return {
    consistencyScore,
    stdDev,
    variance,
    trendData
  };
};

export const calculateTradingFrequency = (trades: Trade[]): FrequencyMetrics => {
  if (!trades || trades.length === 0) {
    return {
      avgTradesPerDay: 0,
      frequencyLevel: "low"
    };
  }

  const tradesByDay: Record<string, number> = {};
  trades.forEach(t => {
    const day = dayjs(t.close_time).format('YYYY-MM-DD');
    tradesByDay[day] = (tradesByDay[day] || 0) + 1;
  });

  const avgTradesPerDay = Object.values(tradesByDay).reduce((a, b) => a + b, 0) / Object.keys(tradesByDay).length;

  let frequencyLevel: "high" | "moderate" | "low";
  if (avgTradesPerDay > 10) frequencyLevel = "high";
  else if (avgTradesPerDay > 5) frequencyLevel = "moderate";
  else frequencyLevel = "low";

  return {
    avgTradesPerDay,
    frequencyLevel
  };
};

export const generatePsychologyInsights = (
  discipline: DisciplineMetrics,
  consistency: ConsistencyMetrics,
  frequency: FrequencyMetrics
): PsychologyInsight[] => {
  const insights: PsychologyInsight[] = [];

  // Discipline insights
  if (discipline.overallScore >= 80) {
    insights.push({
      category: "discipline",
      message: `Excellent discipline with ${discipline.overallScore.toFixed(0)}/100 score. Your TP/SL adherence of ${discipline.tpslAdherence.toFixed(0)}% shows strong risk management.`,
      importance: "high"
    });
  } else if (discipline.overallScore < 60) {
    insights.push({
      category: "discipline",
      message: `Discipline needs improvement (${discipline.overallScore.toFixed(0)}/100). Focus on setting stop losses and take profits on every trade.`,
      importance: "high"
    });
  }

  // Revenge trading insights
  if (discipline.revengeTrades > 5) {
    insights.push({
      category: "emotion",
      message: `${discipline.revengeTrades} revenge trades detected. Implement a mandatory 30-minute cooldown after losses to prevent emotional decisions.`,
      importance: "high"
    });
  }

  // Consistency insights
  if (consistency.consistencyScore >= 70) {
    insights.push({
      category: "consistency",
      message: `Strong consistency score of ${consistency.consistencyScore.toFixed(0)}/100. Your returns show stable patterns with low variance.`,
      importance: "medium"
    });
  } else if (consistency.consistencyScore < 50) {
    insights.push({
      category: "consistency",
      message: `High variance in returns (StdDev: $${consistency.stdDev.toFixed(2)}). Focus on consistent position sizing and risk management.`,
      importance: "high"
    });
  }

  // Frequency insights
  if (frequency.frequencyLevel === "high") {
    insights.push({
      category: "frequency",
      message: `High trading frequency (${frequency.avgTradesPerDay.toFixed(1)} trades/day). Ensure you're not overtrading or forcing setups.`,
      importance: "medium"
    });
  } else if (frequency.frequencyLevel === "low") {
    insights.push({
      category: "frequency",
      message: `Low trading frequency (${frequency.avgTradesPerDay.toFixed(1)} trades/day) suggests quality over quantity approach. Maintain this discipline.`,
      importance: "low"
    });
  }

  return insights;
};
