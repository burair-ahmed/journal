import { Card } from "@/components/ui/card";
import { useFilteredTrades } from "@/hooks/useTrades";
import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  accountId?: number;
}

export const LargestGainLossGauge = ({ accountId }: Props) => {
  const { trades, isLoading } = useFilteredTrades(accountId);
  const [hoverSection, setHoverSection] = useState<"gain" | "loss" | null>(null);

  const largestGain = trades.length
    ? Math.max(...trades.map((t) => t.profit))
    : 0;

  const largestLoss = trades.length
    ? Math.min(...trades.map((t) => t.profit))
    : 0;

  const absGain = Math.abs(largestGain);
  const absLoss = Math.abs(largestLoss);
  const total = absGain + absLoss || 1;

  const gainPercent = (absGain / total) * 100;
  const lossPercent = (absLoss / total) * 100;

  return (
    <Card className="p-4 bg-white border border-gray-200 shadow-sm rounded-2xl h-[200px] relative">
      <span className="text-sm font-medium text-gray-600 block mb-4">
        Largest Gain vs Largest Loss
      </span>

      <div className="relative w-full flex justify-center items-center">
        <svg width="180" height="100" viewBox="0 0 180 100">
          {/* Gain section (green) */}
          <motion.path
            d="M20,100 A70,70 0 0,1 160,100"
            fill="none"
            stroke="#22c55e"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="220"
            strokeDashoffset={220 - (gainPercent / 100) * 220}
            onMouseEnter={() => setHoverSection("gain")}
            onMouseLeave={() => setHoverSection(null)}
            transition={{ duration: 1 }}
          />

          {/* Loss section (red) */}
          <motion.path
            d="M20,100 A70,70 0 0,1 160,100"
            fill="none"
            stroke="#ef4444"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="220"
            strokeDashoffset={220 - (lossPercent / 100) * 220}
            transform="scale(-1,1) translate(-180,0)"
            onMouseEnter={() => setHoverSection("loss")}
            onMouseLeave={() => setHoverSection(null)}
            transition={{ duration: 1 }}
          />
        </svg>

        {/* Hover overlay pale band */}
        {hoverSection && (
          <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none">
            <div className="w-[180px] h-[100px] rounded-t-full border-t-[12px] border-transparent"
              style={{
                borderColor:
                  hoverSection === "gain" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
              }}
            ></div>
          </div>
        )}

        {/* Tooltip box */}
        {hoverSection && (
          <div className="absolute -top-3 bg-white text-gray-800 px-3 py-1 text-xs font-semibold rounded shadow">
            {hoverSection === "gain" ? (
              <>Gain<br />{largestGain.toFixed(2)}</>
            ) : (
              <>Loss<br />{largestLoss.toFixed(2)}</>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
