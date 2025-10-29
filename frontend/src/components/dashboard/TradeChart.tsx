// // src/components/dashboard/TradeChart.tsx
// import { useEffect, useRef } from "react";
// import { createChart, IChartApi, CandlestickSeriesOptions } from "lightweight-charts";

// interface TradeChartProps {
//   symbol: string;
//   openTime: string;
//   closeTime: string;
//   openPrice: number;
//   closePrice: number;
//   tp?: number;
//   sl?: number;
// }

// export const TradeChart = ({ symbol, openTime, closeTime, openPrice, closePrice, tp, sl }: TradeChartProps) => {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const chartRef = useRef<IChartApi | null>(null);

//   useEffect(() => {
//     if (!containerRef.current) return;

//     const chart = createChart(containerRef.current, {
//       layout: { background: { color: "#0B0D29" }, textColor: "#FFFFFF" },
//       grid: { vertLines: { color: "#17193C" }, horzLines: { color: "#17193C" } },
//       width: containerRef.current.clientWidth,
//       height: 300,
//       timeScale: { timeVisible: true, secondsVisible: false },
//     });
//     chartRef.current = chart;

//     const candleSeries = chart.addCandlestickSeries({
//       upColor: "#7C3AED",
//       downColor: "#DB2777",
//       borderVisible: false,
//       wickUpColor: "#7C3AED",
//       wickDownColor: "#DB2777",
//     } as CandlestickSeriesOptions);

//     // Mock data source; replace with your symbol data fetch
//     const mockData = Array.from({ length: 100 }).map((_, i) => ({
//       time: Math.floor(Date.now() / 1000) - (100 - i) * 3600,
//       open: openPrice + Math.sin(i / 10) * 0.3,
//       high: openPrice + Math.sin(i / 10) * 0.5 + 0.1,
//       low: openPrice + Math.sin(i / 10) * 0.5 - 0.1,
//       close: openPrice + Math.sin(i / 10) * 0.4,
//     }));
//     candleSeries.setData(mockData);

//     // Markers
//     const entryMarker = {
//       time: Math.floor(new Date(openTime).getTime() / 1000),
//       position: "belowBar",
//       color: "#7C3AED",
//       shape: "arrowUp",
//       text: `ENTRY ${openPrice.toFixed(2)}`,
//     };
//     const exitMarker = {
//       time: Math.floor(new Date(closeTime).getTime() / 1000),
//       position: "aboveBar",
//       color: "#DB2777",
//       shape: "arrowDown",
//       text: `EXIT ${closePrice.toFixed(2)}`,
//     };
//     const extraMarkers: any[] = [];
//     if (tp) extraMarkers.push({ time: entryMarker.time, position: "aboveBar", color: "#16a34a", shape: "circle", text: `TP ${tp}` });
//     if (sl) extraMarkers.push({ time: entryMarker.time, position: "belowBar", color: "#ef4444", shape: "circle", text: `SL ${sl}` });

//     candleSeries.setMarkers([entryMarker, exitMarker, ...extraMarkers]);

//     const resize = () => chart.applyOptions({ width: containerRef.current!.clientWidth });
//     window.addEventListener("resize", resize);
//     return () => {
//       window.removeEventListener("resize", resize);
//       chart.remove();
//     };
//   }, [symbol, openTime, closeTime, openPrice, closePrice, tp, sl]);

//   return <div ref={containerRef} className="w-full mt-2 rounded-xl overflow-hidden" />;
// };
