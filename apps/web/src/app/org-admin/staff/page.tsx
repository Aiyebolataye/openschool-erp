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
  { label: "Total Staff", value: "18", detail: "", detailColor: "muted" as const },
  { label: "Active", value: "16", detail: "", detailColor: "green" as const },
  { label: "Directors", value: "6", detail: "", detailColor: "muted" as const },
  { label: "Pending Invites", value: "2", detail: "", detailColor: "orange" as const },
];

const data = [
  { name: "Alex Morgan", email: "a.morgan@metrogroup.edu", role: { text: "Executive Director", variant: "blue" as const }, status: { text: "Active", variant: "green" as const }, lastActive: "10 min ago", actions: "View" },
  { name: "Priya Sharma", email: "p.sharma@metrogroup.edu", role: { text: "Regional Director", variant: "muted" as const }, status: { text: "Active", variant: "green" as const }, lastActive: "1 hr ago", actions: "View" },
  { name: "James Chen", email: "j.chen@metrogroup.edu", role: { text: "Finance Director", variant: "muted" as const }, status: { text: "Active", variant: "green" as const }, lastActive: "3 hrs ago", actions: "View" },
  { name: "Sofia Reyes", email: "s.reyes@metrogroup.edu", role: { text: "Academic Director", variant: "muted" as const }, status: { text: "Active", variant: "green" as const }, lastActive: "2 hrs ago", actions: "View" },
  { name: "David Okafor", email: "d.okafor@metrogroup.edu", role: { text: "Compliance Officer", variant: "muted" as const }, status: { text: "Inactive", variant: "red" as const }, lastActive: "2 days ago", actions: "View" },
];

const columns = [
  { key: "name", label: "NAME", width: "160px" },
  { key: "email", label: "EMAIL", width: "200px" },
  { key: "role", label: "ROLE", width: "150px" },
  { key: "status", label: "STATUS", width: "90px" },
  { key: "lastActive", label: "LAST ACTIVE", width: "110px" },
  { key: "actions", label: "ACTIONS", width: "70px", align: "right" as const },
];

export default function OrgStaffPage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [addStaffOpen, setAddStaffOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Organization Staff"
        subtitle="Organization-level users (separate from institution staff)"
        actions={
          <>
            <Button variant="secondary" onClick={() => setInviteOpen(true)}>Invite User</Button>
            <Button onClick={() => setAddStaffOpen(true)}>+ Add Staff</Button>
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
          <Select options={[{ label: "All Roles", value: "all" }]} placeholder="All Roles" />
          <Select options={[{ label: "All Statuses", value: "all" }]} placeholder="All Statuses" />
          <SearchInput placeholder="Search by name or email..." className="flex-1" />
        </div>
      </Card>

      <DataTable columns={columns} data={data} />
      <Pagination currentPage={1} totalPages={4} />

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={() => setInviteOpen(false)}>Send Invite</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Full Name" required>
            <TextInput placeholder="e.g. Jane Doe" />
          </Field>
          <Field label="Email" required>
            <TextInput type="email" placeholder="jane@example.com" />
          </Field>
          <SelectField label="Role" required placeholder="Select role" options={["Admin", "Principal", "Teacher"]} />
          <Field label="Note">
            <TextInput placeholder="Optional note for the invitee" />
          </Field>
        </div>
      </Modal>

      <Modal
        open={addStaffOpen}
        onClose={() => setAddStaffOpen(false)}
        title="Add Staff"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddStaffOpen(false)}>Cancel</Button>
            <Button onClick={() => setAddStaffOpen(false)}>Add Staff</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Full Name" required>
            <TextInput placeholder="e.g. Jane Doe" />
          </Field>
          <SelectField label="Role" required placeholder="Select role" options={["Admin", "Principal", "Teacher"]} />
          <SelectField label="Department" required placeholder="Select department" options={["Academic", "Finance", "HR", "Operations", "IT"]} />
          <Field label="Email" required>
            <TextInput type="email" placeholder="jane@example.com" />
          </Field>
          <Field label="Phone">
            <TextInput type="tel" placeholder="+1 234 567 890" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
