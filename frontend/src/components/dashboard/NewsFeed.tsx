"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Card } from "@/components/ui/card";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Zap, ArrowRight } from "lucide-react";

dayjs.extend(utc);
dayjs.extend(timezone);

interface FFEvent {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
  actual?: string;
}

export const NewsFeed = () => {
  const [events, setEvents] = useState<FFEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>([]);
  const [ascendingOrder, setAscendingOrder] = useState(true);

  // DOM Refs for scrolling to upcoming event
  const eventRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // For automatic “next event” detection
  const [nextEventId, setNextEventId] = useState<string | null>(null);

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
        return <Zap className="text-red-600 w-3.5 h-3.5 mr-1" />;
      case "medium":
        return <Zap className="text-amber-600 w-3.5 h-3.5 mr-1" />;
      case "low":
        return <Zap className="text-emerald-600 w-3.5 h-3.5 mr-1" />;
      default:
        return <Zap className="text-gray-500 w-3.5 h-3.5 mr-1" />;
    }
  };

  // Extract filter values
  const uniqueCurrencies = [...new Set(events.map((e) => e.country))];
  const uniqueImpacts = [...new Set(events.map((e) => e.impact))];

  // Filtering logic
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const currencyOk =
        selectedCurrencies.length === 0 ||
        selectedCurrencies.includes(e.country);

      const impactOk =
        selectedImpacts.length === 0 || selectedImpacts.includes(e.impact);

      return currencyOk && impactOk;
    });
  }, [events, selectedCurrencies, selectedImpacts]);

  // Group by date
  const groupedByDate = filteredEvents.reduce((acc, ev) => {
    const key = dayjs(ev.date).format("YYYY-MM-DD");
    if (!acc[key]) acc[key] = [];
    acc[key].push(ev);
    return acc;
  }, {} as Record<string, FFEvent[]>);

  // Sort days
  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    ascendingOrder
      ? dayjs(a).valueOf() - dayjs(b).valueOf()
      : dayjs(b).valueOf() - dayjs(a).valueOf()
  );

  // Detect next event in real-time
  useEffect(() => {
    const updateNextEvent = () => {
      const now = dayjs();
      let nextId: string | null = null;

      const all = Object.entries(groupedByDate)
        .flatMap(([date, list]) => list)
        .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());

      for (const ev of all) {
        if (dayjs(ev.date).isAfter(now)) {
          nextId = ev.date; // Unique enough
          break;
        }
      }

      setNextEventId(nextId);
    };

    updateNextEvent();

    const timer = setInterval(updateNextEvent, 30_000); // update every 30 sec
    return () => clearInterval(timer);
  }, [groupedByDate]);

  // Scroll to upcoming event
  const scrollToUpcoming = () => {
    if (!nextEventId) return;

    const el = eventRefs.current[nextEventId];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };
  // When real time reaches the next event → flash it
  useEffect(() => {
    if (!nextEventId) return;

    const timer = setInterval(() => {
      const target = groupedByDate
        ? Object.values(groupedByDate)
            .flat()
            .find((ev) => ev.date === nextEventId)
        : null;

      if (!target) return;

      const now = dayjs();
      const eventTime = dayjs(target.date);

      if (now.isAfter(eventTime) && eventRefs.current[nextEventId]) {
        eventRefs.current[nextEventId]?.classList.add("animate-flashPulse");
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [nextEventId, groupedByDate]);

  return (
    <Card className="p-5 bg-white border border-gray-200 shadow-md rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="text-base font-semibold text-gray-800">
          Economic Calendar (This Week)
        </div>

        {/* SHOW CURRENT NEWS BUTTON */}
        <button
          onClick={scrollToUpcoming}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-[#7C3AED] to-[#DB2777] text-white hover:bg-indigo-700 transition shadow-sm"
        >
          Show Current Upcoming News
        </button>
      </div>
      {/* NEXT EVENT STICKY BANNER */}
      {nextEventId && (
        <div className="sticky top-12 mb-3">
          <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#DB2777] text-white text-xs font-semibold shadow-md flex items-center gap-2 animate-slideDown">
            <Zap className="w-3 h-3 text-white" />
            Next Event Incoming
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md pb-4 mb-4 border-b border-gray-200">
        {/* Currencies */}
        <div className="mb-3">
          <div className="text-xs font-semibold text-gray-600 mb-1">
            Currencies
          </div>
          <div className="flex flex-wrap gap-2">
            {uniqueCurrencies.map((c) => (
              <button
                key={c}
                onClick={() =>
                  setSelectedCurrencies((prev) =>
                    prev.includes(c)
                      ? prev.filter((x) => x !== c)
                      : [...prev, c]
                  )
                }
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                  selectedCurrencies.includes(c)
                    ? "text-white border-transparent bg-gradient-to-r from-[#7C3AED] to-[#DB2777] shadow-sm"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Impacts */}
        <div>
          <div className="text-xs font-semibold text-gray-600 mb-1">Impact</div>
          <div className="flex flex-wrap gap-2">
            {uniqueImpacts.map((i) => (
              <button
                key={i}
                onClick={() =>
                  setSelectedImpacts((prev) =>
                    prev.includes(i)
                      ? prev.filter((x) => x !== i)
                      : [...prev, i]
                  )
                }
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                  selectedImpacts.includes(i)
                    ? "text-white border-transparent bg-gradient-to-r from-[#7C3AED] to-[#DB2777] shadow-sm"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Sort order */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-600">Sort Days</span>

          <button
            onClick={() => setAscendingOrder(!ascendingOrder)}
            className="relative inline-flex h-6 w-12 items-center rounded-full bg-gray-300 transition"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                ascendingOrder ? "translate-x-1" : "translate-x-6"
              }`}
            />
          </button>
        </div>
      </div>

      {/* EVENTS */}
      <div className="max-h-[520px] overflow-y-auto space-y-8 px-2">
        {sortedDates.map((date) => {
          const dayEvents = groupedByDate[date].sort((a, b) =>
            ascendingOrder
              ? dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
              : dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
          );

          return (
            <div key={date}>
              <div className="sticky top-0 z-10 bg-gray-50 text-xs font-semibold text-gray-600 px-2 py-1.5 rounded-md border border-gray-200 shadow-sm mb-3">
                {dayjs(date).format("dddd, MMM D")}
              </div>

              <div className="space-y-2">
                {dayEvents.map((ev, idx) => {
                  const isNext = ev.date === nextEventId;

                  return (
                    <div
                      key={idx}
                      ref={(el) => (eventRefs.current[ev.date] = el)}
                      className={`relative flex flex-wrap items-center justify-between px-3 py-2.5 bg-gray-50 border rounded-xl transition-all duration-200
  ${
    isNext
      ? "relative border-transparent bg-white shadow-md animate-glowRing before:absolute before:inset-[-2px] before:rounded-xl before:bg-gradient-to-r before:from-[#7C3AED] before:to-[#DB2777] before:-z-10"
      : "border-gray-200 hover:shadow-md hover:bg-gray-100"
  }
`}
                    >
                      {/* Arrow Indicator */}
                      {/* {isNext && (
                        <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 w-4 h-4 animate-pulse" />
                      )} */}

                      {/* Left */}
                      <div className="flex items-center gap-3 min-w-[45%]">
                        <span className="text-xs font-semibold text-gray-700 w-12 text-right">
                          {dayjs(ev.date).format("HH:mm")}
                        </span>

                        <span
                          className="
    text-xs font-semibold 
    text-[#6A21C8] 
    bg-gradient-to-r from-[#7C3AED]/10 to-[#DB2777]/10 
    px-2 py-0.5 rounded-md
  "
                        >
                          {" "}
                          {ev.country}
                        </span>

                        <span className="text-sm font-medium text-gray-800 leading-tight">
                          {ev.title}
                        </span>
                      </div>

                      {/* Right */}
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
                        <span
                          className={`px-2 py-0.5 rounded-md flex items-center ${getImpactColor(
                            ev.impact
                          )}`}
                        >
                          {getImpactIcon(ev.impact)}
                          {ev.impact || "-"}
                        </span>

                        <span className="w-14 text-center text-gray-700">
                          {ev.actual || "-"}
                        </span>
                        <span className="w-14 text-center text-gray-500">
                          {ev.forecast || "-"}
                        </span>
                        <span className="w-14 text-center text-gray-400">
                          {ev.previous || "-"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
