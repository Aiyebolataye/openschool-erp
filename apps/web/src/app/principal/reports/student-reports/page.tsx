"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { useDiscReports, useDiscCases, uid } from "@/lib/app-store";
import { Check, X } from "lucide-react";

export default function PrincipalStudentReportsPage() {
  const [reports, setReports] = useDiscReports();
  const [, setCases] = useDiscCases();
  const pending = reports.filter((r) => r.status === "pending");
  const decided = reports.filter((r) => r.status !== "pending");

  const approve = (id: string) => {
    const report = reports.find((r) => r.id === id);
    if (!report) return;
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)));
    setCases((prev) => [
      ...prev,
      {
        id: uid(),
        studentName: report.studentName,
        studentId: report.studentId,
        className: report.className,
        reason: report.reason,
        date: report.date,
        status: "open",
      },
    ]);
  };

  const reject = (id: string) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)));
  };

  const pendingList = (
    <Card className="divide-y divide-border-light">
      {pending.length === 0 && (
        <p className="px-5 py-10 text-center text-sm text-text-muted">No pending reports from teachers.</p>
      )}
      {pending.map((r) => (
        <div key={r.id} className="px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-dark">{r.studentName} <span className="text-text-muted">· {r.className}</span></p>
              <p className="text-xs text-text-muted mt-0.5">Reported by {r.reportedBy} · {r.date}</p>
            </div>
            <Badge variant="orange">Pending</Badge>
          </div>
          <div className="mt-3 rounded-lg bg-surface p-3">
            <p className="text-xs font-semibold text-text-dark uppercase tracking-wide mb-1">{r.reason}</p>
            <p className="text-xs text-text-muted">{r.details || "No additional details provided."}</p>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" onClick={() => approve(r.id)}>
              <Check className="w-4 h-4" /> Accept & Save as Case
            </Button>
            <Button variant="secondary" size="sm" onClick={() => reject(r.id)}>
              <X className="w-4 h-4" /> Reject
            </Button>
            <Link href={`/teacher/students/${r.studentId}`}>
              <Button variant="ghost" size="sm">View Student</Button>
            </Link>
          </div>
        </div>
      ))}
    </Card>
  );

  const decidedList = (
    <Card className="divide-y divide-border-light">
      {decided.length === 0 && (
        <p className="px-5 py-10 text-center text-sm text-text-muted">No reviewed reports yet.</p>
      )}
      {decided.map((r) => (
        <div key={r.id} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-text-dark">{r.studentName} <span className="text-text-muted">· {r.reason}</span></p>
            <p className="text-xs text-text-muted mt-0.5">{r.date}</p>
          </div>
          <Badge variant={r.status === "approved" ? "green" : "red"}>
            {r.status === "approved" ? "Approved → Global Case" : "Rejected"}
          </Badge>
        </div>
      ))}
    </Card>
  );

  return (
    <div className="max-w-[900px] mx-auto">
      <PageHeader
        title="Student Reports"
        subtitle="Review reports submitted by teachers. Accepted reports are saved to the student profile as disciplinary cases."
      />
      <Tabs
        tabs={[
          { id: "pending", label: `Pending (${pending.length})`, content: <div className="space-y-3">{pendingList}</div> },
          { id: "decided", label: `Reviewed (${decided.length})`, content: <div className="space-y-3">{decidedList}</div> },
        ]}
      />
    </div>
  );
}
