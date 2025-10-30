import { useFilteredTrades } from "@/hooks/useTrades";
import { Card } from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
  LineChart,
  BarChart3,
  Edit3,
} from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(utc);
dayjs.extend(localizedFormat);

interface TradesTableProps {
  accountId?: number;
}

export const TradesTable = ({ accountId }: TradesTableProps) => {
  const { trades, isLoading } = useFilteredTrades(accountId);

  if (isLoading) {
    return (
      <Card className="p-4 border border-dashed rounded-2xl bg-gradient-to-r from-[#FDF4FF] to-[#FCE7F3] text-center text-gray-500 font-medium animate-pulse">
        Loading trades...
      </Card>
    );
  }

  if (!trades || trades.length === 0) {
    return (
      <Card className="p-4 border border-dashed rounded-2xl bg-gradient-to-r from-[#FDF4FF] to-[#FCE7F3] text-center text-gray-500 font-medium">
        No trades found for this account.
      </Card>
    );
  }

  return (
    <Card className="p-4 rounded-2xl border border-[#E5E7EB] bg-white/80 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300">
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]/60">
        <table className="min-w-full text-sm table-fixed">
          <thead className="bg-gradient-to-r from-[#741052]/10 via-[#D946EF]/10 to-[#DB2777]/10 text-[#1E1E1E] font-semibold uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left w-[10%]">Symbol</th>
              <th className="px-5 py-3 text-left w-[15%]">Open</th>
              <th className="px-5 py-3 text-left w-[15%]">Close</th>
              <th className="px-5 py-3 text-right w-[10%]">Volume</th>
              <th className="px-5 py-3 text-right w-[10%]">Side</th>
              <th className="px-5 py-3 text-right w-[15%]">Profit / Loss</th>
              <th className="px-5 py-3 text-right w-[15%]">TP/SL Hit</th>
              <th className="px-5 py-3 text-right w-[10%]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E5E7EB] text-gray-700">
            {trades.map((trade: any) => {
              const isProfit = Number(trade.profit) > 0;
              const profitColor = isProfit ? "text-green-600" : "text-red-600";

              const positionSide =
                trade.type === 0
                  ? "Buy"
                  : trade.type === 1
                  ? "Sell"
                  : trade.type === 2
                  ? "Long"
                  : trade.type === 3
                  ? "Short"
                  : "N/A";

              let hitStatus = "-";
              const reason =
                trade.close_reason ?? trade.mt5_raw?.reason ?? trade.comment ?? "";
              const tp = Number(trade.tp_price ?? trade.tp ?? 0);
              const sl = Number(trade.sl_price ?? trade.sl ?? 0);
              const closePrice = Number(trade.close_price ?? 0);

              if (
                reason.toString().toLowerCase().includes("tp") ||
                Math.abs(closePrice - tp) < 1e-4
              ) {
                hitStatus = "TP Hit";
              } else if (
                reason.toString().toLowerCase().includes("sl") ||
                Math.abs(closePrice - sl) < 1e-4
              ) {
                hitStatus = "SL Hit";
              } else if (reason.toString().toLowerCase().includes("manual")) {
                hitStatus = "Manual Close";
              }

              return (
                <tr
                  key={trade.id ?? trade.position_id}
                  className="group hover:bg-gradient-to-r hover:from-[#FDF4FF] hover:to-[#FCE7F3] transition-all duration-300"
                >
                  {/* Symbol */}
                  <td className="px-5 py-3 font-semibold text-[#1E1E1E] align-top">
                    <span className="bg-gradient-to-r from-[#741052] via-[#D946EF] to-[#DB2777] bg-clip-text text-transparent">
                      {trade.symbol}
                    </span>
                  </td>

                  {/* Open */}
                  <td className="px-5 py-3 text-gray-700 align-top">
                    <div className="flex flex-col">
                      <span className="font-medium tabular-nums">
                        {Number(trade.open_price).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {dayjs(trade.open_time).format("DD MMM HH:mm")}
                      </span>
                    </div>
                  </td>

                  {/* Close */}
                  <td className="px-5 py-3 text-gray-700 align-top">
                    <div className="flex flex-col">
                      <span className="font-medium tabular-nums">
                        {Number(trade.close_price).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {dayjs(trade.close_time).format("DD MMM HH:mm")}
                      </span>
                    </div>
                  </td>

                  {/* Volume */}
                  <td className="px-5 py-3 text-right font-medium text-gray-700 tabular-nums align-top">
                    {Number(trade.volume).toFixed(2)}
                  </td>

                  {/* Side */}
                  <td className="px-5 py-3 text-right align-top">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        positionSide.toLowerCase().includes("buy") ||
                        positionSide.toLowerCase().includes("long")
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {positionSide}
                    </span>
                  </td>

                  {/* Profit / Loss */}
                  <td
                    className={`px-5 py-3 text-right font-semibold tabular-nums ${profitColor} align-top`}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {isProfit ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                      {Number(trade.profit).toFixed(2)}
                    </div>
                  </td>

                  {/* TP/SL Hit */}
                  <td
                    className={`px-5 py-3 text-right font-medium align-top ${
                      hitStatus === "TP Hit"
                        ? "text-green-600"
                        : hitStatus === "SL Hit"
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {hitStatus}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3 text-right align-top">
                    <div className="flex items-center justify-end gap-3">
                      <Edit3 className="h-4 w-4 text-gray-500 hover:text-[#741052] transition-colors cursor-pointer" />
                      <BarChart3 className="h-4 w-4 text-gray-500 hover:text-[#7C3AED] transition-colors cursor-pointer" />
                      <LineChart className="h-4 w-4 text-gray-500 hover:text-[#DB2777] transition-colors cursor-pointer" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
