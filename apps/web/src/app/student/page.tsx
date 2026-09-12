"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { ChevronRight } from "lucide-react";

const kpis = [
  { label: "Classes Today", value: "7", detail: "ends by 1:40 pm", detailColor: "blue" as const },
  { label: "Assignments Due", value: "3", detail: "2 due this week", detailColor: "orange" as const },
  { label: "Attendance", value: "95%", detail: "19 of 20 school days", detailColor: "green" as const },
  { label: "Term Average", value: "78.0%", detail: "3rd of 42 in SS1 Science", detailColor: "green" as const },
  { label: "Hostel", value: "Day student", detail: "Not boarding", detailColor: "muted" as const },
  { label: "Fee Balance", value: "₦185,000", detail: "Due Aug 14, 2026", detailColor: "red" as const },
];

const todaysClasses = [
  { time: "8:00", subject: "Biology", teacher: "Mrs. F. Ajayi", room: "Sci Lab 1", color: "green" as const },
  { time: "8:40", subject: "Chemistry", teacher: "Mr. A. Adeyemi", room: "Chem Lab", color: "blue" as const },
  { time: "9:20", subject: "Mathematics", teacher: "Mr. S. Adekunle", room: "SS1 Sci A", color: "orange" as const },
  { time: "10:30", subject: "English Language", teacher: "Mrs. Y. Balogun", room: "SS1 Sci A", color: "red" as const },
  { time: "11:10", subject: "Literature-in-English", teacher: "Miss C. Nnamdi", room: "SS1 Sci A", color: "purple" as const },
  { time: "11:50", subject: "Physics", teacher: "Dr. N. Obi", room: "Phy Lab", color: "muted" as const },
  { time: "1:00", subject: "Biology Practical", teacher: "Mrs. F. Ajayi", room: "Sci Lab 1", color: "green" as const },
];

const upcomingAssignments = [
  { id: "ASN-3041", title: "Draw & label the mammalian heart", subject: "Biology", due: "Thu, Jul 30", status: { text: "Due in 2 days", variant: "orange" as const } },
  { id: "ASN-3042", title: "Balancing chemical equations worksheet", subject: "Chemistry", due: "Fri, Jul 31", status: { text: "Due in 3 days", variant: "orange" as const } },
  { id: "ASN-3039", title: "Critical appreciation of “The Gods Are Not to Blame”", subject: "Literature", due: "Mon, Aug 3", status: { text: "Due in 6 days", variant: "orange" as const } },
];

const notices = [
  { title: "Third Term results released", detail: "Your report sheet is now available on the Results page.", tag: "Exams", tone: "orange" as const },
  { title: "Inter-house sports trials every Thursday", detail: "Preliminary trials hold at the sports field by 4:00 pm.", tag: "Sports", tone: "green" as const },
  { title: "P.T.A. meeting this Friday, Jul 31 at 3:00 pm", detail: "Parents are encouraged to attend in the school hall.", tag: "General", tone: "blue" as const },
  { title: "Fee payment deadline extended to Aug 14", detail: "All outstanding balances for this session should be cleared on or before this date.", tag: "Fees", tone: "red" as const },
];

const toneDot: Record<string, string> = {
  green: "bg-green",
  red: "bg-red",
  orange: "bg-orange",
  blue: "bg-primary",
  purple: "bg-purple",
  muted: "bg-text-muted",
};

export default function StudentDashboardPage() {
  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Welcome back, Chidi"
        subtitle="Student dashboard · SS1 Science · STU-21401 · Third Term, 2025/2026"
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-text-dark mb-2">Today&apos;s Classes · Tue, Jul 28</h3>
          <Card className="divide-y divide-border-light">
            {todaysClasses.map((c) => (
              <div key={c.subject + c.time} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-16 shrink-0 text-xs tabular-nums text-text-muted">{c.time}</span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${toneDot[c.color]}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-dark">{c.subject}</p>
                    <p className="text-xs text-text-muted">
                      {c.teacher} · {c.room}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <Link
              href="/student/timetable"
              className="block text-center text-xs font-medium text-primary hover:underline py-3"
            >
              View full timetable →
            </Link>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-semibold text-text-dark mb-2">Upcoming Assignments</h3>
            <Card className="divide-y divide-border-light">
              {upcomingAssignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-dark truncate">{a.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {a.subject} · due {a.due}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={a.status.variant}>{a.status.text}</Badge>
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </div>
                </div>
              ))}
              <Link
                href="/student/assignments"
                className="block text-center text-xs font-medium text-primary hover:underline py-3"
              >
                View all assignments →
              </Link>
            </Card>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-dark mb-2">Latest Results · Third Term, 2025/2026</h3>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-text-muted">Term Average</p>
                  <p className="text-2xl font-bold text-text-dark font-display">78.0%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">Best Subject</p>
                  <p className="text-sm font-semibold text-text-dark">Literature-in-English 86%</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="green">A · 4 subjects</Badge>
                  <Badge variant="blue">B · 2 subjects</Badge>
                </div>
                <Link
                  href="/student/results"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View full report →
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-dark mb-2">School Notices</h3>
        <div className="grid grid-cols-2 gap-4">
          {notices.map((n) => (
            <Card key={n.title} className="p-5">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-semibold text-text-dark">{n.title}</p>
                <Badge variant={n.tone}>{n.tag}</Badge>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">{n.detail}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
