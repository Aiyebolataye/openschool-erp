"use client";

import { useState } from "react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";

const kpis = [
  { label: "TOTAL MODULES", value: "24", detail: "platform-wide", detailColor: "muted" as const },
  { label: "ENABLED BY DEFAULT", value: "18", detail: "", detailColor: "green" as const },
  { label: "OPTIONAL MODULES", value: "6", detail: "per-plan", detailColor: "muted" as const },
];

const rows = [
  { module: "Academics", key: "academics", tier: { text: "Core", variant: "blue" as const }, status: { text: "Enabled by default", variant: "green" as const }, appliesTo: "All" },
  { module: "Attendance", key: "attendance", tier: { text: "Core", variant: "blue" as const }, status: { text: "Enabled by default", variant: "green" as const }, appliesTo: "All" },
  { module: "Finance & Billing", key: "finance", tier: { text: "Core", variant: "blue" as const }, status: { text: "Enabled by default", variant: "green" as const }, appliesTo: "All" },
  { module: "Summer School", key: "summer-school", tier: { text: "Optional", variant: "purple" as const }, status: { text: "Per-plan", variant: "orange" as const }, appliesTo: "Enterprise+" },
  { module: "Assignments", key: "assignments", tier: { text: "Core", variant: "blue" as const }, status: { text: "Enabled by default", variant: "green" as const }, appliesTo: "All" },
  { module: "Student Welfare", key: "student-welfare", tier: { text: "Optional", variant: "purple" as const }, status: { text: "Per-plan", variant: "orange" as const }, appliesTo: "Pro+" },
  { module: "Calendar", key: "calendar", tier: { text: "Core", variant: "blue" as const }, status: { text: "Enabled by default", variant: "green" as const }, appliesTo: "All" },
  { module: "Communication", key: "communication", tier: { text: "Core", variant: "blue" as const }, status: { text: "Enabled by default", variant: "green" as const }, appliesTo: "All" },
  { module: "Reports & Analytics", key: "reports", tier: { text: "Core", variant: "blue" as const }, status: { text: "Enabled by default", variant: "green" as const }, appliesTo: "All" },
];

const columns = [
  { key: "module", label: "MODULE", width: "180px" },
  { key: "key", label: "KEY", width: "170px" },
  { key: "tier", label: "TIER", width: "100px" },
  { key: "status", label: "STATUS", width: "160px" },
  { key: "appliesTo", label: "APPLIES TO", width: "130px" },
  { key: "actions", label: "ACTIONS", width: "110px", align: "right" as const },
];

export default function ModulesPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<typeof rows[number] | null>(null);
  const [tier, setTier] = useState("");
  const [status, setStatus] = useState("");

  const data = rows.map((row) => ({
    ...row,
    actions: (
      <Button variant="ghost" size="sm" onClick={() => setSelected(row)}>
        Configure
      </Button>
    ),
  }));

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Platform Modules"
        subtitle="Platform Admin / Modules"
        actions={<Button onClick={() => setOpen(true)}>+ New Module</Button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select options={[{ label: "All Tiers", value: "all" }]} placeholder="All Tiers" />
          <Select options={[{ label: "All Statuses", value: "all" }]} placeholder="All Statuses" />
          <SearchInput placeholder="Search modules..." className="flex-1" />
        </div>
      </Card>

      <DataTable columns={columns} data={data} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New Module"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Create Module</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Module Name" required>
            <TextInput placeholder="e.g. Virtual Classroom" />
          </Field>
          <Field label="Module Key" required>
            <TextInput placeholder="e.g. virtual-classroom" />
          </Field>
          <SelectField label="Tier" required placeholder="Select tier" options={["Core", "Optional"]} value={tier} onChange={(e) => setTier(e.target.value)} />
          <SelectField label="Status" required placeholder="Select status" options={["Enabled by default", "Per-plan / Optional"]} value={status} onChange={(e) => setStatus(e.target.value)} />
          <Field label="Short Description">
            <TextArea rows={3} placeholder="What this module does..." />
          </Field>
        </div>
      </Modal>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.module ?? "Module Configuration"}
        footer={
          <Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>
        }
      >
        {selected && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Key</span>
              <span className="font-mono font-medium text-text-dark">{selected.key}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Tier</span>
              <Badge variant={selected.tier.variant}>{selected.tier.text}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Status</span>
              <Badge variant={selected.status.variant}>{selected.status.text}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Applies To</span>
              <span className="font-medium text-text-dark">{selected.appliesTo}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
