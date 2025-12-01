import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export type Trade = {
  account_id: number;
  position_id: number;
  ticket: number;
  order_id: number;
  symbol: string;
  type: number;
  open_time: string;
  close_time: string;
  open_price: number;
  close_price: number;
  volume: number;
  profit: number;
  commission: number;
  swap: number;
  comment: string;
  tp_price?: number;
  sl_price?: number;
  tp?: number;
  sl?: number;
  close_reason?: string;
  mt5_raw?: any;
};

// ------------------------------------------
// ✅ useTrades — all trades per account
// ------------------------------------------
import { useAuthContext } from "@/contexts/AuthContext";

// ------------------------------------------
// ✅ useTrades — all trades per account
// ------------------------------------------
export function useTrades(accountId?: number) {
  const { effectiveUserId } = useAuthContext();

  return useQuery<Trade[]>({
    queryKey: ["trades", accountId, effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];
      
      let query = supabase
        .from("trades")
        .select("*, accounts!inner(user_id)")
        .eq("accounts.user_id", effectiveUserId)
        .order("close_time", { ascending: false });

      if (accountId) query = query.eq("account_id", accountId);

      const { data, error } = await query;
      if (error) throw error;
      return data as Trade[];
    },
    enabled: !!effectiveUserId,
  });
}

// ------------------------------------------
// ✅ useFilteredTrades — filters out deposits/balances
// ------------------------------------------
export function useFilteredTrades(accountId?: number) {
  const allTradesQuery = useTrades(accountId);

  const allTrades = allTradesQuery.data ?? [];

  // Define a function to detect deposit/balance trades
  const isDepositTrade = (t: any) => {
    const comment = t.comment?.toLowerCase() || "";
    const symbol = t.symbol?.toLowerCase() || "";

    return (
      comment.includes("deposit") ||
      comment.includes("balance") ||
      comment.includes("withdraw") ||
      t.order_id === 0 ||
      t.ticket === 0 ||
      symbol === "" ||
      symbol === "balance"
    );
  };

  const depositTrade = allTrades.find(isDepositTrade);
  const deposit = depositTrade ? Number(depositTrade.profit) : 0;

  // Filter out deposits/balances from normal trades
  const filtered = allTrades.filter((t) => !isDepositTrade(t));

  return {
    ...allTradesQuery,
    trades: filtered,
    deposit,
  };
}

// ------------------------------------------
// ✅ useDailyPnL — daily aggregated stats excluding deposit/balance trades
// ------------------------------------------
export interface DailyStat {
  date: string;
  pnl: number;
  trades: number;
}

export interface DailyPnLResult {
  deposit: number;
  stats: DailyStat[];
}

export function useDailyPnL(month: number, year: number, accountId?: number) {
  const { effectiveUserId } = useAuthContext();

  return useQuery<DailyPnLResult>({
    queryKey: ["dailyPnL", month, year, accountId, effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return { deposit: 0, stats: [] };

      let query = supabase
        .from("trades")
        .select("*, accounts!inner(user_id)")
        .eq("accounts.user_id", effectiveUserId)
        .gte("close_time", `${year}-${String(month + 1).padStart(2, "0")}-01`)
        .lt("close_time", `${year}-${String(month + 2).padStart(2, "0")}-01`)
        .order("close_time", { ascending: true });

      if (accountId) query = query.eq("account_id", accountId);

      const { data, error } = await query;
      if (error) throw error;

      const trades = data as Trade[];

      // 🔍 Shared detection logic for deposit/balance trades
      const isDepositTrade = (t: Trade) => {
        const comment = t.comment?.toLowerCase() || "";
        const symbol = t.symbol?.toLowerCase() || "";
        return (
          comment.includes("deposit") ||
          comment.includes("balance") ||
          comment.includes("withdraw") ||
          t.order_id === 0 ||
          t.ticket === 0 ||
          symbol === "" ||
          symbol === "balance"
        );
      };

      // 🪙 Extract deposit trade if any
      const depositTrade = trades.find(isDepositTrade);
      const deposit = depositTrade ? Number(depositTrade.profit) : 0;

      // 🚫 Filter out deposits/balances
      const filtered = trades.filter((t) => !isDepositTrade(t));

      // 📅 Aggregate by day (only real trades)
      const daily: Record<string, { pnl: number; trades: number }> = {};
      for (const t of filtered) {
        const date = t.close_time.split("T")[0];
        if (!daily[date]) daily[date] = { pnl: 0, trades: 0 };

        const netPnL =
          Number(t.profit ?? 0) + Number(t.commission ?? 0) - Number(t.swap ?? 0);

        daily[date].pnl += netPnL;
        daily[date].trades += 1;
      }

      return {
        deposit,
        stats: Object.entries(daily).map(([date, { pnl, trades }]) => ({
          date,
          pnl,
          trades,
        })),
      };
    },
    enabled: !!effectiveUserId,
  });
}
