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
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";

const kpis = [
  { label: "TOTAL INSTITUTIONS", value: "384", detail: "", detailColor: "muted" as const },
  { label: "ACTIVE", value: "312", detail: "81.3%", detailColor: "green" as const },
  { label: "STUDENTS", value: "89.2K", detail: "", detailColor: "muted" as const },
  { label: "STAFF", value: "12.5K", detail: "", detailColor: "muted" as const },
  { label: "CAMPUSES", value: "547", detail: "", detailColor: "muted" as const },
];

const data = [
  { institution: "Greenfield Primary", slug: "greenfield-primary", organization: "Greenfield Academy", status: { text: "Active", variant: "green" as const }, students: "2,450", staff: "186", plan: { text: "Pro", variant: "blue" as const }, created: "Jan 15, 2025", actions: "View" },
  { institution: "Metropolitan High", slug: "metro-high", organization: "Metropolitan Schools", status: { text: "Active", variant: "green" as const }, students: "3,120", staff: "245", plan: { text: "Enterprise", variant: "blue" as const }, created: "Mar 22, 2025", actions: "View" },
  { institution: "Coastal Elementary", slug: "coastal-elem", organization: "Standalone", status: { text: "Trial", variant: "orange" as const }, students: "890", staff: "72", plan: { text: "Starter", variant: "muted" as const }, created: "Jun 8, 2025", actions: "View" },
  { institution: "Pinnacle Academy", slug: "pinnacle-academy", organization: "Pinnacle Learning Center", status: { text: "Suspended", variant: "red" as const }, students: "1,840", staff: "134", plan: { text: "Basic", variant: "muted" as const }, created: "Nov 3, 2024", actions: "View" },
  { institution: "Sunrise International School", slug: "sunrise-intl", organization: "Standalone", status: { text: "Active", variant: "green" as const }, students: "4,210", staff: "312", plan: { text: "Enterprise", variant: "blue" as const }, created: "Aug 19, 2025", actions: "View" },
];

const columns = [
  { key: "institution", label: "INSTITUTION", width: "200px" },
  { key: "organization", label: "ORGANIZATION", width: "180px" },
  { key: "status", label: "STATUS", width: "100px" },
  { key: "students", label: "STUDENTS", width: "90px" },
  { key: "staff", label: "STAFF", width: "80px" },
  { key: "plan", label: "PLAN", width: "100px" },
  { key: "created", label: "CREATED", width: "120px" },
  { key: "actions", label: "ACTIONS", width: "80px", align: "right" as const },
];

export default function InstitutionsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Institutions"
        subtitle="Platform Admin / Institutions"
        actions={<Button onClick={() => setOpen(true)}>+ Add Institution</Button>}
      />

      <div className="grid grid-cols-5 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select options={[{ label: "All Organizations", value: "all" }, { label: "Standalone", value: "standalone" }]} placeholder="All Organizations" />
          <Select options={[{ label: "All Statuses", value: "all" }]} placeholder="All Statuses" />
          <SearchInput placeholder="Search institutions..." className="flex-1" />
        </div>
      </Card>

      <DataTable columns={columns} data={data} />
      <Pagination currentPage={1} totalPages={77} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Institution"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Create Institution</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Institution Name" required>
            <TextInput placeholder="e.g. Greenfield Primary" />
          </Field>
          <SelectField label="Organization" required options={["NONE / Standalone", "Greenfield Academy", "Metropolitan Schools", "Coastal Education", "Pinnacle Learning", "Sunrise International"]} placeholder="Select organization" value="" onChange={() => {}} />
          <SelectField label="Type" required options={["Primary", "Secondary", "Mixed"]} placeholder="Select type" value="" onChange={() => {}} />
          <Field label="Address">
            <TextInput placeholder="e.g. 123 Main St, City, State" />
          </Field>
          <Field label="Admin Email" required>
            <TextInput type="email" placeholder="e.g. admin@greenfield.edu" />
          </Field>
          <Field label="Phone">
            <TextInput type="tel" placeholder="e.g. +1 (555) 123-4567" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
