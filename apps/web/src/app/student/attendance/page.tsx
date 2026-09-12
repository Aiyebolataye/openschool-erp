"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ABSENT = new Set([17]);
const LATE = new Set([21]);
const TODAY = 28;

function statusFor(day: number, dow: number): "present" | "late" | "absent" | "weekend" | "upcoming" {
  if (dow === 0 || dow === 6) return "weekend";
  if (day > TODAY) return "upcoming";
  if (ABSENT.has(day)) return "absent";
  if (LATE.has(day)) return "late";
  return "present";
}

const MONTH_YEAR = "July 2026";

export default function StudentAttendancePage() {
  const first = new Date(2026, 6, 1);
  const offset = (first.getDay() + 6) % 7;
  const cells: ({ day: number; dow: number; status: string; today: boolean } | null)[] = [];

  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= 31; d++) {
    const dow = new Date(2026, 6, d).getDay();
    cells.push({ day: d, dow, status: statusFor(d, dow), today: d === TODAY });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="My Attendance"
        subtitle={`SS1 Science · ${MONTH_YEAR} · Third Term`}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Present %" value="95%" detail="19 of 20 school days" detailColor="green" />
        <StatCard label="Days Present" value="19" detail="includes 1 late arrival" detailColor="green" />
        <StatCard label="Absent" value="1" detail="Jul 17, 2026" detailColor="red" />
        <StatCard label="Late" value="1" detail="Jul 21, 2026" detailColor="orange" />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-dark">Attendance Record — July 2026</h3>
          <Badge variant="blue">SS1 Science</Badge>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {WEEKDAYS.map((w) => (
            <div key={w} className="rounded-md bg-surface px-1 py-1.5 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{w}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((cell, i) => {
            if (!cell) return <div key={i} />;
            const chip =
              cell.status === "present" ? (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-light text-green text-[11px] font-bold">P</span>
              ) : cell.status === "late" ? (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-light text-orange text-[11px] font-bold">L</span>
              ) : cell.status === "absent" ? (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-light text-red text-[11px] font-bold">A</span>
              ) : null;
            return (
              <div
                key={i}
                className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-lg border ${
                  cell.today ? "border-primary ring-2 ring-primary/20" : "border-border-light"
                } ${
                  cell.status === "weekend"
                    ? "bg-surface/60"
                    : cell.status === "upcoming"
                      ? "bg-card opacity-60"
                      : cell.today
                        ? "bg-primary-light/40"
                        : "bg-card"
                }`}
              >
                <span
                  className={`text-[11px] tabular-nums ${
                    cell.status === "weekend" || cell.status === "upcoming"
                      ? "text-text-muted/60"
                      : "text-text-dark font-medium"
                  }`}
                >
                  {cell.day}
                </span>
                {chip}
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border-light pt-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-light text-[8px] font-bold text-green">P</span>
              <span className="text-xs text-text-muted">Present</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-orange-light text-[8px] font-bold text-orange">L</span>
              <span className="text-xs text-text-muted">Late</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-light text-[8px] font-bold text-red">A</span>
              <span className="text-xs text-text-muted">Absent</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary-light text-[8px] font-bold text-primary">T</span>
              <span className="text-xs text-text-muted">Today · Jul 28</span>
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Attendance is marked daily by your class teacher, Mrs. Ajayi.
          </p>
        </div>
      </Card>
    </div>
  );
}
