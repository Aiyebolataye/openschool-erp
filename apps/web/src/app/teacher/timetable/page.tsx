"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

const WEEK: { day: string; lessons: { time: string; cls: string; subject: string }[] }[] = [
  { day: "Monday", lessons: [ { time: "8:00 – 9:00", cls: "SS1 Science", subject: "Biology" }, { time: "9:10 – 10:10", cls: "SS2 Science", subject: "Biology" }, { time: "11:00 – 12:00", cls: "SS3 Science", subject: "Biology" } ] },
  { day: "Tuesday", lessons: [ { time: "9:10 – 10:10", cls: "SS2 Science", subject: "Biology" }, { time: "2:00 – 3:00", cls: "Lab", subject: "Practical" } ] },
  { day: "Wednesday", lessons: [ { time: "8:00 – 9:00", cls: "SS1 Science", subject: "Biology" }, { time: "2:00 – 3:00", cls: "SS3 Science", subject: "Biology" } ] },
  { day: "Thursday", lessons: [ { time: "10:00 – 11:00", cls: "SS2 Science", subject: "Biology" }, { time: "11:10 – 12:10", cls: "SS3 Science", subject: "Biology" } ] },
  { day: "Friday", lessons: [ { time: "9:10 – 10:10", cls: "SS1 Science", subject: "Biology" }, { time: "1:00 – 2:00", cls: "Lab", subject: "Practical" } ] },
];

const DAYS = WEEK.map((d) => d.day);

const LESSON_STYLE: Record<string, { tint: string; text: string }> = {
  "SS1 Science|Biology": { tint: "bg-primary-light", text: "text-primary" },
  "SS2 Science|Biology": { tint: "bg-green-light", text: "text-green" },
  "SS3 Science|Biology": { tint: "bg-orange-light", text: "text-orange" },
  "Lab|Practical": { tint: "bg-purple-light", text: "text-purple" },
};

const LEGEND = [
  { label: "SS1 Science", color: "bg-primary" },
  { label: "SS2 Science", color: "bg-green" },
  { label: "SS3 Science", color: "bg-orange" },
  { label: "Lab Practical", color: "bg-purple" },
];

function startMin(time: string) {
  const [hh, mm] = time.split("–")[0].trim().split(":").map(Number);
  return (hh < 8 ? hh + 12 : hh) * 60 + mm;
}

const TIME_SLOTS = Array.from(new Set(WEEK.flatMap((d) => d.lessons.map((l) => l.time)))).sort((a, b) => startMin(a) - startMin(b));

function lessonFor(day: string, time: string) {
  return WEEK.find((d) => d.day === day)?.lessons.find((l) => l.time === time);
}

function lessonStyle(cls: string, subject: string) {
  return LESSON_STYLE[`${cls}|${subject}`] ?? { tint: "bg-primary-light", text: "text-primary" };
}

export default function TimetablePage() {
  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader title="My Timetable" subtitle="Weekly timetable · repeats every week" />

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-dark">Weekly Schedule</h3>
          <span className="text-xs text-text-muted">Biology · Mrs. Ajayi</span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[84px_repeat(5,1fr)] gap-1.5">
              <div />
              {DAYS.map((d) => (
                <div key={d} className="rounded-md bg-surface px-1.5 py-2 text-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-dark">{d}</span>
                </div>
              ))}
            </div>

            <div className="mt-1.5 flex flex-col gap-1.5">
              {TIME_SLOTS.map((time) => (
                <div key={time} className="grid grid-cols-[84px_repeat(5,1fr)] gap-1.5">
                  <div className="flex items-center justify-end pr-1">
                    <span className="text-[11px] tabular-nums text-text-muted">{time}</span>
                  </div>
                  {DAYS.map((day) => {
                    const lesson = lessonFor(day, time);
                    const style = lesson ? lessonStyle(lesson.cls, lesson.subject) : null;
                    return (
                      <div key={day} className="min-h-[64px] rounded-lg border border-border-light px-2 py-2">
                        {lesson ? (
                          <div className={`h-full rounded-md px-2 py-1.5 ${style!.tint}`}>
                            <p className={`text-xs font-semibold ${style!.text}`}>{lesson.cls}</p>
                            <p className="text-[11px] text-text-muted">{lesson.subject}</p>
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-border-light" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border-light pt-4">
          <div className="flex flex-wrap gap-x-3 gap-y-1.5">
            {LEGEND.map((l) => (
              <span key={l.label} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${l.color}`} />
                <span className="text-xs text-text-muted">{l.label}</span>
              </span>
            ))}
          </div>
          <p className="text-xs text-text-muted">This schedule repeats every week.</p>
        </div>
      </Card>
    </div>
  );
}
