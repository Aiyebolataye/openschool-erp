"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";

const kpis = [
  { label: "Active Assignments", value: "34", detail: "", detailColor: "muted" as const },
  { label: "Awaiting Grading", value: "18", detail: "", detailColor: "orange" as const },
  { label: "Graded", value: "11", detail: "", detailColor: "green" as const },
  { label: "Overdue Submissions", value: "9", detail: "", detailColor: "red" as const },
];

const assignments = [
  { title: "Essay on Civic Responsibilities", cls: "SS1 Civic Ed", submissions: "38 / 42", due: "Aug 5", status: { text: "Active", variant: "green" as const } },
  { title: "Algebra Problem Set 4", cls: "JSS2 Math", submissions: "42 / 45", due: "Aug 7", status: { text: "Active", variant: "green" as const } },
  { title: "Chemistry Lab Report", cls: "SS2 Chemistry", submissions: "31 / 38", due: "Aug 1", status: { text: "Grading", variant: "orange" as const } },
  { title: "Literature Essay — Poetry", cls: "SS2 Art", submissions: "40 / 40", due: "Jul 30", status: { text: "Graded", variant: "muted" as const } },
];

function List({ rows }: { rows: { title: string; sub: string; status?: { text: string; variant: "green" | "red" | "orange" | "muted" | "blue" } }[] }) {
  return (
    <Card className="divide-y divide-border-light">
      {rows.map((r) => (
        <div key={r.title} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-text-dark">{r.title}</p>
            <p className="text-xs text-text-muted mt-0.5">{r.sub}</p>
          </div>
          {r.status && <Badge variant={r.status.variant}>{r.status.text}</Badge>}
        </div>
      ))}
    </Card>
  );
}

export default function PrincipalAssignmentsPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Assignments"
        subtitle="Manage and monitor class assignments across the institution"
        actions={<Button onClick={() => setCreateOpen(true)}>+ Create Assignment</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <List rows={assignments.map((a) => ({ title: a.title, sub: `${a.cls} · ${a.submissions} · due ${a.due}`, status: a.status }))} />

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Assignment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => setCreateOpen(false)}>Create</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Title" required>
            <TextInput placeholder="Enter assignment title" />
          </Field>
          <SelectField label="Class" required placeholder="Select class" options={["JSS1 A", "JSS1 B", "SS1 Science", "SS2 Art", "SS1 Business"]} />
          <SelectField label="Subject" required placeholder="Select subject" options={["Mathematics", "English", "Physics", "Chemistry", "Biology", "Literature"]} />
          <SelectField label="Teacher" required placeholder="Assign teacher" options={["Mrs. Ajayi", "Mr. Obi", "Ms. Tran"]} />
          <Field label="Due Date" required>
            <TextInput type="date" />
          </Field>
          <Field label="Instructions">
            <TextArea rows={3} placeholder="Assignment instructions" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
