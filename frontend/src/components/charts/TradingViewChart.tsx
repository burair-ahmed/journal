// components/charts/TradingViewChart.tsx
/**
 * TradingView chart component using lightweight-charts library
 * Displays candlestick data with entry/exit markers
 */

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, UTCTimestamp } from 'lightweight-charts';
import type { OHLCCandle } from '@/hooks/useOHLCData';

interface ChartMarker {
  time: number;
  position: 'belowBar' | 'aboveBar' | 'inBar';
  color: string;
  shape: 'arrowUp' | 'arrowDown' | 'circle' | 'square';
  text: string;
}

interface TradingViewChartProps {
  data: OHLCCandle[];
  markers?: ChartMarker[];
  height?: number;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  data,
  markers = [],
  height = 400
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data.length) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: '#d1d5db',
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#374151',
      },
      rightPriceScale: {
        borderColor: '#374151',
      },
    });

    // Add candlestick series (v4 API)
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: true,
      borderColor: '#000000',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickVisible: true,
      wickColor: '#999999',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    } as any);

    // Transform data to chart format with proper UTC timestamp
    const chartData = data.map(candle => ({
      time: candle.timestamp as UTCTimestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    candlestickSeries.setData(chartData);
    
    // Add markers at exact price points (using 'inBar' position)
    if (markers && markers.length > 0) {
      const chartMarkers = markers.map(marker => ({
        time: marker.time as UTCTimestamp,
        position: 'inBar' as const, // Position marker on the bar itself at exact price
        color: marker.color,
        shape: marker.shape,
        text: marker.text,
      }));
      candlestickSeries.setMarkers(chartMarkers);
    }
    
    // Cleanup
    return () => {
      chart.remove();
    };
  }, [data, markers, height]);

  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-black text-gray-400" 
        style={{ height: `${height}px` }}
      >
        <p>No chart data available</p>
      </div>
    );
  }

  return <div ref={chartContainerRef} className="w-full" />;
};
