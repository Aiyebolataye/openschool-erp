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
  { name: "Mrs. Ajayi", role: "Biology Teacher", dept: "Sciences", docs: { text: "Docs Complete", variant: "green" as const }, status: { text: "Active", variant: "green" as const } },
  { name: "Mr. Obi", role: "Math Teacher", dept: "Sciences", docs: { text: "Docs Complete", variant: "green" as const }, status: { text: "Active", variant: "green" as const } },
  { name: "Ms. Tran", role: "Literature Teacher", dept: "Arts", docs: { text: "NIN Pending", variant: "orange" as const }, status: { text: "Active", variant: "green" as const } },
  { name: "Mr. Adeyemi", role: "HOD Sciences", dept: "Sciences", docs: { text: "Docs Complete", variant: "green" as const }, status: { text: "Leave", variant: "orange" as const } },
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
          { id: "staff", label: "Staff", content: <List rows={staff.map((s) => ({ title: s.name, sub: `${s.role} · ${s.dept}`, right: s.docs.text, status: s.status }))} /> },
          { id: "payroll", label: "Payroll", content: <List rows={payroll.map((p) => ({ title: p.staff, sub: p.role, right: p.gross, status: p.status }))} /> },
          { id: "hr", label: "HR", content: <List rows={hr.map((h) => ({ title: h.title, sub: h.detail, status: h.status }))} /> },
        ]}
      />

      <Modal
        open={addStaffOpen}
        onClose={() => setAddStaffOpen(false)}
        title="Add Staff"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddStaffOpen(false)}>Cancel</Button>
            <Button onClick={() => setAddStaffOpen(false)}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Full Name" required>
            <TextInput placeholder="Enter full name" />
          </Field>
          <SelectField label="Role" required placeholder="Select role" options={["Teacher", "Admin", "Accounts", "Librarian", "Nurse", "Transport"]} />
          <SelectField label="Department" required placeholder="Select department" options={["Sciences", "Arts", "Commerce", "Administration", "Medical", "Transport"]} />
          <Field label="School Email" required>
            <TextInput type="email" placeholder="name@school.edu" />
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
          <div className="rounded-lg bg-primary-light/60 border border-primary/20 p-3 text-xs text-primary">
            On first login, staff are required to upload their National Identification Number (NIN) and other supporting documents before full account access is granted.
          </div>
        </div>
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
