"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea } from "@/components/ui/form";

const data = [
  { role: "Platform Admin", description: "Full platform administration access", users: "8", permissions: "42", status: { text: "Active", variant: "green" as const }, actions: "View" },
  { role: "Institution Admin", description: "Institution-level management and config", users: "24", permissions: "35", status: { text: "Active", variant: "green" as const }, actions: "View" },
  { role: "Support Agent", description: "Customer support operations", users: "12", permissions: "18", status: { text: "Active", variant: "green" as const }, actions: "View" },
  { role: "Billing Manager", description: "Billing and subscription management", users: "4", permissions: "12", status: { text: "Inactive", variant: "muted" as const }, actions: "View" },
  { role: "Auditor", description: "Read-only audit log access", users: "6", permissions: "8", status: { text: "Draft", variant: "muted" as const }, actions: "View" },
];

const columns = [
  { key: "role", label: "ROLE NAME", width: "160px" },
  { key: "description", label: "DESCRIPTION", width: "300px" },
  { key: "users", label: "USERS", width: "80px" },
  { key: "permissions", label: "PERMISSIONS", width: "100px" },
  { key: "status", label: "STATUS", width: "100px" },
  { key: "actions", label: "ACTIONS", width: "80px", align: "right" as const },
];

const permissions = [
  "Manage Users",
  "Manage Organizations",
  "Manage Institutions",
  "View Analytics",
  "Manage Billing",
  "Manage Support Tickets",
  "Manage Campaigns",
  "Manage Surveys",
];

export default function RolesPage() {
  const [open, setOpen] = useState(false);
  const [selectedPerms, setSelectedPerms] = useState<Record<string, boolean>>({});

  const togglePerm = (perm: string) => {
    setSelectedPerms((prev) => ({ ...prev, [perm]: !prev[perm] }));
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Roles & Permissions"
        subtitle="Platform Admin / Roles & Permissions"
        actions={<Button onClick={() => setOpen(true)}>+ Create Role</Button>}
      />

      <div className="mb-6">
        <SearchInput placeholder="Search roles..." className="max-w-sm" />
      </div>

      <DataTable columns={columns} data={data} />
      <Pagination currentPage={1} totalPages={3} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create Role"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Create Role</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Role Name" required>
            <TextInput placeholder="e.g. Content Manager" />
          </Field>
          <Field label="Description">
            <TextArea rows={3} placeholder="Describe this role's responsibilities..." />
          </Field>
          <div>
            <span className="block text-xs font-medium text-text-dark mb-2">Permissions</span>
            <div className="flex flex-col gap-2">
              {permissions.map((perm) => (
                <label key={perm} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selectedPerms[perm]}
                    onChange={() => togglePerm(perm)}
                    className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary/30"
                  />
                  <span className="text-sm text-text-dark">{perm}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
