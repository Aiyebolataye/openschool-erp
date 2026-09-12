"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
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
  { label: "ACTIVE TEMPLATES", value: "14", detail: "in catalogue", detailColor: "muted" as const },
  { label: "DRAFT TEMPLATES", value: "3", detail: "", detailColor: "orange" as const },
  { label: "INSTITUTIONS USING", value: "128", detail: "42% of base", detailColor: "green" as const },
];

const initialRows = [
  { name: "Standard Secondary School", category: { text: "Secondary", variant: "blue" as const }, modules: "Academics / Attendance / Finance / Calendar", status: { text: "Published", variant: "green" as const }, usedBy: "86" },
  { name: "Primary School", category: { text: "Primary", variant: "green" as const }, modules: "Academics / Attendance / Calendars", status: { text: "Published", variant: "green" as const }, usedBy: "24" },
  { name: "Boarding School", category: { text: "Boarding", variant: "purple" as const }, modules: "Academics / Hostel / Finance", status: { text: "Draft", variant: "orange" as const }, usedBy: "0" },
  { name: "International Baccalaureate", category: { text: "International", variant: "muted" as const }, modules: "Academics / Assessments / Reports", status: { text: "Published", variant: "green" as const }, usedBy: "18" },
];

type TemplateRow = {
  name: string;
  category: { text: string; variant: "blue" | "green" | "purple" | "muted" | "orange" };
  modules: string;
  status: { text: string; variant: "green" | "orange" };
  usedBy: string;
};

const columns = [
  { key: "name", label: "TEMPLATE", width: "220px" },
  { key: "category", label: "CATEGORY", width: "120px" },
  { key: "modules", label: "MODULES", width: "260px" },
  { key: "status", label: "STATUS", width: "110px" },
  { key: "usedBy", label: "USED BY", width: "90px" },
  { key: "actions", label: "ACTIONS", width: "130px", align: "right" as const },
];

export default function InstitutionTemplatesPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TemplateRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TemplateRow | null>(null);
  const [rows, setRows] = useState<TemplateRow[]>(initialRows);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  function handleDelete() {
    if (!deleteTarget) return;
    setRows((prev) => prev.filter((r) => r.name !== deleteTarget.name));
    setDeleteTarget(null);
  }

  const q = search.trim().toLowerCase();
  const filtered = rows.filter((row) => {
    const matchesSearch =
      !q ||
      row.name.toLowerCase().includes(q) ||
      row.category.text.toLowerCase().includes(q) ||
      row.status.text.toLowerCase().includes(q);
    const matchesCategory = !categoryFilter || row.category.text === categoryFilter;
    const matchesStatus = !statusFilter || row.status.text === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const data = filtered.map((row) => ({
    ...row,
    actions: (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="sm" onClick={() => setSelected(row)}>
          View
        </Button>
        <button
          type="button"
          onClick={() => setDeleteTarget(row)}
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-text-muted hover:text-red hover:bg-red-light/40 transition-colors"
          title="Delete template"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ),
  }));

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Institution Templates"
        subtitle="Platform Admin / Institution Templates"
        actions={<Button onClick={() => setOpen(true)}>+ New Template</Button>}
      />

      <div className="rounded-lg bg-primary-light/40 border border-primary/20 px-4 py-3 text-xs text-text-dark leading-relaxed mb-6">
        Institution Templates are pre-configured starting points for new institutions. A template bundles a preset set of modules, settings, and defaults so a new school (e.g. a Standard Secondary School) can be set up in one click instead of from scratch.
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select options={[{ label: "Primary", value: "Primary" }, { label: "Secondary", value: "Secondary" }, { label: "Boarding", value: "Boarding" }, { label: "International", value: "International" }]} placeholder="All Categories" value={categoryFilter} onChange={setCategoryFilter} />
          <Select options={[{ label: "Published", value: "Published" }, { label: "Draft", value: "Draft" }]} placeholder="All Statuses" value={statusFilter} onChange={setStatusFilter} />
          <SearchInput placeholder="Search templates..." className="flex-1" value={search} onChange={setSearch} />
        </div>
      </Card>

      <DataTable columns={columns} data={data} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New Institution Template"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Create Template</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Template Name" required>
            <TextInput placeholder="e.g. Standard Secondary School" />
          </Field>
          <SelectField label="Category" required placeholder="Select category" options={["Primary", "Secondary", "Boarding", "International", "Mixed"]} value={category} onChange={(e) => setCategory(e.target.value)} />
          <SelectField label="Status" required placeholder="Select status" options={["Draft", "Published"]} value={status} onChange={(e) => setStatus(e.target.value)} />
          <Field label="Description">
            <TextArea rows={3} placeholder="Describe the template..." />
          </Field>
        </div>
      </Modal>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "Template Details"}
        footer={
          <Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>
        }
      >
        {selected && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Category</span>
              <Badge variant={selected.category.variant}>{selected.category.text}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Modules</span>
              <span className="font-medium text-text-dark text-right max-w-[260px]">{selected.modules}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Status</span>
              <Badge variant={selected.status.variant}>{selected.status.text}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Used By</span>
              <span className="font-medium text-text-dark">{selected.usedBy} institutions</span>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Template"
        subtitle={deleteTarget?.name}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Template</Button>
          </>
        }
      >
        <p className="text-sm text-text-dark">
          Are you sure you want to delete <span className="font-medium">{deleteTarget?.name}</span>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
