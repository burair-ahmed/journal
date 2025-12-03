import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useReplayState } from '@/hooks/useReplayState';
import { useOHLCData } from '@/hooks/useOHLCData';
import { ReplayChart } from '@/components/replay/ReplayChart';
import { ReplayControls } from '@/components/replay/ReplayControls';
import { ReplayTimeline } from '@/components/replay/ReplayTimeline';
import { QuickTradeSelector } from '@/components/replay/QuickTradeSelector';
import { useAccountContext } from '@/contexts/AccountContext';
import { Loader2, PlayCircle, ArrowLeftRight } from 'lucide-react';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { useFilteredTrades } from '@/hooks/useTrades';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export const TradeReplay = () => {
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

  // Handle URL params for direct trade selection
  const [searchParams] = useSearchParams();
  const tradeIdParam = searchParams.get('tradeId');
  const { trades } = useFilteredTrades(selectedAccountId);

  useEffect(() => {
    if (tradeIdParam && trades && !selectedTrade) {
      const trade: any = trades.find((t: any) => t.id.toString() === tradeIdParam);
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
  }, [tradeIdParam, trades, selectTrade, selectedTrade]);

  // Fetch OHLC data when trade is selected
  // Add buffer: 2 days before and after for context
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
    '5m', // Default timeframe
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
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-background p-6">
        <Card className="p-12 text-center max-w-2xl w-full">
          <PlayCircle className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2 bg-brand-gradient bg-clip-text text-transparent">
            Trade Replay
          </h2>
          <p className="text-muted-foreground mb-8">
            Select a trade to replay and watch the price action unfold candle by candle.
          </p>
          
          {/* Trade Selector */}
          <QuickTradeSelector
            accountId={selectedAccountId}
            onSelectTrade={selectTrade}
            selectedTrade={selectedTrade}
          />
          
          <div className="mt-6 text-sm text-muted-foreground">
            <p>💡 Tip: Use keyboard shortcuts once replay starts:</p>
            <div className="flex gap-4 justify-center mt-2 text-xs">
              <span><kbd className="px-2 py-1 bg-muted rounded">Space</kbd> Play/Pause</span>
              <span><kbd className="px-2 py-1 bg-muted rounded">←→</kbd> Scrub</span>
              <span><kbd className="px-2 py-1 bg-muted rounded">R</kbd> Restart</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    );
  }

  // No data available
  if (!candles || candles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-background">
        <Card className="p-12 text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">No Chart Data Available</h2>
          <p className="text-muted-foreground mb-4">
            OHLC data is not available for this trade.
          </p>
          <p className="text-sm text-muted-foreground">
            Please sync OHLC data for this account's server and symbol.
          </p>
        </Card>
      </div>
    );
  }

  const visibleCandles = candles.slice(0, currentIndex + 1);
  const currentCandle = candles[currentIndex];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background p-6 gap-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-brand-gradient bg-clip-text text-transparent">
                Trade Replay
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedTrade.symbol} • {selectedTrade.type === 0 ? 'BUY' : 'SELL'} •{' '}
                {dayjs(selectedTrade.open_time).format('MMM DD, YYYY HH:mm')}
              </p>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeftRight className="h-4 w-4" />
                  Switch Trade
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
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
          
          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Entry Price</div>
              <div className="text-xl font-bold font-mono">
                {selectedTrade.open_price.toFixed(5)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Exit Price</div>
              <div className="text-xl font-bold font-mono">
                {selectedTrade.close_price.toFixed(5)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content - Chart Area */}
      <Card className="flex-1 p-0">
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
          height={400}
        />
      </Card>

      {/* Controls Area */}
      <Card className="p-4 flex flex-col gap-4">
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
    </div>
  );
};
