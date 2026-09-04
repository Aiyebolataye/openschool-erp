"use client";

import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { ListCard } from "@/components/ui/list-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const kpis = [
  { label: "Classes Today", value: "4", detail: "", detailColor: "muted" as const },
  { label: "Students Assigned", value: "248", detail: "", detailColor: "muted" as const },
  { label: "Attendance Pending", value: "4", detail: "", detailColor: "orange" as const },
  { label: "Lesson Notes Pending", value: "2", detail: "", detailColor: "orange" as const },
  { label: "Assignments to Grade", value: "12", detail: "", detailColor: "red" as const },
  { label: "Upcoming Assessments", value: "3", detail: "", detailColor: "muted" as const },
];

const timetable = [
  { period: "1st (8–9)", subject: "SS1 Biology", cls: "SS1 Sci" },
  { period: "2nd (9–10)", subject: "SS2 Biology", cls: "SS2 Sci" },
  { period: "3rd (10–11)", subject: "Free", cls: "—" },
  { period: "4th (11–12)", subject: "SS3 Biology", cls: "SS3 Sci" },
];

const deadlines = [
  { title: "Biology Essay #3", cls: "SS1 Science", due: "Due tomorrow" },
  { title: "Lab Report — Osmosis", cls: "SS2 Science", due: "Due Fri" },
  { title: "Mid-term Quiz", cls: "SS3 Science", due: "Due Aug 10" },
];

const studentAlerts = [
  { avatar: "TO", avatarColor: "red" as const, title: "Tom Wallace", subtitle: "Repeated absence in SS3 Biology", right: <Badge variant="red">High</Badge> },
  { avatar: "AM", avatarColor: "orange" as const, title: "Amara Okafor", subtitle: "Declining performance trend", right: <Badge variant="orange">Med</Badge> },
];

const curriculum = [
  { topic: "Cell Biology", progress: 80 },
  { topic: "Genetics", progress: 45 },
  { topic: "Ecology", progress: 65 },
];

export default function TeacherDashboardPage() {
  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Good morning, Mrs. Ajayi"
        subtitle="Here's your teaching overview for today · Term 3 2026"
        actions={
          <div className="flex items-center gap-3">
            <Link href="/teacher/lesson-notes/new">
              <Button variant="secondary">+ Lesson Note</Button>
            </Link>
            <Link href="/teacher/assignments/new">
              <Button>+ Assignment</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-6 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-text-dark mb-3">Today's Timetable</h3>
          <div className="flex flex-col gap-2">
            {timetable.map((t) => (
              <div key={t.period} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                <span className="text-xs text-text-muted">{t.period}</span>
                <span className="text-sm font-medium text-text-dark">{t.subject}</span>
                <span className="text-xs text-text-muted">{t.cls}</span>
              </div>
            ))}
          </div>
        </Card>

        <ListCard
          title="Assignment Deadlines"
          items={deadlines.map((d) => ({ title: d.title, subtitle: d.cls + " · " + d.due }))}
        />

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-text-dark mb-3">Curriculum Progress</h3>
          <div className="flex flex-col gap-3">
            {curriculum.map((c) => (
              <div key={c.topic}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-text-dark">{c.topic}</span>
                  <span className="text-xs text-text-muted">{c.progress}%</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${c.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ListCard title="Student Alerts" items={studentAlerts} />
        <ListCard
          title="Upcoming Lessons"
          items={[
            { title: "SS1 Biology — Lesson 12", subtitle: "Today · 8:00 AM" },
            { title: "SS2 Biology — Genetics 2", subtitle: "Tomorrow · 9:00 AM" },
            { title: "SS3 Biology — Mock prep", subtitle: "Wed · 11:00 AM" },
          ]}
        />
      </div>
    </div>
  );
}
