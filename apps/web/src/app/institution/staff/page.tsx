"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";

const kpis = [
  { label: "Total Staff", value: "620", detail: "", detailColor: "muted" as const },
  { label: "Monthly Payroll", value: "$845K", detail: "", detailColor: "muted" as const },
  { label: "On Leave", value: "4", detail: "", detailColor: "muted" as const },
  { label: "HR Tasks", value: "9", detail: "", detailColor: "orange" as const },
];

const staff = [
  { name: "Mrs. Ajayi", role: "Biology Teacher", dept: "Sciences", salary: 1850, email: "ajayi@school.edu", personalEmail: "ajayi@personal.com", phone: "+234 801 234 5678", employmentDate: "2021-09-01", docs: { text: "Docs Complete", variant: "green" as const }, status: { text: "Active", variant: "green" as const } },
  { name: "Mr. Obi", role: "Math Teacher", dept: "Sciences", salary: 1850, email: "obi@school.edu", personalEmail: "obi@personal.com", phone: "+234 802 345 6789", employmentDate: "2020-01-15", docs: { text: "Docs Complete", variant: "green" as const }, status: { text: "Active", variant: "green" as const } },
  { name: "Ms. Tran", role: "Literature Teacher", dept: "Arts", salary: 1720, email: "tran@school.edu", personalEmail: "tran@personal.com", phone: "+234 803 456 7890", employmentDate: "2022-03-10", docs: { text: "NIN Pending", variant: "orange" as const }, status: { text: "Active", variant: "green" as const } },
  { name: "Mr. Adeyemi", role: "HOD Sciences", dept: "Sciences", salary: 2200, email: "adeyemi@school.edu", personalEmail: "adeyemi@personal.com", phone: "+234 804 567 8901", employmentDate: "2018-08-20", docs: { text: "Docs Complete", variant: "green" as const }, status: { text: "Leave", variant: "orange" as const } },
];

const payroll = [
  { staff: "Mrs. Ajayi", role: "Biology Teacher", gross: "$1,850", status: { text: "Pending", variant: "orange" as const } },
  { staff: "Mr. Obi", role: "Math Teacher", gross: "$1,850", status: { text: "Pending", variant: "orange" as const } },
  { staff: "Ms. Tran", role: "Lit. Teacher", gross: "$1,720", status: { text: "Paid", variant: "green" as const } },
];

const hr = [
  { title: "Leave Request", detail: "Mr. Adeyemi · Annual · Jul 30–Aug 3", status: { text: "Review", variant: "orange" as const } },
  { title: "Performance Review", detail: "Mrs. Ajayi · Q2 review due", status: { text: "Open", variant: "blue" as const } },
  { title: "Skill Training", detail: "New teachers · Onboarding course", status: { text: "Due", variant: "red" as const } },
];

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 py-2">
      <span className="text-xs font-medium text-text-muted w-36 shrink-0">{label}</span>
      <span className="text-sm text-text-dark">{value}</span>
    </div>
  );
}

function StaffProfile({ s }: { s: typeof staff[number] }) {
  return (
    <div className="px-5 py-4 bg-primary-light/40 border-t border-border-light">
      <ProfileRow label="Full Name" value={s.name} />
      <ProfileRow label="Role" value={s.role} />
      <ProfileRow label="Department" value={s.dept} />
      <ProfileRow label="School Email" value={s.email} />
      <ProfileRow label="Personal Email" value={s.personalEmail} />
      <ProfileRow label="Phone" value={s.phone} />
      <ProfileRow label="Employment Date" value={s.employmentDate} />
      <ProfileRow label="Monthly Salary" value={`$${s.salary.toLocaleString()}`} />
      <ProfileRow label="Document Status" value={s.docs.text} />
    </div>
  );
}

function StaffList({ rows }: { rows: typeof staff }) {
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
            </div>
          </div>
          {expandedIdx === i && <StaffProfile s={s} />}
        </div>
      ))}
    </Card>
  );
}

function List({ rows }: { rows: { title: string; sub: string; right?: string; status?: { text: string; variant: "green" | "red" | "orange" | "muted" | "blue" } }[] }) {
  return (
    <Card className="divide-y divide-border-light">
      {rows.map((r) => (
        <div key={r.title} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-text-dark">{r.title}</p>
            <p className="text-xs text-text-muted mt-0.5">{r.sub}{r.right ? ` · ${r.right}` : ""}</p>
          </div>
          {r.status && <Badge variant={r.status.variant}>{r.status.text}</Badge>}
        </div>
      ))}
    </Card>
  );
}

export default function StaffPage() {
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [payrollOpen, setPayrollOpen] = useState(false);
  const [createdEmail, setCreatedEmail] = useState("");
  const [showCreated, setShowCreated] = useState(false);

  const totalPayroll = staff.reduce((sum, s) => sum + s.salary, 0);

  const handleSave = () => {
    const schoolEmail = (document.getElementById("school-email") as HTMLInputElement)?.value || "newstaff@school.edu";
    setCreatedEmail(schoolEmail);
    setShowCreated(true);
  };

  const handleClose = () => {
    setAddStaffOpen(false);
    setShowCreated(false);
    setCreatedEmail("");
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Staff & HR"
        subtitle="Manage staff, payroll, and human resources"
        actions={
          <>
            <Button variant="secondary" onClick={() => setPayrollOpen(true)}>Run Payroll</Button>
            <Button onClick={() => setAddStaffOpen(true)}>+ Add Staff</Button>
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
          { id: "staff", label: "Staff", content: <StaffList rows={staff} /> },
          { id: "payroll", label: "Payroll", content: (
            <div className="flex flex-col gap-4">
              <Card className="px-5 py-4">
                <p className="text-xs font-medium text-text-muted mb-1">Total Monthly Payroll</p>
                <p className="text-2xl font-semibold text-text-dark">${totalPayroll.toLocaleString()}</p>
                <p className="text-xs text-text-muted mt-1">Computed from {staff.length} staff salaries</p>
              </Card>
              <List rows={payroll.map((p) => ({ title: p.staff, sub: p.role, right: p.gross, status: p.status }))} />
            </div>
          )},
          { id: "hr", label: "HR", content: <List rows={hr.map((h) => ({ title: h.title, sub: h.detail, status: h.status }))} /> },
        ]}
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
            <div className="rounded-lg bg-primary-light/60 border border-primary/30 px-4 py-4">
              <p className="text-sm font-medium text-text-dark">
                Account created. Login credentials sent to {createdEmail}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-text-muted">Temporary Password</p>
              <div className="rounded-md bg-primary-light/60 border border-primary/30 px-4 py-3">
                <code className="text-sm font-semibold text-text-dark tracking-wide">TempPwd@2026</code>
              </div>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              The staff member must change this password on their first login.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Field label="Full Name" required>
              <TextInput placeholder="Enter full name" />
            </Field>
            <SelectField label="Role" required placeholder="Select role" options={["Teacher", "Admin", "Accounts", "Librarian", "Nurse", "Transport"]} />
            <SelectField label="Department" required placeholder="Select department" options={["Sciences", "Arts", "Commerce", "Administration", "Medical", "Transport"]} />
            <Field label="School Email" required>
              <TextInput id="school-email" type="email" placeholder="name@school.edu" />
            </Field>
            <Field label="Personal Email" required>
              <TextInput type="email" placeholder="name@personal.com" />
            </Field>
            <Field label="Phone">
              <TextInput type="tel" placeholder="+234 xxx xxx xxxx" />
            </Field>
            <Field label="Employment Date" required>
              <TextInput type="date" />
            </Field>
            <Field label="Monthly Salary (USD)" required>
              <TextInput type="number" placeholder="0.00" />
            </Field>
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
