import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { useFilteredTrades } from "@/hooks/useTrades";
import { motion } from "framer-motion";

interface Props {
  accountId?: number;
}

export const TradeWinWidget = ({ accountId }: Props) => {
  const { trades, isLoading } = useFilteredTrades(accountId);

  const wins = trades.filter((t) => t.profit > 0).length;
  const losses = trades.filter((t) => t.profit < 0).length;
  const total = trades.length || 1;
  const winRate = ((wins / total) * 100).toFixed(2);

  // --- Dynamic gauge color (red to green)
  const hue = (Number(winRate) / 100) * 120; // 0°=red, 120°=green
  const gaugeColor = `hsl(${hue}, 80%, 50%)`;

  const radius = 60;
  const circumference = Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset =
    circumference - (Number(winRate) / 100) * circumference;

  return (
    <Card className="p-4 bg-white/80 border border-gray-200 shadow-sm rounded-2xl backdrop-blur-sm h-[180px]">
      {/* Header */}
      {/* <div className="flex items-center justify-between mb-2">
        <Info className="h-4 w-4 text-gray-400" />

      </div> */}

      {/* Two-column layout (responsive) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left column */}
        <div className="flex flex-col items-center sm:items-start flex-1">
                  <span className="text-sm font-medium text-gray-500">Trade Win %</span>
          <span className="text-3xl font-bold text-gray-900">
            {isLoading ? "..." : `${winRate}%`}
          </span>
          <span className="text-xs text-gray-500">Win Rate</span>
        </div>

        {/* Right column - half-circle gauge */}
        <div className="relative w-full sm:w-[160px] h-[80px] flex-row justify-center items-center">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 160 80"
            className="overflow-visible"
          >
            {/* background arc */}
            <path
              d="M20,80 A60,60 0 0,1 140,80"
              fill="none"
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="10"
              strokeLinecap="round"
            />

            {/* animated arc */}
            <motion.path
              d="M20,80 A60,60 0 0,1 140,80"
              fill="none"
              stroke={gaugeColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset, stroke: gaugeColor }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="flex justify-between mt-3 px-2">
            <div className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-medium">
              {losses} Losses
            </div>
            <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-medium">
              {wins} Wins
            </div>
          </div>
        </div>
      </div>

      {/* Bottom stats (aligned left/right under gauge) */}
    </Card>
  );
};
