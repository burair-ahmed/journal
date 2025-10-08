// src/hooks/useAccounts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export type Account = {
  id: number;
  user_id: string;
  mt5_login: number;
  mt5_password: string;
  mt5_server: string;
  alias?: string;
  mt5_name?: string;
  created_at: string;
};

export function useAccounts(userId?: string) {
  return useQuery<Account[]>({
    queryKey: ["accounts", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return data as Account[];
    },
    enabled: !!userId,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: Omit<Account, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("accounts")
        .insert(account)
        .select()
        .single();
      if (error) throw error;
      return data as Account;
    },
    onSuccess: (newAcc) => {
      queryClient.invalidateQueries({ queryKey: ["accounts", newAcc.user_id] });
    },
  });
}
