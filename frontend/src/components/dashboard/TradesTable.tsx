import { useFilteredTrades } from "@/hooks/useTrades";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, LineChart, BarChart3, Edit3 } from "lucide-react";
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
      <Card className="p-4 border-dashed border-2 text-center text-muted-foreground">
        Loading trades...
      </Card>
    );
  }

  if (!trades || trades.length === 0) {
    return (
      <Card className="p-4 border-dashed border-2 text-center text-muted-foreground">
        No trades found for this account.
      </Card>
    );
  }

  return (
    <Card className="p-4 border border-gray-200 rounded-2xl bg-white/40">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100/80 text-gray-700 font-medium">
            <tr>
              <th className="px-4 py-2 text-left">Symbol</th>
              <th className="px-4 py-2 text-left">Open</th>
              <th className="px-4 py-2 text-left">Close</th>
              <th className="px-4 py-2 text-right">Volume</th>
              <th className="px-4 py-2 text-right">Side</th>
              <th className="px-4 py-2 text-right">Profit / Loss</th>
              <th className="px-4 py-2 text-right">TP/SL Hit</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
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

              // --- TP/SL Detection Logic ---
              let hitStatus = "-";
              const reason = trade.close_reason ?? trade.mt5_raw?.reason ?? trade.comment ?? "";
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
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  {/* Symbol */}
                  <td className="px-4 py-2 font-semibold text-gray-800">
                    {trade.symbol}
                  </td>

                  {/* Open */}
                  <td className="px-4 py-2 text-gray-700">
                    <div>{Number(trade.open_price).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">
                      {dayjs(trade.open_time).format("DD MMM HH:mm")}
                    </div>
                  </td>

                  {/* Close */}
                  <td className="px-4 py-2 text-gray-700">
                    <div>{Number(trade.close_price).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">
                      {dayjs(trade.close_time).format("DD MMM HH:mm")}
                    </div>
                  </td>

                  {/* Volume */}
                  <td className="px-4 py-2 text-right text-gray-700">
                    {Number(trade.volume).toFixed(2)}
                  </td>

                  {/* Side */}
                  <td className="px-4 py-2 text-right text-gray-700">
                    {positionSide}
                  </td>

                  {/* Profit / Loss */}
                  <td
                    className={`px-4 py-2 text-right font-semibold ${profitColor}`}
                  >
                    {isProfit ? (
                      <div className="flex items-center justify-end gap-1">
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                        {Number(trade.profit).toFixed(2)}
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                        {Number(trade.profit).toFixed(2)}
                      </div>
                    )}
                  </td>

                  {/* TP/SL Hit */}
                  <td
                    className={`px-4 py-2 text-right ${
                      hitStatus === "TP Hit"
                        ? "text-green-600"
                        : hitStatus === "SL Hit"
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {hitStatus}
                  </td>

                  {/* Action Icons */}
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-2 text-gray-500">
                      <Edit3 className="h-4 w-4 cursor-pointer hover:text-blue-600" />
                      <BarChart3
                        className="h-4 w-4 cursor-pointer hover:text-indigo-600"
                        
                      />
                      <LineChart
                        className="h-4 w-4 cursor-pointer hover:text-green-600"
                      />
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
