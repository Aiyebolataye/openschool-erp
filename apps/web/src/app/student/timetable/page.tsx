"use client";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

interface Lesson {
  subject: string;
  teacher: string;
  room: string;
  tone: "green" | "blue" | "orange" | "red" | "purple" | "muted";
}

type WeekSchedule = Record<string, Lesson>;

const schedule: WeekSchedule = {
  "Monday|8:00": { subject: "Chemistry", teacher: "Mr. A. Adeyemi", room: "Chem Lab", tone: "blue" },
  "Monday|8:40": { subject: "Mathematics", teacher: "Mr. S. Adekunle", room: "SS1 Sci A", tone: "orange" },
  "Monday|9:20": { subject: "Biology", teacher: "Mrs. F. Ajayi", room: "Sci Lab 1", tone: "green" },
  "Monday|10:30": { subject: "English Language", teacher: "Mrs. Y. Balogun", room: "SS1 Sci A", tone: "red" },
  "Monday|11:10": { subject: "Physics", teacher: "Dr. N. Obi", room: "Phy Lab", tone: "purple" },
  "Monday|11:50": { subject: "Literature-in-English", teacher: "Miss C. Nnamdi", room: "SS1 Sci A", tone: "muted" },

  "Tuesday|8:00": { subject: "Biology", teacher: "Mrs. F. Ajayi", room: "Sci Lab 1", tone: "green" },
  "Tuesday|8:40": { subject: "Chemistry", teacher: "Mr. A. Adeyemi", room: "Chem Lab", tone: "blue" },
  "Tuesday|9:20": { subject: "Mathematics", teacher: "Mr. S. Adekunle", room: "SS1 Sci A", tone: "orange" },
  "Tuesday|10:30": { subject: "English Language", teacher: "Mrs. Y. Balogun", room: "SS1 Sci A", tone: "red" },
  "Tuesday|11:10": { subject: "Literature-in-English", teacher: "Miss C. Nnamdi", room: "SS1 Sci A", tone: "muted" },
  "Tuesday|11:50": { subject: "Physics", teacher: "Dr. N. Obi", room: "Phy Lab", tone: "purple" },
  "Tuesday|13:00": { subject: "Biology Practical", teacher: "Mrs. F. Ajayi", room: "Sci Lab 1", tone: "green" },

  "Wednesday|8:00": { subject: "Physics", teacher: "Dr. N. Obi", room: "Phy Lab", tone: "purple" },
  "Wednesday|8:40": { subject: "Biology", teacher: "Mrs. F. Ajayi", room: "Sci Lab 1", tone: "green" },
  "Wednesday|9:20": { subject: "Chemistry", teacher: "Mr. A. Adeyemi", room: "Chem Lab", tone: "blue" },
  "Wednesday|10:30": { subject: "Mathematics", teacher: "Mr. S. Adekunle", room: "SS1 Sci A", tone: "orange" },
  "Wednesday|11:10": { subject: "English Language", teacher: "Mrs. Y. Balogun", room: "SS1 Sci A", tone: "red" },
  "Wednesday|11:50": { subject: "Literature-in-English", teacher: "Miss C. Nnamdi", room: "SS1 Sci A", tone: "muted" },

  "Thursday|8:00": { subject: "English Language", teacher: "Mrs. Y. Balogun", room: "SS1 Sci A", tone: "red" },
  "Thursday|8:40": { subject: "Literature-in-English", teacher: "Miss C. Nnamdi", room: "SS1 Sci A", tone: "muted" },
  "Thursday|9:20": { subject: "Physics", teacher: "Dr. N. Obi", room: "Phy Lab", tone: "purple" },
  "Thursday|10:30": { subject: "Chemistry", teacher: "Mr. A. Adeyemi", room: "Chem Lab", tone: "blue" },
  "Thursday|11:10": { subject: "Biology", teacher: "Mrs. F. Ajayi", room: "Sci Lab 1", tone: "green" },
  "Thursday|11:50": { subject: "Mathematics", teacher: "Mr. S. Adekunle", room: "SS1 Sci A", tone: "orange" },
  "Thursday|13:00": { subject: "Physics Practical", teacher: "Dr. N. Obi", room: "Phy Lab", tone: "purple" },

  "Friday|8:00": { subject: "Mathematics", teacher: "Mr. S. Adekunle", room: "SS1 Sci A", tone: "orange" },
  "Friday|8:40": { subject: "English Language", teacher: "Mrs. Y. Balogun", room: "SS1 Sci A", tone: "red" },
  "Friday|9:20": { subject: "Literature-in-English", teacher: "Miss C. Nnamdi", room: "SS1 Sci A", tone: "muted" },
  "Friday|10:30": { subject: "Biology", teacher: "Mrs. F. Ajayi", room: "Sci Lab 1", tone: "green" },
  "Friday|11:10": { subject: "Chemistry", teacher: "Mr. A. Adeyemi", room: "Chem Lab", tone: "blue" },
  "Friday|11:50": { subject: "Physics", teacher: "Dr. N. Obi", room: "Phy Lab", tone: "purple" },
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const SLOT_BLOCKS: { label: string; slots: string[] }[] = [
  { label: "", slots: ["8:00", "8:40", "9:20"] },
  { label: "Morning Break · 10:00 – 10:30", slots: [] },
  { label: "", slots: ["10:30", "11:10", "11:50"] },
  { label: "Lunch Break · 12:30 – 1:00", slots: [] },
  { label: "", slots: ["13:00", "13:40"] },
];

const TIME_LABEL: Record<string, string> = {
  "8:00": "8:00 – 8:40",
  "8:40": "8:40 – 9:20",
  "9:20": "9:20 – 10:00",
  "10:30": "10:30 – 11:10",
  "11:10": "11:10 – 11:50",
  "11:50": "11:50 – 12:30",
  "13:00": "1:00 – 1:40",
  "13:40": "1:40 – 2:20",
};

const tintMap: Record<string, string> = {
  green: "bg-green-light",
  blue: "bg-primary-light",
  orange: "bg-orange-light",
  red: "bg-red-light",
  purple: "bg-purple-light",
  muted: "bg-surface",
};

const dotMap: Record<string, string> = {
  green: "bg-green",
  blue: "bg-primary",
  orange: "bg-orange",
  red: "bg-red",
  purple: "bg-purple",
  muted: "bg-text-muted",
};

function lessonFor(day: string, time: string): Lesson | undefined {
  return schedule[`${day}|${time}`];
}

const LEGEND = [
  { label: "Biology", color: "bg-green" },
  { label: "Chemistry", color: "bg-primary" },
  { label: "Mathematics", color: "bg-orange" },
  { label: "English Language", color: "bg-red" },
  { label: "Literature", color: "bg-purple" },
  { label: "Physics", color: "bg-text-muted" },
];

function DayHeader({ day }: { day: string }) {
  return (
    <div className="rounded-md bg-surface px-1.5 py-2 text-center">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-dark">{day}</span>
    </div>
  );
}

export default function StudentTimetablePage() {
  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Weekly Timetable"
        subtitle="SS1 Science · Third Term, 2025/2026"
      />

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-dark">Weekly Schedule</h3>
          <span className="text-xs text-text-muted">Class Teacher · Mrs. F. Ajayi</span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[880px]">
            <div className="grid grid-cols-[90px_repeat(5,1fr)] gap-1.5">
              <div />
              {DAYS.map((d) => (
                <DayHeader key={d} day={d} />
              ))}
            </div>

            {SLOT_BLOCKS.map((block, bi) =>
              block.label ? (
                <div
                  key={bi}
                  className="mt-1.5 rounded-md bg-surface border border-border-light px-3 py-1.5 text-center"
                >
                  <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                    {block.label}
                  </span>
                </div>
              ) : (
                <div key={bi} className="mt-1.5 flex flex-col gap-1.5">
                  {block.slots.map((time) => (
                    <div key={time} className="grid grid-cols-[90px_repeat(5,1fr)] gap-1.5">
                      <div className="flex items-center justify-end pr-1">
                        <span className="text-[11px] tabular-nums text-text-muted">{TIME_LABEL[time]}</span>
                      </div>
                      {DAYS.map((day) => {
                        const lesson = lessonFor(day, time);
                        return (
                          <div key={day} className="min-h-[60px] rounded-lg border border-border-light px-1.5 py-1">
                            {lesson ? (
                              <div className={`h-full rounded-md px-2 py-1.5 ${tintMap[lesson.tone]}`}>
                                <p className="text-xs font-semibold text-text-dark leading-snug">
                                  {lesson.subject}
                                </p>
                                <p className="text-[11px] text-text-muted leading-snug">{lesson.teacher}</p>
                                <p className="text-[10px] text-text-muted/80 leading-snug">{lesson.room}</p>
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
              )
            )}
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
