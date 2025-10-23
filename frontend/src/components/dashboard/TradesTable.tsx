import { useFilteredTrades } from "@/hooks/useTrades";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
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

              // Detect TP/SL hit from comment or raw MT5 data if available
              const hitStatus =
                trade.comment?.toLowerCase().includes("tp") ||
                trade.mt5_raw?.reason === "tp"
                  ? "TP Hit"
                  : trade.comment?.toLowerCase().includes("sl") ||
                    trade.mt5_raw?.reason === "sl"
                  ? "SL Hit"
                  : "-";

              return (
                <tr
                  key={trade.id}
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  {/* Symbol */}
                  <td className="px-4 py-2 font-semibold text-gray-800">
                    {trade.symbol}
                  </td>

                  {/* Open Price + Time */}
                  <td className="px-4 py-2 text-gray-700">
                    <div>{Number(trade.open_price).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">
                      {dayjs(trade.open_time).format("DD MMM HH:mm")}
                    </div>
                  </td>

                  {/* Close Price + Time */}
                  <td className="px-4 py-2 text-gray-700">
                    <div>{Number(trade.close_price).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">
                      {dayjs(trade.close_time).format("DD MMM HH:mm")}
                    </div>
                  </td>

                  {/* Lot Size */}
                  <td className="px-4 py-2 text-right text-gray-700">
                    {Number(trade.volume).toFixed(2)}
                  </td>

                  {/* Position Side */}
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
