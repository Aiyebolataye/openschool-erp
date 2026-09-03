"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const events = [
  { day: "Tue", date: "28", month: "Jul", title: "Board Executive Meeting", time: "10:00 AM", type: { text: "Meeting", variant: "blue" as const } },
  { day: "Wed", date: "29", month: "Jul", title: "Greenfield Audit Review", time: "2:00 PM", type: { text: "Review", variant: "orange" as const } },
  { day: "Mon", date: "3", month: "Aug", title: "Regional Directors Call", time: "11:00 AM", type: { text: "Call", variant: "green" as const } },
  { day: "Wed", date: "5", month: "Aug", title: "Institution Audit — Greenfield", time: "9:00 AM", type: { text: "Audit", variant: "red" as const } },
  { day: "Wed", date: "12", month: "Aug", title: "Directors Training", time: "Online", type: { text: "Training", variant: "blue" as const } },
];

const calendar = Array.from({ length: 35 }, (_, i) => i + 1);

export default function CalendarPage() {
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
            {calendar.map((d) => (
              <div key={d} className={`aspect-square rounded-lg flex items-center justify-center text-sm ${d === 5 ? "bg-primary text-white font-semibold" : d === 12 ? "bg-orange-light text-orange font-semibold" : "text-text-dark hover:bg-surface"}`}>
                {d}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-text-dark mb-3">Upcoming Events</h3>
          <div className="flex flex-col gap-3">
            {events.map((e) => (
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
