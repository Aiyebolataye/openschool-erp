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
  { label: "Open Requests", value: "14", detail: "3 urgent", detailColor: "red" as const },
  { label: "In Progress", value: "8", detail: "", detailColor: "muted" as const },
  { label: "Resolved This Month", value: "22", detail: "", detailColor: "green" as const },
];

const tickets = [
  { subject: "Subscription upgrade rejected", institution: "Greenfield Academy", priority: { text: "URGENT", variant: "red" as const }, status: { text: "Open", variant: "orange" as const }, updated: "2h ago" },
  { subject: "Can't view student records", institution: "Coastal Education", priority: { text: "NORMAL", variant: "muted" as const }, status: { text: "In Progress", variant: "blue" as const }, updated: "5h ago" },
  { subject: "Billing discrepancy on invoice", institution: "Metropolitan Schools", priority: { text: "NORMAL", variant: "muted" as const }, status: { text: "In Progress", variant: "blue" as const }, updated: "1d ago" },
];

export default function OrgSupportPage() {
  const [submitOpen, setSubmitOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Support"
        subtitle="Manage support for your institutions"
        actions={<Button onClick={() => setSubmitOpen(true)}>+ Submit Request</Button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="divide-y divide-border-light">
        {tickets.map((t) => (
          <div key={t.subject} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Badge variant={t.priority.variant}>{t.priority.text}</Badge>
              <div>
                <p className="text-sm font-medium text-text-dark">{t.subject}</p>
                <p className="text-xs text-text-muted mt-0.5">{t.institution} · updated {t.updated}</p>
              </div>
            </div>
            <Badge variant={t.status.variant}>{t.status.text}</Badge>
          </div>
        ))}
      </Card>

      <Modal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        title="Submit Support Request"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSubmitOpen(false)}>Cancel</Button>
            <Button onClick={() => setSubmitOpen(false)}>Submit Request</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Subject" required>
            <TextInput placeholder="Brief description of the issue" />
          </Field>
          <SelectField label="Category" required placeholder="Select category" options={["Technical", "Billing", "Feature", "Other"]} />
          <SelectField label="Priority" required placeholder="Select priority" options={["Low", "Medium", "High"]} />
          <Field label="Description" required>
            <TextArea rows={4} placeholder="Describe your request in detail..." />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
