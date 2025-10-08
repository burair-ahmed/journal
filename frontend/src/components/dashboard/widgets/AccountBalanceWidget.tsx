import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useFilteredTrades } from "@/hooks/useTrades";

export const AccountBalanceWidget = ({ accountId }: { accountId?: number }) => {
  const { trades, deposit, isLoading } = useFilteredTrades(accountId);

  if (isLoading) return <Card className="p-4">Loading...</Card>;
  if (!trades?.length) return <Card className="p-4">No trades</Card>;

  const pnl = trades.reduce((sum, t) => sum + t.profit, 0);
  const totalBalance = deposit + pnl;

  return (
    <Card className="p-5 bg-white/30 border border-white/40 rounded-2xl shadow-xl backdrop-blur-xl">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-700">Account Balance</span>
        <TrendingUp className="h-5 w-5 text-green-500" />
      </div>

      <div className="text-3xl font-bold text-gray-900">${totalBalance.toFixed(2)}</div>

      <div className="mt-2 flex justify-between text-sm">
        <span className="text-gray-600">Deposits</span>
        <span className="font-semibold text-blue-600">${deposit.toFixed(2)}</span>
      </div>
      <div className="mt-1 flex justify-between text-sm">
        <span className="text-gray-600">Net P&L</span>
        <span className={`font-semibold ${pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
          ${pnl.toFixed(2)}
        </span>
      </div>
    </Card>
  );
};
