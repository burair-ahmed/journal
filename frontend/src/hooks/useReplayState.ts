import { useState, useEffect, useCallback, useRef } from 'react';
import { OHLCCandle } from './useOHLCData';

export interface Trade {
  id: number;
  ticket?: number;
  position_id?: string;
  symbol: string;
  type: number; // 0 = BUY, 1 = SELL
  open_time: string;
  close_time: string;
  open_price: number;
  close_price: number;
  volume: number;
  profit: number;
  account_id: number;
  tp_price?: number;
  sl_price?: number;
}

export interface ReplayState {
  // Current state
  currentIndex: number;
  isPlaying: boolean;
  speed: number; // multiplier: 0.5, 1, 2, 5, 10, 20
  
  // Trade data
  selectedTrade: Trade |null;
  candles: OHLCCandle[];
  
  // Computed values
  progress: number; // 0-100%
  currentTime: number;
  hasReachedEntry: boolean;
  hasReachedExit: boolean;
  currentPnL: number;
  currentPrice: number;
  
  // Actions
  play: () => void;
  pause: () => void;
  restart: () => void;
  setSpeed: (speed: number) => void;
  scrubTo: (index: number) => void;
  jumpToEntry: () => void;
  jumpToExit: () => void;
  selectTrade: (trade: Trade | null) => void;
  setCandles: (candles: OHLCCandle[]) => void;
}

export const useReplayState = (): ReplayState => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState(1);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [candles, setCandles] = useState<OHLCCandle[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Computed values
  const progress = candles.length > 0 ? (currentIndex / (candles.length - 1)) * 100 : 0;
  const currentTime = candles[currentIndex]?.timestamp || 0;
  const currentPrice = candles[currentIndex]?.close || 0;
  
  const entryTime = selectedTrade ? new Date(selectedTrade.open_time).getTime() / 1000 : 0;
  const exitTime = selectedTrade ? new Date(selectedTrade.close_time).getTime() / 1000 : 0;
  
  // Use >= for entry/exit detection to ensure markers appear
  const hasReachedEntry = currentTime >= entryTime && entryTime > 0;
  const hasReachedExit = currentTime >= exitTime && exitTime > 0;
  
  // Calculate current P&L based on current price (only after entry)
  const currentPnL = selectedTrade && currentPrice > 0 && hasReachedEntry
    ? selectedTrade.type === 0 // BUY
      ? (currentPrice - selectedTrade.open_price) * selectedTrade.volume * 100000 // Rough forex calculation
      : (selectedTrade.open_price - currentPrice) * selectedTrade.volume * 100000
    : 0;

  // Play/Pause logic with interval
  useEffect(() => {
    if (!isPlaying || candles.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const baseInterval = 1000; // 1 second per candle at 1x
    const actualInterval = baseInterval / speed;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= candles.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, actualInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed, candles.length]);

  // Actions
  const play = useCallback(() => {
    if (currentIndex >= candles.length - 1) {
      setCurrentIndex(0); // Restart if at end
    }
    setIsPlaying(true);
  }, [currentIndex, candles.length]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const restart = useCallback(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(newSpeed);
  }, []);

  const scrubTo = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, candles.length - 1));
    setCurrentIndex(clampedIndex);
  }, [candles.length]);

  const jumpToEntry = useCallback(() => {
    if (!selectedTrade) return;
    const entryIndex = candles.findIndex(
      (candle) => candle.timestamp >= entryTime
    );
    if (entryIndex !== -1) {
      scrubTo(entryIndex);
    }
  }, [selectedTrade, candles, entryTime, scrubTo]);

  const jumpToExit = useCallback(() => {
    if (!selectedTrade) return;
    const exitIndex = candles.findIndex(
      (candle) => candle.timestamp >= exitTime
    );
    if (exitIndex !== -1) {
      scrubTo(exitIndex);
    }
  }, [selectedTrade, candles, exitTime, scrubTo]);

  const selectTrade = useCallback((trade: Trade | null) => {
    setSelectedTrade(trade);
    setCurrentIndex(0);
    setIsPlaying(false);
    setCandles([]);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          isPlaying ? pause() : play();
          break;
        case 'ArrowRight':
          e.preventDefault();
          scrubTo(currentIndex + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          scrubTo(currentIndex - 1);
          break;
        case 'KeyR':
          e.preventDefault();
          restart();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentIndex, play, pause, scrubTo, restart]);

  return {
    currentIndex,
    isPlaying,
    speed,
    selectedTrade,
    candles,
    progress,
    currentTime,
    hasReachedEntry,
    hasReachedExit,
    currentPnL,
    currentPrice,
    play,
    pause,
    restart,
    setSpeed,
    scrubTo,
    jumpToEntry,
    jumpToExit,
    selectTrade,
    setCandles,
  };
};
