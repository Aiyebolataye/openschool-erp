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

const initialData = [
  { user: "James Wilson", email: "j.wilson@metro.edu", role: { text: "Organization Admin", variant: "blue" as const }, status: { text: "Active", variant: "green" as const }, tenant: "Metro Education Group", lastActive: "1 hr ago" },
  { user: "Robert Kim", email: "r.kim@pinnacle.edu", role: { text: "Institution Admin", variant: "muted" as const }, status: { text: "Inactive", variant: "red" as const }, tenant: "Pinnacle Learning", lastActive: "2 days ago" },
  { user: "Aisha Patel", email: "a.patel@sunrise.edu", role: { text: "Organization Admin", variant: "blue" as const }, status: { text: "Active", variant: "green" as const }, tenant: "Sunrise Education Group", lastActive: "15 min ago" },
  { user: "Maria Garcia", email: "m.garcia@coastal.edu", role: { text: "Institution Admin", variant: "muted" as const }, status: { text: "Active", variant: "green" as const }, tenant: "Coastal Education Trust", lastActive: "3 hrs ago" },
  { user: "David Osei", email: "d.osei@greenfield.edu", role: { text: "Institution Admin", variant: "muted" as const }, status: { text: "Active", variant: "green" as const }, tenant: "Demo Academy", lastActive: "2 min ago" },
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

type UserRow = {
  user: string;
  email: string;
  role: { text: string; variant: "blue" | "muted" };
  status: { text: string; variant: "green" | "red" };
  tenant: string;
  lastActive: string;
};

function roleVariant(role: string): "blue" | "muted" {
  return role === "Organization Admin" ? "blue" : "muted";
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>(initialData);
  const [viewUser, setViewUser] = useState<UserRow | null>(null);
  const [editRole, setEditRole] = useState("");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviteNote, setInviteNote] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  function openUser(row: UserRow) {
    setViewUser(row);
    setEditRole(row.role.text);
  }

  function toggleStatus() {
    if (!viewUser) return;
    const next = viewUser.status.text === "Active" ? "Inactive" : "Active";
    const variant = next === "Active" ? "green" : "red";
    setUsers((prev) => prev.map((u) => (u.email === viewUser.email ? { ...u, status: { text: next, variant } } : u)));
    setViewUser((prev) => (prev ? { ...prev, status: { text: next, variant } } : prev));
  }

  function saveUser() {
    if (!viewUser) return;
    setUsers((prev) => prev.map((u) => (u.email === viewUser.email ? { ...u, role: { text: editRole, variant: roleVariant(editRole) } } : u)));
    setViewUser(null);
  }

  const q = search.trim().toLowerCase();
  const filtered = users.filter((u) => {
    const matchesSearch =
      !q ||
      u.user.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.tenant.toLowerCase().includes(q) ||
      u.role.text.toLowerCase().includes(q);
    const matchesRole = !roleFilter || u.role.text === roleFilter;
    const matchesStatus = !statusFilter || u.status.text === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const tableData = filtered.map((u) => ({
    ...u,
    actions: (
      <Button variant="ghost" size="sm" onClick={() => openUser(u)}>View</Button>
    ),
  }));

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Users"
        subtitle="Platform Admin / Users"
        actions={<Button onClick={() => setInviteOpen(true)}>Invite User</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select options={[{ label: "Organization Admin", value: "Organization Admin" }, { label: "Institution Admin", value: "Institution Admin" }]} placeholder="All Roles" value={roleFilter} onChange={setRoleFilter} />
          <Select options={[{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }]} placeholder="All Statuses" value={statusFilter} onChange={setStatusFilter} />
          <SearchInput placeholder="Search by name or email..." className="flex-1" value={search} onChange={setSearch} />
        </div>
      </Card>

      <DataTable columns={columns} data={tableData} />
      <Pagination currentPage={1} totalPages={170} />

      <Modal
        open={!!viewUser}
        onClose={() => setViewUser(null)}
        title={viewUser?.user ?? ""}
        subtitle={viewUser?.email}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setViewUser(null)}>Close</Button>
            <Button size="sm" onClick={saveUser}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-medium text-text-muted">User</span>
              <p className="text-sm text-text-dark mt-1">{viewUser?.user}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-text-muted">Email</span>
              <p className="text-sm text-text-dark mt-1">{viewUser?.email}</p>
            </div>
          </div>
          <SelectField label="Role" options={["Organization Admin", "Institution Admin"]} value={editRole} onChange={(e) => setEditRole(e.target.value)} />
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-text-muted">Status</span>
              <div className="mt-1"><Badge variant={viewUser?.status.variant}>{viewUser?.status.text}</Badge></div>
            </div>
            <Button variant="secondary" size="sm" onClick={toggleStatus}>Toggle to {viewUser?.status.text === "Active" ? "Inactive" : "Active"}</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-medium text-text-muted">Tenant</span>
              <p className="text-sm text-text-dark mt-1">{viewUser?.tenant}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-text-muted">Last Active</span>
              <p className="text-sm text-text-dark mt-1">{viewUser?.lastActive}</p>
            </div>
          </div>
        </div>
      </Modal>

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
        <div className="flex flex-col gap-4">
          <Field label="Full Name" required>
            <TextInput placeholder="e.g. Jane Doe" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
          </Field>
          <Field label="Email" required>
            <TextInput type="email" placeholder="e.g. jane@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
          </Field>
          <SelectField label="Role" required options={["Organization Admin", "Institution Admin"]} placeholder="Select role" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} />
          <Field label="Note">
            <TextArea rows={3} placeholder="Optional note for the invitee..." value={inviteNote} onChange={(e) => setInviteNote(e.target.value)} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}