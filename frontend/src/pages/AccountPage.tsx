import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTrades, useDailyPnL } from "@/hooks/useTrades";
import { useAuth } from "@/hooks/useAuth";
import { syncTrades } from "@/lib/api";
import { format } from "date-fns";

export const AccountPage = () => {
  const { id } = useParams();
  const accountId = id ? Number(id) : undefined;

  const { user } = useAuth();
  const { data: trades, isLoading: tradesLoading } = useTrades(accountId);

  const today = new Date();
  const { data: dailyPnL, isLoading: pnlLoading } = useDailyPnL(
    today.getMonth(),
    today.getFullYear(),
    accountId
  );

  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // --- Sync trades handler ---
  const handleSync = async () => {
    if (!accountId) return;
    setSyncing(true);
    setMessage(null);
    try {
      const res = await syncTrades(accountId);
      setMessage(res.message || "Trades synced successfully!");
    } catch (err: any) {
    } finally {
      setSyncing(false);
    }
  };

  // --- Performance metrics ---
  const totalProfit = trades?.reduce((sum, t) => sum + t.profit, 0) ?? 0;
  const winRate =
    trades && trades.length > 0
      ? (trades.filter((t) => t.profit > 0).length / trades.length) * 100
      : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header with Sync Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Account #{id}</h1>
        <Button onClick={handleSync} disabled={syncing}>
          {syncing ? "Syncing..." : "Sync Trades"}
        </Button>
      </div>
      {message && <p className="text-sm mt-1">{message}</p>}

      {/* Calendar */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-2">Calendar</h2>
        {pnlLoading ? (
          <p>Loading...</p>
        ) : dailyPnL ? (
          <ul className="grid grid-cols-4 gap-2">
            {dailyPnL.stats.map((s) => (
              <li
                key={s.date}
                className={`p-2 rounded ${
                  s.pnl >= 0 ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <div className="text-sm">{format(new Date(s.date), "MMM d")}</div>
                <div className="text-xs">
                  {s.pnl.toFixed(2)} ({s.trades} trades)
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No data</p>
        )}
      </Card>

      {/* Performance */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-2">Performance Metrics</h2>
        {tradesLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-2">
            <p>💰 Total Profit: {totalProfit.toFixed(2)}</p>
            <p>✅ Win Rate: {winRate.toFixed(1)}%</p>
            <p>📊 Total Trades: {trades?.length ?? 0}</p>
          </div>
        )}
      </Card>

      {/* Trade History */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-2">Trade History</h2>
        {tradesLoading ? (
          <p>Loading...</p>
        ) : trades && trades.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Symbol</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Volume</th>
                <th className="text-left p-2">Profit</th>
                <th className="text-left p-2">Close Time</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.ticket} className="border-b">
                  <td className="p-2">{t.symbol}</td>
                  <td className="p-2">{t.type === 0 ? "Buy" : "Sell"}</td>
                  <td className="p-2">{t.volume}</td>
                  <td
                    className={`p-2 ${
                      t.profit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.profit.toFixed(2)}
                  </td>
                  <td className="p-2">
                    {format(new Date(t.close_time), "MMM d, HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No trades yet.</p>
        )}
      </Card>
    </div>
  );
};
