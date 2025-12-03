import { useEffect, useMemo } from 'react';
import { TradingViewChart } from '@/components/charts/TradingViewChart';
import { OHLCCandle } from '@/hooks/useOHLCData';
import dayjs from 'dayjs';

interface ReplayChartProps {
  allCandles: OHLCCandle[];
  currentIndex: number;
  entryPrice: number;
  exitPrice: number;
  entryTime: number; // Unix timestamp
  exitTime: number;   // Unix timestamp
  tradeType: 'BUY' | 'SELL';
  showEntry: boolean;
  showExit: boolean;
  currentPnL: number;
  height?: number;
  autoSize?: boolean;
}

interface ChartMarker {
  time: number;
  position: 'belowBar' | 'aboveBar' | 'inBar';
  color: string;
  shape: 'arrowUp' | 'arrowDown' | 'circle' | 'square';
  text: string;
}

export const ReplayChart: React.FC<ReplayChartProps> = ({
  allCandles,
  currentIndex,
  entryPrice,
  exitPrice,
  entryTime,
  exitTime,
  tradeType,
  showEntry,
  showExit,

  currentPnL,
  height = 500,
  autoSize = false,
}) => {
  // Get only the candles up to current index (progressive reveal)
  const visibleCandles = useMemo(() => {
    const visible = allCandles.slice(0, currentIndex + 1);
    console.log(`[ReplayChart] Total candles: ${allCandles.length}, Current index: ${currentIndex}, Visible: ${visible.length}`);
    return visible;
  }, [allCandles, currentIndex]);

  // Create markers that appear only when we've reached their timestamp
  const markers: ChartMarker[] = useMemo(() => {
    const chartMarkers: ChartMarker[] = [];

    // Entry marker - show when we've reached entry time
    if (showEntry) {
      chartMarkers.push({
        time: entryTime,
        position: 'inBar' as const,
        color: '#D946EF', // Primary color from theme (fuchsia)
        shape: 'arrowUp' as const,
        text: `Entry: ${entryPrice.toFixed(5)}`,
      });
    }

    // Exit marker - show when we've reached exit time
    if (showExit) {
      const isProfitable = exitPrice > entryPrice ? (tradeType === 'BUY') : (tradeType === 'SELL');
      chartMarkers.push({
        time: exitTime,
        position: 'inBar' as const,
        color: isProfitable ? '#16a34a' : '#dc2626', // Profit green or loss red
        shape: 'arrowDown' as const,
        text: `Exit: ${exitPrice.toFixed(5)}`,
      });
    }

    return chartMarkers;
  }, [showEntry, showExit, entryTime, exitTime, entryPrice, exitPrice, tradeType]);

  // Display current candle info if available
  const currentCandle = allCandles[currentIndex];

  return (
    <div className="relative h-full w-full min-h-[300px]">
      {/* Chart */}
      <div className="h-full">
        <TradingViewChart
          data={visibleCandles}
          markers={markers}
          height={height}
          autoSize={autoSize}
        />
      </div>

      {/* Overlay - Current Stats */}
      {currentCandle && (
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-white/10 shadow-xl">
          <div className="space-y-2 text-sm">
            {/* Current Time */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Time:</span>
              <span className="text-white font-mono">
                {dayjs.unix(currentCandle.timestamp).format('MMM DD, HH:mm:ss')}
              </span>
            </div>

            {/* Current Price */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Price:</span>
              <span className="text-white font-mono font-bold">
                {currentCandle.close.toFixed(5)}
              </span>
            </div>

            {/* Current P&L */}
            {showEntry && (
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <span className="text-gray-400">P&L:</span>
                <span
                  className={`font-mono font-bold ${
                    currentPnL >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {currentPnL >= 0 ? '+' : ''}${currentPnL.toFixed(2)}
                </span>
              </div>
            )}

            {/* Trade Status Indicators */}
            <div className="flex gap-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    showEntry ? 'bg-fuchsia-500 animate-pulse' : 'bg-gray-600'
                  }`}
                />
                <span className={showEntry ? 'text-fuchsia-400' : 'text-gray-500'}>
                  Entry
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    showExit
                      ? currentPnL >= 0
                        ? 'bg-green-500 animate-pulse'
                        : 'bg-red-500 animate-pulse'
                      : 'bg-gray-600'
                  }`}
                />
                <span
                  className={
                    showExit
                      ? currentPnL >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                      : 'text-gray-500'
                  }
                >
                  Exit
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">Candles:</span>
          <span className="text-white font-mono">
            {visibleCandles.length} / {allCandles.length}
          </span>
        </div>
      </div>
    </div>
  );
};
