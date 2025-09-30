import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { useDailyPnL, DailyStat } from "@/hooks/useTrades";

interface CalendarDay {
  date: number;
  pnl: number;
  trades: number;
  percentage?: number;
}

type ViewMode = "day" | "month" | "year";

// ✅ Weekly summary widget (dynamic)
const WeeklySummaryWidget = ({
  dailyPnL,
  currentMonth,
  currentYear,
}: {
  dailyPnL: DailyStat[];
  currentMonth: number;
  currentYear: number;
}) => {
  // Calculate weekly stats dynamically
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Weekly Summary</h3>
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
        {weeklyData.map((week) => (
          <div
            key={week.week}
            className="p-4 rounded-2xl border bg-transparent shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="text-sm font-medium">Week {week.week}</div>
                <div className="text-xs text-muted-foreground">
                  {week.days} days
                </div>
              </div>
              <div
                className={`font-semibold ${
                  week.pnl > 0
                    ? "text-green-600"
                    : week.pnl < 0
                    ? "text-red-600"
                    : "text-muted-foreground"
                }`}
              >
                {week.pnl === 0 ? "$0.00" : `$${week.pnl.toFixed(2)}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TradezellaCalendar = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [viewMode, setViewMode] = useState<ViewMode>("day");

  const { data } = useDailyPnL(currentMonth, currentYear);
  const dailyPnL: DailyStat[] = data?.stats ?? [];
  const deposit = data?.deposit ?? 10000;

  const getDayClass = (day: CalendarDay) => {
    let baseClass =
      "min-h-[100px] p-2 border border-border rounded-lg flex flex-col items-center justify-center text-xs cursor-pointer transition-all hover:shadow-sm";

    if (day.pnl > 0) {
      baseClass += " bg-green-100 text-green-800";
    } else if (day.pnl < 0) {
      baseClass += " bg-red-100 text-red-800";
    } else {
      baseClass += " bg-gray-50";
    }

    return baseClass;
  };

  // ✅ round PnL to 2 decimals
  const formatCurrency = (amount: number) => {
    const formatted = amount.toFixed(2);
    return amount >= 0 ? `$${formatted}` : `-$${Math.abs(Number(formatted))}`;
  };

  const formatPercentage = (percentage: number) =>
    `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`;

  // ------------------------
  // Calendar cell generation
  // ------------------------
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
      percentage: stat && deposit > 0 ? (stat.pnl / deposit) * 100 : undefined,
    });
  }

  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  // ------------------------
  // Navigation logic
  // ------------------------
  const isCurrentMonth =
    currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const goPrev = () => {
    if (viewMode === "day") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((y) => y - 1);
      } else {
        setCurrentMonth((m) => m - 1);
      }
    } else if (viewMode === "month") {
      setCurrentYear((y) => y - 1);
    } else if (viewMode === "year") {
      setCurrentYear((y) => y - 12);
    }
  };

  const goNext = () => {
    if (viewMode === "day") {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((y) => y + 1);
      } else {
        setCurrentMonth((m) => m + 1);
      }
    } else if (viewMode === "month") {
      setCurrentYear((y) => y + 1);
    } else if (viewMode === "year") {
      setCurrentYear((y) => y + 12);
    }
  };

  const goToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setViewMode("day");
  };

  // ------------------------
  // Render modes
  // ------------------------
  const renderDayView = () => (
    <>
      <div className="grid grid-cols-7 gap-2 mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarCells.map((day, index) => (
          <div key={index} className="aspect-[4/3]">
            {day ? (
              <div className={getDayClass(day)}>
                <div className="font-semibold mb-1">{day.date}</div>
                <div className="font-bold">{formatCurrency(day.pnl)}</div>
                <div className="text-xs opacity-70">{day.trades} trades</div>
                {day.percentage !== undefined && (
                  <div className="text-xs font-medium mt-1">
                    {formatPercentage(day.percentage)}
                  </div>
                )}
              </div>
            ) : (
              <div className="min-h-[100px] p-2 opacity-30"></div>
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
      {/* Calendar + Weekly Summary side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Calendar */}
        <div className="lg:col-span-4 space-y-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={goPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col items-center">
              <div className="flex gap-2">
                <h3
                  className="text-lg font-semibold cursor-pointer"
                  onClick={() => setViewMode("month")}
                >
                  {new Date(currentYear, currentMonth).toLocaleString(
                    "default",
                    { month: "long" }
                  )}
                </h3>
                <h3
                  className="text-lg font-semibold cursor-pointer"
                  onClick={() => setViewMode("year")}
                >
                  {currentYear}
                </h3>
              </div>
              <Button variant="secondary" size="sm" onClick={goToday}>
                Today
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={goNext}
              disabled={isCurrentMonth && viewMode === "day"}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Body */}
          <Card className="p-4">
            {viewMode === "day" && renderDayView()}
            {viewMode === "month" && renderMonthView()}
            {viewMode === "year" && renderYearView()}
          </Card>
        </div>

        {/* Right: Weekly Summary */}
        <WeeklySummaryWidget
          dailyPnL={dailyPnL}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
      </div>
    </div>
  );
};
