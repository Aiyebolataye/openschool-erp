"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";

const kpis = [
  { label: "Results in Moderation", value: "18", detail: "", detailColor: "orange" as const },
  { label: "Published", value: "24", detail: "", detailColor: "green" as const },
  { label: "Corrections", value: "6", detail: "", detailColor: "red" as const },
  { label: "Credit Recovery Flagged", value: "34", detail: "", detailColor: "blue" as const },
];

const moderation = [
  { title: "SS2 Term 3 — Science", cls: "SS2 Science", teacher: "Mrs. Ajayi", status: { text: "Moderation", variant: "orange" as const } },
  { title: "JSS3 Mock Results", cls: "JSS3", teacher: "Mr. Obi", status: { text: "Moderation", variant: "orange" as const } },
  { title: "SS1 Result Correction", cls: "SS1 Art", teacher: "Ms. Tran", status: { text: "Correction", variant: "red" as const } },
];

const published = [
  { title: "SS3 Term 2 Final", cls: "SS3", teacher: "Mrs. Ajayi", status: { text: "Published", variant: "green" as const } },
  { title: "JSS2 Term 2 Final", cls: "JSS2", teacher: "Mr. Obi", status: { text: "Published", variant: "green" as const } },
];

const recovery = [
  { title: "Mathematics Failure Flags", detail: "12 students · SS3", status: { text: "Flagged", variant: "orange" as const } },
  { title: "Physics Failure Flags", detail: "8 students · SS2", status: { text: "Flagged", variant: "orange" as const } },
  { title: "Summer School Enrollment", detail: "18 enrolled · 6 waiting", status: { text: "Active", variant: "green" as const } },
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

export default function PrincipalResultsPage() {
  const [moderateOpen, setModerateOpen] = useState(false);

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Results"
        subtitle="Moderate results, publish, and manage credit recovery"
        actions={<Button onClick={() => setModerateOpen(true)}>+ Moderate Result</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Tabs
        tabs={[
          { id: "moderation", label: "Moderation & Corrections", content: <List rows={moderation.map((m) => ({ title: m.title, sub: `${m.cls} · ${m.teacher}`, status: m.status }))} /> },
          { id: "published", label: "Published", content: <List rows={published.map((p) => ({ title: p.title, sub: `${p.cls} · ${p.teacher}`, status: p.status }))} /> },
          { id: "recovery", label: "Credit Recovery", content: <List rows={recovery.map((r) => ({ title: r.title, sub: r.detail, status: r.status }))} /> },
        ]}
      />

      <Modal
        open={moderateOpen}
        onClose={() => setModerateOpen(false)}
        title="Moderate Result"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModerateOpen(false)}>Cancel</Button>
            <Button variant="secondary" onClick={() => setModerateOpen(false)}>Send Back</Button>
            <Button onClick={() => setModerateOpen(false)}>Approve</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Result Batch" required placeholder="Select batch" options={["SS2 Term 3 — Science", "JSS3 Mock Results", "SS1 Art"]} />
          <Field label="Comments">
            <TextArea rows={3} placeholder="Moderation comments (optional)" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
