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

const initialRows = [
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

type ModuleRow = {
  module: string;
  key: string;
  tier: { text: string; variant: "blue" | "purple" };
  status: { text: string; variant: "green" | "orange" };
  appliesTo: string;
};

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
  const [selected, setSelected] = useState<ModuleRow | null>(null);
  const [tier, setTier] = useState("");
  const [status, setStatus] = useState("");
  const [rows, setRows] = useState<ModuleRow[]>(initialRows);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const q = search.trim().toLowerCase();
  const filtered = rows.filter((row) => {
    const matchesSearch =
      !q ||
      row.module.toLowerCase().includes(q) ||
      row.key.toLowerCase().includes(q) ||
      row.tier.text.toLowerCase().includes(q) ||
      row.status.text.toLowerCase().includes(q);
    const matchesTier = !tierFilter || row.tier.text === tierFilter;
    const matchesStatus = !statusFilter || row.status.text === statusFilter;
    return matchesSearch && matchesTier && matchesStatus;
  });

  const data = filtered.map((row) => ({
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

      <div className="rounded-lg bg-primary-light/40 border border-primary/20 px-4 py-3 text-xs text-text-dark leading-relaxed mb-6">
        Modules are the feature building-blocks of the platform. Every institution gets the Core modules by default; Optional modules are switched on per subscription plan (e.g. Summer School, Student Welfare). Turn a module on/off to control which features an institution can use.
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select options={[{ label: "Core", value: "Core" }, { label: "Optional", value: "Optional" }]} placeholder="All Tiers" value={tierFilter} onChange={setTierFilter} />
          <Select options={[{ label: "Enabled by default", value: "Enabled by default" }, { label: "Per-plan", value: "Per-plan" }]} placeholder="All Statuses" value={statusFilter} onChange={setStatusFilter} />
          <SearchInput placeholder="Search modules..." className="flex-1" value={search} onChange={setSearch} />
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
