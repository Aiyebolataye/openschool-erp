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
  { label: "Active Announcements", value: "3", detail: "", detailColor: "muted" as const },
  { label: "Scheduled", value: "2", detail: "", detailColor: "muted" as const },
  { label: "Total Sent", value: "24", detail: "", detailColor: "muted" as const },
];

const announcements = [
  { title: "End of Term Staff Briefing", audience: "Institution Admins, Principals", status: { text: "Published", variant: "green" as const }, scheduled: "Jul 28, 2026", sent: "24 recipients" },
  { title: "New Uniform Policy for 2027", audience: "All staff & parents", status: { text: "Scheduled", variant: "orange" as const }, scheduled: "Aug 5, 2026", sent: "Pending" },
  { title: "Financial Reporting Deadline", audience: "Finance Directors", status: { text: "Draft", variant: "muted" as const }, scheduled: "Aug 12, 2026", sent: "Pending" },
];

export default function AnnouncementsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Organization Announcements"
        subtitle="Organization-wide announcements to institutions"
        actions={<Button onClick={() => setOpen(true)}>+ New Announcement</Button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="divide-y divide-border-light">
        {announcements.map((a) => (
          <div key={a.title} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-text-dark">{a.title}</p>
              <p className="text-xs text-text-muted mt-0.5">{a.audience} · {a.scheduled} · {a.sent}</p>
            </div>
            <Badge variant={a.status.variant}>{a.status.text}</Badge>
          </div>
        ))}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New Announcement"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Create Announcement</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title" required>
            <TextInput placeholder="e.g. End of Term Staff Briefing" />
          </Field>
          <SelectField label="Audience" required placeholder="Select audience" options={["All Staff", "Institution Admins", "Principals", "Parents", "All"]} />
          <Field label="Body" required>
            <TextArea rows={4} placeholder="Write your announcement message..." />
          </Field>
          <Field label="Schedule">
            <TextInput placeholder="e.g. Aug 10, 2026" />
          </Field>
          <SelectField label="Priority" placeholder="Select priority" options={["Low", "Normal", "High", "Urgent"]} />
        </div>
      </Modal>
    </div>
  );
}
