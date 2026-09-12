"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { useState } from "react";
import Link from "next/link";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import { SearchInput } from "@/components/ui/search-input";

type StaffStatus = { text: string; variant: "green" | "orange" | "blue" | "red" | "muted" };

type StaffMember = {
  name: string;
  role: string;
  dept: string;
  salary: number;
  email: string;
  personalEmail: string;
  phone: string;
  employmentDate: string;
  docs: StaffStatus;
  status: StaffStatus;
};

const initialStaff: StaffMember[] = [
  { name: "Mrs. Ajayi", role: "Biology Teacher", dept: "Sciences", salary: 1850, email: "ajayi@school.edu", personalEmail: "ajayi@personal.com", phone: "+234 801 234 5678", employmentDate: "2021-09-01", docs: { text: "Docs Complete", variant: "green" }, status: { text: "Active", variant: "green" } },
  { name: "Mr. Obi", role: "Math Teacher", dept: "Sciences", salary: 1850, email: "obi@school.edu", personalEmail: "obi@personal.com", phone: "+234 802 345 6789", employmentDate: "2020-01-15", docs: { text: "Docs Complete", variant: "green" }, status: { text: "Active", variant: "green" } },
  { name: "Ms. Tran", role: "Literature Teacher", dept: "Arts", salary: 1720, email: "tran@school.edu", personalEmail: "tran@personal.com", phone: "+234 803 456 7890", employmentDate: "2022-03-10", docs: { text: "NIN Pending", variant: "orange" }, status: { text: "Active", variant: "green" } },
  { name: "Mr. Adeyemi", role: "HOD Sciences", dept: "Sciences", salary: 2200, email: "adeyemi@school.edu", personalEmail: "adeyemi@personal.com", phone: "+234 804 567 8901", employmentDate: "2018-08-20", docs: { text: "Docs Complete", variant: "green" }, status: { text: "Leave", variant: "orange" } },
];

const initialHr = [
  { title: "Leave Request", detail: "Mr. Adeyemi · Annual · Jul 30–Aug 3", status: { text: "Review", variant: "orange" as const } },
  { title: "Performance Review", detail: "Mrs. Ajayi · Q2 review due", status: { text: "Open", variant: "blue" as const } },
  { title: "Skill Training", detail: "New teachers · Onboarding course", status: { text: "Due", variant: "red" as const } },
];

const kpis = [
  { label: "Total Staff", value: "620", detail: "", detailColor: "muted" as const },
  { label: "Monthly Payroll", value: "₦845K", detail: "", detailColor: "muted" as const },
  { label: "On Leave", value: "4", detail: "", detailColor: "muted" as const },
  { label: "HR Tasks", value: "9", detail: "", detailColor: "orange" as const },
];

const ROLE_DASHBOARDS: Record<string, { label: string; url: string }> = {
  "School Nurse": { label: "Clinic Admin Dashboard", url: "/clinic-admin" },
  "Librarian": { label: "Librarian Dashboard", url: "/librarian" },
  "Transport Manager": { label: "Transport Manager Dashboard", url: "/transport-manager" },
  "Payroll Officer": { label: "HR & Payroll Dashboard", url: "/hr-officer" },
  "Student Management Officer": { label: "Student Management Dashboard", url: "/student-management" },
  "Bursar": { label: "Bursar Dashboard", url: "/bursar" },
  "Hostel Admin": { label: "Hostel Admin Dashboard", url: "/hostel-admin" },
};

const PASSWORD_PREFIX: Record<string, string> = {
  "School Nurse": "Nrs",
  "Librarian": "Libr",
  "Transport Manager": "Trns",
  "Payroll Officer": "Payr",
  "Student Management Officer": "StM",
  "Bursar": "Burs",
  "Hostel Admin": "Hstl",
};

const roleOptions = ["Teacher", "Admin", "Accounts", "School Nurse", "Librarian", "Transport Manager", "Payroll Officer", "Student Management Officer", "Bursar", "Hostel Admin"];
const deptOptions = ["Sciences", "Arts", "Commerce", "Administration", "Medical", "Transport"];

function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9.]/g, "");
}

function genTempPassword(role: string): string {
  const prefix = PASSWORD_PREFIX[role] || "Staff";
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${year}#${rand}`;
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 py-2">
      <span className="text-xs font-medium text-text-muted w-36 shrink-0">{label}</span>
      <span className="text-sm text-text-dark">{value}</span>
    </div>
  );
}

function StaffList({ rows, onEdit }: { rows: StaffMember[]; onEdit: (idx: number) => void }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <Card className="divide-y divide-border-light">
      {rows.map((s, i) => (
        <div key={s.name}>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-text-dark">{s.name}</p>
              <p className="text-xs text-text-muted mt-0.5">{s.role} · {s.dept} · {s.docs.text}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={s.status.variant}>{s.status.text}</Badge>
              <Button variant="secondary" onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}>
                {expandedIdx === i ? "Close" : "View Profile"}
              </Button>
              <Button variant="secondary" onClick={() => onEdit(i)}>Edit</Button>
            </div>
          </div>
          {expandedIdx === i && <StaffProfile s={s} />}
        </div>
      ))}
    </Card>
  );
}

function StaffProfile({ s }: { s: StaffMember }) {
  return (
    <div className="px-5 py-4 bg-primary-light/40 border-t border-border-light">
      <ProfileRow label="Full Name" value={s.name} />
      <ProfileRow label="Role" value={s.role} />
      <ProfileRow label="Department" value={s.dept} />
      <ProfileRow label="School Email" value={s.email} />
      <ProfileRow label="Personal Email" value={s.personalEmail} />
      <ProfileRow label="Phone" value={s.phone} />
      <ProfileRow label="Employment Date" value={s.employmentDate} />
      <ProfileRow label="Monthly Salary" value={`₦${s.salary.toLocaleString()}`} />
      <ProfileRow label="Document Status" value={s.docs.text} />
    </div>
  );
}

function EditStaffModal({
  open,
  onClose,
  staff: staffMember,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  staff: StaffMember;
  onSave: (updated: StaffMember) => void;
}) {
  const [name, setName] = useState(staffMember.name);
  const [role, setRole] = useState(staffMember.role);
  const [dept, setDept] = useState(staffMember.dept);
  const [personalEmail, setPersonalEmail] = useState(staffMember.personalEmail);
  const [phone, setPhone] = useState(staffMember.phone);
  const [employmentDate, setEmploymentDate] = useState(staffMember.employmentDate);
  const [salary, setSalary] = useState(String(staffMember.salary));

  const handleSave = () => {
    onSave({
      ...staffMember,
      name,
      role,
      dept,
      personalEmail,
      phone,
      employmentDate,
      salary: Number(salary),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit ${staffMember.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Full Name" required>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <SelectField
          label="Role"
          required
          placeholder="Select role"
          options={roleOptions}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <SelectField
          label="Department"
          required
          placeholder="Select department"
          options={deptOptions}
          value={dept}
          onChange={(e) => setDept(e.target.value)}
        />
        <Field label="School Email">
          <TextInput value={staffMember.email} disabled className="opacity-60 cursor-not-allowed" />
        </Field>
        <div className="rounded-lg bg-primary-light/60 border border-primary/20 p-3 text-xs text-primary">
          School email cannot be changed. Contact platform support to modify it.
        </div>
        <Field label="Personal Email" required>
          <TextInput type="email" value={personalEmail} onChange={(e) => setPersonalEmail(e.target.value)} />
        </Field>
        <Field label="Phone">
          <TextInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="Employment Date" required>
          <TextInput type="date" value={employmentDate} onChange={(e) => setEmploymentDate(e.target.value)} />
        </Field>
        <Field label="Monthly Salary (₦)" required>
          <TextInput type="number" value={salary} onChange={(e) => setSalary(e.target.value)} />
        </Field>
        <ProfileRow label="Document Status" value={staffMember.docs.text} />
      </div>
    </Modal>
  );
}

function HrDetailModal({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: (typeof initialHr)[number] | null;
}) {
  if (!item) return null;

  const actions: Record<string, string[]> = {
    "Leave Request": ["Approve", "Deny"],
    "Performance Review": ["Review", "Close"],
    "Skill Training": ["Start", "Postpone"],
  };

  const actionButtons = actions[item.title] || [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item.title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          {actionButtons.map((label) => (
            <Button key={label} onClick={onClose}>{label}</Button>
          ))}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Badge variant={item.status.variant}>{item.status.text}</Badge>
          <span className="text-sm text-text-dark">{item.detail}</span>
        </div>
        <div className="rounded-lg bg-primary-light/60 border border-primary/20 p-3 text-xs text-primary">
          {item.title === "Leave Request" && "Review the leave request details and take the appropriate action to approve or deny this request."}
          {item.title === "Performance Review" && "Open the performance review to evaluate the staff member's quarterly performance and provide feedback."}
          {item.title === "Skill Training" && "Start the training session to begin the onboarding course for new teachers."}
        </div>
      </div>
    </Modal>
  );
}

function CredentialRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-primary-light/60 border border-border-light px-4 py-3">
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-text-muted uppercase tracking-wide">{label}</p>
        <code className="text-sm font-semibold text-text-dark break-all">{value}</code>
      </div>
      <Button variant="ghost" size="sm" onClick={copy} aria-label={`Copy ${label}`} className="shrink-0">
        {copied ? <Check className="w-4 h-4 text-green" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  );
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [search, setSearch] = useState("");
  const [hrList] = useState(initialHr);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [payrollOpen, setPayrollOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDept, setNewDept] = useState("");
  const [newPersonalEmail, setNewPersonalEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [showCreated, setShowCreated] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [hrModalOpen, setHrModalOpen] = useState(false);
  const [selectedHr, setSelectedHr] = useState<(typeof initialHr)[number] | null>(null);

  const officialEmail = newName.trim() ? `${slugifyName(newName)}@school.edu` : "";
  const dash = newRole ? ROLE_DASHBOARDS[newRole] : undefined;

  const totalPayroll = staffList.reduce((sum, s) => sum + s.salary, 0);

  const q = search.trim().toLowerCase();
  const visibleStaff = q
    ? staffList.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q) ||
          s.dept.toLowerCase().includes(q)
      )
    : staffList;

  const resetAddForm = () => {
    setNewName("");
    setNewRole("");
    setNewDept("");
    setNewPersonalEmail("");
    setNewPhone("");
    setNewDate("");
    setNewSalary("");
    setTempPassword("");
  };

  const handleOpenAdd = () => {
    resetAddForm();
    setShowCreated(false);
    setAddStaffOpen(true);
  };

  const handleRoleChange = (value: string) => {
    setNewRole(value);
    setTempPassword(genTempPassword(value));
  };

  const handleSave = () => {
    if (!newName.trim() || !newRole || !newPersonalEmail.trim()) return;
    if (dash) {
      const member: StaffMember = {
        name: newName.trim(),
        role: newRole,
        dept: newDept,
        salary: Number(newSalary) || 0,
        email: officialEmail,
        personalEmail: newPersonalEmail,
        phone: newPhone,
        employmentDate: newDate,
        docs: { text: "Docs Pending", variant: "orange" },
        status: { text: "Active", variant: "green" },
      };
      setStaffList((prev) => [...prev, member]);
    }
    setShowCreated(true);
  };

  const handleClose = () => {
    setAddStaffOpen(false);
    setShowCreated(false);
    resetAddForm();
  };

  const handleEditSave = (updated: StaffMember) => {
    setStaffList((prev) => prev.map((s, i) => (i === editIdx ? updated : s)));
    setEditIdx(null);
  };

  const handleHrClick = (item: (typeof initialHr)[number]) => {
    setSelectedHr(item);
    setHrModalOpen(true);
  };

  const payroll = [
    { staff: "Mrs. Ajayi", role: "Biology Teacher", gross: "₦1,850", status: { text: "Pending", variant: "orange" as const } },
    { staff: "Mr. Obi", role: "Math Teacher", gross: "₦1,850", status: { text: "Pending", variant: "orange" as const } },
    { staff: "Ms. Tran", role: "Lit. Teacher", gross: "₦1,720", status: { text: "Paid", variant: "green" as const } },
  ];

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Staff & HR"
        subtitle="Manage staff, payroll, and human resources"
        actions={
          <>
            <Button variant="secondary" onClick={() => setPayrollOpen(true)}>Run Payroll</Button>
            <Button onClick={handleOpenAdd}>+ Add Staff</Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Tabs
        tabs={[
          { id: "staff", label: "Staff", content: (
            <div className="flex flex-col gap-4">
              <SearchInput placeholder="Search by name, role, or department..." className="max-w-sm" value={search} onChange={setSearch} />
              <StaffList rows={visibleStaff} onEdit={(i) => setEditIdx(staffList.indexOf(visibleStaff[i]))} />
            </div>
          ) },
          { id: "payroll", label: "Payroll", content: (
            <div className="flex flex-col gap-4">
              <Card className="px-5 py-4">
                <p className="text-xs font-medium text-text-muted mb-1">Total Monthly Payroll</p>
                <p className="text-2xl font-semibold text-text-dark">₦{totalPayroll.toLocaleString()}</p>
                <p className="text-xs text-text-muted mt-1">Computed from {staffList.length} staff salaries</p>
              </Card>
              <Card className="divide-y divide-border-light">
                {payroll.map((p) => (
                  <div key={p.staff} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-text-dark">{p.staff}</p>
                      <p className="text-xs text-text-muted mt-0.5">{p.role} · {p.gross}</p>
                    </div>
                    <Badge variant={p.status.variant}>{p.status.text}</Badge>
                  </div>
                ))}
              </Card>
            </div>
          )},
          { id: "hr", label: "HR", content: (
            <Card className="divide-y divide-border-light">
              {hrList.map((h) => (
                <button
                  key={h.title}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface/50 transition-colors"
                  onClick={() => handleHrClick(h)}
                >
                  <div>
                    <p className="text-sm font-medium text-text-dark">{h.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{h.detail}</p>
                  </div>
                  <Badge variant={h.status.variant}>{h.status.text}</Badge>
                </button>
              ))}
            </Card>
          )},
        ]}
      />

      {editIdx !== null && (
        <EditStaffModal
          open={editIdx !== null}
          onClose={() => setEditIdx(null)}
          staff={staffList[editIdx]}
          onSave={handleEditSave}
        />
      )}

      <HrDetailModal
        open={hrModalOpen}
        onClose={() => setHrModalOpen(false)}
        item={selectedHr}
      />

      <Modal
        open={addStaffOpen}
        onClose={handleClose}
        title="Add Staff"
        footer={
          showCreated ? (
            <Button onClick={handleClose}>Done</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </>
          )
        }
      >
        {showCreated ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-green-light/60 border border-green/30 px-4 py-4 flex items-start gap-2">
              <Check className="w-4 h-4 text-green mt-0.5 shrink-0" />
              <p className="text-sm font-medium text-text-dark">
                Account created — login credentials sent to {officialEmail}
              </p>
            </div>
            <CredentialRow label="Official Email" value={officialEmail} />
            <CredentialRow label="Temporary Password" value={tempPassword} />
            {dash && (
              <div className="rounded-lg bg-primary-light/60 border border-primary/20 p-4 flex flex-col gap-2">
                <Badge variant="blue">{dash.label}</Badge>
                <Link
                  href={dash.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary font-medium inline-flex items-center gap-1"
                >
                  {dash.url} <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
            <p className="text-xs text-text-muted leading-relaxed">
              The staff member must change this password on their first login.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Field label="Full Name" required>
              <TextInput placeholder="Enter full name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </Field>
            <SelectField
              label="Role"
              required
              placeholder="Select role"
              options={roleOptions}
              value={newRole}
              onChange={(e) => handleRoleChange(e.target.value)}
            />
            <Field label="Official School Email" required>
              <TextInput value={officialEmail} readOnly placeholder="Generated from full name" className="text-text-muted cursor-not-allowed" />
            </Field>
            <Field label="Temporary Password" required>
              <TextInput value={tempPassword} readOnly placeholder="Generated from role" className="text-text-muted cursor-not-allowed" />
            </Field>
            {dash && (
              <div className="rounded-lg bg-primary-light/60 border border-primary/20 p-3 flex flex-col gap-1.5">
                <p className="text-xs font-medium text-primary">Dashboard access: {dash.label}</p>
                <Link
                  href={dash.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-text-muted inline-flex items-center gap-1 hover:text-primary"
                >
                  {dash.url} <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
            <SelectField
              label="Department"
              required
              placeholder="Select department"
              options={deptOptions}
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
            />
            <Field label="Personal Email" required>
              <TextInput type="email" placeholder="name@personal.com" value={newPersonalEmail} onChange={(e) => setNewPersonalEmail(e.target.value)} />
            </Field>
            <Field label="Phone">
              <TextInput type="tel" placeholder="+234 xxx xxx xxxx" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            </Field>
            <Field label="Employment Date" required>
              <TextInput type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            </Field>
            <Field label="Monthly Salary (₦)" required>
              <TextInput type="number" placeholder="0.00" value={newSalary} onChange={(e) => setNewSalary(e.target.value)} />
            </Field>
            <div className="rounded-lg bg-primary-light/60 border border-primary/20 p-3 text-xs text-primary">
              On save, an email with the dashboard URL, official email, and temporary password is sent to {newPersonalEmail || "the personal email provided"}.
            </div>
            <div className="rounded-lg bg-primary-light/60 border border-primary/20 p-3 text-xs text-primary">
              On first login, staff are required to upload their National Identification Number (NIN) and other supporting documents before full account access is granted.
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={payrollOpen}
        onClose={() => setPayrollOpen(false)}
        title="Run Payroll"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPayrollOpen(false)}>Cancel</Button>
            <Button onClick={() => setPayrollOpen(false)}>Run</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Pay Period" required placeholder="Select period" options={["Jul 2026", "Aug 2026"]} />
          <SelectField label="Include" required placeholder="Select staff group" options={["All Staff", "Teachers Only", "Admin Only"]} />
          <SelectField label="Payroll Type" required placeholder="Select type" options={["Salary", "Allowance", "Bonus"]} />
          <Field label="Gross Amount">
            <TextInput type="number" placeholder="0.00" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
