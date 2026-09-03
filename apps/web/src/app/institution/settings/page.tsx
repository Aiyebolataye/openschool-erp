"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";

const sections = [
  { title: "Institution Profile", description: "Name, type, contact, address" },
  { title: "Branding & Theme", description: "Logo, colors, typography, login page" },
  { title: "Academic Configuration", description: "Levels, sessions, terms, grading" },
  { title: "Fee Structure", description: "Categories, discounts, scholarships" },
  { title: "Roles & Permissions", description: "Custom roles and access control" },
  { title: "Security & Integrations", description: "MFA, SSO, connected services" },
  { title: "Data & Privacy", description: "Retention, exports, compliance" },
];

const pages = [
  { name: "Homepage", status: { text: "Published", variant: "green" as const }, updated: "Jul 28, 2026" },
  { name: "About Us", status: { text: "Published", variant: "green" as const }, updated: "Jan 15, 2026" },
  { name: "Admissions", status: { text: "Draft", variant: "muted" as const }, updated: "Jul 30, 2026" },
  { name: "Academics", status: { text: "Published", variant: "green" as const }, updated: "Feb 20, 2026" },
  { name: "News & Events", status: { text: "Published", variant: "green" as const }, updated: "Jul 25, 2026" },
  { name: "Staff Directory", status: { text: "Scheduled", variant: "orange" as const }, updated: "Jul 31, 2026" },
];

function SettingsContent({ onConfigure }: { onConfigure: (title: string) => void }) {
  return (
    <Card className="divide-y divide-border-light">
      {sections.map((s) => (
        <div key={s.title} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-text-dark">{s.title}</p>
            <p className="text-xs text-text-muted mt-0.5">{s.description}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onConfigure(s.title)}>Configure</Button>
        </div>
      ))}
    </Card>
  );
}

function WebsiteContent() {
  return (
    <Card className="divide-y divide-border-light">
      {pages.map((p) => (
        <div key={p.name} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-text-dark">{p.name}</p>
            <p className="text-xs text-text-muted mt-0.5">Updated {p.updated}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={p.status.variant as "green"}>{p.status.text}</Badge>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
        </div>
      ))}
    </Card>
  );
}

export default function SettingsPage() {
  const [configOpen, setConfigOpen] = useState(false);
  const [configTitle, setConfigTitle] = useState("");

  const handleConfigure = (title: string) => {
    setConfigTitle(title);
    setConfigOpen(true);
  };

  return (
    <div className="max-w-[1000px] mx-auto">
      <PageHeader
        title="Website & Settings"
        subtitle="Institution configuration and public website builder"
        actions={<Button>Preview</Button>}
      />

      <Tabs
        tabs={[
          { id: "settings", label: "Settings", content: <SettingsContent onConfigure={handleConfigure} /> },
          { id: "website", label: "Website Builder", content: <WebsiteContent /> },
        ]}
      />

      <Modal
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        title={`Configure: ${configTitle}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfigOpen(false)}>Cancel</Button>
            <Button onClick={() => setConfigOpen(false)}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Status" required placeholder="Select status" options={["Enabled", "Disabled"]} />
          <Field label="Description">
            <TextInput placeholder="Configuration notes" />
          </Field>
          <Field label="Priority">
            <TextInput type="number" placeholder="1" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
