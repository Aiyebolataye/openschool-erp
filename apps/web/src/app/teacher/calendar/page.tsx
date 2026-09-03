"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const events = [
  { day: "Tue", month: "AUG", date: "4", title: "SS1 Science — Biology Lesson", time: "8:00 AM", type: { text: "Teaching", variant: "blue" as const } },
  { day: "Mon", month: "AUG", date: "10", title: "Mid-term Exams Start", time: "All day", type: { text: "Exam", variant: "orange" as const } },
  { day: "Wed", month: "AUG", date: "12", title: "Parent-Teacher Evening", time: "4:00 PM", type: { text: "Meeting", variant: "green" as const } },
  { day: "Sat", month: "AUG", date: "15", title: "Inter-house Sports", time: "9:00 AM", type: { text: "Event", variant: "purple" as const } },
];

export default function CalendarPage() {
  return (
    <div className="max-w-[1000px] mx-auto">
      <PageHeader title="Calendar" subtitle="Your teaching and classroom schedule" />

      <Card className="p-4 mb-6">
        <h3 className="text-sm font-semibold text-text-dark mb-3">Upcoming Events</h3>
        <div className="flex flex-col gap-3">
          {events.map((e) => (
            <div key={e.title} className="flex items-center gap-3">
              <div className="w-10 rounded-lg bg-surface flex flex-col items-center py-1.5 shrink-0">
                <span className="text-[10px] text-text-muted uppercase">{e.month}</span>
                <span className="text-sm font-bold text-text-dark leading-none">{e.date}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-dark truncate">{e.title}</p>
                <p className="text-xs text-text-muted">{e.time} · {e.day}</p>
              </div>
              <Badge variant={e.type.variant as "blue"}>{e.type.text}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
