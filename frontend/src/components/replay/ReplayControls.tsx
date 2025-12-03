import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  FastForward,
} from 'lucide-react';

interface ReplayControlsProps {
  isPlaying: boolean;
  speed: number;
  onPlayPause: () => void;
  onRestart: () => void;
  onSpeedChange: (speed: number) => void;
  onJumpToEntry: () => void;
  onJumpToExit: () => void;
  hasEntry: boolean;
  hasExit: boolean;
}

export const ReplayControls: React.FC<ReplayControlsProps> = ({
  isPlaying,
  speed,
  onPlayPause,
  onRestart,
  onSpeedChange,
  onJumpToEntry,
  onJumpToExit,
  hasEntry,
  hasExit,
}) => {
  const speeds = [0.5, 1, 2, 5, 10, 20];

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-card border rounded-lg shadow-sm">
      {/* Left: Playback Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onRestart}
          title="Restart (R)"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button
          variant={isPlaying ? "secondary" : "default"}
          size="icon"
          onClick={onPlayPause}
          className={isPlaying ? "" : "bg-brand-gradient text-white hover:opacity-90"}
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
        </Button>
      </div>

      {/* Center: Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onJumpToEntry}
          disabled={!hasEntry}
          className="text-xs"
          title="Jump to Entry"
        >
          <SkipBack className="h-3 w-3 mr-1" />
          Entry
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onJumpToExit}
          disabled={!hasExit}
          className="text-xs"
          title="Jump to Exit"
        >
          Exit
          <SkipForward className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {/* Right: Speed Control */}
      <div className="flex items-center gap-2">
        <FastForward className="h-4 w-4 text-muted-foreground" />
        <Select
          value={speed.toString()}
          onValueChange={(val) => onSpeedChange(Number(val))}
        >
          <SelectTrigger className="w-[80px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {speeds.map((s) => (
              <SelectItem key={s} value={s.toString()}>
                {s}x
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
