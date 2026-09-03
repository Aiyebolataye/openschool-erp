"use client";

import { useState } from "react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Copy } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";

const kpis = [
  { label: "API CALLS (24H)", value: "1.2M", detail: "+12% vs yesterday", detailColor: "green" as const },
  { label: "WEBHOOKS", value: "18", detail: "3 inactive", detailColor: "muted" as const },
  { label: "API KEYS", value: "24", detail: "2 expiring soon", detailColor: "orange" as const },
  { label: "ERROR RATE", value: "0.12%", detail: "", detailColor: "green" as const },
];

const apiKeys = [
  { name: "Production API Key", key: "sk_live_****4a2b", status: { text: "Active", variant: "green" as const }, created: "Jan 15, 2026", lastUsed: "2 min ago" },
  { name: "Staging API Key", key: "sk_test_****8c3d", status: { text: "Active", variant: "green" as const }, created: "Mar 22, 2026", lastUsed: "1 hr ago" },
  { name: "Development Key", key: "sk_dev_****2e1f", status: { text: "Active", variant: "green" as const }, created: "Jun 8, 2026", lastUsed: "3 hrs ago" },
  { name: "Legacy Integration", key: "sk_live_****9g4h", status: { text: "Expiring", variant: "orange" as const }, created: "Aug 19, 2025", lastUsed: "5 days ago" },
];

const endpoints = [
  { method: "GET", path: "/api/v1/organizations", calls: "245K", latency: "45ms", errors: "0.02%" },
  { method: "POST", path: "/api/v1/institutions", calls: "12.3K", latency: "120ms", errors: "0.08%" },
  { method: "GET", path: "/api/v1/users", calls: "189K", latency: "38ms", errors: "0.01%" },
  { method: "PUT", path: "/api/v1/subscriptions/[id]", calls: "8.2K", latency: "95ms", errors: "0.15%" },
  { method: "GET", path: "/api/v1/analytics/dashboard", calls: "67K", latency: "210ms", errors: "0.05%" },
];

const methodColor: Record<string, string> = {
  GET: "bg-green-light text-green",
  POST: "bg-primary-light text-primary",
  PUT: "bg-orange-light text-orange",
  DELETE: "bg-red-light text-red",
};

export default function DeveloperPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Developer"
        subtitle="Platform Admin / Developer"
        actions={<Button onClick={() => setOpen(true)}>+ Generate API Key</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-text-dark mb-4">API Keys</h3>
          <div className="flex flex-col gap-3">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.name} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                <div>
                  <p className="text-sm font-medium text-text-dark">{apiKey.name}</p>
                  <p className="text-xs text-text-muted font-mono">{apiKey.key}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={apiKey.status.variant}>{apiKey.status.text}</Badge>
                  <Button variant="ghost" size="sm"><Copy className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-text-dark mb-4">Top Endpoints</h3>
          <div className="flex flex-col gap-3">
            {endpoints.map((ep) => (
              <div key={ep.path} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${methodColor[ep.method]}`}>{ep.method}</span>
                  <span className="text-xs text-text-dark font-mono">{ep.path}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span>{ep.calls}</span>
                  <span>{ep.latency}</span>
                  <span className="text-green">{ep.errors}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Generate API Key"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Generate Key</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Key Name" required>
            <TextInput placeholder="e.g. Production API Key" />
          </Field>
          <Field label="Scopes">
            <TextInput placeholder="e.g. read:orgs, write:users" />
          </Field>
          <SelectField label="Expires" required options={["30 days", "90 days", "1 year", "Never"]} placeholder="Select expiry" value="" onChange={() => {}} />
          <div className="rounded-lg bg-orange-light border border-orange/20 px-4 py-3">
            <p className="text-xs text-orange font-medium">Important: Copy your API key immediately after generation. It will not be shown again.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
