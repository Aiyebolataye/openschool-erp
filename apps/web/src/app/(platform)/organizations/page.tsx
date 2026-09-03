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
  { label: "TOTAL ORGANIZATIONS", value: "127", detail: "+12 this month", detailColor: "green" as const },
  { label: "ACTIVE", value: "98", detail: "77.2%", detailColor: "green" as const },
  { label: "SUSPENDED", value: "18", detail: "14.2%", detailColor: "red" as const },
  { label: "TRIAL", value: "11", detail: "8.7%", detailColor: "orange" as const },
];

const data = [
  { org: "Greenfield Academy", slug: "greenfield-academy", status: { text: "Active", variant: "green" as const }, institutions: "5", students: "12,450", plan: { text: "Enterprise", variant: "blue" as const }, created: "Jan 15, 2025", actions: "View" },
  { org: "Metropolitan Schools", slug: "metropolitan-schools", status: { text: "Active", variant: "green" as const }, institutions: "3", students: "8,230", plan: { text: "Pro", variant: "blue" as const }, created: "Mar 22, 2025", actions: "View" },
  { org: "Coastal Education Trust", slug: "coastal-ed-trust", status: { text: "Trial", variant: "orange" as const }, institutions: "2", students: "3,100", plan: { text: "Starter", variant: "muted" as const }, created: "Jun 8, 2025", actions: "View" },
  { org: "Pinnacle Learning Center", slug: "pinnacle-learning", status: { text: "Suspended", variant: "red" as const }, institutions: "1", students: "1,840", plan: { text: "Basic", variant: "muted" as const }, created: "Nov 3, 2024", actions: "View" },
  { org: "Sunrise International", slug: "sunrise-intl", status: { text: "Active", variant: "green" as const }, institutions: "8", students: "24,600", plan: { text: "Enterprise", variant: "blue" as const }, created: "Aug 19, 2025", actions: "View" },
];

const columns = [
  { key: "org", label: "ORGANIZATION", width: "220px" },
  { key: "status", label: "STATUS", width: "100px" },
  { key: "institutions", label: "INSTITUTIONS", width: "100px" },
  { key: "students", label: "STUDENTS", width: "100px" },
  { key: "plan", label: "PLAN", width: "100px" },
  { key: "created", label: "CREATED", width: "120px" },
  { key: "actions", label: "ACTIONS", width: "80px", align: "right" as const },
];

export default function OrganizationsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Organizations"
        subtitle="Platform Admin / Organizations"
        actions={<Button onClick={() => setOpen(true)}>+ Add Organization</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select options={[{ label: "All Statuses", value: "all" }]} placeholder="All Statuses" />
          <Select options={[{ label: "All Plans", value: "all" }]} placeholder="All Plans" />
          <SearchInput placeholder="Search by name, slug, or email..." className="flex-1" />
        </div>
      </Card>

      <DataTable columns={columns} data={data} />
      <Pagination currentPage={1} totalPages={26} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Organization"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Create Organization</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Organization Name" required>
            <TextInput placeholder="e.g. Greenfield Academy" />
          </Field>
          <Field label="Domain" required>
            <TextInput placeholder="e.g. greenfield.edu" />
          </Field>
          <Field label="Admin Name" required>
            <TextInput placeholder="e.g. John Smith" />
          </Field>
          <Field label="Admin Email" required>
            <TextInput type="email" placeholder="e.g. admin@greenfield.edu" />
          </Field>
          <SelectField label="Plan" required options={["Starter", "Growth", "Enterprise"]} placeholder="Select plan" value="" onChange={() => {}} />
          <Field label="Phone">
            <TextInput type="tel" placeholder="e.g. +1 (555) 123-4567" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
