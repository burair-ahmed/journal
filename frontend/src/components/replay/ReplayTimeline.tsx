import { Slider } from '@/components/ui/slider';
import dayjs from 'dayjs';

interface ReplayTimelineProps {
  currentIndex: number;
  totalCandles: number;
  currentTime: number;
  startTime: number;
  endTime: number;
  onScrub: (index: number) => void;
}

export const ReplayTimeline: React.FC<ReplayTimelineProps> = ({
  currentIndex,
  totalCandles,
  currentTime,
  startTime,
  endTime,
  onScrub,
}) => {
  // Format time for display
  const formatTime = (timestamp: number) => {
    if (!timestamp) return '--:--';
    return dayjs.unix(timestamp).format('MMM DD, HH:mm');
  };

  return (
    <div className="w-full px-1">
      <div className="flex justify-between text-xs text-muted-foreground mb-2">
        <span>{formatTime(startTime)}</span>
        <span className="font-mono text-foreground font-medium">
          {formatTime(currentTime)}
        </span>
        <span>{formatTime(endTime)}</span>
      </div>
      
      <Slider
        value={[currentIndex]}
        min={0}
        max={Math.max(0, totalCandles - 1)}
        step={1}
        onValueChange={(vals) => onScrub(vals[0])}
        className="cursor-pointer"
      />
    </div>
  );
};
