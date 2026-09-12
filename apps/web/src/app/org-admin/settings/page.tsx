"use client";

import { useState } from "react";
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

export default function SettingsPage() {
  const [configOpen, setConfigOpen] = useState(false);
  const [configSection, setConfigSection] = useState("");
  const [config, setConfig] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const setField = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setConfig((prev) => ({ ...prev, [key]: e.target.value }));

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const sectionId = sections.find((s) => s.title === configSection)?.id ?? "org-details";

  function renderSection(id: string) {
    switch (id) {
      case "org-details":
        return (
          <>
            <Field label="Organization Name">
              <TextInput placeholder="Metro Education Group" value={config.orgName ?? ""} onChange={setField("orgName")} />
            </Field>
            <Field label="Contact Email">
              <TextInput type="email" placeholder="admin@metrogroup.edu" value={config.contactEmail ?? ""} onChange={setField("contactEmail")} />
            </Field>
            <Field label="Phone">
              <TextInput type="tel" placeholder="+1 234 567 890" value={config.orgPhone ?? ""} onChange={setField("orgPhone")} />
            </Field>
          </>
        );
      case "branding":
        return (
          <>
            <Field label="Primary Color">
              <TextInput placeholder="#1a56db" value={config.primaryColor ?? ""} onChange={setField("primaryColor")} />
            </Field>
            <Field label="Logo URL">
              <TextInput placeholder="https://example.com/logo.png" value={config.logoUrl ?? ""} onChange={setField("logoUrl")} />
            </Field>
          </>
        );
      case "billing":
        return (
          <>
            <SelectField label="Current Plan" options={["Starter", "Professional", "Enterprise"]} value={config.currentPlan ?? ""} onChange={setField("currentPlan")} />
            <Field label="Payment Email">
              <TextInput type="email" placeholder="billing@metrogroup.edu" value={config.billingEmail ?? ""} onChange={setField("billingEmail")} />
            </Field>
          </>
        );
      case "modules":
        return (
          <>
            <SelectField label="Academics" options={["Enabled", "Disabled"]} value={config.academics ?? ""} onChange={setField("academics")} />
            <SelectField label="Finance" options={["Enabled", "Disabled"]} value={config.finance ?? ""} onChange={setField("finance")} />
            <SelectField label="Attendance" options={["Enabled", "Disabled"]} value={config.attendance ?? ""} onChange={setField("attendance")} />
            <SelectField label="HR" options={["Enabled", "Disabled"]} value={config.hr ?? ""} onChange={setField("hr")} />
          </>
        );
      case "security":
        return (
          <>
            <SelectField label="SSO" options={["Enabled", "Disabled"]} value={config.sso ?? ""} onChange={setField("sso")} />
            <SelectField label="Two-Factor Auth" options={["Required", "Optional", "Disabled"]} value={config.twoFactor ?? ""} onChange={setField("twoFactor")} />
            <Field label="Session Timeout (minutes)">
              <TextInput type="number" placeholder="30" value={config.sessionTimeout ?? ""} onChange={setField("sessionTimeout")} />
            </Field>
          </>
        );
      case "privacy":
        return (
          <>
            <SelectField label="Data Retention" options={["1 Year", "3 Years", "5 Years", "Forever"]} value={config.retention ?? ""} onChange={setField("retention")} />
            <SelectField label="Export Access" options={["Admin Only", "All Staff", "Disabled"]} value={config.exportAccess ?? ""} onChange={setField("exportAccess")} />
          </>
        );
      case "notifications":
        return (
          <>
            <SelectField label="Email Notifications" options={["Enabled", "Disabled"]} value={config.emailNotif ?? ""} onChange={setField("emailNotif")} />
            <SelectField label="SMS Notifications" options={["Enabled", "Disabled"]} value={config.smsNotif ?? ""} onChange={setField("smsNotif")} />
          </>
        );
      case "templates":
        return (
          <>
            <SelectField label="Report Template" options={["Default", "Custom"]} value={config.reportTemplate ?? ""} onChange={setField("reportTemplate")} />
            <SelectField label="Invoice Template" options={["Default", "Custom"]} value={config.invoiceTemplate ?? ""} onChange={setField("invoiceTemplate")} />
          </>
        );
      default:
        return null;
    }
  }

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
            <Button onClick={() => { setConfigOpen(false); showToast("Settings saved"); }}>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          {renderSection(sectionId)}
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}