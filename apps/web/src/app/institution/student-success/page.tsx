"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { useDiscCases } from "@/lib/app-store";

const kpis = [
  { label: "Active Interventions", value: "14", detail: "", detailColor: "muted" as const },
  { label: "Open Discipline Cases", value: "5", detail: "", detailColor: "orange" as const },
  { label: "Welfare Alerts", value: "3", detail: "", detailColor: "red" as const },
  { label: "Portfolios Updated", value: "820", detail: "this week", detailColor: "green" as const },
];

const success = [
  { title: "Repeated absenteeism", student: "Amara Okafor · JSS2 B", level: { text: "HIGH", variant: "red" as const } },
  { title: "Academic decline flagged", student: "Tom Wallace · SS3 Art", level: { text: "MEDIUM", variant: "orange" as const } },
  { title: "Wellbeing check recommended", student: "Grace Lim · SS2 Science", level: { text: "LOW", variant: "muted" as const } },
];

const portfolio = [
  { student: "Chidi Eze", detail: "Academic record updated", date: "2h ago" },
  { student: "Amara Okafor", detail: "New certificate added", date: "1d ago" },
  { student: "Tom Wallace", detail: "Portfolio completed", date: "2d ago" },
];

function List({ rows }: { rows: { title: string; sub: string; status?: { text: string; variant: "green" | "red" | "orange" | "muted" | "blue" } }[] }) {
  return (
    <Card className="divide-y divide-border-light">
      {rows.map((r) => (
        <div key={r.title} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-text-dark">{r.title}</p>
            <p className="text-xs text-text-muted mt-0.5">{r.sub}</p>
          </div>
          {r.status && <Badge variant={r.status.variant}>{r.status.text}</Badge>}
        </div>
      ))}
    </Card>
  );
}

export default function StudentWelfarePage() {
  const [cases, setCases] = useDiscCases();
  const openCases = cases.filter((c) => c.status === "open");

  const resolveCase = (id: string) => {
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, status: "resolved", resolvedBy: "School Admin" } : c)));
  };

  return (
    <div className="max-w-[1000px] mx-auto">
      <PageHeader
        title="Student Welfare"
        subtitle="Student success, discipline, and portfolio management"
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) =>
          k.label === "Open Discipline Cases" ? (
            <StatCard key={k.label} label={k.label} value={String(openCases.length)} detail={openCases.length > 0 ? `${openCases.length} awaiting resolution` : "No open cases"} detailColor="orange" />
          ) : (
            <StatCard key={k.label} {...k} />
          )
        )}
      </div>

      <Tabs
        tabs={[
          { id: "success", label: "Student Success", content: <List rows={success.map((s) => ({ title: s.title, sub: s.student, status: s.level }))} /> },
          { id: "discipline", label: "Discipline", content: <div className="space-y-3"><Card className="divide-y divide-border-light">
            {cases.length === 0 && <p className="px-5 py-8 text-center text-sm text-text-muted">No disciplinary cases on record.</p>}
            {cases.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-4">
                <Link href={`/institution/student-success/case/${c.id}`} className="flex-1 min-w-0 group">
                  <p className="text-sm font-medium text-text-dark group-hover:text-primary">{c.reason}</p>
                  <p className="text-xs text-text-muted mt-0.5">{c.studentName} · {c.className} · {c.date}</p>
                  {c.resolvedBy && <p className="text-xs text-green mt-0.5">Resolved by {c.resolvedBy}</p>}
                </Link>
                <div className="flex items-center gap-3">
                  <Badge variant={c.status === "open" ? "orange" : "green"}>{c.status === "open" ? "Open" : "Resolved"}</Badge>
                  {c.status === "open" && (
                    <Button variant="secondary" size="sm" onClick={() => resolveCase(c.id)}>Mark Resolved</Button>
                  )}
                </div>
              </div>
            ))}
          </Card></div> },
          { id: "portfolio", label: "Portfolios", content: <List rows={portfolio.map((p) => ({ title: p.student, sub: `${p.detail} · ${p.date}` }))} /> },
        ]}
      />
    </div>
  );
}
