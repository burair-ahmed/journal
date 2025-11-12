"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Zap } from "lucide-react";

dayjs.extend(utc);
dayjs.extend(timezone);

interface FFEvent {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
}

export const NewsFeed = () => {
  const [events, setEvents] = useState<FFEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/news");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Failed to fetch news:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 border border-red-300";
      case "medium":
        return "bg-amber-100 text-amber-700 border border-amber-300";
      case "low":
        return "bg-emerald-100 text-emerald-700 border border-emerald-300";
      default:
        return "bg-gray-100 text-gray-500 border border-gray-300";
    }
  };

    const getImpactIcon = (impact: string) => {
    switch (impact.toLowerCase()) {
      case "high":
        return <Zap className="text-red-600 w-4 h-4" />;
      case "medium":
        return <Zap className="text-amber-600 w-4 h-4" />;
      case "low":
        return <Zap className="text-emerald-600 w-4 h-4" />;
      default:
        return <Zap className="text-gray-500 w-4 h-4" />;
    }
  };
  // Group events by date
  const groupedByDate = events.reduce((acc, ev) => {
    const dateKey = dayjs(ev.date).format("YYYY-MM-DD");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(ev);
    return acc;
  }, {} as Record<string, FFEvent[]>);

  // Sort dates ascending
  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => dayjs(a).valueOf() - dayjs(b).valueOf()
  );

  return (
    <Card className="p-5 bg-white border border-gray-200 shadow-md rounded-2xl">
      <div className="text-base font-semibold text-gray-800 mb-5">
        Economic Calendar (This Week)
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm text-center py-8">
          Loading news...
        </div>
      ) : (
        <div className="max-h-[520px] overflow-y-auto space-y-8 pr-1">
          {sortedDates.map((date) => {
            // Sort events of the day by time ascending
            const dailyEvents = groupedByDate[date].sort(
              (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
            );

            return (
              <div key={date}>
                <div className="sticky top-0 bg-gray-50 text-xs font-semibold text-gray-600 px-2 py-1.5 rounded-md border border-gray-200 shadow-sm mb-3">
                  {dayjs(date).format("dddd, MMM D")}
                </div>

                <div className="space-y-2">
                  {dailyEvents.map((ev, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap items-center justify-between px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:shadow-md hover:bg-gray-100 transition-all duration-200"
                    >
                      {/* Left: Country + Title */}
                      <div className="flex items-center gap-3 min-w-[40%]">
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {ev.country}
                        </span>
                        <span className="text-sm font-medium text-gray-800 leading-tight">
                          {ev.title}
                        </span>
                      </div>

                      {/* Right: Details */}
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
                        <span
                          className={`px-2 py-0.5 rounded-md flex ${getImpactColor(
                            ev.impact
                          )}`}
                        >
                          {getImpactIcon(ev.impact)}{ev.impact || "-"}
                        </span>
                        <span className="w-12 text-center text-gray-700">
                          {dayjs(ev.date).format("HH:mm")}
                        </span>
                        <span className="w-14 text-center text-gray-500">
                          {ev.forecast || "-"}
                        </span>
                        <span className="w-14 text-center text-gray-400">
                          {ev.previous || "-"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
