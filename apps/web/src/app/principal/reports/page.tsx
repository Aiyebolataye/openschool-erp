"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, SelectField } from "@/components/ui/form";
import { useState } from "react";

const kpis = [
  { label: "Academic Reports", value: "14", detail: "", detailColor: "muted" as const },
  { label: "Attendance Reports", value: "6", detail: "", detailColor: "muted" as const },
  { label: "Behaviour Reports", value: "3", detail: "", detailColor: "muted" as const },
  { label: "Scheduled", value: "4", detail: "", detailColor: "orange" as const },
];

const academic = [
  { name: "Enrollment Summary", frequency: "Monthly" },
  { name: "Attendance Overview", frequency: "Weekly" },
];

function ReportList() {
  return (
    <Card className="divide-y divide-border-light">
      {academic.map((r) => (
        <div key={r.name} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-text-dark">{r.name}</p>
            <p className="text-xs text-text-muted mt-0.5">{r.frequency} · Filterable · Exportable</p>
          </div>
          <Button variant="secondary" size="sm">View</Button>
        </div>
      ))}
    </Card>
  );
}

export default function PrincipalReportsPage() {
  const [generateOpen, setGenerateOpen] = useState(false);

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Reports"
        subtitle="Academic and operational reports"
        actions={
          <>
            <Button variant="secondary">Schedule</Button>
            <Button onClick={() => setGenerateOpen(true)}>+ Generate</Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Tabs
        tabs={[
          { id: "academic", label: "Academic", content: <ReportList /> },
          { id: "behavior", label: "Behaviour", content: <ReportList /> },
        ]}
      />

      <Modal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        title="Generate Report"
        footer={
          <>
            <Button variant="secondary" onClick={() => setGenerateOpen(false)}>Cancel</Button>
            <Button onClick={() => setGenerateOpen(false)}>Generate</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Report Type" required placeholder="Select type" options={["Academic", "Attendance", "Behaviour", "Credit Recovery", "Enrollment"]} />
          <SelectField label="Scope" required placeholder="Select scope" options={["Whole School", "Per Class", "Per Student"]} />
          <SelectField label="Period" required placeholder="Select period" options={["Term 3", "This Month", "Academic Year"]} />
          <SelectField label="Format" required placeholder="Select format" options={["PDF", "Excel", "CSV"]} />
        </div>
      </Modal>
    </div>
  );
}
