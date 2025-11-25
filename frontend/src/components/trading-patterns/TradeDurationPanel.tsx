import { Card } from "@/components/ui/card";
import { RadialRing } from "./RadialRing";
import { Clock, Zap, TrendingUp, Calendar } from "lucide-react";
import { DurationStats } from "@/lib/analytics/tradingPatterns";
import { useEffect, useState } from "react";

interface TradeDurationPanelProps extends DurationStats {}

export const TradeDurationPanel = ({ scalps, intraday, swing, position }: TradeDurationPanelProps) => {
  const [displayScalps, setDisplayScalps] = useState(0);
  const [displayIntraday, setDisplayIntraday] = useState(0);
  const [displaySwing, setDisplaySwing] = useState(0);
  const [displayPosition, setDisplayPosition] = useState(0);

  useEffect(() => {
    const animateCounter = (target: number, setter: (val: number) => void) => {
      const duration = 1000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(current));
        }
      }, duration / steps);

      return timer;
    };

    const timers = [
      animateCounter(scalps, setDisplayScalps),
      animateCounter(intraday, setDisplayIntraday),
      animateCounter(swing, setDisplaySwing),
      animateCounter(position, setDisplayPosition)
    ];

    return () => timers.forEach(clearInterval);
  }, [scalps, intraday, swing, position]);

  const total = scalps + intraday + swing + position || 1;
  const scalpPercentage = (scalps / total) * 100;
  const intradayPercentage = (intraday / total) * 100;
  const swingPercentage = (swing / total) * 100;
  const positionPercentage = (position / total) * 100;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Trade Duration Analysis</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 rounded-2xl hover:shadow-lg transition-all duration-200">
          <div className="flex flex-col items-center space-y-3">
            <Zap className="h-6 w-6 text-primary" />
            <div className="text-sm text-muted-foreground">Scalps (&lt;15min)</div>
            <div className="relative">
              <RadialRing percentage={scalpPercentage} size={80} color="primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-xl font-bold">{displayScalps}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{scalpPercentage.toFixed(0)}%</div>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl hover:shadow-lg transition-all duration-200">
          <div className="flex flex-col items-center space-y-3">
            <Clock className="h-6 w-6 text-profit" />
            <div className="text-sm text-muted-foreground">Intraday (15m-4h)</div>
            <div className="relative">
              <RadialRing percentage={intradayPercentage} size={80} color="profit" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-xl font-bold">{displayIntraday}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{intradayPercentage.toFixed(0)}%</div>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl hover:shadow-lg transition-all duration-200">
          <div className="flex flex-col items-center space-y-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <div className="text-sm text-muted-foreground">Swing (4h-1d)</div>
            <div className="relative">
              <RadialRing percentage={swingPercentage} size={80} color="primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-xl font-bold">{displaySwing}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{swingPercentage.toFixed(0)}%</div>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl hover:shadow-lg transition-all duration-200">
          <div className="flex flex-col items-center space-y-3">
            <Calendar className="h-6 w-6 text-loss" />
            <div className="text-sm text-muted-foreground">Position (&gt;1d)</div>
            <div className="relative">
              <RadialRing percentage={positionPercentage} size={80} color="loss" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-xl font-bold">{displayPosition}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{positionPercentage.toFixed(0)}%</div>
          </div>
        </Card>
      </div>
    </div>
  );
};
