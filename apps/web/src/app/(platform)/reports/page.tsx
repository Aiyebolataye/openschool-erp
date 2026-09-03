"use client";

import { useState } from "react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Download } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";

const kpis = [
  { label: "TOTAL REPORTS", value: "42", detail: "", detailColor: "muted" as const },
  { label: "GENERATED THIS MONTH", value: "18", detail: "+24% vs last month", detailColor: "green" as const },
  { label: "SCHEDULED REPORTS", value: "12", detail: "", detailColor: "muted" as const },
  { label: "ACTIVE VIEWERS", value: "89", detail: "", detailColor: "muted" as const },
];

const reports = [
  { name: "Monthly Revenue Summary", category: "Finance", frequency: "Monthly", lastGenerated: "Jul 1, 2026", status: { text: "Current", variant: "green" as const } },
  { name: "User Growth Analytics", category: "Growth", frequency: "Weekly", lastGenerated: "Jul 22, 2026", status: { text: "Current", variant: "green" as const } },
  { name: "Institution Performance", category: "Operations", frequency: "Monthly", lastGenerated: "Jul 1, 2026", status: { text: "Current", variant: "green" as const } },
  { name: "Support Ticket Analysis", category: "Support", frequency: "Weekly", lastGenerated: "Jul 22, 2026", status: { text: "Current", variant: "green" as const } },
  { name: "Subscription Churn Report", category: "Finance", frequency: "Monthly", lastGenerated: "Jul 1, 2026", status: { text: "Overdue", variant: "red" as const } },
  { name: "Platform Usage Dashboard", category: "Analytics", frequency: "Daily", lastGenerated: "Jul 27, 2026", status: { text: "Current", variant: "green" as const } },
];

export default function ReportsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Reports"
        subtitle="Platform Admin / Reports"
        actions={
          <>
            <Select options={[{ label: "All Categories", value: "all" }]} placeholder="All Categories" />
            <Button onClick={() => setOpen(true)}>+ Generate Report</Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <Card className="divide-y divide-border-light">
        {reports.map((report) => (
          <div key={report.name} className="flex items-center justify-between px-5 py-4 hover:bg-surface/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                <span className="text-primary text-sm font-semibold">📊</span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-dark">{report.name}</p>
                <p className="text-xs text-text-muted">{report.category} · {report.frequency} · Last: {report.lastGenerated}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={report.status.variant}>{report.status.text}</Badge>
              <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Generate Report"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Generate Report</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Report Type" required options={["Revenue", "User Growth", "Institution Performance", "Support", "Subscription Churn", "Usage"]} placeholder="Select report type" value="" onChange={() => {}} />
          <SelectField label="Scope" required options={["All Organizations", "Single Organization", "Platform-wide"]} placeholder="Select scope" value="" onChange={() => {}} />
          <Field label="Period" required>
            <TextInput placeholder="e.g. July 2026" />
          </Field>
          <SelectField label="Format" required options={["PDF", "Excel"]} placeholder="Select format" value="" onChange={() => {}} />
        </div>
      </Modal>
    </div>
  );
}
