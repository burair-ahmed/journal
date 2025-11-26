export interface MonteCarloResults {
  percentiles: {
    p5: number;
    p50: number;
    p95: number;
  };
  drawdownProbability: number;
  riskOfRuin: "minimal" | "elevated" | "critical";
  simulationData: number[];
}

export const runMonteCarloSimulation = (
  avgReturn: number,
  stdDev: number,
  scenarios: number = 1000
): MonteCarloResults => {
  const results: number[] = [];

  // Simple Monte Carlo: generate random outcomes based on historical stats
  for (let i = 0; i < scenarios; i++) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const outcome = avgReturn + z * stdDev;
    results.push(outcome);
  }

  results.sort((a, b) => a - b);

  const p5Index = Math.floor(scenarios * 0.05);
  const p50Index = Math.floor(scenarios * 0.50);
  const p95Index = Math.floor(scenarios * 0.95);

  const percentiles = {
    p5: results[p5Index],
    p50: results[p50Index],
    p95: results[p95Index]
  };

  // Drawdown probability (probability of loss)
  const lossCount = results.filter(r => r < 0).length;
  const drawdownProbability = (lossCount / scenarios) * 100;

  // Risk of ruin assessment
  let riskOfRuin: "minimal" | "elevated" | "critical";
  if (drawdownProbability < 20) riskOfRuin = "minimal";
  else if (drawdownProbability < 40) riskOfRuin = "elevated";
  else riskOfRuin = "critical";

  // Sample 100 scenarios for visualization
  const simulationData = results.filter((_, i) => i % 10 === 0).slice(0, 100);

  return {
    percentiles,
    drawdownProbability,
    riskOfRuin,
    simulationData
  };
};
