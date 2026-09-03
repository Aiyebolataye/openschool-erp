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
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";

const kpis = [
  { label: "MESSAGES SENT", value: "12.4K", detail: "+8% vs last month", detailColor: "green" as const },
  { label: "TEMPLATES", value: "24", detail: "", detailColor: "muted" as const },
  { label: "CAMPAIGNS", value: "6", detail: "2 active", detailColor: "muted" as const },
  { label: "DELIVERY RATE", value: "98.2%", detail: "", detailColor: "green" as const },
];

const data = [
  { campaign: "Welcome Series", type: { text: "Email", variant: "blue" as const }, audience: "All New Users", status: { text: "Active", variant: "green" as const }, sent: "2,340", openRate: "68.2%", created: "Jun 1, 2026", actions: "View" },
  { campaign: "Monthly Newsletter", type: { text: "Email", variant: "blue" as const }, audience: "All Org Admins", status: { text: "Active", variant: "green" as const }, sent: "1,890", openRate: "54.1%", created: "Jul 1, 2026", actions: "View" },
  { campaign: "Trial Expiry Reminder", type: { text: "In-App", variant: "muted" as const }, audience: "Trial Users", status: { text: "Active", variant: "green" as const }, sent: "420", openRate: "82.3%", created: "May 15, 2026", actions: "View" },
  { campaign: "Maintenance Alert", type: { text: "SMS", variant: "orange" as const }, audience: "All Admins", status: { text: "Draft", variant: "muted" as const }, sent: "—", openRate: "—", created: "Jul 25, 2026", actions: "View" },
  { campaign: "Feature Announcement", type: { text: "Email", variant: "blue" as const }, audience: "Enterprise Plan", status: { text: "Completed", variant: "muted" as const }, sent: "890", openRate: "71.5%", created: "Jul 10, 2026", actions: "View" },
];

const columns = [
  { key: "campaign", label: "CAMPAIGN", width: "180px" },
  { key: "type", label: "TYPE", width: "80px" },
  { key: "audience", label: "AUDIENCE", width: "140px" },
  { key: "status", label: "STATUS", width: "100px" },
  { key: "sent", label: "SENT", width: "80px" },
  { key: "openRate", label: "OPEN RATE", width: "90px" },
  { key: "created", label: "CREATED", width: "110px" },
  { key: "actions", label: "ACTIONS", width: "80px", align: "right" as const },
];

export default function CommunicationPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Communication"
        subtitle="Platform Admin / Communication"
        actions={<Button onClick={() => setOpen(true)}>+ New Campaign</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select options={[{ label: "All Types", value: "all" }]} placeholder="All Types" />
          <Select options={[{ label: "All Statuses", value: "all" }]} placeholder="All Statuses" />
          <SearchInput placeholder="Search campaigns..." className="flex-1" />
        </div>
      </Card>

      <DataTable columns={columns} data={data} />
      <Pagination currentPage={1} totalPages={2} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New Campaign"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Create Campaign</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Campaign Name" required>
            <TextInput placeholder="e.g. Welcome Series" />
          </Field>
          <SelectField label="Channel" required options={["Email", "SMS", "Push", "In-App"]} placeholder="Select channel" value="" onChange={() => {}} />
          <SelectField label="Audience" required options={["All Users", "Org Admins", "Institution Admins"]} placeholder="Select audience" value="" onChange={() => {}} />
          <Field label="Subject">
            <TextInput placeholder="e.g. Welcome to the platform!" />
          </Field>
          <Field label="Body" required>
            <TextArea rows={5} placeholder="Write your campaign message..." />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
