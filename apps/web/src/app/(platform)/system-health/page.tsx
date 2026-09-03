"use client";

import { useState } from "react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { SelectField } from "@/components/ui/form";

const kpis = [
  { label: "UPTIME (30D)", value: "99.97%", detail: "4 min downtime total", detailColor: "green" as const },
  { label: "CPU USAGE", value: "34%", detail: "Normal load", detailColor: "green" as const },
  { label: "MEMORY", value: "68%", detail: "48GB / 72GB", detailColor: "green" as const },
  { label: "DISK USAGE", value: "54%", detail: "2.4TB / 4.5TB", detailColor: "green" as const },
];

const services = [
  { service: "PostgreSQL Database", status: { text: "Operational", variant: "green" as const }, uptime: "99.99%", latency: "12ms", lastCheck: "2 min ago" },
  { service: "Redis Cache", status: { text: "Operational", variant: "green" as const }, uptime: "99.99%", latency: "3ms", lastCheck: "2 min ago" },
  { service: "AWS S3 Storage", status: { text: "Operational", variant: "green" as const }, uptime: "99.99%", latency: "45ms", lastCheck: "2 min ago" },
  { service: "SMTP Service", status: { text: "Operational", variant: "green" as const }, uptime: "99.95%", latency: "120ms", lastCheck: "5 min ago" },
  { service: "Search Engine", status: { text: "Degraded", variant: "orange" as const }, uptime: "99.80%", latency: "340ms", lastCheck: "2 min ago" },
  { service: "CDN", status: { text: "Operational", variant: "green" as const }, uptime: "99.99%", latency: "18ms", lastCheck: "2 min ago" },
  { service: "Background Jobs", status: { text: "Operational", variant: "green" as const }, uptime: "99.90%", latency: "N/A", lastCheck: "1 min ago" },
  { service: "Monitoring", status: { text: "Operational", variant: "green" as const }, uptime: "99.99%", latency: "8ms", lastCheck: "1 min ago" },
];

const columns = [
  { key: "service", label: "SERVICE", width: "200px" },
  { key: "status", label: "STATUS", width: "120px" },
  { key: "uptime", label: "UPTIME", width: "100px", align: "center" as const },
  { key: "latency", label: "LATENCY", width: "100px", align: "center" as const },
  { key: "lastCheck", label: "LAST CHECK", width: "100px", align: "right" as const },
];

export default function SystemHealthPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="System Health"
        subtitle="Platform Admin / System Health"
        actions={<Button variant="secondary" onClick={() => setOpen(true)}>Run Diagnostics</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <h3 className="text-sm font-semibold text-text-dark mb-4">Service Status</h3>
      <DataTable columns={columns} data={services} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Run Diagnostics"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Run Diagnostics</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Diagnostics scope" required options={["Full Run", "API Only", "DB Only", "Cache Only"]} placeholder="Select scope" value="" onChange={() => {}} />
          <p className="text-xs text-text-muted">This may take a few minutes</p>
        </div>
      </Modal>
    </div>
  );
}
