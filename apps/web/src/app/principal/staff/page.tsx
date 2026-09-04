"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import { useState } from "react";

const kpis = [
  { label: "Total Staff", value: "620", detail: "", detailColor: "muted" as const },
  { label: "Teachers", value: "410", detail: "", detailColor: "muted" as const },
  { label: "On Leave", value: "4", detail: "", detailColor: "muted" as const },
  { label: "Pending Onboarding", value: "9", detail: "", detailColor: "orange" as const },
];

const staff = [
  { name: "Mrs. Ajayi", role: "Biology Teacher", dept: "Sciences", status: { text: "Active", variant: "green" as const } },
  { name: "Mr. Obi", role: "Math Teacher", dept: "Sciences", status: { text: "Active", variant: "green" as const } },
  { name: "Ms. Tran", role: "Literature Teacher", dept: "Arts", status: { text: "Active", variant: "green" as const } },
  { name: "Mr. Adeyemi", role: "HOD Sciences", dept: "Sciences", status: { text: "Leave", variant: "orange" as const } },
];

function List({ rows }: { rows: { title: string; sub: string; status: { text: string; variant: "green" | "red" | "orange" | "muted" | "blue" } }[] }) {
  return (
    <Card className="divide-y divide-border-light">
      {rows.map((r) => (
        <div key={r.title} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-text-dark">{r.title}</p>
            <p className="text-xs text-text-muted mt-0.5">{r.sub}</p>
          </div>
          <Badge variant={r.status.variant}>{r.status.text}</Badge>
        </div>
      ))}
    </Card>
  );
}

export default function PrincipalStaffPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [createdEmail, setCreatedEmail] = useState("");
  const [showCreated, setShowCreated] = useState(false);

  const handleSave = () => {
    const schoolEmail = (document.getElementById("school-email") as HTMLInputElement)?.value || "newstaff@school.com";
    setCreatedEmail(schoolEmail);
    setShowCreated(true);
  };

  const handleClose = () => {
    setAddOpen(false);
    setShowCreated(false);
    setCreatedEmail("");
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Staff"
        subtitle="Manage teaching and non-teaching staff"
        actions={<Button onClick={() => setAddOpen(true)}>+ Add Staff</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <List rows={staff.map((s) => ({ title: s.name, sub: `${s.role} · ${s.dept}`, status: s.status }))} />

      <Modal
        open={addOpen}
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
            <Field label="Personal Email" required>
              <TextInput type="email" placeholder="personal@email.com" />
            </Field>
            <Field label="School Email" required>
              <TextInput id="school-email" type="email" placeholder="name@school.com" />
            </Field>
            <Field label="Phone">
              <TextInput type="tel" placeholder="+234 xxx xxx xxxx" />
            </Field>
            <Field label="Employment Date" required>
              <TextInput type="date" />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}
