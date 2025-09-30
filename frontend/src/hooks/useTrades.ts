import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export type Trade = {
  position_id: number;
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
  mt5_raw?: any;
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
        .order("close_time", { ascending: false }); // ✅ sort by close_time
      if (error) throw error;
      return data as Trade[];
    },
  });
}

/// --------------------
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
        .gte("close_time", `${year}-${String(month + 1).padStart(2, "0")}-01`)
        .lt("close_time", `${year}-${String(month + 2).padStart(2, "0")}-01`)
        .order("close_time", { ascending: true });

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

      // ✅ aggregate by day (net PnL = profit - commission - swap)
      const daily: Record<string, { pnl: number; trades: number }> = {};
      for (const t of filteredTrades) {
        const date = t.close_time.split("T")[0];
        if (!daily[date]) daily[date] = { pnl: 0, trades: 0 };

        const netPnL =
          Number(t.profit ?? 0) +
          Number(t.commission ?? 0) -
          Number(t.swap ?? 0);

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
  });
}
