"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { useState } from "react";

const kpis = [
  { label: "Active Interventions", value: "14", detail: "", detailColor: "muted" as const },
  { label: "Open Discipline Cases", value: "5", detail: "", detailColor: "orange" as const },
  { label: "Welfare Alerts", value: "3", detail: "", detailColor: "red" as const },
  { label: "Credit Recovery", value: "34", detail: "", detailColor: "blue" as const },
];

const success = [
  { title: "Repeated absenteeism", student: "Amara Okafor · JSS2 B", level: { text: "HIGH", variant: "red" as const } },
  { title: "Academic decline flagged", student: "Tom Wallace · SS3 Art", level: { text: "MEDIUM", variant: "orange" as const } },
  { title: "Wellbeing check recommended", student: "Grace Lim · SS2 Science", level: { text: "LOW", variant: "muted" as const } },
];

const discipline = [
  { title: "Classroom disruption", student: "Daniel Smith · JSS1 A", status: { text: "Open", variant: "orange" as const } },
  { title: "Unauthorized absence", student: "Grace Lim · SS2 Science", status: { text: "Suspended", variant: "red" as const } },
  { title: "Late submission repeat", student: "Omar Farouk · SS1", status: { text: "Resolved", variant: "green" as const } },
];

const portfolio = [
  { student: "Chidi Eze", detail: "Academic record updated", date: "2h ago" },
  { student: "Amara Okafor", detail: "New certificate added", date: "1d ago" },
  { student: "Tom Wallace", detail: "Portfolio completed", date: "2d ago" },
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

export default function PrincipalStudentWelfarePage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="max-w-[1000px] mx-auto">
      <PageHeader
        title="Student Welfare"
        subtitle="Student success, discipline, and portfolio management"
        actions={<Button onClick={() => setCreateOpen(true)}>+ Create</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Tabs
        tabs={[
          { id: "success", label: "Student Success", content: <List rows={success.map((s) => ({ title: s.title, sub: s.student, status: s.level }))} /> },
          { id: "discipline", label: "Discipline", content: <List rows={discipline.map((d) => ({ title: d.title, sub: d.student, status: d.status }))} /> },
          { id: "portfolio", label: "Portfolios", content: <List rows={portfolio.map((p) => ({ title: p.student, sub: `${p.detail} · ${p.date}` }))} /> },
        ]}
      />

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Student Success Record"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => setCreateOpen(false)}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Student" required placeholder="Select student" options={["Amara Okafor", "Tom Wallace", "Grace Lim", "Chidi Eze", "Daniel Smith"]} />
          <SelectField label="Type" required placeholder="Select type" options={["Intervention", "Portfolio Item", "Certificate", "Discipline Record", "Academic Recovery Plan"]} />
          <Field label="Title" required>
            <TextInput placeholder="Enter record title" />
          </Field>
          <Field label="Details">
            <TextArea rows={4} placeholder="Additional details" />
          </Field>
          <Field label="Date" required>
            <TextInput type="date" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
