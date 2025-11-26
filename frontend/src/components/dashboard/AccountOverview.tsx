// src/components/dashboard/AccountOverview.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTrades, useDailyPnL } from "@/hooks/useTrades";
import { format } from "date-fns";
import { useState } from "react";
import { syncTrades } from "@/lib/api";

export const AccountOverview: React.FC<{ accountId: number }> = ({ accountId }) => {
  const today = new Date();
  const { data: trades, isLoading: tradesLoading } = useTrades(accountId);
  const { data: dailyPnL, isLoading: pnlLoading } = useDailyPnL(
    today.getMonth(),
    today.getFullYear(),
    accountId
  );

  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSync = async () => {
    setMessage(null);
    try {
      setSyncing(true);
      const res = await syncTrades(accountId);
      setMessage(res.message ?? "Synced trades");
    } catch (err: any) {
      setMessage(err?.response?.data?.detail ?? "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const totalProfit = trades?.reduce((sum, t) => sum + (Number(t.profit) ?? 0), 0) ?? 0;
  const winRate =
    trades && trades.length > 0
      ? (trades.filter((t) => Number(t.profit) > 0).length / trades.length) * 100
      : 0;

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Account Overview</h2>
        <div className="flex gap-2 items-center">
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? "Syncing..." : "Sync Trades"}
          </Button>
        </div>
      </div>
      {message && <div className="text-sm text-muted-foreground">{message}</div>}

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Calendar</h3>
        {pnlLoading ? (
          <p>Loading...</p>
        ) : dailyPnL ? (
          <ul className="grid grid-cols-4 gap-2">
            {dailyPnL.stats.map((s) => (
              <li
                key={s.date}
                className={`p-2 rounded ${s.pnl >= 0 ? "bg-green-100" : "bg-red-100"}`}
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

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Performance Metrics</h3>
        {tradesLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-2">
            <p>💰 Total Profit: {totalProfit.toFixed(2)}</p>
            <p>✅ Win Rate: {winRate.toFixed(1)}%</p>
            <p>Total Trades: {trades?.length ?? 0}</p>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Trade History</h3>
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
                  <td className={`p-2 ${t.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {Number(t.profit).toFixed(2)}
                  </td>
                  <td className="p-2">{format(new Date(t.close_time), "MMM d, HH:mm")}</td>
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
