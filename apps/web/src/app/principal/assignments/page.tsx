"use client";

import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";

const kpis = [
  { label: "Active Assignments", value: "34", detail: "", detailColor: "muted" as const },
  { label: "Awaiting Grading", value: "18", detail: "", detailColor: "orange" as const },
  { label: "Graded", value: "11", detail: "", detailColor: "green" as const },
  { label: "Overdue Submissions", value: "9", detail: "", detailColor: "red" as const },
];

const assignments = [
  { id: "asg-1", title: "Essay on Civic Responsibilities", cls: "SS1 Civic Ed", teacher: "Mrs. Ajayi", submissions: "38 / 42", due: "Aug 5", status: { text: "Active", variant: "green" as const } },
  { id: "asg-2", title: "Algebra Problem Set 4", cls: "JSS2 Math", teacher: "Mr. Obi", submissions: "42 / 45", due: "Aug 7", status: { text: "Active", variant: "green" as const } },
  { id: "asg-3", title: "Chemistry Lab Report", cls: "SS2 Chemistry", teacher: "Mr. Adeyemi", submissions: "31 / 38", due: "Aug 1", status: { text: "Grading", variant: "orange" as const } },
  { id: "asg-4", title: "Literature Essay — Poetry", cls: "SS2 Art", teacher: "Ms. Tran", submissions: "40 / 40", due: "Jul 30", status: { text: "Graded", variant: "muted" as const } },
];

const performance = [
  { subject: "Biology", avg: "74.2%", top: "Chidi Eze (96%)", atRisk: "2 students", flag: { text: "Healthy", variant: "green" as const } },
  { subject: "Mathematics", avg: "68.5%", top: "Ngozi Adeyemi (95%)", atRisk: "5 students", flag: { text: "At Risk", variant: "red" as const } },
  { subject: "English", avg: "79.8%", top: "Amara Okafor (91%)", atRisk: "1 student", flag: { text: "Healthy", variant: "green" as const } },
  { subject: "Chemistry", avg: "71.3%", top: "Tom Wallace (88%)", atRisk: "3 students", flag: { text: "Monitor", variant: "orange" as const } },
];

export default function PrincipalAssignmentsPage() {
  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Assignments"
        subtitle="View assignments created by teachers and monitor performance across subjects"
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Tabs
        tabs={[
          {
            id: "assignments",
            label: "All Assignments",
            content: (
              <Card className="divide-y divide-border-light">
                {assignments.map((a) => (
                  <Link
                    key={a.id}
                    href={`/principal/assignments/${a.id}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-surface-secondary transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-dark">{a.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{a.cls} · {a.teacher} · {a.submissions} · due {a.due}</p>
                    </div>
                    <Badge variant={a.status.variant as "green"}>{a.status.text}</Badge>
                  </Link>
                ))}
              </Card>
            ),
          },
          {
            id: "performance",
            label: "Performance",
            content: (
              <Card className="divide-y divide-border-light">
                {performance.map((p) => (
                  <div key={p.subject} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-text-dark">{p.subject}</p>
                      <p className="text-xs text-text-muted mt-0.5">Average: {p.avg} · Top: {p.top} · At Risk: {p.atRisk}</p>
                    </div>
                    <Badge variant={p.flag.variant as "green"}>{p.flag.text}</Badge>
                  </div>
                ))}
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
