"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { uid } from "@/lib/app-store";

interface Role {
  id: string;
  role: string;
  description: string;
  users: string;
  permissions: string;
  status: { text: string; variant: "green" | "red" | "orange" | "muted" | "purple" | "blue" };
}

const initialData: Role[] = [
  { id: "r1", role: "Platform Admin", description: "Full platform administration access", users: "8", permissions: "42", status: { text: "Active", variant: "green" } },
  { id: "r2", role: "Institution Admin", description: "Institution-level management and config", users: "24", permissions: "35", status: { text: "Active", variant: "green" } },
  { id: "r3", role: "Support Agent", description: "Customer support operations", users: "12", permissions: "18", status: { text: "Active", variant: "green" } },
  { id: "r4", role: "Billing Manager", description: "Billing and subscription management", users: "4", permissions: "12", status: { text: "Inactive", variant: "muted" } },
  { id: "r5", role: "Auditor", description: "Read-only audit log access", users: "6", permissions: "8", status: { text: "Draft", variant: "muted" } },
];

const columns = [
  { key: "role", label: "ROLE NAME", width: "160px" },
  { key: "description", label: "DESCRIPTION", width: "280px" },
  { key: "users", label: "USERS", width: "80px" },
  { key: "permissions", label: "PERMISSIONS", width: "100px" },
  { key: "status", label: "STATUS", width: "100px" },
  { key: "actions", label: "ACTIONS", width: "170px", align: "right" as const },
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

const initialRolePerms: Record<string, string[]> = {
  "Platform Admin": permissions,
  "Institution Admin": permissions.slice(0, 4),
  "Support Agent": ["Manage Support Tickets", "View Analytics"],
  "Billing Manager": ["Manage Billing", "View Analytics"],
  "Auditor": ["View Analytics"],
};

const statusOptions = ["Active", "Inactive", "Draft"];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(initialData);
  const [rolePerms, setRolePerms] = useState<Record<string, string[]>>(initialRolePerms);

  const [open, setOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<Record<string, boolean>>({});

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editPerms, setEditPerms] = useState<Record<string, boolean>>({});

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [search, setSearch] = useState("");

  const togglePerm = (perm: string) => {
    setSelectedPerms((prev) => ({ ...prev, [perm]: !prev[perm] }));
  };

  const toggleEditPerm = (perm: string) => {
    setEditPerms((prev) => ({ ...prev, [perm]: !prev[perm] }));
  };

  const handleCreateRole = () => {
    if (!createName.trim()) return;
    const permsList = permissions.filter((p) => selectedPerms[p]);
    const newRole: Role = {
      id: uid(),
      role: createName.trim(),
      description: createDescription,
      users: "0",
      permissions: String(permsList.length),
      status: { text: "Active", variant: "green" },
    };
    setRoles((prev) => [...prev, newRole]);
    setRolePerms((prev) => ({ ...prev, [newRole.role]: permsList }));
    setOpen(false);
    setCreateName("");
    setCreateDescription("");
    setSelectedPerms({});
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setEditName(role.role);
    setEditDescription(role.description);
    setEditStatus(role.status.text);
    const permsMap: Record<string, boolean> = {};
    (rolePerms[role.role] ?? []).forEach((p) => { permsMap[p] = true; });
    setEditPerms(permsMap);
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingRole || !editName.trim()) return;
    const permsList = permissions.filter((p) => editPerms[p]);
    setRoles((prev) =>
      prev.map((r) =>
        r.id === editingRole.id
          ? {
              ...r,
              role: editName.trim(),
              description: editDescription,
              permissions: String(permsList.length),
              status: { text: editStatus, variant: editStatus === "Active" ? "green" : "muted" },
            }
          : r
      )
    );
    setRolePerms((prev) => {
      const next = { ...prev };
      delete next[editingRole.role];
      next[editName.trim()] = permsList;
      return next;
    });
    setEditOpen(false);
  };

  const handleDeleteRole = () => {
    if (!deletingRole) return;
    setRoles((prev) => prev.filter((r) => r.id !== deletingRole.id));
    setRolePerms((prev) => {
      const next = { ...prev };
      delete next[deletingRole.role];
      return next;
    });
    setDeleteOpen(false);
    setDeletingRole(null);
  };

  const q = search.trim().toLowerCase();
  const filteredRoles = roles.filter(
    (r) => !q || r.role.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
  );

  const dataWithActions = filteredRoles.map((row) => ({
    ...row,
    actions: (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedRole(row); setDetailOpen(true); }}>
          View
        </Button>
        <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
          Edit
        </Button>
        <button
          className="w-8 h-8 rounded-lg text-red hover:bg-red-light/50 flex items-center justify-center"
          aria-label="Delete"
          onClick={() => { setDeletingRole(row); setDeleteOpen(true); }}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ),
  }));

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Roles & Permissions"
        subtitle="Platform Admin / Roles & Permissions"
        actions={<Button onClick={() => setOpen(true)}>+ Create Role</Button>}
      />

      <div className="mb-6">
        <SearchInput placeholder="Search roles..." className="max-w-sm" value={search} onChange={setSearch} />
      </div>

      <DataTable columns={columns} data={dataWithActions} />
      <Pagination currentPage={1} totalPages={3} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create Role"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateRole}>Create Role</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Role Name" required>
            <TextInput placeholder="e.g. Content Manager" value={createName} onChange={(e) => setCreateName(e.target.value)} />
          </Field>
          <Field label="Description">
            <TextArea rows={3} placeholder="Describe this role's responsibilities..." value={createDescription} onChange={(e) => setCreateDescription(e.target.value)} />
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

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Role"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Role Name" required>
            <TextInput value={editName} onChange={(e) => setEditName(e.target.value)} />
          </Field>
          <Field label="Description">
            <TextArea rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
          </Field>
          <SelectField label="Status" options={statusOptions} value={editStatus} onChange={(e) => setEditStatus(e.target.value)} />
          <div>
            <span className="block text-xs font-medium text-text-dark mb-2">Permissions</span>
            <div className="flex flex-col gap-2">
              {permissions.map((perm) => (
                <label key={perm} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!editPerms[perm]}
                    onChange={() => toggleEditPerm(perm)}
                    className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary/30"
                  />
                  <span className="text-sm text-text-dark">{perm}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Role Details"
        footer={
          <Button variant="secondary" onClick={() => setDetailOpen(false)}>Close</Button>
        }
      >
        {selectedRole && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Role Name</span>
                <span className="text-sm text-text-dark">{selectedRole.role}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Status</span>
                <Badge variant={selectedRole.status.variant}>{selectedRole.status.text}</Badge>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Users</span>
                <span className="text-sm text-text-dark">{selectedRole.users}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Description</span>
                <span className="text-sm text-text-dark">{selectedRole.description}</span>
              </div>
            </div>
            <div>
              <span className="block text-xs font-medium text-text-muted mb-2">Permissions</span>
              <div className="flex flex-col gap-1.5">
                {(rolePerms[selectedRole.role] ?? []).map((perm) => (
                  <div key={perm} className="flex items-center gap-2 text-sm text-text-dark">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {perm}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Role"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteRole}>Delete</Button>
          </>
        }
      >
        {deletingRole && (
          <p className="text-sm text-text-dark">
            Are you sure you want to delete the role <span className="font-medium">{deletingRole.role}</span>? This action cannot be undone.
          </p>
        )}
      </Modal>
    </div>
  );
}