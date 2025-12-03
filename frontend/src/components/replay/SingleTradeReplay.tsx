import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useReplayState, Trade } from '@/hooks/useReplayState';
import { useOHLCData } from '@/hooks/useOHLCData';
import { ReplayChart } from '@/components/replay/ReplayChart';
import { ReplayControls } from '@/components/replay/ReplayControls';
import { ReplayTimeline } from '@/components/replay/ReplayTimeline';
import { QuickTradeSelector } from '@/components/replay/QuickTradeSelector';
import { useAccountContext } from '@/contexts/AccountContext';
import { Loader2, PlayCircle, ArrowLeftRight, X } from 'lucide-react';
import dayjs from 'dayjs';
import { useFilteredTrades } from '@/hooks/useTrades';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface SingleTradeReplayProps {
  tradeId?: number | null;
  onClose?: () => void;
  showControls?: boolean;
  className?: string;
  masterControl?: {
    isPlaying: boolean;
    onRegister: (callbacks: { play: () => void; pause: () => void }) => void;
    onUnregister: () => void;
  };
}

export const SingleTradeReplay = ({ 
  tradeId, 
  onClose, 
  showControls = true,
  className,
  masterControl
}: SingleTradeReplayProps) => {
  const { selectedAccountId } = useAccountContext();
  const replayState = useReplayState();
  const {
    selectedTrade,
    candles,
    currentIndex,
    isPlaying,
    speed,
    progress,
    currentTime,
    currentPnL,
    hasReachedEntry,
    hasReachedExit,
    setCandles,
    selectTrade,
    play,
    pause,
    restart,
    setSpeed,
    scrubTo,
    jumpToEntry,
    jumpToExit,
  } = replayState;

  // Sync with Master Control
  useEffect(() => {
    if (masterControl && selectedTrade) {
      masterControl.onRegister({ play, pause });
      return () => masterControl.onUnregister();
    }
  }, [masterControl, selectedTrade, play, pause]);

  const { trades } = useFilteredTrades(selectedAccountId);

  // Sync with tradeId prop
  useEffect(() => {
    if (tradeId && trades && (!selectedTrade || selectedTrade.id !== tradeId)) {
      const trade: any = trades.find((t: any) => t.id === tradeId);
      if (trade) {
        selectTrade({
          id: trade.id,
          ticket: trade.ticket,
          position_id: trade.position_id,
          symbol: trade.symbol,
          type: trade.type,
          open_time: trade.open_time,
          close_time: trade.close_time,
          open_price: Number(trade.open_price),
          close_price: Number(trade.close_price),
          volume: Number(trade.volume),
          profit: Number(trade.profit),
          account_id: trade.account_id,
          tp_price: trade.tp_price ? Number(trade.tp_price) : undefined,
          sl_price: trade.sl_price ? Number(trade.sl_price) : undefined,
        });
      }
    }
  }, [tradeId, trades, selectTrade, selectedTrade]);

  // Fetch OHLC data when trade is selected
  const bufferDays = 2;
  const extendedStartTime = selectedTrade 
    ? dayjs(selectedTrade.open_time).subtract(bufferDays, 'day').toISOString()
    : undefined;
  const extendedEndTime = selectedTrade
    ? dayjs(selectedTrade.close_time).add(bufferDays, 'day').toISOString()
    : undefined;

  const { data: ohlcData, isLoading } = useOHLCData(
    selectedTrade?.account_id,
    selectedTrade?.symbol,
    '5m',
    extendedStartTime,
    extendedEndTime
  );

  // Update candles when data loads
  useEffect(() => {
    if (ohlcData && Array.isArray(ohlcData) && ohlcData.length > 0) {
      setCandles(ohlcData);
    }
  }, [ohlcData, setCandles]);

  // Empty state - no trade selected
  if (!selectedTrade) {
    return (
      <div className={`flex flex-col items-center justify-center h-full bg-background p-6 border rounded-lg ${className}`}>
        <Card className="p-8 text-center max-w-md w-full relative">
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <PlayCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-bold mb-2">Select Trade</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Choose a trade to replay in this slot.
          </p>
          
          <QuickTradeSelector
            accountId={selectedAccountId}
            onSelectTrade={selectTrade}
            selectedTrade={selectedTrade}
          />
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center h-full bg-background ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-background gap-4 ${className}`}>
      {/* Header */}
      <Card className="p-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="min-w-0">
              <h1 className="text-lg font-bold bg-brand-gradient bg-clip-text text-transparent truncate">
                {selectedTrade.symbol}
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                {selectedTrade.type === 0 ? 'BUY' : 'SELL'} • {dayjs(selectedTrade.open_time).format('MMM DD HH:mm')}
              </p>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0" align="start">
                <QuickTradeSelector
                  accountId={selectedAccountId}
                  onSelectTrade={(trade) => {
                    if (trade) selectTrade(trade);
                  }}
                  selectedTrade={selectedTrade}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Stats - Compact */}
          <div className="flex gap-4 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-muted-foreground">Entry</div>
              <div className="text-sm font-bold font-mono">
                {selectedTrade.open_price.toFixed(5)}
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-muted-foreground">Exit</div>
              <div className="text-sm font-bold font-mono">
                {selectedTrade.close_price.toFixed(5)}
              </div>
            </div>
            {onClose && (
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Content - Chart Area */}
      <Card className="flex-1 p-0 overflow-hidden min-h-0">
        <ReplayChart
          allCandles={candles}
          currentIndex={currentIndex}
          entryPrice={selectedTrade.open_price}
          exitPrice={selectedTrade.close_price}
          entryTime={dayjs(selectedTrade.open_time).unix()}
          exitTime={dayjs(selectedTrade.close_time).unix()}
          tradeType={selectedTrade.type === 0 ? 'BUY' : 'SELL'}
          showEntry={hasReachedEntry}
          showExit={hasReachedExit}
          currentPnL={currentPnL}
          height={undefined} // Ignored when autoSize is true
          autoSize={true}
        />
      </Card>

      {/* Controls Area - Conditional */}
      {showControls && (
        <Card className="p-3 flex flex-col gap-3 shrink-0">
          <ReplayTimeline
            currentIndex={currentIndex}
            totalCandles={candles.length}
            currentTime={currentTime}
            startTime={candles[0]?.timestamp || 0}
            endTime={candles[candles.length - 1]?.timestamp || 0}
            onScrub={scrubTo}
          />
          
          <ReplayControls
            isPlaying={isPlaying}
            speed={speed}
            onPlayPause={isPlaying ? pause : play}
            onRestart={restart}
            onSpeedChange={setSpeed}
            onJumpToEntry={jumpToEntry}
            onJumpToExit={jumpToExit}
            hasEntry={!!selectedTrade}
            hasExit={!!selectedTrade}
          />
        </Card>
      )}
    </div>
  );
};
