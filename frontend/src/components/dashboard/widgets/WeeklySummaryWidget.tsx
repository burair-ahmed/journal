import { Card } from "@/components/ui/card";

const weeklyData = [
  { week: 1, pnl: 0, days: 0 },
  { week: 2, pnl: 1050, days: 1 },
  { week: 3, pnl: 1612.50, days: 4 },
  { week: 4, pnl: 1982.50, days: 5 },
  { week: 5, pnl: 487.50, days: 4 },
  { week: 6, pnl: 0, days: 0 },
];

export const WeeklySummaryWidget = () => {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        {weeklyData.map((week) => (
          <div key={week.week} className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium">Week {week.week}</div>
              <div className="text-xs text-muted-foreground">{week.days} days</div>
            </div>
            <div className={`font-semibold ${
              week.pnl > 0 ? 'text-green-600' : 
              week.pnl < 0 ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              {week.pnl === 0 ? '$0.00' : `$${week.pnl.toFixed(2)}`}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};