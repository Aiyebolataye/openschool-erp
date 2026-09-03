"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";

const kpis = [
  { label: "Report Types", value: "12", detail: "", detailColor: "muted" as const },
  { label: "Active Automations", value: "14", detail: "", detailColor: "muted" as const },
  { label: "Automation Runs (7d)", value: "3,400", detail: "+5%", detailColor: "green" as const },
  { label: "Failed Runs", value: "2", detail: "", detailColor: "red" as const },
];

const reportGroups = [
  { title: "Academic", reports: ["Enrollment", "Attendance", "Academic performance"] },
  { title: "Operations", reports: ["Clinic activity", "Visitor stats", "Transport usage", "Library usage"] },
  { title: "Administration", reports: ["Payroll", "Staff performance", "Audit reports", "Automation performance"] },
];

const automations = [
  { name: "Late fee reminder", trigger: "Fee overdue > 3 days", status: { text: "Active", variant: "green" as const } },
  { name: "Absence notification", trigger: "Absent > 2 consecutive", status: { text: "Active", variant: "green" as const } },
  { name: "Result moderation alert", trigger: "Result submitted", status: { text: "Paused", variant: "orange" as const } },
];

function ReportsContent() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {reportGroups.map((g) => (
        <Card key={g.title} className="p-5">
          <h3 className="text-sm font-semibold text-text-dark mb-3">{g.title}</h3>
          <div className="flex flex-col gap-2">
            {g.reports.map((r) => (
              <div key={r} className="py-2 border-b border-border-light last:border-0">
                <p className="text-sm text-text-dark">{r}</p>
                <p className="text-xs text-text-muted">Filterable · Exportable · Scheduled</p>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function AutomationContent() {
  return (
    <Card className="divide-y divide-border-light">
      {automations.map((a) => (
        <div key={a.name} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-text-dark">{a.name}</p>
            <p className="text-xs text-text-muted mt-0.5">{a.trigger}</p>
          </div>
          <Badge variant={a.status.variant as "green"}>{a.status.text}</Badge>
        </div>
      ))}
    </Card>
  );
}

export default function ReportsPage() {
  const [generateOpen, setGenerateOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Reports & Automation"
        subtitle="Generate reports and manage automation workflows"
        actions={
          <>
            <Button variant="secondary" onClick={() => setScheduleOpen(true)}>Schedule</Button>
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
          { id: "reports", label: "Reports", content: <ReportsContent /> },
          { id: "automation", label: "Automation", content: <AutomationContent /> },
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
          <SelectField label="Report Type" required placeholder="Select type" options={["Academic", "Attendance", "Finance", "Behavior"]} />
          <SelectField label="Scope" required placeholder="Select scope" options={["Whole School", "Per Class", "Per Student"]} />
          <Field label="Period" required>
            <TextInput type="month" />
          </Field>
          <SelectField label="Format" required placeholder="Select format" options={["PDF", "Excel"]} />
        </div>
      </Modal>

      <Modal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title="Schedule Report"
        footer={
          <>
            <Button variant="secondary" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={() => setScheduleOpen(false)}>Schedule</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Recurrence" required placeholder="Select frequency" options={["Daily", "Weekly", "Monthly"]} />
          <SelectField label="Report Type" required placeholder="Select type" options={["Academic", "Attendance", "Finance", "Behavior"]} />
          <Field label="Recipients Email" required>
            <TextInput type="email" placeholder="admin@school.com" />
          </Field>
          <Field label="Time" required>
            <TextInput type="time" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
