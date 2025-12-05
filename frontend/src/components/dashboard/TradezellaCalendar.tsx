import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, BarChart3, Layers, Target } from "lucide-react";
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

// ✨ Enhanced Weekly Summary Widget
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
    const result: { week: number; pnl: number; days: number; tradingDays: number }[] = [];
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
        result[weekNum - 1] = { week: weekNum, pnl: 0, days: 0, tradingDays: 0 };
      }

      if (stat) {
        result[weekNum - 1].pnl += stat.pnl;
        result[weekNum - 1].tradingDays += stat.trades > 0 ? 1 : 0;
      }
      result[weekNum - 1].days++;
    }
    return result;
  }, [dailyPnL, currentMonth, currentYear]);

  const totalPnL = weeklyData.reduce((sum, w) => sum + w.pnl, 0);

  return (
    <div className="space-y-3 mt-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Weekly Summary</h3>
        <span className={cn(
          "text-sm font-bold",
          totalPnL > 0 ? "text-profit" : totalPnL < 0 ? "text-loss" : "text-muted-foreground"
        )}>
          {totalPnL >= 0 ? `$${totalPnL.toFixed(2)}` : `-$${Math.abs(totalPnL).toFixed(2)}`}
        </span>
      </div>

      {/* Enhanced Week Cards */}
      <div className="space-y-2">
        {weeklyData.map((week) => (
          <div
            key={week.week}
            className={cn(
              "p-3 rounded-lg border bg-transparent shadow-sm flex justify-between items-center",
              "transition-all duration-200 hover:shadow-md hover:border-primary/30",
              // Subtle background tint based on PnL
              week.pnl > 0 && "bg-profit/5 border-profit/20",
              week.pnl < 0 && "bg-loss/5 border-loss/20",
              week.pnl === 0 && "border-border"
            )}
          >
            <div className="flex items-center gap-3">
              {/* PnL Indicator */}
              <div className={cn(
                "w-1 h-8 rounded-full",
                week.pnl > 0 ? "bg-profit" : week.pnl < 0 ? "bg-loss" : "bg-muted"
              )} />
              <div>
                <div className="text-sm font-medium">Week {week.week}</div>
                <div className="text-xs text-muted-foreground">
                  {week.tradingDays} trading day{week.tradingDays !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <div
              className={cn(
                "font-semibold text-right",
                week.pnl > 0 ? "text-profit" : week.pnl < 0 ? "text-loss" : "text-muted-foreground"
              )}
            >
              {week.pnl === 0 ? "$0.00" : week.pnl > 0 ? `$${week.pnl.toFixed(2)}` : `-$${Math.abs(week.pnl).toFixed(2)}`}
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

  // ✨ Enhanced day class with better visual hierarchy
  const getDayClass = (day: CalendarDay) => {
    const baseClass =
      "min-h-[100px] p-2 border rounded-lg flex flex-col items-center justify-center text-xs cursor-pointer transition-all duration-200";
    
    if (day.pnl > 0) {
      const intensity = Math.min(Math.abs(day.pnl) / 500, 1);
      return cn(
        baseClass,
        "border-profit/30 hover:border-profit/50 hover:shadow-sm",
        intensity > 0.5 ? "bg-profit/15" : "bg-profit/10",
        "text-profit"
      );
    } else if (day.pnl < 0) {
      const intensity = Math.min(Math.abs(day.pnl) / 500, 1);
      return cn(
        baseClass,
        "border-loss/30 hover:border-loss/50 hover:shadow-sm",
        intensity > 0.5 ? "bg-loss/15" : "bg-loss/10",
        "text-loss"
      );
    } else {
      return cn(baseClass, "bg-secondary/20 border-border hover:border-muted-foreground/30");
    }
  };

  const formatCurrency = (amount: number) => {
    const formatted = Math.abs(amount).toFixed(2);
    return amount >= 0 ? `$${formatted}` : `-$${formatted}`;
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

  const isToday = (day: CalendarDay) => {
    return (
      day.date === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

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

  // ✨ Enhanced Popover Content
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
    const winRate = tradesForDay.length > 0 
      ? ((wins.length / tradesForDay.length) * 100).toFixed(1) 
      : '0';

    return {
      totalTrades: tradesForDay.length,
      winningTrades: wins.length,
      losingTrades: losses.length,
      biggestWin,
      biggestLoss,
      totalLots,
      symbols,
      winRate,
    };
  };

  // ✨ Enhanced Day View with better spacing and hover states
  const renderDayView = () => (
    <>
      {/* Day Labels with better styling */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium py-2 border-b-2 border-primary text-muted-foreground"
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
                      "flex flex-col items-start rounded-lg px-2 py-1.5",
                      // Today indicator
                      isToday(day) && "ring-2 ring-primary ring-offset-1"
                    )}
                  >
                    {/* Date number with better weight */}
                    <div className={cn(
                      "text-sm font-semibold",
                      isToday(day) && "text-primary"
                    )}>
                      {day.date}
                    </div>
                    
                    {/* PnL with improved typography */}
                    <div className="text-base font-medium mt-auto">
                      {formatCurrency(day.pnl)}
                    </div>
                    
                    {/* Trade count with subtle styling */}
                    <div className={cn(
                      "text-xs",
                      day.trades > 0 ? "text-muted-foreground" : "text-muted-foreground/50"
                    )}>
                      {day.trades > 0 ? `${day.trades} trade${day.trades > 1 ? 's' : ''}` : "—"}
                    </div>
                    
                    {/* Percentage with conditional display */}
                    {day.percentage !== undefined && day.trades > 0 && (
                      <div className={cn(
                        "text-xs font-medium mt-0.5",
                        day.percentage >= 0 ? "text-profit/70" : "text-loss/70"
                      )}>
                        {formatPercentage(day.percentage)}
                      </div>
                    )}
                  </div>
                </PopoverTrigger>

                {/* ✨ Enhanced Popover */}
                <PopoverContent className="w-[340px] p-0 rounded-xl border bg-background shadow-lg">
                  {(() => {
                    const info = getDayTradesData(day.dateStr);
                    return info ? (
                      <div className="space-y-0">
                        {/* Header */}
                        <div className="px-4 py-3 border-b bg-muted/30">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">
                                Trade Summary
                              </span>
                              <p className="text-base font-semibold text-foreground">
                                {day.dateStr}
                              </p>
                            </div>
                            <div className={cn(
                              "text-xl font-medium",
                              day.pnl >= 0 ? "text-profit" : "text-loss"
                            )}>
                              {formatCurrency(day.pnl)}
                            </div>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="p-4 space-y-4">
                          {/* Main Metrics Row */}
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-2.5 rounded-lg bg-muted/50 text-center">
                              <BarChart3 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                              <span className="text-lg font-bold">{info.totalTrades}</span>
                              <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-profit/10 text-center">
                              <TrendingUp className="h-4 w-4 mx-auto mb-1 text-profit" />
                              <span className="text-lg font-bold text-profit">{info.winningTrades}</span>
                              <p className="text-xs text-muted-foreground">Wins</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-loss/10 text-center">
                              <TrendingDown className="h-4 w-4 mx-auto mb-1 text-loss" />
                              <span className="text-lg font-bold text-loss">{info.losingTrades}</span>
                              <p className="text-xs text-muted-foreground">Losses</p>
                            </div>
                          </div>

                          {/* Secondary Metrics */}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-primary" />
                                <span className="text-muted-foreground">Win Rate</span>
                              </div>
                              <span className="font-semibold text-primary">{info.winRate}%</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                              <div className="flex items-center gap-2">
                                <Layers className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Lots</span>
                              </div>
                              <span className="font-semibold">{info.totalLots.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Best/Worst with subtle separators */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded-lg bg-muted/30 border-l-2 border-profit">
                              <p className="text-xs text-muted-foreground mb-0.5">Best Trade</p>
                              <p className="text-sm font-bold text-profit">
                                {formatCurrency(info.biggestWin)}
                              </p>
                            </div>
                            <div className="p-2 rounded-lg bg-muted/30 border-l-2 border-loss">
                              <p className="text-xs text-muted-foreground mb-0.5">Worst Trade</p>
                              <p className="text-sm font-bold text-loss">
                                {formatCurrency(info.biggestLoss)}
                              </p>
                            </div>
                          </div>

                          {/* Symbols with better chips */}
                          {info.symbols.length > 0 && (
                            <div className="pt-3 border-t">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Symbols Traded
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {info.symbols.map((symbol) => (
                                  <span
                                    key={symbol}
                                    className="px-2 py-0.5 text-xs font-medium rounded-md bg-primary/10 text-primary border border-primary/20"
                                  >
                                    {symbol}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-sm text-muted-foreground py-6 px-4">
                        No trades for this date
                      </div>
                    );
                  })()}
                </PopoverContent>
              </Popover>
            ) : (
              <div className="min-h-[100px] p-2 border border-border/50 rounded-lg bg-muted/10 opacity-60"></div>
            )}
          </div>
        ))}
      </div>
    </>
  );

  // ✨ Enhanced Month View
  const renderMonthView = () => {
    const months = Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString("default", { month: "short" })
    );
    const currentMonthNow = new Date().getMonth();
    const currentYearNow = new Date().getFullYear();

    return (
      <div className="grid grid-cols-3 gap-3">
        {months.map((m, idx) => {
          const isCurrent = idx === currentMonthNow && currentYear === currentYearNow;
          const isFuture = currentYear > currentYearNow || (currentYear === currentYearNow && idx > currentMonthNow);
          
          return (
            <Button
              key={m}
              variant="outline"
              disabled={isFuture}
              onClick={() => {
                setCurrentMonth(idx);
                setViewMode("day");
              }}
              className={cn(
                "h-16 transition-all duration-200",
                isCurrent && "border-primary bg-primary/10 text-primary",
                isFuture && "opacity-40"
              )}
            >
              <span className="text-base font-semibold">{m}</span>
            </Button>
          );
        })}
      </div>
    );
  };

  // ✨ Enhanced Year View
  const renderYearView = () => {
    const startYear = Math.floor(currentYear / 12) * 12;
    const thisYear = new Date().getFullYear();

    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 12 }, (_, i) => startYear + i).map((y) => {
          const isCurrent = y === thisYear;
          const isFuture = y > thisYear;

          return (
            <Button
              key={y}
              variant="outline"
              disabled={isFuture}
              onClick={() => {
                setCurrentYear(y);
                setViewMode("month");
              }}
              className={cn(
                "h-14 transition-all duration-200",
                isCurrent && "border-primary bg-primary/10 text-primary",
                isFuture && "opacity-40"
              )}
            >
              <span className="text-base font-semibold">{y}</span>
            </Button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-4 space-y-4">
          {/* ✨ Enhanced Header with better interactions */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goPrev}
              className="hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={goToday}
              className="font-medium"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goNext}
              disabled={isCurrentMonth && viewMode === "day"}
              className="hover:bg-muted transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {/* Month/Year with hover underline */}
            <div className="ml-6 flex gap-2 text-lg font-semibold">
              <span
                className="cursor-pointer hover:text-primary hover:underline underline-offset-4 transition-colors"
                onClick={() => setViewMode("month")}
              >
                {new Date(currentYear, currentMonth).toLocaleString("default", {
                  month: "long",
                })}
              </span>
              <span
                className="cursor-pointer hover:text-primary hover:underline underline-offset-4 transition-colors"
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

        {/* Weekly Summary */}
        <WeeklySummaryWidget
          dailyPnL={dailyPnL}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
      </div>
    </div>
  );
};
