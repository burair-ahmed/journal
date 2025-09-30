import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export const AccountBalanceWidget = () => {
  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Account Balance & P&L</span>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">3K</span>
      </div>
      <div className="text-2xl font-bold text-purple-700 mb-1">$32,032.50</div>
      <div className="flex items-center gap-1 text-sm text-green-600">
        <span>P&L:</span>
        <span className="font-semibold">$7,032.50</span>
      </div>
    </Card>
  );
};