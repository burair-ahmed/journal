import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, TrendingDown } from "lucide-react";
import { AccountSummary } from "@/lib/analytics/tax";

interface BrokerAccountComparisonPanelProps {
  accounts: AccountSummary[];
}

export const BrokerAccountComparisonPanel = ({ accounts }: BrokerAccountComparisonPanelProps) => {
  if (accounts.length <= 1) return null;

  const topAccount = accounts[0];
  const maxPnL = Math.max(...accounts.map(a => Math.abs(a.netPnL)));

  return (
    <Card className="p-6 rounded-2xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Broker Account Comparison</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          Performance breakdown across {accounts.length} connected accounts
        </p>

        <div className="space-y-3">
          {accounts.map((account, index) => {
            const isProfit = account.netPnL >= 0;
            const isTop = account.accountId === topAccount.accountId;
            const barWidth = (Math.abs(account.netPnL) / maxPnL) * 100;

            return (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
                  isTop ? 'bg-primary/10 border-primary/30' : 'bg-secondary/10 border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Account #{account.accountId}</span>
                    {isTop && (
                      <Badge className="bg-primary text-primary-foreground text-xs">Top Performer</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isProfit ? (
                      <TrendingUp className="h-4 w-4 text-profit" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-loss" />
                    )}
                    <span className={`font-bold ${isProfit ? 'text-profit' : 'text-loss'}`}>
                      ${Math.abs(account.netPnL).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20">{account.tradeCount} trades</span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isProfit ? 'bg-gradient-to-r from-profit/60 to-profit' : 'bg-gradient-to-r from-loss/60 to-loss'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
