"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import { useState } from "react";

const events = [
  { day: "Mon", month: "AUG", date: "3", title: "Term 3 Resumption", time: "All day", type: { text: "Academic", variant: "blue" as const } },
  { day: "Tue", month: "AUG", date: "4", title: "PTA Meeting", time: "4:00 PM", type: { text: "Meeting", variant: "green" as const } },
  { day: "Mon", month: "AUG", date: "10", title: "Mid-term Exams Start", time: "All day", type: { text: "Exam", variant: "orange" as const } },
  { day: "Sat", month: "AUG", date: "15", title: "Inter-house Sports", time: "9:00 AM", type: { text: "Event", variant: "purple" as const } },
];

const calendar = Array.from({ length: 35 }, (_, i) => i + 1);

export default function PrincipalCalendarPage() {
  const [addOpen, setAddOpen] = useState(false);

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
            {calendar.map((d) => (
              <div key={d} className={`aspect-square rounded-lg flex items-center justify-center text-sm ${d === 3 ? "bg-primary text-white font-semibold" : d === 10 ? "bg-orange-light text-orange font-semibold" : "text-text-dark hover:bg-surface"}`}>
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
