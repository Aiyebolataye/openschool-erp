"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";

const sections = [
  {
    title: "Profile",
    description: "Manage your account settings",
    fields: [
      { label: "Name", value: "Enterprise Admin" },
      { label: "Email", value: "admin@openschool.io" },
      { label: "Role", value: "Super Admin" },
    ],
  },
  {
    title: "Security",
    description: "Password and authentication settings",
    fields: [
      { label: "Two-Factor Auth", value: "Enabled", valueColor: "text-green" },
      { label: "Last Password Change", value: "14 days ago" },
      { label: "Active Sessions", value: "2" },
    ],
  },
  {
    title: "Notifications",
    description: "Configure notification preferences",
    fields: [
      { label: "Email Notifications", value: "Enabled", valueColor: "text-green" },
      { label: "Critical Alerts", value: "Enabled", valueColor: "text-green" },
      { label: "Weekly Digest", value: "Disabled" },
    ],
  },
  {
    title: "Appearance",
    description: "Customize your workspace",
    fields: [
      { label: "Theme", value: "Light" },
      { label: "Sidebar", value: "Expanded" },
      { label: "Compact Mode", value: "Disabled" },
    ],
  },
];

export default function SettingsPage() {
  const [open, setOpen] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState("");

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Settings"
        subtitle="Platform Admin / Settings"
        actions={<Button variant="secondary" onClick={() => setOpen(true)}>Edit Settings</Button>}
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
        title="Edit Settings"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Save Changes</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Platform Name" required>
            <TextInput placeholder="e.g. School ERP Platform" />
          </Field>
          <Field label="Support Email" required>
            <TextInput type="email" placeholder="e.g. support@openschool.io" />
          </Field>
          <SelectField label="Default Language" required options={["English", "Spanish", "French", "Arabic", "Hindi"]} placeholder="Select language" value={defaultLanguage} onChange={(e) => setDefaultLanguage(e.target.value)} />
          <SelectField label="Maintenance Mode" required options={["Off", "On"]} placeholder="Select mode" value={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.value)} />
          <Field label="About">
            <TextArea rows={3} placeholder="Brief description about the platform..." />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
