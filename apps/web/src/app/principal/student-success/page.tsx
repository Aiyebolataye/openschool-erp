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

const initialSuccess = [
  { id: 1, title: "Repeated absenteeism", student: "Amara Okafor · JSS2 B", level: { text: "HIGH", variant: "red" as const } },
  { id: 2, title: "Academic decline flagged", student: "Tom Wallace · SS3 Art", level: { text: "MEDIUM", variant: "orange" as const } },
  { id: 3, title: "Wellbeing check recommended", student: "Grace Lim · SS2 Science", level: { text: "LOW", variant: "muted" as const } },
];

const initialDiscipline = [
  { id: 1, title: "Classroom disruption", student: "Daniel Smith · JSS1 A", status: { text: "Open", variant: "orange" as const } },
  { id: 2, title: "Unauthorized absence", student: "Grace Lim · SS2 Science", status: { text: "Suspended", variant: "red" as const } },
  { id: 3, title: "Late submission repeat", student: "Omar Farouk · SS1", status: { text: "Resolved", variant: "green" as const } },
];

const portfolio = [
  { student: "Chidi Eze", detail: "Academic record updated", date: "2h ago" },
  { student: "Amara Okafor", detail: "New certificate added", date: "1d ago" },
  { student: "Tom Wallace", detail: "Portfolio completed", date: "2d ago" },
];

type SuccessItem = (typeof initialSuccess)[number];
type DisciplineItem = (typeof initialDiscipline)[number];
type BadgeVariant = "green" | "red" | "orange" | "muted" | "blue";

interface Row {
  id: number;
  title: string;
  sub: string;
  status?: { text: string; variant: BadgeVariant };
  actions?: { label: string; variant?: "primary" | "secondary"; onClick: () => void }[];
}

function List({ rows }: { rows: Row[] }) {
  return (
    <Card className="divide-y divide-border-light">
      {rows.map((r) => (
        <div key={r.id} className="flex items-center justify-between px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-dark">{r.title}</p>
            <p className="text-xs text-text-muted mt-0.5">{r.sub}</p>
          </div>
          <div className="flex items-center gap-2 ml-4 shrink-0">
            {r.status && <Badge variant={r.status.variant}>{r.status.text}</Badge>}
            {r.actions?.map((a) => (
              <Button key={a.label} variant={a.variant ?? "secondary"} onClick={a.onClick}>
                {a.label}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </Card>
  );
}

export default function PrincipalStudentWelfarePage() {
  const [createOpen, setCreateOpen] = useState(false);

  const [successResolved, setSuccessResolved] = useState<Record<number, string>>({});
  const [disciplineResolved, setDisciplineResolved] = useState<Record<number, string>>({});
  const [disciplineEscalated, setDisciplineEscalated] = useState<Record<number, boolean>>({});

  const [resolveModal, setResolveModal] = useState<{ source: "success" | "discipline"; id: number } | null>(null);
  const [resolveNotes, setResolveNotes] = useState("");

  const [escalateModal, setEscalateModal] = useState<number | null>(null);
  const [escalateReason, setEscalateReason] = useState("");

  function handleResolveConfirm() {
    if (!resolveModal) return;
    if (resolveModal.source === "success") {
      setSuccessResolved((prev) => ({ ...prev, [resolveModal.id]: resolveNotes }));
    } else {
      setDisciplineResolved((prev) => ({ ...prev, [resolveModal.id]: resolveNotes }));
    }
    setResolveNotes("");
    setResolveModal(null);
  }

  function handleEscalateConfirm() {
    if (escalateModal === null) return;
    setDisciplineEscalated((prev) => ({ ...prev, [escalateModal]: true }));
    setEscalateReason("");
    setEscalateModal(null);
  }

  const successRows: Row[] = initialSuccess.map((s) => {
    const resolved = successResolved[s.id];
    return {
      id: s.id,
      title: s.title,
      sub: s.student,
      status: resolved
        ? { text: "Resolved", variant: "green" as const }
        : s.level,
      actions: resolved
        ? [{ label: "View", variant: "secondary" as const, onClick: () => {} }]
        : [{ label: "Resolve", variant: "primary" as const, onClick: () => { setResolveNotes(""); setResolveModal({ source: "success", id: s.id }); } }],
    };
  });

  const disciplineRows: Row[] = initialDiscipline.map((d) => {
    const resolved = disciplineResolved[d.id];
    const escalated = disciplineEscalated[d.id];
    return {
      id: d.id,
      title: d.title,
      sub: d.student,
      status: resolved
        ? { text: "Resolved", variant: "green" as const }
        : escalated
          ? { text: "Escalated", variant: "red" as const }
          : d.status,
      actions: resolved
        ? [{ label: "View", variant: "secondary" as const, onClick: () => {} }]
        : [
            { label: "Resolve", variant: "primary" as const, onClick: () => { setResolveNotes(""); setResolveModal({ source: "discipline", id: d.id }); } },
            { label: "Escalate", variant: "secondary" as const, onClick: () => { setEscalateReason(""); setEscalateModal(d.id); } },
          ],
    };
  });

  const portfolioRows: Row[] = portfolio.map((p, i) => ({
    id: i,
    title: p.student,
    sub: `${p.detail} · ${p.date}`,
  }));

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
          { id: "success", label: "Student Success", content: <List rows={successRows} /> },
          { id: "discipline", label: "Discipline", content: <List rows={disciplineRows} /> },
          { id: "portfolio", label: "Portfolios", content: <List rows={portfolioRows} /> },
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

      <Modal
        open={resolveModal !== null}
        onClose={() => setResolveModal(null)}
        title="Resolve Item"
        footer={
          <>
            <Button variant="secondary" onClick={() => setResolveModal(null)}>Cancel</Button>
            <Button onClick={handleResolveConfirm}>Mark as Resolved</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Resolution Notes" required>
            <TextArea
              rows={4}
              placeholder="Enter resolution notes..."
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={escalateModal !== null}
        onClose={() => setEscalateModal(null)}
        title="Escalate Case"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEscalateModal(null)}>Cancel</Button>
            <Button onClick={handleEscalateConfirm}>Confirm Escalation</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Escalation Reason" required>
            <TextArea
              rows={4}
              placeholder="Reason for escalation..."
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
