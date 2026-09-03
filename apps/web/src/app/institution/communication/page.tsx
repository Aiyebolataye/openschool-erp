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
  { label: "Messages (7d)", value: "12,400", detail: "", detailColor: "muted" as const },
  { label: "Delivery Rate", value: "98.2%", detail: "", detailColor: "green" as const },
  { label: "Documents", value: "46", detail: "", detailColor: "muted" as const },
  { label: "Draft Campaigns", value: "3", detail: "", detailColor: "muted" as const },
];

const channels = [
  { name: "Email", detail: "12 templates", status: { text: "Active", variant: "green" as const } },
  { name: "SMS", detail: "8 templates", status: { text: "Active", variant: "green" as const } },
  { name: "WhatsApp", detail: "6 templates", status: { text: "Linked", variant: "blue" as const } },
  { name: "Announcements", detail: "Rules configured", status: { text: "Active", variant: "green" as const } },
];

const documents = [
  { name: "Student Handbook.pdf", category: { text: "Policy", variant: "blue" as const }, detail: "3.2 MB · Jan 10, 2026" },
  { name: "Term 3 Timetable.xlsx", category: { text: "Timetable", variant: "orange" as const }, detail: "420 KB · Jul 28, 2026" },
  { name: "Code of Conduct.docx", category: { text: "Policy", variant: "blue" as const }, detail: "180 KB · Mar 2, 2026" },
  { name: "Payroll Register.xlsx", category: { text: "Finance", variant: "green" as const }, detail: "1.1 MB · Jul 30, 2026" },
];

function List({ rows }: { rows: { title: string; detail: string; status?: { text: string; variant: "green" | "red" | "orange" | "muted" | "blue" } }[] }) {
  return (
    <Card className="divide-y divide-border-light">
      {rows.map((r) => (
        <div key={r.title} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-text-dark">{r.title}</p>
            <p className="text-xs text-text-muted mt-0.5">{r.detail}</p>
          </div>
          {r.status && <Badge variant={r.status.variant}>{r.status.text}</Badge>}
        </div>
      ))}
    </Card>
  );
}

export default function CommunicationPage() {
  const [msgOpen, setMsgOpen] = useState(false);

  return (
    <div className="max-w-[1000px] mx-auto">
      <PageHeader
        title="Communication & Docs"
        subtitle="Messages, templates, broadcasts, and document library"
        actions={<Button onClick={() => setMsgOpen(true)}>+ New Message</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Tabs
        tabs={[
          { id: "communication", label: "Communication", content: <List rows={channels.map((c) => ({ title: c.name, detail: c.detail, status: c.status }))} /> },
          { id: "documents", label: "Documents", content: <List rows={documents.map((d) => ({ title: d.name, detail: d.detail, status: d.category }))} /> },
        ]}
      />

      <Modal
        open={msgOpen}
        onClose={() => setMsgOpen(false)}
        title="New Message"
        footer={
          <>
            <Button variant="secondary" onClick={() => setMsgOpen(false)}>Cancel</Button>
            <Button onClick={() => setMsgOpen(false)}>Send</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Recipient" required placeholder="Select recipient" options={["All Parents", "All Staff", "Specific Class", "Specific Student"]} />
          <Field label="Subject" required>
            <TextInput placeholder="Enter subject" />
          </Field>
          <Field label="Body" required>
            <TextArea rows={4} placeholder="Type your message..." />
          </Field>
          <SelectField label="Channel" required placeholder="Select channel" options={["Email", "SMS", "Push"]} />
        </div>
      </Modal>
    </div>
  );
}
