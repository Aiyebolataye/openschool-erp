"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";

const sections = [
  { id: "org-details", title: "Organization Details", description: "Name, contact info, legal identifier" },
  { id: "branding", title: "Branding & Logo", description: "Organization logo and color scheme" },
  { id: "billing", title: "Billing & Subscriptions", description: "Payment methods and plan management" },
  { id: "modules", title: "Modules", description: "Configure which modules institutions can use" },
  { id: "security", title: "Security & Permissions", description: "SSO, 2FA, session policies" },
  { id: "privacy", title: "Data & Privacy", description: "Retention, export, and compliance settings" },
  { id: "notifications", title: "Notifications", description: "Default notification preferences" },
  { id: "templates", title: "Default Templates", description: "Base templates pushed to new institutions" },
];

const sectionFields: Record<string, React.ReactNode> = {
  "org-details": (
    <>
      <Field label="Organization Name">
        <TextInput placeholder="Metro Education Group" />
      </Field>
      <Field label="Contact Email">
        <TextInput type="email" placeholder="admin@metrogroup.edu" />
      </Field>
      <Field label="Phone">
        <TextInput type="tel" placeholder="+1 234 567 890" />
      </Field>
    </>
  ),
  branding: (
    <>
      <Field label="Primary Color">
        <TextInput placeholder="#1a56db" />
      </Field>
      <Field label="Logo URL">
        <TextInput placeholder="https://example.com/logo.png" />
      </Field>
    </>
  ),
  billing: (
    <>
      <SelectField label="Current Plan" options={["Starter", "Professional", "Enterprise"]} />
      <Field label="Payment Email">
        <TextInput type="email" placeholder="billing@metrogroup.edu" />
      </Field>
    </>
  ),
  modules: (
    <>
      <SelectField label="Academics" options={["Enabled", "Disabled"]} />
      <SelectField label="Finance" options={["Enabled", "Disabled"]} />
      <SelectField label="Attendance" options={["Enabled", "Disabled"]} />
      <SelectField label="HR" options={["Enabled", "Disabled"]} />
    </>
  ),
  security: (
    <>
      <SelectField label="SSO" options={["Enabled", "Disabled"]} />
      <SelectField label="Two-Factor Auth" options={["Required", "Optional", "Disabled"]} />
      <Field label="Session Timeout (minutes)">
        <TextInput type="number" placeholder="30" />
      </Field>
    </>
  ),
  privacy: (
    <>
      <SelectField label="Data Retention" options={["1 Year", "3 Years", "5 Years", "Forever"]} />
      <SelectField label="Export Access" options={["Admin Only", "All Staff", "Disabled"]} />
    </>
  ),
  notifications: (
    <>
      <SelectField label="Email Notifications" options={["Enabled", "Disabled"]} />
      <SelectField label="SMS Notifications" options={["Enabled", "Disabled"]} />
    </>
  ),
  templates: (
    <>
      <SelectField label="Report Template" options={["Default", "Custom"]} />
      <SelectField label="Invoice Template" options={["Default", "Custom"]} />
    </>
  ),
};

export default function SettingsPage() {
  const [configOpen, setConfigOpen] = useState(false);
  const [configSection, setConfigSection] = useState("");

  return (
    <div className="max-w-[1000px] mx-auto">
      <PageHeader title="Organization Settings" subtitle="Configuration for your organization workspace" />

      <Card className="divide-y divide-border-light">
        {sections.map((s) => (
          <div key={s.title} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-text-dark">{s.title}</p>
              <p className="text-xs text-text-muted mt-0.5">{s.description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setConfigSection(s.title);
                setConfigOpen(true);
              }}
            >
              Configure
            </Button>
          </div>
        ))}
      </Card>

      <Modal
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        title={`Configure — ${configSection}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfigOpen(false)}>Cancel</Button>
            <Button onClick={() => setConfigOpen(false)}>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          {sectionFields[sections.find((s) => s.title === configSection)?.id ?? "org-details"]}
        </div>
      </Modal>
    </div>
  );
}
