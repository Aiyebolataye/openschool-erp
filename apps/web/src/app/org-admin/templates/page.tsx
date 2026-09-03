"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";

const templateGroups = [
  { name: "Academic Structure", description: "Levels, sessions, terms, classes", type: { text: "Mandatory", variant: "red" as const } },
  { name: "Fee Categories", description: "Standard fee structure for org", type: { text: "Optional", variant: "muted" as const } },
  { name: "Branding", description: "Org logo and color scheme", type: { text: "Mandatory", variant: "red" as const } },
  { name: "Report Cards", description: "Standard report card layout", type: { text: "Optional", variant: "muted" as const } },
  { name: "Documents", description: "Policies and compliance documents", type: { text: "Mandatory", variant: "red" as const } },
  { name: "Staff Roles", description: "Default staff role definitions", type: { text: "Optional", variant: "muted" as const } },
  { name: "Communication Templates", description: "Email and SMS templates", type: { text: "Optional", variant: "muted" as const } },
];

export default function TemplatesPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Templates"
        subtitle="Organization-wide templates that can be pushed to institutions (accept, modify, or ignore)"
        actions={<Button onClick={() => setOpen(true)}>+ Create Template</Button>}
      />

      <Card className="divide-y divide-border-light">
        {templateGroups.map((t) => (
          <div key={t.name} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-text-dark">{t.name}</p>
              <p className="text-xs text-text-muted mt-0.5">{t.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={t.type.variant}>{t.type.text}</Badge>
              <Button variant="secondary" size="sm">Push to Institutions</Button>
            </div>
          </div>
        ))}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create Template"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Create Template</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Template Name" required>
            <TextInput placeholder="e.g. End of Term Notice" />
          </Field>
          <SelectField label="Category" required placeholder="Select category" options={["Email", "SMS", "Document"]} />
          <Field label="Subject" required>
            <TextInput placeholder="e.g. End of Term Parent Notice" />
          </Field>
          <Field label="Body" required>
            <TextArea rows={5} placeholder="Write your template content..." />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
