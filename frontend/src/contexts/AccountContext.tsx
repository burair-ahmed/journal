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
  const { effectiveUserId, isImpersonating, impersonatedMentorship } = useAuthContext();
  const { data: allAccounts, isLoading } = useAccounts(effectiveUserId);

  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

  // Filter accounts based on mentor permissions
  const accounts = React.useMemo(() => {
    if (!allAccounts) return undefined;
    
    console.log('💰 Account filtering - isImpersonating:', isImpersonating);
    console.log('💰 All accounts:', allAccounts);
    console.log('💰 Mentorship:', impersonatedMentorship);
    
    // If not impersonating, return all accounts
    if (!isImpersonating) return allAccounts;
    
    // During impersonation, filter by allowed_accounts
    const allowedAccounts = impersonatedMentorship?.permissions?.allowed_accounts;
    
    console.log('💰 Allowed accounts:', allowedAccounts);
    
    // If no allowed_accounts defined (legacy mentorship), show all
    if (!allowedAccounts || allowedAccounts.length === 0) {
      console.log('💰 No restrictions - showing all accounts');
      return allAccounts;
    }
    
    // Filter to only allowed accounts
    const filtered = allAccounts.filter(account => allowedAccounts.includes(account.id));
    console.log('💰 Filtered accounts:', filtered);
    return filtered;
  }, [allAccounts, isImpersonating, impersonatedMentorship]);

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
