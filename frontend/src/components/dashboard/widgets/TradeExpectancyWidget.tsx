import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

export const TradeExpectancyWidget = () => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Trade Expectancy</span>
        <Info className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="text-2xl font-bold">$213.11</div>
      <div className="text-xs text-muted-foreground mt-1">Click to add widget</div>
    </Card>
  );
};