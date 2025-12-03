import { useState } from 'react';
import { useFilteredTrades } from '@/hooks/useTrades';
import { Trade } from '@/hooks/useReplayState';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

interface QuickTradeSelectorProps {
  accountId?: number;
  onSelectTrade: (trade: Trade | null) => void;
  selectedTrade: Trade | null;
}

export const QuickTradeSelector: React.FC<QuickTradeSelectorProps> = ({
  accountId,
  onSelectTrade,
  selectedTrade,
}) => {
  const { trades, isLoading } = useFilteredTrades(accountId);
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <Button variant="outline" className="w-full justify-between" disabled>
        Loading trades...
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  if (!trades || trades.length === 0) {
    return (
      <Button variant="outline" className="w-full justify-between" disabled>
        No trades available
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  // Sort trades by date (most recent first)
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(b.close_time).getTime() - new Date(a.close_time).getTime()
  );

  const handleSelect = (tradeId: string) => {
    const trade: any = sortedTrades.find((t: any) => t.id.toString() === tradeId);
    if (trade) {
      onSelectTrade({
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
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto py-3"
        >
          {selectedTrade ? (
            <div className="flex flex-col items-start text-left">
              <span className="font-semibold flex items-center gap-2">
                {selectedTrade.symbol}
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded",
                  selectedTrade.type === 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                )}>
                  {selectedTrade.type === 0 ? 'BUY' : 'SELL'}
                </span>
              </span>
              <span className="text-xs text-muted-foreground">
                {dayjs(selectedTrade.close_time).format('MMM DD, HH:mm')} • {selectedTrade.profit >= 0 ? '+' : ''}{selectedTrade.profit.toFixed(2)}
              </span>
            </div>
          ) : (
            "Select a trade to replay..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search symbol..." />
          <CommandList>
            <CommandEmpty>No trade found.</CommandEmpty>
            <CommandGroup heading="Recent Trades">
              {sortedTrades.slice(0, 100).map((trade: any) => {
                const isProfit = Number(trade.profit) > 0;
                const tradeType = trade.type === 0 ? 'BUY' : 'SELL';
                const isSelected = selectedTrade?.id === trade.id;

                return (
                  <CommandItem
                    key={trade.id}
                    value={`${trade.symbol} ${trade.id}`} // Search by symbol
                    onSelect={() => handleSelect(trade.id.toString())}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{trade.symbol}</span>
                        <span className={cn(
                          "font-mono text-xs",
                          isProfit ? "text-green-500" : "text-red-500"
                        )}>
                          {isProfit ? '+' : ''}{Number(trade.profit).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-1.5 rounded",
                            tradeType === 'BUY' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                          )}>
                            {tradeType}
                          </span>
                          <span>{dayjs(trade.close_time).format('MMM DD, HH:mm')}</span>
                        </div>
                        <span>Vol: {trade.volume}</span>
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
