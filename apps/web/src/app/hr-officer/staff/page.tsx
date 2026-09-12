"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import type { TableRow } from "@/types";
import { UserPlus, Phone, Mail, FileText, Pencil } from "lucide-react";

type StaffStatus = "Active" | "Leave";
type DocsStatus = "Complete" | "Pending";

interface Staff {
  id: string;
  name: string;
  role: string;
  dept: string;
  salary: number;
  email: string;
  phone: string;
  status: StaffStatus;
  docs: DocsStatus;
  joined: string;
  gender: string;
}

const initialStaff: Staff[] = [
  { id: "EMP-1001", name: "Chief Ebere Nnamdi", role: "Principal", dept: "Admin & Management", salary: 650000, email: "e.nnamdi@greenfield.edu", phone: "+234 810 555 1001", status: "Active", docs: "Complete", joined: "Sep 2012", gender: "Male" },
  { id: "EMP-1002", name: "Dr. Folake Akinwande", role: "Vice Principal (Academics)", dept: "Admin & Management", salary: 480000, email: "f.akinwande@greenfield.edu", phone: "+234 810 555 1002", status: "Active", docs: "Complete", joined: "Jan 2015", gender: "Female" },
  { id: "EMP-1003", name: "Mrs. Yetunde Alabi", role: "Bursar", dept: "Finance", salary: 350000, email: "y.alabi@greenfield.edu", phone: "+234 810 555 1003", status: "Active", docs: "Pending", joined: "Mar 2014", gender: "Female" },
  { id: "EMP-1004", name: "Mr. Chukwuemeka Obi", role: "Physics Teacher", dept: "Sciences", salary: 320000, email: "c.obi@greenfield.edu", phone: "+234 810 555 1004", status: "Active", docs: "Complete", joined: "Sep 2017", gender: "Male" },
  { id: "EMP-1005", name: "Mrs. Adaeze Okafor", role: "Chemistry Teacher", dept: "Sciences", salary: 310000, email: "a.okafor@greenfield.edu", phone: "+234 810 555 1005", status: "Leave", docs: "Complete", joined: "Sep 2016", gender: "Female" },
  { id: "EMP-1006", name: "Mr. Emeka Nwosu", role: "Mathematics Teacher", dept: "Sciences", salary: 300000, email: "e.nwosu@greenfield.edu", phone: "+234 810 555 1006", status: "Active", docs: "Complete", joined: "Jan 2018", gender: "Male" },
  { id: "EMP-1007", name: "Miss Funke Adeyemi", role: "English Teacher", dept: "Languages", salary: 290000, email: "f.adeyemi@greenfield.edu", phone: "+234 810 555 1007", status: "Leave", docs: "Pending", joined: "Sep 2019", gender: "Female" },
  { id: "EMP-1008", name: "Mr. Segun Oyelaran", role: "Biology Teacher", dept: "Sciences", salary: 285000, email: "s.oyelaran@greenfield.edu", phone: "+234 810 555 1008", status: "Active", docs: "Complete", joined: "Sep 2018", gender: "Male" },
  { id: "EMP-1009", name: "Mr. Tunde Bakare", role: "Accountant", dept: "Finance", salary: 260000, email: "t.bakare@greenfield.edu", phone: "+234 810 555 1009", status: "Active", docs: "Pending", joined: "Jan 2020", gender: "Male" },
  { id: "EMP-1010", name: "Mrs. Ngozi Bello", role: "HR & Payroll Officer", dept: "Admin & Management", salary: 280000, email: "n.bello@greenfield.edu", phone: "+234 810 555 1010", status: "Active", docs: "Complete", joined: "Jan 2019", gender: "Female" },
  { id: "EMP-1011", name: "Miss Blessing Eze", role: "Admin Secretary", dept: "Admin & Management", salary: 150000, email: "b.eze@greenfield.edu", phone: "+234 810 555 1011", status: "Active", docs: "Complete", joined: "Sep 2021", gender: "Female" },
  { id: "EMP-1012", name: "Mr. Dipo Salako", role: "Groundsman", dept: "Operations", salary: 120000, email: "d.salako@greenfield.edu", phone: "+234 810 555 1012", status: "Active", docs: "Pending", joined: "Jan 2022", gender: "Male" },
];

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const statusBadge = (s: StaffStatus) =>
  s === "Active"
    ? { text: "Active", variant: "green" as const }
    : { text: "On leave", variant: "orange" as const };

const docsBadge = (d: DocsStatus) =>
  d === "Complete"
    ? { text: "Complete", variant: "green" as const }
    : { text: "Pending", variant: "orange" as const };

const columns = [
  { key: "staff", label: "STAFF" },
  { key: "role", label: "ROLE" },
  { key: "dept", label: "DEPARTMENT" },
  { key: "salary", label: "SALARY" },
  { key: "email", label: "EMAIL" },
  { key: "status", label: "STATUS" },
];

export default function HrOfficerStaffPage() {
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Staff | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDept, setNewDept] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editSalary, setEditSalary] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStatus, setEditStatus] = useState<StaffStatus>("Active");
  const [editDocs, setEditDocs] = useState<DocsStatus>("Complete");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const deptOptions = Array.from(new Set(staff.map((s) => s.dept)));

  const q = search.trim().toLowerCase();
  const filtered = staff.filter(
    (s) =>
      (!dept || s.dept === dept) &&
      (!q ||
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.dept.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q))
  );

  const rows: TableRow[] = filtered.map((s) => ({
    staff: (
      <div>
        <p className="text-sm font-medium text-text-dark">{s.name}</p>
        <p className="text-xs text-text-muted">{s.id}</p>
      </div>
    ),
    role: s.role,
    dept: s.dept,
    salary: (
      <div>
        <p className="text-sm font-medium text-text-dark">{naira(s.salary)}</p>
        <p className="text-xs text-text-muted">monthly</p>
      </div>
    ),
    email: s.email,
    status: statusBadge(s.status),
  }));

  const openDetail = (row: TableRow, i: number) => {
    setSelected(filtered[i]);
    setDetailOpen(true);
  };

  const openEdit = () => {
    if (!selected) return;
    setEditName(selected.name);
    setEditRole(selected.role);
    setEditDept(selected.dept);
    setEditSalary(String(selected.salary));
    setEditEmail(selected.email);
    setEditPhone(selected.phone);
    setEditStatus(selected.status);
    setEditDocs(selected.docs);
    setDetailOpen(false);
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!selected || !editName.trim() || !editRole.trim() || !editDept) return;
    const salary = Number(editSalary);
    if (!salary) return;
    setStaff((prev) =>
      prev.map((s) =>
        s.id === selected.id
          ? {
              ...s,
              name: editName.trim(),
              role: editRole.trim(),
              dept: editDept,
              salary,
              email: editEmail.trim(),
              phone: editPhone.trim() || s.phone,
              status: editStatus,
              docs: editDocs,
            }
          : s
      )
    );
    setSelected({
      ...selected,
      name: editName.trim(),
      role: editRole.trim(),
      dept: editDept,
      salary,
      email: editEmail.trim(),
      phone: editPhone.trim() || selected.phone,
      status: editStatus,
      docs: editDocs,
    });
    setEditOpen(false);
    showToast(`Staff record updated for ${editName.trim()}`);
  };

  const addStaff = () => {
    if (!newName.trim() || !newRole.trim() || !newDept) return;
    const salary = Number(newSalary);
    const maxId = Math.max(...staff.map((s) => parseInt(s.id.slice(4), 10)));
    setStaff((prev) => [
      ...prev,
      {
        id: `EMP-${maxId + 1}`,
        name: newName.trim(),
        role: newRole.trim(),
        dept: newDept,
        salary: salary || 150000,
        email: newEmail.trim() || `${newName.trim().toLowerCase().replace(/\s+/g, ".")}@greenfield.edu`,
        phone: newPhone.trim() || "+234 810 555 0000",
        status: "Active",
        docs: "Pending",
        joined: "Sep 2026",
        gender: "Female",
      },
    ]);
    setNewName("");
    setNewRole("");
    setNewDept("");
    setNewSalary("");
    setNewEmail("");
    setNewPhone("");
    setAddOpen(false);
    showToast(`${newName.trim()} added to staff records`);
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Staff Records"
        subtitle="Manage staff information and employment details"
        actions={<Button onClick={() => setAddOpen(true)}>+ Add Staff</Button>}
      />

      <Card className="p-4 mb-6 flex flex-col gap-4">
        <SearchInput
          placeholder="Search by name, ID, role, department or email..."
          value={search}
          onChange={setSearch}
          className="max-w-md"
        />
        <div className="max-w-xs">
          <SelectField
            label="Department"
            placeholder="All departments"
            options={deptOptions}
            value={dept}
            onChange={(e) => setDept(e.target.value)}
          />
        </div>
      </Card>

      <DataTable columns={columns} data={rows} onRowClick={openDetail} />

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.name ?? ""}
        subtitle={selected ? `${selected.id} · ${selected.role}` : undefined}
        footer={
          selected && (
            <>
              <Button variant="secondary" onClick={() => setDetailOpen(false)}>Close</Button>
              <Button onClick={openEdit}>
                <Pencil className="w-4 h-4" /> Edit
              </Button>
            </>
          )
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border-light p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Employment Status</p>
                <p className="text-sm font-medium text-text-dark">{selected.status}</p>
              </div>
              <Badge variant={statusBadge(selected.status).variant}>{selected.status}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted">Department</p>
                <p className="text-sm font-medium text-text-dark mt-0.5">{selected.dept}</p>
              </div>
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted">Monthly Salary</p>
                <p className="text-sm font-medium text-text-dark mt-0.5">{naira(selected.salary)}</p>
              </div>
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone
                </p>
                <p className="text-sm font-medium text-text-dark mt-0.5">{selected.phone}</p>
              </div>
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </p>
                <p className="text-sm font-medium text-text-dark mt-0.5 truncate">{selected.email}</p>
              </div>
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted">Joined</p>
                <p className="text-sm font-medium text-text-dark mt-0.5">{selected.joined}</p>
              </div>
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted">Gender</p>
                <p className="text-sm font-medium text-text-dark mt-0.5">{selected.gender}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border-light p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Documentation</p>
                  <p className="text-sm font-medium text-text-dark">Employment file & credentials</p>
                </div>
              </div>
              <Badge variant={docsBadge(selected.docs).variant}>{selected.docs}</Badge>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Staff"
        subtitle={selected ? `${selected.name} · ${selected.id}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Full Name" required>
            <TextInput
              placeholder="Enter full name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Role" required>
              <TextInput
                placeholder="e.g. Chemistry Teacher"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
              />
            </Field>
            <Field label="Monthly Salary (₦)" required>
              <TextInput
                type="number"
                placeholder="e.g. 310000"
                value={editSalary}
                onChange={(e) => setEditSalary(e.target.value)}
              />
            </Field>
          </div>
          <SelectField
            label="Department"
            required
            placeholder="Select department"
            options={deptOptions}
            value={editDept}
            onChange={(e) => setEditDept(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <TextInput
                type="email"
                placeholder="name@greenfield.edu"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </Field>
            <Field label="Phone">
              <TextInput
                type="tel"
                placeholder="+234 xxx xxx xxxx"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Status"
              options={["Active", "Leave"]}
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as StaffStatus)}
            />
            <SelectField
              label="Documentation"
              options={["Complete", "Pending"]}
              value={editDocs}
              onChange={(e) => setEditDocs(e.target.value as DocsStatus)}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Staff"
        subtitle="Create a new staff record"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addStaff}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Full Name" required>
            <TextInput
              placeholder="Enter full name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Role" required>
              <TextInput
                placeholder="e.g. Chemistry Teacher"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              />
            </Field>
            <Field label="Monthly Salary (₦)">
              <TextInput
                type="number"
                placeholder="e.g. 310000"
                value={newSalary}
                onChange={(e) => setNewSalary(e.target.value)}
              />
            </Field>
          </div>
          <SelectField
            label="Department"
            required
            placeholder="Select department"
            options={deptOptions}
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <TextInput
                type="email"
                placeholder="name@greenfield.edu"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </Field>
            <Field label="Phone">
              <TextInput
                type="tel"
                placeholder="+234 xxx xxx xxxx"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </Field>
          </div>
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}
