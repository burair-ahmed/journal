import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SingleTradeReplay } from '@/components/replay/SingleTradeReplay';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  LayoutTemplate, 
  Columns, 
  Grid2X2, 
  Maximize,
  Minimize,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type LayoutType = '1x1' | '1x2' | '2x2';

interface ReplaySlot {
  id: string;
  tradeId: number | null;
}

export const TradeReplay = () => {
  const [searchParams] = useSearchParams();
  const tradeIdParam = searchParams.get('tradeId');
  
  const [layout, setLayout] = useState<LayoutType>('1x1');
  const [slots, setSlots] = useState<ReplaySlot[]>([
    { id: 'slot-1', tradeId: null }
  ]);
  const [isSyncEnabled, setIsSyncEnabled] = useState(false);
  
  // Master Control Logic
  const [isMasterPlaying, setIsMasterPlaying] = useState(false);
  const [masterSpeed, setMasterSpeed] = useState(1);
  const [childControls, setChildControls] = useState<any[]>([]);

  const registerChild = (controls: any) => {
    setChildControls(prev => [...prev, controls]);
  };

  const unregisterChild = (controls: any) => {
    setChildControls(prev => prev.filter(c => c !== controls));
  };

  const masterControl = isSyncEnabled ? {
    isPlaying: isMasterPlaying,
    speed: masterSpeed,
    onRegister: registerChild,
    onUnregister: () => {}, // Simplified for now, ideally pass ID
  } : undefined;

  const toggleMasterPlay = () => {
    const newState = !isMasterPlaying;
    setIsMasterPlaying(newState);
    childControls.forEach(child => {
      if (newState) child.play();
      else child.pause();
    });
  };

  const handleMasterRestart = () => {
    childControls.forEach(child => {
      if (child.restart) child.restart();
    });
    setIsMasterPlaying(false);
  };

  const handleMasterSpeedChange = (newSpeed: number) => {
    setMasterSpeed(newSpeed);
    childControls.forEach(child => {
      if (child.setSpeed) child.setSpeed(newSpeed);
    });
  };

  // Initialize first slot with URL param
  useEffect(() => {
    if (tradeIdParam) {
      setSlots(prev => {
        const newSlots = [...prev];
        if (newSlots[0].tradeId !== Number(tradeIdParam)) {
          newSlots[0] = { ...newSlots[0], tradeId: Number(tradeIdParam) };
          return newSlots;
        }
        return prev;
      });
    }
  }, [tradeIdParam]);

  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout);
    setSlots(prev => {
      let newSlots = [...prev];
      const targetCount = newLayout === '1x1' ? 1 : newLayout === '1x2' ? 2 : 4;
      
      if (newSlots.length < targetCount) {
        // Add slots
        for (let i = newSlots.length; i < targetCount; i++) {
          newSlots.push({ id: `slot-${i + 1}`, tradeId: null });
        }
      } else if (newSlots.length > targetCount) {
        // Remove slots (keep the first ones)
        newSlots = newSlots.slice(0, targetCount);
      }
      return newSlots;
    });
  };

  const handleCloseSlot = (slotId: string) => {
    // If closing the only slot, just clear it
    if (slots.length === 1) {
      setSlots([{ ...slots[0], tradeId: null }]);
      return;
    }
    // Otherwise, maybe reset layout? For now, just clear the trade
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, tradeId: null } : s));
  };

  const getGridClass = () => {
    switch (layout) {
      case '1x1': return 'grid-cols-1 grid-rows-1';
      case '1x2': return 'grid-cols-2 grid-rows-1';
      case '2x2': return 'grid-cols-2 grid-rows-2';
      default: return 'grid-cols-1';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background p-4 gap-4 relative">
      {/* Top Bar */}
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-bold bg-brand-gradient bg-clip-text text-transparent">
          Trade Replay
        </h1>
        
        <div className="flex items-center gap-4">
          {/* Sync Toggle */}
          <div className="flex items-center gap-2">
            <Switch 
              id="sync-mode" 
              checked={isSyncEnabled}
              onCheckedChange={setIsSyncEnabled}
            />
            <Label htmlFor="sync-mode" className="cursor-pointer">Sync Playback</Label>
          </div>

          {/* Layout Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <LayoutTemplate className="h-4 w-4" />
                Compare
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleLayoutChange('1x1')}>
                <Maximize className="h-4 w-4 mr-2" /> Single View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLayoutChange('1x2')}>
                <Columns className="h-4 w-4 mr-2" /> Split Vertical (2)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLayoutChange('2x2')}>
                <Grid2X2 className="h-4 w-4 mr-2" /> Quad View (4)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grid Container */}
      <div className={`grid ${getGridClass()} gap-4 flex-1 min-h-0 transition-all duration-300 ${isSyncEnabled ? 'pb-24' : ''}`}>
        {slots.map((slot) => (
          <div key={slot.id} className="min-h-0 min-w-0 h-full">
            <SingleTradeReplay
              tradeId={slot.tradeId}
              onClose={() => handleCloseSlot(slot.id)}
              showControls={!isSyncEnabled}
              className="h-full border rounded-lg shadow-sm"
              masterControl={isSyncEnabled ? {
                isPlaying: isMasterPlaying,
                onRegister: registerChild,
                onUnregister: () => {} // Fix this to be robust later
              } : undefined}
            />
          </div>
        ))}
      </div>

      {/* Master Control Bar (Visible only when Sync is ON) */}
      {isSyncEnabled && (
        <Card className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl p-4 shadow-2xl border-primary/20 bg-background/95 backdrop-blur animate-in slide-in-from-bottom-10">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Restart & Play/Pause */}
            <div className="flex items-center gap-2">
              <Button 
                size="icon" 
                variant="outline"
                onClick={handleMasterRestart}
                title="Restart All"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              
              <Button 
                size="icon"
                variant={isMasterPlaying ? "secondary" : "default"}
                className={isMasterPlaying ? "" : "bg-brand-gradient text-white hover:opacity-90"}
                onClick={toggleMasterPlay}
                title={isMasterPlaying ? "Pause All" : "Play All"}
              >
                {isMasterPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 fill-current" />
                )}
              </Button>
            </div>

            {/* Center: Label */}
            <div className="text-sm text-muted-foreground font-mono">
              Master Control
            </div>

            {/* Right: Speed Control */}
            <div className="flex items-center gap-2">
              <Minimize className="h-4 w-4 text-muted-foreground" />
              <Select
                value={masterSpeed.toString()}
                onValueChange={(val) => handleMasterSpeedChange(Number(val))}
              >
                <SelectTrigger className="w-[80px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0.5, 1, 2, 5, 10, 20].map((s) => (
                    <SelectItem key={s} value={s.toString()}>
                      {s}x
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
