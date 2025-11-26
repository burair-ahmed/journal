export interface GoalMetrics {
  monthlyGoalCompletion: number;
  ytdGoalCompletion: number;
  goalProbability: number;
  remainingToGoal: number;
  insights: string[];
}

export const calculateGoalCompletion = (
  currentProfit: number,
  monthlyGoal: number,
  ytdProfit: number,
  ytdGoal: number
): GoalMetrics => {
  const monthlyGoalCompletion = (currentProfit / monthlyGoal) * 100;
  const ytdGoalCompletion = (ytdProfit / ytdGoal) * 100;
  
  // Simple probability based on current pace
  const goalProbability = Math.min(100, monthlyGoalCompletion * 1.2);
  
  const remainingToGoal = Math.max(0, monthlyGoal - currentProfit);

  const insights: string[] = [];
  
  if (monthlyGoalCompletion >= 100) {
    insights.push("Monthly goal achieved! Maintain discipline to preserve gains.");
  } else if (monthlyGoalCompletion >= 80) {
    insights.push(`${remainingToGoal.toFixed(0)} away from monthly target. Strong position.`);
  } else {
    insights.push(`Accelerate to ${(remainingToGoal / 10).toFixed(0)}/day to hit monthly goal.`);
  }

  return {
    monthlyGoalCompletion,
    ytdGoalCompletion,
    goalProbability,
    remainingToGoal,
    insights
  };
};
