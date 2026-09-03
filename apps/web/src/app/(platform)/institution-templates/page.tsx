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
  { label: "ACTIVE TEMPLATES", value: "14", detail: "in catalogue", detailColor: "muted" as const },
  { label: "DRAFT TEMPLATES", value: "3", detail: "", detailColor: "orange" as const },
  { label: "INSTITUTIONS USING", value: "128", detail: "42% of base", detailColor: "green" as const },
];

const data = [
  { name: "Standard Secondary School", category: { text: "Secondary", variant: "blue" as const }, modules: "Academics / Attendance / Finance / Calendar", status: { text: "Published", variant: "green" as const }, usedBy: "86", actions: "View" },
  { name: "Primary School", category: { text: "Primary", variant: "green" as const }, modules: "Academics / Attendance / Calendars", status: { text: "Published", variant: "green" as const }, usedBy: "24", actions: "View" },
  { name: "Boarding School", category: { text: "Boarding", variant: "purple" as const }, modules: "Academics / Hostel / Finance", status: { text: "Draft", variant: "orange" as const }, usedBy: "0", actions: "View" },
  { name: "International Baccalaureate", category: { text: "International", variant: "muted" as const }, modules: "Academics / Assessments / Reports", status: { text: "Published", variant: "green" as const }, usedBy: "18", actions: "View" },
];

const columns = [
  { key: "name", label: "TEMPLATE", width: "220px" },
  { key: "category", label: "CATEGORY", width: "120px" },
  { key: "modules", label: "MODULES", width: "260px" },
  { key: "status", label: "STATUS", width: "110px" },
  { key: "usedBy", label: "USED BY", width: "90px" },
  { key: "actions", label: "ACTIONS", width: "90px", align: "right" as const },
];

export default function InstitutionTemplatesPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Institution Templates"
        subtitle="Platform Admin / Institution Templates"
        actions={<Button onClick={() => setOpen(true)}>+ New Template</Button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select options={[{ label: "All Categories", value: "all" }]} placeholder="All Categories" />
          <Select options={[{ label: "All Statuses", value: "all" }]} placeholder="All Statuses" />
          <SearchInput placeholder="Search templates..." className="flex-1" />
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
          <SelectField label="Category" required placeholder="Select category" options={["Primary", "Secondary", "Boarding", "International", "Mixed"]} value="" onChange={() => {}} />
          <SelectField label="Status" required placeholder="Select status" options={["Draft", "Published"]} value="" onChange={() => {}} />
          <Field label="Description">
            <TextArea rows={3} placeholder="Describe the template..." />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
