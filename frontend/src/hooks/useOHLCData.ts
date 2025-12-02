// hooks/useOHLCData.ts
/**
 * Custom hook to fetch OHLC (candlestick) data for charts
 * Handles daily aggregated JSONB format from backend
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import dayjs from 'dayjs';

// Timeframe types
export type Timeframe = '1m' | '3m' | '5m' | '30m' | '1h' | '4h' | '1d';

// Candle structure from JSONB (compact format)
interface CompactCandle {
  time: string;  // ISO timestamp
  o: number;     // open
  h: number;     // high
  l: number;     // low
  c: number;     // close
  v: number;     // volume
  tv: number;    // tick_volume
  s: number;     // spread
}

// Daily record structure from database
interface DailyOHLCRecord {
  id: number;
  mt5_server: string;
  symbol: string;
  timeframe: Timeframe;
  date: string;
  candles: CompactCandle[];
  candle_count: number;
  first_candle_time: string;
  last_candle_time: string;
}

// Expanded candle for chart display
export interface OHLCCandle {
  time: string;
  timestamp: number;  // Unix timestamp for charts
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  tick_volume: number;
  spread: number;
}

// Normalization functions (match backend)
const normalizeServerName = (server: string): string => {
  return server.replace(/[\s-]+/g, '').toLowerCase();
};

const normalizeSymbol = (symbol: string): string => {
  return symbol.replace(/\.(a|i|m|e|c)$|_(a|i|m|e|c)$/i, '').toUpperCase();
};

/**
 * Extract and expand candles from JSONB daily records
 */
const extractCandles = (dailyRecords: DailyOHLCRecord[]): OHLCCandle[] => {
  const allCandles: OHLCCandle[] = [];
  
  for (const record of dailyRecords) {
    for (const candle of record.candles) {
      allCandles.push({
        time: candle.time,
        timestamp: dayjs(candle.time).unix(),
        open: candle.o,
        high: candle.h,
        low: candle.l,
        close: candle.c,
        volume: candle.v,
        tick_volume: candle.tv,
        spread: candle.s
      });
    }
  }
  
  // Sort by time to ensure chronological order
  return allCandles.sort((a, b) => a.timestamp - b.timestamp);
};

/**
 * Hook to fetch OHLC data for a specific trade
 */
export const useOHLCData = (
  accountId: number | undefined,
  symbol: string | undefined,
  timeframe: Timeframe,
  startTime: string | undefined,
  endTime: string | undefined
) => {
  return useQuery({
    queryKey: ['ohlc', accountId, symbol, timeframe, startTime, endTime],
    queryFn: async () => {
      if (!accountId || !symbol || !startTime || !endTime) {
        return [];
      }

      // Step 1: Get account's server
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('mt5_server')
        .eq('id', accountId)
        .single();

      if (accountError || !account) {
        throw new Error('Account not found');
      }

      // Step 2: Normalize server and symbol
      const normalizedServer = normalizeServerName(account.mt5_server);
      const normalizedSymbol = normalizeSymbol(symbol);

      // Step 3: Calculate date range (add buffer for context)
      const bufferHours = 24;
      const startDate = dayjs(startTime).subtract(bufferHours, 'hour').format('YYYY-MM-DD');
      const endDate = dayjs(endTime).add(bufferHours, 'hour').format('YYYY-MM-DD');

      // Step 4: Fetch daily OHLC records
      const { data: dailyRecords, error: ohlcError } = await supabase
        .from('ohlc_data')
        .select('*')
        .eq('mt5_server', normalizedServer)
        .eq('symbol', normalizedSymbol)
        .eq('timeframe', timeframe)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (ohlcError) {
        console.error('Error fetching OHLC data:', ohlcError);
        throw ohlcError;
      }

      if (!dailyRecords || dailyRecords.length === 0) {
        return [];
      }

      // Step 5: Extract candles from JSONB arrays
      const allCandles = extractCandles(dailyRecords as DailyOHLCRecord[]);

      // Step 6: Filter to exact time range (remove buffer excess)
      const startTimestamp = dayjs(startTime).unix();
      const endTimestamp = dayjs(endTime).unix();
      
      const filteredCandles = allCandles.filter(
        candle => candle.timestamp >= startTimestamp && candle.timestamp <= endTimestamp
      );

      return filteredCandles;
    },
    enabled: !!accountId && !!symbol && !!timeframe && !!startTime && !!endTime,
    staleTime: 1000 * 60 * 60, // 1 hour - OHLC data is historical, can cache aggressively
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
  });
};

/**
 * Hook to check if OHLC data is available for a symbol
 */
export const useOHLCDataAvailability = (
  accountId: number | undefined,
  symbol: string | undefined,
  timeframe: Timeframe
) => {
  return useQuery({
    queryKey: ['ohlc-availability', accountId, symbol, timeframe],
    queryFn: async () => {
      if (!accountId || !symbol) {
        return false;
      }

      const { data: account } = await supabase
        .from('accounts')
        .select('mt5_server')
        .eq('id', accountId)
        .single();

      if (!account) return false;

      const normalizedServer = normalizeServerName(account.mt5_server);
      const normalizedSymbol = normalizeSymbol(symbol);

      // Check if any data exists
      const { data, error } = await supabase
        .from('ohlc_data')
        .select('id')
        .eq('mt5_server', normalizedServer)
        .eq('symbol', normalizedSymbol)
        .eq('timeframe', timeframe)
        .limit(1);

      return !error && data && data.length > 0;
    },
    enabled: !!accountId && !!symbol,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Trigger OHLC sync for an account
 */
export const syncOHLCData = async (
  accountId: number,
  timeframes: Timeframe[] = ['5m', '1h', '1d'],
  days: number = 90
): Promise<any> => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  
  const response = await fetch(
    `${backendUrl}/sync-ohlc/${accountId}?days=${days}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ timeframes })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to sync OHLC data');
  }

  return response.json();
};
