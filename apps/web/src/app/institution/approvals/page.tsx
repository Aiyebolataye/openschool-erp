"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";

const kpis = [
  { label: "Pending Approvals", value: "18", detail: "", detailColor: "orange" as const },
  { label: "Approved Today", value: "22", detail: "", detailColor: "green" as const },
  { label: "Rejected Today", value: "3", detail: "", detailColor: "red" as const },
  { label: "Delegated", value: "5", detail: "", detailColor: "muted" as const },
];

const data = [
  { item: { text: "Admission — Chidi Eze", variant: "muted" as const }, type: "Admission", submittedBy: "Admissions Office", submitted: "2h ago", priority: { text: "NORMAL", variant: "muted" as const }, actions: "Review" },
  { item: { text: "Fee waiver — Grace Lim", variant: "muted" as const }, type: "Fee Waiver", submittedBy: "Finance", submitted: "4h ago", priority: { text: "URGENT", variant: "red" as const }, actions: "Review" },
  { item: { text: "Results — SS2 Term 2", variant: "muted" as const }, type: "Results", submittedBy: "Mr. Obi", submitted: "1d ago", priority: { text: "NORMAL", variant: "muted" as const }, actions: "Review" },
  { item: { text: "Attendance correction — SS1", variant: "muted" as const }, type: "Attendance", submittedBy: "Mrs. Ajayi", submitted: "1d ago", priority: { text: "NORMAL", variant: "muted" as const }, actions: "Review" },
];

const columns = [
  { key: "item", label: "ITEM", width: "200px" },
  { key: "type", label: "TYPE", width: "110px" },
  { key: "submittedBy", label: "SUBMITTED BY", width: "140px" },
  { key: "submitted", label: "SUBMITTED", width: "100px" },
  { key: "priority", label: "PRIORITY", width: "90px" },
  { key: "actions", label: "ACTIONS", width: "80px", align: "right" as const },
];

export default function ApprovalsPage() {
  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Approval Center"
        subtitle="Review or delegate approvals across all workflows"
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  );
}
