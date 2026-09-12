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

type StaffRow = {
  name: string;
  email: string;
  role: { text: string; variant: "blue" | "muted" };
  status: { text: string; variant: "green" | "red" };
  lastActive: string;
  institution: string;
};

const initialData: StaffRow[] = [
  { name: "Alex Morgan", email: "a.morgan@metrogroup.edu", role: { text: "Executive Director", variant: "blue" }, status: { text: "Active", variant: "green" }, lastActive: "10 min ago", institution: "Metro Education Group" },
  { name: "Priya Sharma", email: "p.sharma@metrogroup.edu", role: { text: "Regional Director", variant: "muted" }, status: { text: "Active", variant: "green" }, lastActive: "1 hr ago", institution: "Greenfield Academy" },
  { name: "James Chen", email: "j.chen@metrogroup.edu", role: { text: "Finance Director", variant: "muted" }, status: { text: "Active", variant: "green" }, lastActive: "3 hrs ago", institution: "Metropolitan Schools" },
  { name: "Sofia Reyes", email: "s.reyes@metrogroup.edu", role: { text: "Academic Director", variant: "muted" }, status: { text: "Active", variant: "green" }, lastActive: "2 hrs ago", institution: "Coastal Education Trust" },
  { name: "David Okafor", email: "d.okafor@metrogroup.edu", role: { text: "Compliance Officer", variant: "muted" }, status: { text: "Inactive", variant: "red" }, lastActive: "2 days ago", institution: "Pinnacle Learning" },
];

const columns = [
  { key: "name", label: "NAME", width: "160px" },
  { key: "email", label: "EMAIL", width: "200px" },
  { key: "role", label: "ROLE", width: "150px" },
  { key: "institution", label: "INSTITUTION", width: "180px" },
  { key: "status", label: "STATUS", width: "90px" },
  { key: "lastActive", label: "LAST ACTIVE", width: "110px" },
  { key: "actions", label: "ACTIONS", width: "80px", align: "right" as const },
];

export default function OrgStaffPage() {
  const [staff, setStaff] = useState<StaffRow[]>(initialData);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [viewItem, setViewItem] = useState<StaffRow | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviteNote, setInviteNote] = useState("");

  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("");
  const [staffDept, setStaffDept] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPhone, setStaffPhone] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const q = search.trim().toLowerCase();
  const filtered = staff.filter((row) => {
    const matchesSearch =
      !q ||
      row.name.toLowerCase().includes(q) ||
      row.email.toLowerCase().includes(q) ||
      row.role.text.toLowerCase().includes(q) ||
      row.institution.toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || row.role.text === roleFilter;
    const matchesStatus = statusFilter === "all" || row.status.text === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const tableData = filtered.map((row) => ({
    ...row,
    actions: (
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => setViewItem(row)}>View</Button>
      </div>
    ),
  }));

  function handleInvite() {
    if (!inviteName.trim()) return;
    setInviteOpen(false);
    setInviteName("");
    setInviteEmail("");
    setInviteRole("");
    setInviteNote("");
    showToast("Invite sent successfully");
  }

  function handleAddStaff() {
    if (!staffName.trim()) return;
    setAddStaffOpen(false);
    setStaffName("");
    setStaffRole("");
    setStaffDept("");
    setStaffEmail("");
    setStaffPhone("");
    showToast("Staff member added successfully");
  }

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
          <Select
            options={[{ label: "All Roles", value: "all" }, { label: "Executive Director", value: "Executive Director" }, { label: "Regional Director", value: "Regional Director" }, { label: "Finance Director", value: "Finance Director" }, { label: "Academic Director", value: "Academic Director" }, { label: "Compliance Officer", value: "Compliance Officer" }]}
            placeholder="All Roles"
            value={roleFilter}
            onChange={(val) => setRoleFilter(val)}
          />
          <Select
            options={[{ label: "All Statuses", value: "all" }, { label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }]}
            placeholder="All Statuses"
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
          />
          <SearchInput placeholder="Search by name or email..." className="flex-1" value={search} onChange={(val) => setSearch(val)} />
        </div>
      </Card>

      <DataTable columns={columns} data={tableData} />
      <Pagination currentPage={currentPage} totalPages={4} onPageChange={setCurrentPage} />

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite}>Send Invite</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Full Name" required>
            <TextInput placeholder="e.g. Jane Doe" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
          </Field>
          <Field label="Email" required>
            <TextInput type="email" placeholder="jane@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
          </Field>
          <SelectField label="Role" required placeholder="Select role" options={["Admin", "Principal", "Teacher"]} value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} />
          <Field label="Note">
            <TextInput placeholder="Optional note for the invitee" value={inviteNote} onChange={(e) => setInviteNote(e.target.value)} />
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
            <Button onClick={handleAddStaff}>Add Staff</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Full Name" required>
            <TextInput placeholder="e.g. Jane Doe" value={staffName} onChange={(e) => setStaffName(e.target.value)} />
          </Field>
          <SelectField label="Role" required placeholder="Select role" options={["Admin", "Principal", "Teacher"]} value={staffRole} onChange={(e) => setStaffRole(e.target.value)} />
          <SelectField label="Department" required placeholder="Select department" options={["Academic", "Finance", "HR", "Operations", "IT"]} value={staffDept} onChange={(e) => setStaffDept(e.target.value)} />
          <Field label="Email" required>
            <TextInput type="email" placeholder="jane@example.com" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} />
          </Field>
          <Field label="Phone">
            <TextInput type="tel" placeholder="+1 234 567 890" value={staffPhone} onChange={(e) => setStaffPhone(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title={viewItem?.name ?? ""}
        subtitle={viewItem?.email}
        footer={<Button variant="secondary" onClick={() => setViewItem(null)}>Close</Button>}
      >
        {viewItem && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-text-muted">Role</span>
                <div className="mt-0.5"><Badge variant={viewItem.role.variant}>{viewItem.role.text}</Badge></div>
              </div>
              <div>
                <span className="text-xs text-text-muted">Status</span>
                <div className="mt-0.5"><Badge variant={viewItem.status.variant}>{viewItem.status.text}</Badge></div>
              </div>
              <div>
                <span className="text-xs text-text-muted">Institution</span>
                <p className="text-sm font-medium text-text-dark">{viewItem.institution}</p>
              </div>
              <div>
                <span className="text-xs text-text-muted">Last Active</span>
                <p className="text-sm font-medium text-text-dark">{viewItem.lastActive}</p>
              </div>
            </div>
            <div className="border-t border-border-light pt-4">
              <span className="text-xs text-text-muted">Email</span>
              <p className="text-sm font-medium text-text-dark">{viewItem.email}</p>
            </div>
          </div>
        )}
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}