// frontend/src/components/layout/TopHeader.tsx
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bell, Filter, Repeat } from "lucide-react";
import { useAccountContext } from "@/contexts/AccountContext";
import { syncTrades } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export const TopHeader = () => {
  const {
    accounts,
    selectedAccountId,
    setSelectedAccountId,
    isLoadingAccounts,
  } = useAccountContext();
  const { user } = useAuth();

  const [syncing, setSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(false); // Auto sync toggle state
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSync = async () => {
    if (!selectedAccountId) {
      toast.error("Please select an account first.");
      return;
    }

    try {
      setSyncing(true);
      const res = await syncTrades(selectedAccountId);
      toast.success(res.message ?? "Trades synced successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.detail ?? "Failed to sync trades");
    } finally {
      setSyncing(false);
    }
  };

  // Automatically sync every 5 minutes when autoSync is enabled
  useEffect(() => {
    if (autoSync && selectedAccountId) {
      // Sync immediately once when toggled on
      handleSync();

      // Set up interval
      syncIntervalRef.current = setInterval(() => {
        handleSync();
      }, 5 * 60 * 1000); // 5 minutes
    }

    // Cleanup interval when autoSync disabled or unmounted
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [autoSync, selectedAccountId]);

  return (
    <div className="backdrop-blur-xl bg-background/60 border-b border-border p-4 sticky top-0 z-20">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="text-muted-foreground">
            Good {new Date().getHours() < 12 ? "morning" : "evening"}!
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filters</span>
          </div>

          {/* Account Selector */}
          <Select
            value={selectedAccountId ? String(selectedAccountId) : undefined}
            onValueChange={(val) =>
              setSelectedAccountId(val ? Number(val) : null)
            }
          >
            <SelectTrigger className="w-56">
              <SelectValue
                placeholder={
                  isLoadingAccounts ? "Loading accounts..." : "Select account"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {isLoadingAccounts ? (
                <SelectItem value="loading">Loading...</SelectItem>
              ) : accounts && accounts.length > 0 ? (
                accounts.map((acc) => (
                  <SelectItem key={acc.id} value={String(acc.id)}>
                    {acc.alias ?? `MT5 ${acc.mt5_login} (${acc.mt5_server})`}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-accounts" disabled>
                  No accounts
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          {/* Auto Sync Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              checked={autoSync}
              onCheckedChange={(checked) => setAutoSync(checked)}
            />
            <span className="text-sm text-muted-foreground">Auto Sync</span>
          </div>

          {/* Sync Trades Button */}
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={handleSync}
            disabled={syncing || !selectedAccountId}
          >
            <Repeat className="h-4 w-4 mr-2" />
            {syncing ? "Syncing..." : "Sync Trades"}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
