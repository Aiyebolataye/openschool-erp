"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { SelectField } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import type { TableRow } from "@/types";

interface ResultRow {
  subject: string;
  ca: number;
  exam: number;
}

interface TermData {
  term: string;
  position: string;
  rows: ResultRow[];
}

const terms: TermData[] = [
  {
    term: "Third Term · 2025/2026",
    position: "3rd of 42",
    rows: [
      { subject: "Biology", ca: 25, exam: 58 },
      { subject: "Chemistry", ca: 23, exam: 52 },
      { subject: "Physics", ca: 22, exam: 50 },
      { subject: "Mathematics", ca: 21, exam: 49 },
      { subject: "English Language", ca: 24, exam: 58 },
      { subject: "Literature-in-English", ca: 26, exam: 60 },
    ],
  },
  {
    term: "Second Term · 2025/2026",
    position: "5th of 42",
    rows: [
      { subject: "Biology", ca: 24, exam: 56 },
      { subject: "Chemistry", ca: 21, exam: 49 },
      { subject: "Physics", ca: 20, exam: 47 },
      { subject: "Mathematics", ca: 19, exam: 45 },
      { subject: "English Language", ca: 23, exam: 55 },
      { subject: "Literature-in-English", ca: 24, exam: 58 },
    ],
  },
  {
    term: "First Term · 2025/2026",
    position: "6th of 42",
    rows: [
      { subject: "Biology", ca: 22, exam: 54 },
      { subject: "Chemistry", ca: 20, exam: 50 },
      { subject: "Physics", ca: 18, exam: 44 },
      { subject: "Mathematics", ca: 16, exam: 40 },
      { subject: "English Language", ca: 21, exam: 50 },
      { subject: "Literature-in-English", ca: 23, exam: 55 },
    ],
  },
];

const termOptions = terms.map((t) => t.term);

function gradeFor(total: number) {
  if (total >= 75) return { grade: "A", remark: "Excellent", variant: "green" as const };
  if (total >= 65) return { grade: "B", remark: "Very Good", variant: "blue" as const };
  if (total >= 60) return { grade: "C", remark: "Credit", variant: "orange" as const };
  if (total >= 50) return { grade: "D", remark: "Pass", variant: "purple" as const };
  return { grade: "F", remark: "Fail", variant: "red" as const };
}

const columns = [
  { key: "subject", label: "SUBJECT" },
  { key: "ca", label: "CA (30)", width: "100px", align: "center" as const },
  { key: "exam", label: "EXAM (70)", width: "100px", align: "center" as const },
  { key: "total", label: "TOTAL", width: "90px", align: "center" as const },
  { key: "grade", label: "GRADE", width: "90px", align: "center" as const },
  { key: "remark", label: "REMARK", width: "140px" },
];

export default function StudentResultsPage() {
  const [term, setTerm] = useState(termOptions[0]);

  const active = terms.find((t) => t.term === term) ?? terms[0];
  const totalOf = (r: ResultRow) => r.ca + r.exam;
  const total = active.rows.reduce((sum, r) => sum + totalOf(r), 0);
  const average = (total / active.rows.length).toFixed(1);
  const best = active.rows.reduce((a, b) => (totalOf(a) >= totalOf(b) ? a : b));

  const standing =
    parseFloat(average) >= 75
      ? { text: "Distinction", variant: "green" as const }
      : parseFloat(average) >= 65
        ? { text: "Very Good", variant: "blue" as const }
        : parseFloat(average) >= 60
          ? { text: "Good", variant: "orange" as const }
          : { text: "Fair", variant: "purple" as const };

  const rows: TableRow[] = active.rows.map((r) => {
    const g = gradeFor(totalOf(r));
    return {
      subject: <span className="text-sm font-medium text-text-dark">{r.subject}</span>,
      ca: r.ca,
      exam: r.exam,
      total: totalOf(r),
      grade: { text: g.grade, variant: g.variant },
      remark: g.remark,
    };
  });

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="My Results"
        subtitle="Termly report sheet · SS1 Science · 2025/2026 session"
      />

      <Card className="p-4 mb-6 max-w-sm">
        <SelectField
          label="Session / Term"
          options={termOptions}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </Card>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Term Average" value={`${average}%`} detail={`out of ${active.rows.length} subjects`} detailColor="green" />
        <StatCard label="Best Subject" value={best.subject} detail={`Highest total · ${totalOf(best)}%`} detailColor="blue" />
        <StatCard label="Class Position" value={active.position} detail="SS1 Science" detailColor="muted" />
      </div>

      <DataTable columns={columns} data={rows} />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-text-muted">Overall standing:</span>
        <Badge variant={standing.variant}>{standing.text}</Badge>
        <span className="text-xs text-text-muted">Average of 6 subjects · {active.term}</span>
      </div>
    </div>
  );
}
