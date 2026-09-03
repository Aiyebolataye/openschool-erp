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
  { label: "Messages (7d)", value: "12,400", detail: "", detailColor: "muted" as const },
  { label: "Announcements", value: "8", detail: "", detailColor: "muted" as const },
  { label: "Unread Alerts", value: "12", detail: "", detailColor: "orange" as const },
  { label: "Open Tickets", value: "5", detail: "", detailColor: "red" as const },
];

const messages = [
  { title: "Parent — Fee reminder", detail: "Mrs. Okafor · Regarding Amara", status: { text: "New", variant: "blue" as const } },
  { title: "Teacher — Leave request", detail: "Mr. Adeyemi · Annual leave", status: { text: "Review", variant: "orange" as const } },
  { title: "HOD Sciences — Timetable", detail: "Approval needed", status: { text: "Pending", variant: "orange" as const } },
];

const announcements = [
  { title: "Term 3 Staff Briefing", audience: "All staff", status: { text: "Published", variant: "green" as const } },
  { title: "Mid-term Exams Notice", audience: "Parents & students", status: { text: "Scheduled", variant: "orange" as const } },
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

export default function PrincipalCommunicationPage() {
  const [newOpen, setNewOpen] = useState(false);

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Communication"
        subtitle="Messages, announcements, and alerts"
        actions={<Button onClick={() => setNewOpen(true)}>+ New Message</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Tabs
        tabs={[
          { id: "messages", label: "Messages", content: <List rows={messages.map((m) => ({ title: m.title, sub: m.detail, status: m.status }))} /> },
          { id: "announcements", label: "Announcements", content: <List rows={announcements.map((a) => ({ title: a.title, sub: a.audience, status: a.status }))} /> },
        ]}
      />

      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="New Message"
        footer={
          <>
            <Button variant="secondary" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={() => setNewOpen(false)}>Send</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Recipient" required placeholder="Select recipient" options={["All Staff", "All Teachers", "HOD Sciences", "A Parent", "A Student"]} />
          <Field label="Subject" required>
            <TextInput placeholder="Subject" />
          </Field>
          <Field label="Body" required>
            <TextArea rows={4} placeholder="Message body" />
          </Field>
          <SelectField label="Channel" required placeholder="Select channel" options={["Email", "SMS", "Push"]} />
        </div>
      </Modal>
    </div>
  );
}
