"use client";

import { useState } from "react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { SelectField } from "@/components/ui/form";

const kpis = [
  { label: "MAU", value: "38.2K", detail: "+5.4% vs last month", detailColor: "green" as const },
  { label: "DAU", value: "8.4K", detail: "+3.2%", detailColor: "green" as const },
  { label: "AVG SESSION", value: "12m 30s", detail: "+8%", detailColor: "green" as const },
  { label: "FEATURE ADOPTION", value: "67.8%", detail: "", detailColor: "muted" as const },
];

const barData = [
  { label: "JAN", value: 65 }, { label: "FEB", value: 72 }, { label: "MAR", value: 58 },
  { label: "APR", value: 80 }, { label: "MAY", value: 68 }, { label: "JUN", value: 85 },
  { label: "JUL", value: 90 }, { label: "AUG", value: 75 }, { label: "SEP", value: 82 },
  { label: "OCT", value: 95 }, { label: "NOV", value: 88 }, { label: "DEC", value: 78 },
];

function BarChart({ data }: { data: typeof barData }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-2 h-48">
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center flex-1 gap-1">
            <div className="w-full bg-primary/80 rounded-t-sm hover:bg-primary transition-all" style={{ height: `${(d.value / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[10px] text-text-muted">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [open, setOpen] = useState(false);
  const [dataRange, setDataRange] = useState("");
  const [reportFormat, setReportFormat] = useState("");
  const [include, setInclude] = useState("");

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Analytics"
        subtitle="Platform Admin / Analytics"
        actions={
          <>
            <Select options={[{ label: "Last 30 Days", value: "30d" }]} placeholder="Last 30 Days" />
            <Button variant="secondary" onClick={() => setOpen(true)}>Export Data</Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-text-dark mb-1">User Activity Trends</h3>
          <p className="text-xs text-text-muted mb-4">Monthly active users over time</p>
          <BarChart data={barData} />
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-text-dark mb-1">Feature Usage</h3>
          <p className="text-xs text-text-muted mb-4">Most used platform features</p>
          <div className="flex flex-col gap-3 mt-4">
            {[
              { name: "Dashboard", usage: 92 },
              { name: "Reports", usage: 78 },
              { name: "User Management", usage: 65 },
              { name: "Billing", usage: 54 },
              { name: "Settings", usage: 41 },
            ].map((f) => (
              <div key={f.name} className="flex items-center gap-3">
                <span className="text-xs text-text-muted w-28">{f.name}</span>
                <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${f.usage}%` }} />
                </div>
                <span className="text-xs text-text-dark font-medium w-8 text-right">{f.usage}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Export Data"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Export</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Data Range" required options={["This Week", "This Month", "Quarter", "Year"]} placeholder="Select data range" value={dataRange} onChange={(e) => setDataRange(e.target.value)} />
          <SelectField label="Report Format" required options={["PDF", "Excel", "CSV"]} placeholder="Select format" value={reportFormat} onChange={(e) => setReportFormat(e.target.value)} />
          <SelectField label="Include" required options={["All Metrics", "Core Metrics"]} placeholder="Select inclusion" value={include} onChange={(e) => setInclude(e.target.value)} />
          <p className="text-xs text-text-muted">The export will be sent to your email when ready.</p>
        </div>
      </Modal>
    </div>
  );
}
