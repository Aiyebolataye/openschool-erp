"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";

const sections = [
  {
    title: "General Settings",
    description: "Configure platform-wide settings",
    fields: [
      { label: "Platform Name", value: "School ERP Platform" },
      { label: "Default Timezone", value: "UTC" },
    ],
  },
  {
    title: "Email Configuration",
    description: "SMTP and notification settings",
    fields: [
      { label: "Two-Factor Auth", value: "Required for Admins" },
      { label: "Status", value: "Connected", valueColor: "text-primary" },
    ],
  },
  {
    title: "Security Settings",
    description: "Authentication and access control",
    fields: [
      { label: "Session Timeout", value: "30 minutes" },
      { label: "IP Whitelisting", value: "Disabled" },
    ],
  },
  {
    title: "Storage & Integrations",
    description: "File storage and external services",
    fields: [
      { label: "Storage Provider", value: "AWS S3" },
      { label: "Storage Used", value: "2.4 TB / 5 TB", valueColor: "text-primary" },
    ],
  },
];

export default function PlatformConfigPage() {
  const [open, setOpen] = useState(false);
  const [defaultPlan, setDefaultPlan] = useState("");
  const [enableSignups, setEnableSignups] = useState("");
  const [sessionTimeout, setSessionTimeout] = useState("");
  const [defaultTimezone, setDefaultTimezone] = useState("");
  const [twoFactorAuth, setTwoFactorAuth] = useState("");
  const [ipWhitelisting, setIpWhitelisting] = useState("");
  const [storageProvider, setStorageProvider] = useState("");

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Platform Configuration"
        subtitle="Platform Admin / Platform Configuration"
        actions={<Button variant="secondary" onClick={() => setOpen(true)}>Edit Configuration</Button>}
      />

      <div className="grid grid-cols-2 gap-4">
        {sections.map((section) => (
          <Card key={section.title} className="p-5">
            <h3 className="text-sm font-semibold text-text-dark mb-1">{section.title}</h3>
            <p className="text-xs text-text-muted mb-4">{section.description}</p>
            <div className="flex flex-col gap-3">
              {section.fields.map((field) => (
                <div key={field.label} className="flex items-center justify-between py-2 px-3 bg-surface rounded-lg">
                  <span className="text-xs text-text-muted">{field.label}</span>
                  <span className={`text-sm font-medium ${field.valueColor || "text-text-dark"}`}>{field.value}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit Configuration"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Save Configuration</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Default Plan" required options={["Starter", "Growth", "Enterprise"]} placeholder="Select default plan" value={defaultPlan} onChange={(e) => setDefaultPlan(e.target.value)} />
          <Field label="Max Users Limit" required>
            <TextInput type="number" placeholder="e.g. 5000" />
          </Field>
          <SelectField label="Enable Signups" required options={["On", "Off"]} placeholder="Select option" value={enableSignups} onChange={(e) => setEnableSignups(e.target.value)} />
          <SelectField label="Session Timeout" required options={["15 minutes", "30 minutes", "1 hour", "2 hours", "Never"]} placeholder="Select timeout" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} />
          <SelectField label="Default Timezone" required options={["UTC"]} placeholder="Select timezone" value={defaultTimezone} onChange={(e) => setDefaultTimezone(e.target.value)} />
          <SelectField label="Two-Factor Auth" required options={["Required for Admins", "Optional", "Disabled"]} placeholder="Select option" value={twoFactorAuth} onChange={(e) => setTwoFactorAuth(e.target.value)} />
          <SelectField label="IP Whitelisting" required options={["Enabled", "Disabled"]} placeholder="Select option" value={ipWhitelisting} onChange={(e) => setIpWhitelisting(e.target.value)} />
          <SelectField label="Storage Provider" required options={["AWS S3", "Google Cloud", "Azure Blob"]} placeholder="Select provider" value={storageProvider} onChange={(e) => setStorageProvider(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
