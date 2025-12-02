// components/charts/TradeChart.tsx
/**
 * Chart wrapper component for displaying OHLC data for a specific trade
 * Includes timeframe selector and trade entry/exit markers
 */

import React, { useState } from 'react';
import { TradingViewChart } from './TradingViewChart';
import { useOHLCData, type Timeframe } from '@/hooks/useOHLCData';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import dayjs from 'dayjs';

interface TradeChartProps {
  symbol: string;
  accountId: number;
  openTime: string;
  closeTime: string;
  entryPrice: number;
  exitPrice: number;
  tradeType: 'BUY' | 'SELL';
}

const TIMEFRAMES: Timeframe[] = ['1m', '3m', '5m', '30m', '1h', '4h', '1d'];

export const TradeChart: React.FC<TradeChartProps> = ({
  symbol,
  accountId,
  openTime,
  closeTime,
  entryPrice,
  exitPrice,
  tradeType
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('5m');

  // Add context: 2 days before and after for better chart analysis
  const bufferDays = 2;
  const extendedStartTime = dayjs(openTime).subtract(bufferDays, 'day').toISOString();
  const extendedEndTime = dayjs(closeTime).add(bufferDays, 'day').toISOString();

  const { data: ohlcData, isLoading, error } = useOHLCData(
    accountId,
    symbol,
    timeframe,
    extendedStartTime,  // 2 days before trade
    extendedEndTime     // 2 days after trade
  );

  // Create entry/exit markers at exact price points
  const markers = (ohlcData && Array.isArray(ohlcData) && ohlcData.length > 0) ? [
    {
      time: dayjs(openTime).unix(),
      position: 'inBar' as const, // Position on bar at exact price
      color: '#3b82f6',
      shape: 'arrowUp' as const,
      text: `Entry: ${entryPrice.toFixed(5)}`,
    },
    {
      time: dayjs(closeTime).unix(),
      position: 'inBar' as const, // Position on bar at exact price
      color: exitPrice > entryPrice ? '#10b981' : '#ef4444',
      shape: 'arrowDown' as const,
      text: `Exit: ${exitPrice.toFixed(5)}`,
    }
  ] : [];

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Timeframe Selector */}
      <div className="p-3 border-b border-gray-800 flex gap-2 overflow-x-auto">
        {TIMEFRAMES.map(tf => (
          <Button
            key={tf}
            size="sm"
            variant={timeframe === tf ? 'default' : 'outline'}
            onClick={() => setTimeframe(tf)}
            className="shrink-0"
          >
            {tf}
          </Button>
        ))}
      </div>

      {/* Chart */}
      <div className="flex-1 p-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-400">Loading chart...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-500 mb-2">Failed to load chart data</p>
              <p className="text-gray-400 text-sm">
                {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </div>
          </div>
        ) : (!ohlcData || !Array.isArray(ohlcData) || ohlcData.length === 0) ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-400 mb-2">No chart data available</p>
              <p className="text-gray-500 text-sm">
                Sync OHLC data for this account to view charts
              </p>
            </div>
          </div>
        ) : (
          <TradingViewChart 
            data={ohlcData} 
            markers={markers}
            height={500}
          />
        )}
      </div>

      {/* Stats Footer */}
      {(ohlcData && Array.isArray(ohlcData) && ohlcData.length > 0) && (
        <div className="p-2 border-t border-gray-800 flex gap-4 text-xs text-gray-400">
          <span>{symbol}</span>
          <span>•</span>
          <span>{timeframe} timeframe</span>
          <span>•</span>
          <span>{ohlcData.length} candles</span>
          <span>•</span>
          <span className={exitPrice > entryPrice ? 'text-green-500' : 'text-red-500'}>
            P&L: {((exitPrice - entryPrice) / entryPrice * 100).toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
};
