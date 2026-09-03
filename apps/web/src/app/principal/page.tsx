"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { useState } from "react";

const kpis = [
  { label: "Total Students", value: "12,450", detail: "", detailColor: "muted" as const },
  { label: "Attendance Today", value: "88.7%", detail: "-0.8%", detailColor: "red" as const },
  { label: "Results Pending", value: "12", detail: "", detailColor: "orange" as const },
  { label: "Welfare Cases", value: "14", detail: "", detailColor: "red" as const },
];

const pending = [
  { title: "Learning Content — SS1 Biology L12", sub: "Mrs. Ajayi · Review", status: { text: "Review", variant: "orange" as const } },
  { title: "Term 3 Results — SS2 Science", sub: "Moderation pending", status: { text: "Moderation", variant: "orange" as const } },
  { title: "Lesson Note — JSS2 Math", sub: "Mr. Obi · Review", status: { text: "Review", variant: "orange" as const } },
  { title: "SS1 Result Correction", sub: "Needs approval", status: { text: "Correction", variant: "red" as const } },
];

const alerts = [
  { title: "Chronic absenteeism", student: "Amara Okafor · JSS2 B", level: { text: "HIGH", variant: "red" as const } },
  { title: "Academic decline flagged", student: "Tom Wallace · SS3 Art", level: { text: "MEDIUM", variant: "orange" as const } },
  { title: "Potential credit recovery", student: "Grace Lim · SS2 Science", level: { text: "MEDIUM", variant: "orange" as const } },
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

export default function PrincipalDashboardPage() {
  const [noticeOpen, setNoticeOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Principal Dashboard"
        subtitle="Oversee academics, results, attendance, and student welfare"
        actions={<Button onClick={() => setNoticeOpen(true)}>+ Post Notice</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-text-dark mb-2">Pending Approvals & Reviews</h3>
          <List rows={pending.map((p) => ({ title: p.title, sub: p.sub, status: p.status }))} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-dark mb-2">Student Welfare Alerts</h3>
          <List rows={alerts.map((a) => ({ title: a.title, sub: a.student, status: a.level }))} />
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-dark">Term 3 Academic Overview</h3>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted">Average Attendance</p>
            <p className="text-2xl font-display font-bold text-text-dark mt-1">88.7%</p>
          </div>
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted">Average Score</p>
            <p className="text-2xl font-display font-bold text-text-dark mt-1">72.4%</p>
          </div>
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted">Pass Rate</p>
            <p className="text-2xl font-display font-bold text-text-dark mt-1">84.1%</p>
          </div>
        </div>
      </Card>

      <Modal
        open={noticeOpen}
        onClose={() => setNoticeOpen(false)}
        title="Post Notice"
        footer={
          <>
            <Button variant="secondary" onClick={() => setNoticeOpen(false)}>Cancel</Button>
            <Button onClick={() => setNoticeOpen(false)}>Post</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Title" required>
            <TextInput placeholder="Notice title" />
          </Field>
          <SelectField label="Audience" required placeholder="Select audience" options={["All Staff", "Teachers", "Parents", "Students", "Entire School"]} />
          <Field label="Message" required>
            <TextArea rows={4} placeholder="Notice message" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
