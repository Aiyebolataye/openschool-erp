"use client";

import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const events: Record<number, { title: string; time: string; type: string }[]> = {
  3: [{ title: "Regional Directors Call", time: "11:00 AM", type: "Call" }],
  5: [{ title: "Institution Audit — Demo", time: "9:00 AM", type: "Audit" }],
  12: [{ title: "Directors Training", time: "Online", type: "Training" }],
  18: [{ title: "Quarterly Budget Review", time: "3:00 PM", type: "Finance" }],
  26: [{ title: "Staff Town Hall", time: "1:00 PM", type: "Meeting" }],
  28: [{ title: "Board Executive Meeting", time: "10:00 AM", type: "Meeting" }],
  29: [{ title: "Demo Audit Review", time: "2:00 PM", type: "Review" }],
};

const upcomingEvents = [
  { day: "Mon", month: "JUL", date: "28", title: "Board Executive Meeting", time: "10:00 AM", type: { text: "Meeting", variant: "blue" as const } },
  { day: "Wed", month: "JUL", date: "29", title: "Demo Audit Review", time: "2:00 PM", type: { text: "Review", variant: "orange" as const } },
  { day: "Wed", month: "AUG", date: "5", title: "Institution Audit — Demo", time: "9:00 AM", type: { text: "Audit", variant: "red" as const } },
  { day: "Wed", month: "AUG", date: "12", title: "Directors Training", time: "Online", type: { text: "Training", variant: "blue" as const } },
];

const calendar = Array.from({ length: 35 }, (_, i) => i + 1);

export default function CalendarPage() {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const cellRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleMouseEnter = useCallback((d: number) => {
    const el = cellRefs.current[d];
    if (el) {
      const rect = el.getBoundingClientRect();
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
    }
    setHoveredDay(d);
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader title="Calendar" subtitle="Organization-wide events, meetings and deadlines" />

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-dark">August 2026</h3>
            <div className="flex gap-1 text-xs text-text-muted">
              <span className="px-2 py-1 rounded hover:bg-surface">‹</span>
              <span className="px-2 py-1 rounded hover:bg-surface">Today</span>
              <span className="px-2 py-1 rounded hover:bg-surface">›</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-text-muted mb-1">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
              <span key={d} className="py-1">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendar.map((d) => {
              const dayEvents = events[d] || [];
              const hasEvents = dayEvents.length > 0;
              return (
                <div
                  key={d}
                  ref={(el) => { cellRefs.current[d] = el; }}
                  className="relative"
                  onMouseEnter={() => hasEvents && handleMouseEnter(d)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <div
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm cursor-default transition-colors ${
                      d === 28 ? "bg-primary text-white font-semibold"
                        : d === 12 ? "bg-orange-light text-orange font-semibold"
                        : hasEvents ? "text-text-dark hover:bg-primary-light/50 font-medium"
                        : "text-text-dark hover:bg-surface"
                    }`}
                  >
                    {d}
                    {hasEvents && d !== 28 && d !== 12 && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {hoveredDay && events[hoveredDay] && (
            <div
              className="fixed z-[9999] w-56 rounded-xl border border-border-light bg-card shadow-lg p-3 pointer-events-none"
              style={{ left: tooltipPos.x, top: tooltipPos.y - 8, transform: "translate(-50%, -100%)" }}
            >
              {events[hoveredDay].map((ev, i) => (
                <div key={i} className="mb-1 last:mb-0">
                  <p className="text-xs font-semibold text-text-dark">{ev.title}</p>
                  <p className="text-[10px] text-text-muted">{ev.time} · {ev.type}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-text-dark mb-3">Upcoming Events</h3>
          <div className="flex flex-col gap-3">
            {upcomingEvents.map((e) => (
              <div key={e.title} className="flex items-center gap-3">
                <div className="w-10 rounded-lg bg-surface flex flex-col items-center py-1.5 shrink-0">
                  <span className="text-[10px] text-text-muted uppercase">{e.month}</span>
                  <span className="text-sm font-bold text-text-dark leading-none">{e.date}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-dark truncate">{e.title}</p>
                  <p className="text-xs text-text-muted">{e.time} · {e.day}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}