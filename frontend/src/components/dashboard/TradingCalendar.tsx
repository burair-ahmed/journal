import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useState } from "react";

interface CalendarDay {
  date: string;
  trades: number;
  pnl: number;
  isToday?: boolean;
}

interface TradingCalendarProps {
  data: CalendarDay[];
}

export const TradingCalendar = ({ data }: TradingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getDayClass = (day: CalendarDay) => {
    let classes = "p-2 rounded-lg cursor-pointer transition-all text-center min-h-[60px] flex flex-col justify-center border";
    
    if (day.pnl > 0) {
      classes += " bg-profit/20 border-profit/30 text-profit-foreground hover:bg-profit/30";
    } else if (day.pnl < 0) {
      classes += " bg-loss/20 border-loss/30 text-loss-foreground hover:bg-loss/30";
    } else {
      classes += " bg-muted/50 border-border hover:bg-muted/70";
    }
    
    if (selectedDate === day.date) {
      classes += " ring-2 ring-primary";
    }
    
    if (day.isToday) {
      classes += " ring-2 ring-accent";
    }
    
    return classes;
  };

  const formatPnL = (pnl: number) => {
    return `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`;
  };

  // Generate current month calendar grid
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Create calendar grid
  const calendarDays = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = data.find(d => d.date === dateStr);
    const isToday = day === currentDate.getDate();
    
    calendarDays.push({
      day,
      date: dateStr,
      trades: dayData?.trades || 0,
      pnl: dayData?.pnl || 0,
      isToday
    });
  }

  return (
    <Card className="widget-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Trading Calendar</h3>
      </div>
      
      <div className="space-y-4">
        <div className="text-center">
          <h4 className="text-xl font-bold">{monthNames[currentMonth]} {currentYear}</h4>
        </div>
        
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div key={index} className="aspect-square">
              {day ? (
                <div
                  className={getDayClass(day)}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <div className="text-sm font-medium">{day.day}</div>
                  {day.trades > 0 && (
                    <>
                      <div className="text-xs opacity-70">{day.trades} trades</div>
                      <div className="text-xs font-bold">{formatPnL(day.pnl)}</div>
                    </>
                  )}
                </div>
              ) : (
                <div className="p-2"></div>
              )}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-profit/20 border border-profit/30"></div>
            <span>Profit</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-loss/20 border border-loss/30"></div>
            <span>Loss</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted/50 border border-border"></div>
            <span>No trades</span>
          </div>
        </div>
      </div>
    </Card>
  );
};