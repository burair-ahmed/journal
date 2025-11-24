import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { Card } from "@/components/ui/card";
import { useFilteredTrades } from "@/hooks/useTrades";

interface Props {
  accountId?: number;
}

export const WinLossSymbolDistribution = ({ accountId }: Props) => {
  const { trades, isLoading } = useFilteredTrades(accountId);
  const chartRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  if (!chartRef.current || isLoading) return;

  const chart = echarts.init(chartRef.current);

  const wins = trades.filter(t => t.profit > 0);
  const losses = trades.filter(t => t.profit < 0);

  const innerData = [
    { value: wins.length, name: "Wins" },
    { value: losses.length, name: "Losses" }
  ];

  const symbolMap = new Map<string, number>();
  trades.forEach(t => {
    symbolMap.set(t.symbol, (symbolMap.get(t.symbol) || 0) + t.profit);
  });

  const outerData = Array.from(symbolMap.entries()).map(([symbol, pnl]) => ({
    value: Number(Math.abs(pnl).toFixed(2)),
    name: symbol
  }));

const COLORS = [
  "#D946EF", // primary (fuchsia)
  "#DB2777", // accent (pink)
  "#741052", // deep plum
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#14B8A6", // teal
  "#F97316", // orange

  // additional premium tones below:
  "#1E3A8A", // deep navy
  "#0F766E", // dark teal
  "#92400E", // bronze brown
  "#7F1D1D", // dark red wine
  "#1E40AF", // richer indigo navy
  "#312E81", // muted royal violet
  "#064E3B", // deep forest green
  "#78350F", // antique gold brown
  "#1E293B", // slate graphite
  "#475569"  // muted steel gray
];


  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: "item",
      backgroundColor: "#fff",
      borderColor: "#d1d5db",
      borderWidth: 1,
      padding: 8,
      textStyle: { color: "#111" },
      formatter: p =>
        `<div style="font-size:13px; font-weight:600;">${p.name}</div>
         PnL: <b>${Number(p.value).toFixed(2)}</b><br/>
         Share: <b>${p.percent}%</b>`
    },
    legend: {
        type: "scroll",
        orient: "horizontal",
      bottom: -10,
      itemGap: 12,
      padding: [20, 0],
      textStyle: { color: "#4b5563", fontSize: 12 },
    },
    series: [
      {
        type: "pie",
        radius: ["0%", "33%"],
        label: { show: true, position: "inside", fontSize: 13 },
        color: ["#10B981", "#EF4444"],
        data: innerData
      },
      {
        type: "pie",
        radius: ["48%", "68%"],
        labelLine: { show: true, length: 18 },
        label: {
          formatter: "{b}: {c}",
          fontSize: 13,
          color: "#374151"
        },
        color: COLORS,
        data: outerData
      }
    ]
  };

  chart.setOption(option);
  const handleResize = () => chart.resize();
  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
    chart.dispose();
  };
}, [trades, isLoading]);


  return (
    <Card className="p-4 bg-card border border-border shadow-sm rounded-2xl h-[500px]">
      <div className="text-sm font-medium text-foreground mb-3">
        Win / Loss Distribution by Symbol
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[260px] text-gray-400 text-sm">
          Loading chart...
        </div>
      ) : (
        <div ref={chartRef} className="w-full h-[380px] mt-2" />
      )}    
    </Card>
  );
};
