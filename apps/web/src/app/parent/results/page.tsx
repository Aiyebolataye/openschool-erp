"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/ui/data-table";
import { SelectField } from "@/components/ui/form";
import type { TableRow, BadgeVariant } from "@/types";

interface Subject {
  subject: string;
  ca: number;
  exam: number;
  total: number;
  grade: string;
}

const results: Record<string, Subject[]> = {
  "Chidi Eze": [
    { subject: "Biology", ca: 34, exam: 54, total: 88, grade: "A" },
    { subject: "Chemistry", ca: 31, exam: 49, total: 80, grade: "A" },
    { subject: "Physics", ca: 29, exam: 46, total: 75, grade: "A" },
    { subject: "Mathematics", ca: 27, exam: 45, total: 72, grade: "B" },
    { subject: "English", ca: 23, exam: 37, total: 60, grade: "C" },
    { subject: "Literature", ca: 19, exam: 30, total: 49, grade: "D" },
  ],
  "Kayode Eze": [
    { subject: "Biology", ca: 30, exam: 42, total: 72, grade: "B" },
    { subject: "Chemistry", ca: 26, exam: 36, total: 62, grade: "C" },
    { subject: "Physics", ca: 28, exam: 40, total: 68, grade: "C" },
    { subject: "Mathematics", ca: 14, exam: 24, total: 38, grade: "F" },
    { subject: "English", ca: 33, exam: 51, total: 84, grade: "A" },
    { subject: "Literature", ca: 35, exam: 55, total: 90, grade: "A" },
  ],
};

const summaries: Record<string, { average: string; best: string; rank: string }> = {
  "Chidi Eze": { average: "70.7%", best: "Biology (88)", rank: "12th of 32" },
  "Kayode Eze": { average: "69.0%", best: "Literature (90)", rank: "15th of 32" },
};

const gradeVariant = (g: string): BadgeVariant => {
  if (g === "A") return "green";
  if (g === "B") return "blue";
  if (g === "C") return "purple";
  if (g === "D" || g === "E") return "orange";
  return "red";
};

const columns = [
  { key: "subject", label: "SUBJECT" },
  { key: "ca", label: "CA", align: "right" as const },
  { key: "exam", label: "EXAM", align: "right" as const },
  { key: "total", label: "TOTAL", align: "right" as const },
  { key: "grade", label: "GRADE", align: "center" as const },
];

export default function ParentResultsPage() {
  const [child, setChild] = useState("Chidi Eze");
  const rows: TableRow[] = results[child].map((s) => ({
    subject: s.subject,
    ca: String(s.ca),
    exam: String(s.exam),
    total: String(s.total),
    grade: <Badge variant={gradeVariant(s.grade)}>{s.grade}</Badge>,
  }));
  const summary = summaries[child];

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader title="Results" subtitle="Academic performance for your wards — Term 2 2026" />

      <div className="max-w-xs mb-6">
        <SelectField
          label="Child"
          options={Object.keys(results)}
          value={child}
          onChange={(e) => setChild(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Average" value={summary.average} detailColor="blue" detail="Term 2 2026" />
        <StatCard label="Best Subject" value={summary.best} detailColor="green" detail="Highest score" />
        <StatCard label="Class Rank" value={summary.rank} detailColor="muted" detail="of SS1 Science" />
      </div>

      <DataTable columns={columns} data={rows} />
    </div>
  );
}
