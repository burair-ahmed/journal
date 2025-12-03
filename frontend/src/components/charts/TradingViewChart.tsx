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
  autoSize?: boolean;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  data,
  markers = [],
  height = 400,
  autoSize = false
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  // 1. Initialize Chart (Run once)
  useEffect(() => {
    if (!chartContainerRef.current) return;

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
        // Prevent auto-scroll to latest candle
        rightOffset: 12,
        barSpacing: 6,
        lockVisibleTimeRangeOnResize: true,
        // Don't auto-fit to visible range
        shiftVisibleRangeOnNewBar: false,
      },
      rightPriceScale: {
        borderColor: '#374151',
      },
    });

    // Add candlestick series
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

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Handle resize with ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      if (!chart || !entries[0]) return;
      
      const { width, height: rectHeight } = entries[0].target.getBoundingClientRect();
      
      // Fallback to prop height if container is 0 (e.g. hidden or collapsed)
      const effectiveHeight = (autoSize && rectHeight > 0) ? rectHeight : height;
      
      chart.applyOptions({ 
        width,
        height: effectiveHeight
      });
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height, autoSize]); // Re-run if height or autoSize changes

  // 2. Update Data
  useEffect(() => {
    if (!seriesRef.current || !data.length) return;

    const chartData = data.map(candle => ({
      time: candle.timestamp as UTCTimestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    seriesRef.current.setData(chartData);
  }, [data]);

  // 3. Update Markers
  useEffect(() => {
    if (!seriesRef.current) return;

    if (markers && markers.length > 0) {
      const chartMarkers = markers.map(marker => ({
        time: marker.time as UTCTimestamp,
        position: 'inBar' as const,
        color: marker.color,
        shape: marker.shape,
        text: marker.text,
      }));
      seriesRef.current.setMarkers(chartMarkers);
    } else {
      seriesRef.current.setMarkers([]);
    }
  }, [markers]);

  if (!data || data.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-black text-gray-400 ${autoSize ? 'h-full' : ''}`}
        style={!autoSize ? { height: `${height}px` } : undefined}
      >
        <p>No chart data available</p>
      </div>
    );
  }

  return <div ref={chartContainerRef} className={`w-full ${autoSize ? 'h-full' : ''}`} />;
};
