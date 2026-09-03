"use client";

import { useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
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
  { label: "Total Institutions", value: "12", detail: "+2 this year", detailColor: "green" as const },
  { label: "Active", value: "10", detail: "", detailColor: "muted" as const },
  { label: "Trial", value: "1", detail: "", detailColor: "orange" as const },
  { label: "Suspended", value: "1", detail: "", detailColor: "red" as const },
];

const data = [
  { name: "Greenfield Academy", slug: "greenfield-academy", type: { text: "Secondary", variant: "muted" as const }, status: { text: "Active", variant: "green" as const }, students: "12,450", staff: "620", subscription: { text: "Enterprise", variant: "blue" as const }, health: { text: "Healthy", variant: "green" as const }, actions: "View" },
  { name: "Metropolitan Schools", slug: "metropolitan-schools", type: { text: "Mixed", variant: "muted" as const }, status: { text: "Active", variant: "green" as const }, students: "8,230", staff: "410", subscription: { text: "Pro", variant: "blue" as const }, health: { text: "Healthy", variant: "green" as const }, actions: "View" },
  { name: "Coastal Education Trust", slug: "coastal-ed-trust", type: { text: "Primary", variant: "muted" as const }, status: { text: "Trial", variant: "orange" as const }, students: "3,100", staff: "155", subscription: { text: "Starter", variant: "muted" as const }, health: { text: "Monitoring", variant: "orange" as const }, actions: "View" },
  { name: "Pinnacle Learning", slug: "pinnacle-learning", type: { text: "Secondary", variant: "muted" as const }, status: { text: "Suspended", variant: "red" as const }, students: "1,840", staff: "95", subscription: { text: "Basic", variant: "muted" as const }, health: { text: "Critical", variant: "red" as const }, actions: "View" },
  { name: "Sunrise International", slug: "sunrise-intl", type: { text: "Secondary", variant: "muted" as const }, status: { text: "Active", variant: "green" as const }, students: "4,210", staff: "210", subscription: { text: "Enterprise", variant: "blue" as const }, health: { text: "Healthy", variant: "green" as const }, actions: "View" },
];

const columns = [
  { key: "name", label: "INSTITUTION", width: "160px" },
  { key: "type", label: "TYPE", width: "80px" },
  { key: "status", label: "STATUS", width: "90px" },
  { key: "students", label: "STUDENTS", width: "80px" },
  { key: "staff", label: "STAFF", width: "70px" },
  { key: "subscription", label: "SUBSCRIPTION", width: "100px" },
  { key: "health", label: "HEALTH", width: "100px" },
  { key: "actions", label: "ACTIONS", width: "70px", align: "right" as const },
];

export default function OrgAdminInstitutionsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Institutions"
        subtitle="Manage institutions under your organization"
        actions={
          <>
            <Button variant="secondary">Link Existing</Button>
            <Button onClick={() => setOpen(true)}>+ Add Institution</Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select options={[{ label: "All Statuses", value: "all" }]} placeholder="All Statuses" />
          <Select options={[{ label: "All Subscriptions", value: "all" }]} placeholder="All Subscriptions" />
          <SearchInput placeholder="Search institutions..." className="flex-1" />
        </div>
      </Card>

      <DataTable columns={columns} data={data} />
      <Pagination currentPage={1} totalPages={3} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Institution"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Add Institution</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Institution Name" required>
            <TextInput placeholder="e.g. Greenfield Academy" />
          </Field>
          <SelectField label="Type" required placeholder="Select type" options={["Primary", "Secondary", "Mixed"]} />
          <Field label="Address">
            <TextInput placeholder="Street, City, State" />
          </Field>
          <Field label="Admin Name" required>
            <TextInput placeholder="e.g. Jane Doe" />
          </Field>
          <Field label="Admin Email" required>
            <TextInput type="email" placeholder="admin@example.com" />
          </Field>
          <Field label="Phone">
            <TextInput placeholder="(555) 123-4567" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
