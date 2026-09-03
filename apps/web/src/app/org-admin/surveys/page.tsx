"use client";

import { useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";

const kpis = [
  { label: "Active Surveys", value: "4", detail: "", detailColor: "muted" as const },
  { label: "Total Responses", value: "1,280", detail: "", detailColor: "muted" as const },
  { label: "Avg Response Rate", value: "62%", detail: "", detailColor: "green" as const },
];

const surveys = [
  { title: "Staff Satisfaction Survey", audience: "All organization staff", status: { text: "Active", variant: "green" as const }, responses: "342" },
  { title: "Parent Satisfaction (Greenfield)", audience: "Greenfield parents", status: { text: "Active", variant: "green" as const }, responses: "610" },
  { title: "Institution Performance Review", audience: "Institution Admins", status: { text: "Closed", variant: "muted" as const }, responses: "18" },
  { title: "Internal Audit Self-Assessment", audience: "Compliance team", status: { text: "Draft", variant: "muted" as const }, responses: "—" },
];

export default function SurveysPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Surveys"
        subtitle="Organization surveys, view individually or aggregated across institutions"
        actions={<Button onClick={() => setOpen(true)}>+ Create Survey</Button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="divide-y divide-border-light">
        {surveys.map((s) => (
          <div key={s.title} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-text-dark">{s.title}</p>
              <p className="text-xs text-text-muted mt-0.5">{s.audience} · {s.responses} responses</p>
            </div>
            <Badge variant={s.status.variant}>{s.status.text}</Badge>
          </div>
        ))}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create Survey"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Create Survey</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title" required>
            <TextInput placeholder="e.g. Staff Satisfaction Survey" />
          </Field>
          <SelectField label="Audience" required placeholder="Select audience" options={["All Staff", "Institution Admins", "Principals", "Parents", "All"]} />
          <Field label="Description" required>
            <TextArea rows={4} placeholder="Describe the purpose of this survey..." />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" required>
              <TextInput placeholder="e.g. Aug 10, 2026" />
            </Field>
            <Field label="End Date" required>
              <TextInput placeholder="e.g. Aug 24, 2026" />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
