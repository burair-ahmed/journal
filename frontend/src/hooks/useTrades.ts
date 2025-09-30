import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export type Trade = {
  ticket: number;
  symbol: string;
  deal_time: string;
  type: number;
  volume: number;
  price: number;
  profit: number;
  comment: string;
  order_id?: number;
};

// --------------------
// All trades
// --------------------
export function useTrades() {
  return useQuery<Trade[]>({
    queryKey: ["trades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("deal_time", { ascending: false });
      if (error) throw error;
      return data as Trade[];
    },
  });
}

// --------------------
// Daily PnL + deposit
// --------------------
export interface DailyStat {
  date: string;
  pnl: number;
  trades: number;
}

export interface DailyPnLResult {
  deposit: number;
  stats: DailyStat[];
}

export function useDailyPnL(month: number, year: number) {
  return useQuery<DailyPnLResult>({
    queryKey: ["dailyPnL", month, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .gte("deal_time", `${year}-${String(month + 1).padStart(2, "0")}-01`)
        .lt(
          "deal_time",
          `${year}-${String(month + 2).padStart(2, "0")}-01`
        )
        .order("deal_time", { ascending: true });

      if (error) throw error;

      const trades = data as Trade[];

      // ✅ find deposit row
      const depositRow = trades.find(
        (t) => t.comment && t.comment.toLowerCase().includes("deposit")
      );
      const deposit = depositRow ? Number(depositRow.profit) : 10000;

      // ✅ exclude deposit from stats
      const filteredTrades = trades.filter(
        (t) => !(t.comment && t.comment.toLowerCase().includes("deposit"))
      );

      // ✅ aggregate by day
      const daily: Record<string, { pnl: number; trades: number }> = {};
      for (const t of filteredTrades) {
        const date = t.deal_time.split("T")[0];
        if (!daily[date]) daily[date] = { pnl: 0, trades: 0 };
        daily[date].pnl += Number(t.profit);
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
  });
}
