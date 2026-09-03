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
  { label: "TOTAL USERS", value: "847", detail: "+32 this month", detailColor: "green" as const },
  { label: "ORG ADMINS", value: "312", detail: "36.8%", detailColor: "muted" as const },
  { label: "INSTITUTION ADMINS", value: "490", detail: "57.9%", detailColor: "green" as const },
  { label: "PENDING INVITES", value: "45", detail: "", detailColor: "muted" as const },
];

const data = [
  { user: "James Wilson", email: "j.wilson@metro.edu", role: { text: "Organization Admin", variant: "blue" as const }, status: { text: "Active", variant: "green" as const }, tenant: "Metro Education Group", lastActive: "1 hr ago", actions: "View" },
  { user: "Robert Kim", email: "r.kim@pinnacle.edu", role: { text: "Institution Admin", variant: "muted" as const }, status: { text: "Inactive", variant: "red" as const }, tenant: "Pinnacle Learning", lastActive: "2 days ago", actions: "View" },
  { user: "Aisha Patel", email: "a.patel@sunrise.edu", role: { text: "Organization Admin", variant: "blue" as const }, status: { text: "Active", variant: "green" as const }, tenant: "Sunrise Education Group", lastActive: "15 min ago", actions: "View" },
  { user: "Maria Garcia", email: "m.garcia@coastal.edu", role: { text: "Institution Admin", variant: "muted" as const }, status: { text: "Active", variant: "green" as const }, tenant: "Coastal Education Trust", lastActive: "3 hrs ago", actions: "View" },
  { user: "David Osei", email: "d.osei@greenfield.edu", role: { text: "Institution Admin", variant: "muted" as const }, status: { text: "Active", variant: "green" as const }, tenant: "Greenfield Academy", lastActive: "2 min ago", actions: "View" },
];

const columns = [
  { key: "user", label: "USER", width: "180px" },
  { key: "email", label: "EMAIL", width: "200px" },
  { key: "role", label: "ROLE", width: "140px" },
  { key: "status", label: "STATUS", width: "90px" },
  { key: "tenant", label: "TENANT", width: "160px" },
  { key: "lastActive", label: "LAST ACTIVE", width: "100px" },
  { key: "actions", label: "ACTIONS", width: "80px", align: "right" as const },
];

export default function UsersPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Users"
        subtitle="Platform Admin / Users"
        actions={<Button onClick={() => setOpen(true)}>Invite User</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select options={[{ label: "All Roles", value: "all" }]} placeholder="All Roles" />
          <Select options={[{ label: "All Statuses", value: "all" }]} placeholder="All Statuses" />
          <SearchInput placeholder="Search by name or email..." className="flex-1" />
        </div>
      </Card>

      <DataTable columns={columns} data={data} />
      <Pagination currentPage={1} totalPages={170} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Invite User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Send Invite</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Full Name" required>
            <TextInput placeholder="e.g. Jane Doe" />
          </Field>
          <Field label="Email" required>
            <TextInput type="email" placeholder="e.g. jane@example.com" />
          </Field>
          <SelectField label="Role" required options={["Organization Admin", "Institution Admin"]} placeholder="Select role" value="" onChange={() => {}} />
          <SelectField label="Organization" required options={["Greenfield Academy", "Metropolitan Schools", "Coastal Education", "Pinnacle Learning", "Sunrise International"]} placeholder="Select organization" value="" onChange={() => {}} />
          <Field label="Note">
            <TextArea rows={3} placeholder="Optional note for the invitee..." />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
