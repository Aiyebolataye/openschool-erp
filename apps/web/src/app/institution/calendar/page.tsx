"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import { useState, useRef, useCallback } from "react";

const events = [
  { day: "Mon", month: "AUG", date: "3", title: "Term 3 Resumption", time: "All day", type: { text: "Academic", variant: "blue" as const } },
  { day: "Tue", month: "AUG", date: "4", title: "PTA Meeting", time: "4:00 PM", type: { text: "Meeting", variant: "green" as const } },
  { day: "Mon", month: "AUG", date: "10", title: "Mid-term Exams Start", time: "All day", type: { text: "Exam", variant: "orange" as const } },
  { day: "Sat", month: "AUG", date: "15", title: "Inter-house Sports", time: "9:00 AM", type: { text: "Event", variant: "purple" as const } },
];

const calendar = Array.from({ length: 35 }, (_, i) => i + 1);

const eventsByDate: Record<string, { title: string; time: string; variant: "green" | "orange" | "blue" | "purple" }[]> = {
  "3": [{ title: "Term 3 Resumption", time: "All day", variant: "blue" }],
  "4": [{ title: "PTA Meeting", time: "4:00 PM", variant: "green" }],
  "10": [{ title: "Mid-term Exams Start", time: "All day", variant: "orange" }],
  "15": [{ title: "Inter-house Sports", time: "9:00 AM", variant: "purple" }],
};

export default function CalendarPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleMouseEnter = useCallback((d: string) => {
    const el = cellRefs.current[d];
    if (el) {
      const rect = el.getBoundingClientRect();
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
    }
    setHoveredDay(d);
  }, []);

  const hoveredEvents = hoveredDay ? eventsByDate[hoveredDay] ?? [] : [];

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Calendar"
        subtitle="Academic and institutional calendar"
        actions={<Button onClick={() => setAddOpen(true)}>+ Add Event</Button>}
      />

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
              const dayKey = String(d);
              const dayEvents = eventsByDate[dayKey] ?? [];
              const isToday = d === 3;
              const hasEvent = dayEvents.length > 0;
              return (
                <div
                  key={d}
                  ref={(el) => { cellRefs.current[dayKey] = el; }}
                  className="relative"
                  onMouseEnter={() => hasEvent && handleMouseEnter(dayKey)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <div
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-colors cursor-default ${
                      isToday
                        ? "bg-primary text-white font-semibold"
                        : hasEvent
                        ? "bg-orange-light text-orange font-semibold hover:bg-orange hover:text-white"
                        : "text-text-dark hover:bg-surface"
                    }`}
                  >
                    {d}
                    {hasEvent && d !== 3 && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {hoveredDay && hoveredEvents.length > 0 && (
            <div
              className="fixed z-[9999] w-56 rounded-xl border border-border-light bg-card shadow-lg p-3 pointer-events-none"
              style={{ left: tooltipPos.x, top: tooltipPos.y - 8, transform: "translate(-50%, -100%)" }}
            >
              {hoveredEvents.map((ev) => (
                <div key={ev.title} className="flex items-center gap-2 mb-1 last:mb-0">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${ev.variant === "green" ? "bg-green" : ev.variant === "orange" ? "bg-orange" : ev.variant === "blue" ? "bg-primary" : "bg-purple"}`} />
                  <div>
                    <p className="text-xs font-semibold text-text-dark">{ev.title}</p>
                    <p className="text-[10px] text-text-muted">{ev.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Event"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => setAddOpen(false)}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Title" required>
            <TextInput placeholder="Event title" />
          </Field>
          <SelectField label="Type" required placeholder="Select type" options={["Academic", "Meeting", "Exam", "Event", "Holiday"]} />
          <Field label="Date" required>
            <TextInput type="date" />
          </Field>
          <Field label="Time" required>
            <TextInput type="time" />
          </Field>
          <SelectField label="Audience" required placeholder="Select audience" options={["Entire School", "Staff", "Teachers", "Parents", "Students"]} />
        </div>
      </Modal>
    </div>
  );
}
