import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

export const ZellaScoreWidget = () => {
  return (
    <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">Zella Score</span>
        <Info className="h-4 w-4 text-muted-foreground" />
      </div>
      
      {/* Triangle Chart */}
      <div className="relative h-24 mb-3">
        <svg viewBox="0 0 100 60" className="w-full h-full">
          {/* Triangle background */}
          <polygon
            points="50,5 85,55 15,55"
            fill="hsl(var(--muted))"
            opacity="0.3"
          />
          {/* Triangle fill */}
          <polygon
            points="50,5 72,55 28,55"
            fill="url(#yellowGradient)"
          />
          <defs>
            <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="text-xs text-muted-foreground">Win %</div>
        </div>
        <div className="absolute top-2 left-2">
          <div className="text-xs text-muted-foreground">Avg win/loss</div>
        </div>
        <div className="absolute top-2 right-2">
          <div className="text-xs text-muted-foreground">Profit factor</div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-sm text-muted-foreground">Your Zella Score</div>
        <div className="text-2xl font-bold text-yellow-600">81.25</div>
      </div>
    </Card>
  );
};