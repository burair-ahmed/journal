import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { useDailyPnL, DailyStat, useTrades, Trade } from "@/hooks/useTrades";
import { cn } from "@/lib/utils";

interface CalendarDay {
  date: number;
  pnl: number;
  trades: number;
  dateStr: string;
  percentage?: number;
}

type ViewMode = "day" | "month" | "year";

const WeeklySummaryWidget = ({
  dailyPnL,
  currentMonth,
  currentYear,
}: {
  dailyPnL: DailyStat[];
  currentMonth: number;
  currentYear: number;
}) => {
  const weeklyData = useMemo(() => {
    const result: { week: number; pnl: number; days: number }[] = [];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      const weekNum = Math.ceil((d + date.getDay()) / 7);
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(d).padStart(2, "0")}`;
      const stat = dailyPnL.find((s) => s.date === dateStr);

      if (!result[weekNum - 1]) {
        result[weekNum - 1] = { week: weekNum, pnl: 0, days: 0 };
      }

      if (stat) {
        result[weekNum - 1].pnl += stat.pnl;
        result[weekNum - 1].days += stat.trades > 0 ? 1 : 0;
      }
    }
    return result;
  }, [dailyPnL, currentMonth, currentYear]);

  return (
    <div className="space-y-2 mt-6">
      <h3 className="text-lg font-semibold">Weekly Summary</h3>
      <div className="grid grid-cols-7 gap-2">
        {weeklyData.map((week) => (
          <div
            key={week.week}
            className="col-span-7 p-3 rounded-lg border bg-transparent shadow-sm flex justify-between items-center"
          >
            <div>
              <div className="text-sm font-medium">Week {week.week}</div>
              <div className="text-xs text-muted-foreground">
                {week.days} days
              </div>
            </div>
            <div
              className={`font-semibold ${
                week.pnl > 0
                  ? "text-profit"
                  : week.pnl < 0
                  ? "text-loss"
                  : "text-muted-foreground"
              }`}
            >
              {week.pnl === 0 ? "$0.00" : `$${week.pnl.toFixed(2)}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TradezellaCalendar: React.FC<{ accountId?: number }> = ({
  accountId,
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [viewMode, setViewMode] = useState<ViewMode>("day");

  const { data } = useDailyPnL(currentMonth, currentYear, accountId);
  const { data: allTrades = [] } = useTrades(accountId);

  const dailyPnL: DailyStat[] = data?.stats ?? [];
  const deposit = data?.deposit ?? 10000;

  const getDayClass = (day: CalendarDay) => {
    const baseClass =
      "min-h-[100px] p-2 border border-border rounded-lg flex flex-col items-center justify-center text-xs cursor-pointer transition-all hover:shadow-sm";
    
    if (day.pnl > 0) {
      return `${baseClass} bg-profit/10 text-profit`;
    } else if (day.pnl < 0) {
      return `${baseClass} bg-loss/10 text-loss`;
    } else {
      return `${baseClass} bg-secondary/20`;
    }
  };

  const formatCurrency = (amount: number) => {
    const formatted = amount.toFixed(2);
    return amount >= 0 ? `$${formatted}` : `-$${Math.abs(Number(formatted))}`;
  };
  const formatPercentage = (p: number) =>
    `${p >= 0 ? "+" : ""}${p.toFixed(2)}%`;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const calendarCells: (CalendarDay | null)[] = Array(firstDay).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(d).padStart(2, "0")}`;
    const stat = dailyPnL.find((s) => s.date === dateStr);
    calendarCells.push({
      date: d,
      pnl: stat?.pnl ?? 0,
      trades: stat?.trades ?? 0,
      dateStr,
      percentage: stat && deposit > 0 ? (stat.pnl / deposit) * 100 : undefined,
    });
  }
  while (calendarCells.length < 42) calendarCells.push(null);
  if (calendarCells.length > 42) calendarCells.splice(42);

  const isCurrentMonth =
    currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const goPrev = () => {
    if (viewMode === "day") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((y) => y - 1);
      } else setCurrentMonth((m) => m - 1);
    } else if (viewMode === "month") setCurrentYear((y) => y - 1);
    else if (viewMode === "year") setCurrentYear((y) => y - 12);
  };

  const goNext = () => {
    if (viewMode === "day") {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((y) => y + 1);
      } else setCurrentMonth((m) => m + 1);
    } else if (viewMode === "month") setCurrentYear((y) => y + 1);
    else if (viewMode === "year") setCurrentYear((y) => y + 12);
  };

  const goToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setViewMode("day");
  };

  // ✅ Compute daily details for Popover
  const getDayTradesData = (dateStr: string) => {
    const tradesForDay = allTrades.filter((t) =>
      t.close_time.startsWith(dateStr)
    );
    if (!tradesForDay.length) return null;

    const wins = tradesForDay.filter((t) => t.profit > 0);
    const losses = tradesForDay.filter((t) => t.profit < 0);
    const biggestWin = Math.max(...wins.map((t) => t.profit), 0);
    const biggestLoss = Math.min(...losses.map((t) => t.profit), 0);
    const totalLots = tradesForDay.reduce((sum, t) => sum + t.volume, 0);
    const symbols = Array.from(new Set(tradesForDay.map((t) => t.symbol)));

    return {
      totalTrades: tradesForDay.length,
      winningTrades: wins.length,
      losingTrades: losses.length,
      biggestWin,
      biggestLoss,
      totalLots,
      symbols,
    };
  };

  // ✅ Day View with Popover integration
  const renderDayView = () => (
    <>
      <div className="grid grid-cols-7 gap-2 mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium py-2 border-b-2 border-primary"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarCells.map((day, index) => (
          <div key={index} className="aspect-[4/3]">
            {day ? (
              <Popover>
                <PopoverTrigger asChild>
                  <div
                    className={cn(
                      getDayClass(day),
                      "flex flex-col items-start rounded-lg px-2 py-1.5 cursor-pointer transition-colors"
                    )}
                  >
                    <div className="text-sm font-medium">{day.date}</div>
                    <div className="text-base font-semibold">
                      {formatCurrency(day.pnl)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {day.trades} trades
                    </div>
                    {day.percentage !== undefined && (
                      <div className="text-xs font-medium mt-1 text-muted-foreground">
                        {formatPercentage(day.percentage)}
                      </div>
                    )}
                  </div>
                </PopoverTrigger>

                <PopoverContent className="w-[360px] p-5 rounded-2xl border bg-background shadow-sm transition-all animate-in fade-in-0 zoom-in-95">
                  {(() => {
                    const info = getDayTradesData(day.dateStr);
                    return info ? (
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex flex-col space-y-0.5 pb-3 border-b">
                          <span className="text-xs font-medium text-muted-foreground">
                            Trade Summary
                          </span>
                          <span className="text-lg font-semibold text-foreground">
                            {day.dateStr}
                          </span>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Total Trades
                            </span>
                            <span className="font-medium">
                              {info.totalTrades}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Winning Trades
                            </span>
                            <span className="text-profit font-medium">
                              {info.winningTrades}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Losing Trades
                            </span>
                            <span className="text-loss font-medium">
                              {info.losingTrades}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Biggest Win
                            </span>
                            <span className="text-profit font-medium">
                              {formatCurrency(info.biggestWin)}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Biggest Loss
                            </span>
                            <span className="text-loss font-medium">
                              {formatCurrency(info.biggestLoss)}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Total Lot Size
                            </span>
                            <span className="font-medium">
                              {info.totalLots.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Symbols */}
                        <div className="pt-3 border-t text-sm">
                          <span className="font-medium text-foreground">
                            Symbols:
                          </span>{" "}
                          {info.symbols.length > 0 ? (
                            <span className="text-muted-foreground">
                              {info.symbols.join(", ")}
                            </span>
                          ) : (
                            <span className="italic text-muted-foreground opacity-70">
                              None
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-sm text-muted-foreground py-4">
                        No trades for this date
                      </div>
                    );
                  })()}
                </PopoverContent>
              </Popover>
            ) : (
              <div className="min-h-[100px] p-2 border border-border rounded-lg bg-gray-50 opacity-80"></div>
            )}
          </div>
        ))}
      </div>
    </>
  );

  const renderMonthView = () => {
    const months = Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString("default", { month: "short" })
    );
    return (
      <div className="grid grid-cols-3 gap-4">
        {months.map((m, idx) => (
          <Button
            key={m}
            variant="outline"
            onClick={() => {
              setCurrentMonth(idx);
              setViewMode("day");
            }}
          >
            {m}
          </Button>
        ))}
      </div>
    );
  };

  const renderYearView = () => {
    const startYear = Math.floor(currentYear / 12) * 12;
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 12 }, (_, i) => startYear + i).map((y) => (
          <Button
            key={y}
            variant="outline"
            onClick={() => {
              setCurrentYear(y);
              setViewMode("month");
            }}
          >
            {y}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={goPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={goToday}>
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goNext}
              disabled={isCurrentMonth && viewMode === "day"}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="ml-6 flex gap-2 text-lg font-semibold">
              <span
                className="cursor-pointer"
                onClick={() => setViewMode("month")}
              >
                {new Date(currentYear, currentMonth).toLocaleString("default", {
                  month: "long",
                })}
              </span>
              <span
                className="cursor-pointer"
                onClick={() => setViewMode("year")}
              >
                {currentYear}
              </span>
            </div>
          </div>

          <div className="p-2">
            {viewMode === "day" && renderDayView()}
            {viewMode === "month" && renderMonthView()}
            {viewMode === "year" && renderYearView()}
          </div>
        </div>

        <WeeklySummaryWidget
          dailyPnL={dailyPnL}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
      </div>
    </div>
  );
};
