// src/contexts/AccountContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAccounts } from "@/hooks/useAccounts";
import { useAuthContext } from "@/contexts/AuthContext";

export type AccountSimple = {
  id: number;
  user_id: string;
  mt5_login: number;
  mt5_server: string;
  alias?: string | null;
  created_at?: string;
};

type AccountContextType = {
  selectedAccountId: number | null;
  setSelectedAccountId: (id: number | null) => void;
  accounts: AccountSimple[] | undefined;
  isLoadingAccounts: boolean;
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { effectiveUserId } = useAuthContext();
  const { data: accounts, isLoading } = useAccounts(effectiveUserId);

  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

  // Reset account selection when effectiveUserId changes (e.g., impersonation starts/stops)
  useEffect(() => {
    setSelectedAccountId(null);
  }, [effectiveUserId]);

  // Load from localStorage
  useEffect(() => {
  const storedAccountId = localStorage.getItem("selectedAccountId");

  if (storedAccountId) {
    setSelectedAccountId(Number(storedAccountId));
  }
}, []);

useEffect(() => {
  if (selectedAccountId) {
    localStorage.setItem("selectedAccountId", String(selectedAccountId));
  } else {
    localStorage.removeItem("selectedAccountId");
  }
}, [selectedAccountId]);

useEffect(() => {
  if (!isLoading && accounts && accounts.length > 0) {
    setSelectedAccountId((prev) => prev ?? accounts[0].id);
  } else if (!isLoading && (!accounts || accounts.length === 0)) {
    setSelectedAccountId(null);
  }
}, [accounts, isLoading]);

  return (
    <AccountContext.Provider
      value={{
        selectedAccountId,
        setSelectedAccountId,
        accounts: accounts as AccountSimple[] | undefined,
        isLoadingAccounts: isLoading,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccountContext = () => {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccountContext must be used within AccountProvider");
  return ctx;
};
