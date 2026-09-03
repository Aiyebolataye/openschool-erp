"use client";

import { useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";

const kpis = [
  { label: "Available Reports", value: "12", detail: "", detailColor: "muted" as const },
  { label: "Scheduled", value: "4", detail: "", detailColor: "muted" as const },
  { label: "Avg Performance", value: "82.4%", detail: "+2.1%", detailColor: "green" as const },
  { label: "Revenue YTD", value: "$3.4M", detail: "+8.3%", detailColor: "green" as const },
];

const reportGroups = [
  {
    title: "Academic",
    reports: [
      { name: "Enrollment Summary", frequency: "Monthly" },
      { name: "Examination Performance", frequency: "Per Term" },
      { name: "Attendance Report", frequency: "Weekly" },
    ],
  },
  {
    title: "Financial",
    reports: [
      { name: "Organization Revenue", frequency: "Monthly" },
      { name: "Outstanding Fees", frequency: "Monthly" },
      { name: "Institution Financial Performance", frequency: "Monthly" },
    ],
  },
  {
    title: "Operational",
    reports: [
      { name: "Staff Distribution", frequency: "Quarterly" },
      { name: "Student Distribution", frequency: "Quarterly" },
      { name: "Institution Growth", frequency: "Annually" },
    ],
  },
];

const ranking = [
  { rank: 1, institution: "Sunrise International", performance: "87.2%", attendance: "93.5%" },
  { rank: 2, institution: "Greenfield Academy", performance: "85.4%", attendance: "91.2%" },
  { rank: 3, institution: "Metropolitan Schools", performance: "83.1%", attendance: "89.8%" },
  { rank: 4, institution: "Coastal Education Trust", performance: "76.8%", attendance: "84.2%" },
  { rank: 5, institution: "Pinnacle Learning", performance: "71.3%", attendance: "78.1%" },
];

const barData = [
  { label: "JAN", value: 70 }, { label: "FEB", value: 74 }, { label: "MAR", value: 68 },
  { label: "APR", value: 78 }, { label: "MAY", value: 72 }, { label: "JUN", value: 81 },
  { label: "JUL", value: 85 },
];

function ReportsContent() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {reportGroups.map((group) => (
        <Card key={group.title} className="p-5">
          <h3 className="text-sm font-semibold text-text-dark">{group.title}</h3>
          <p className="text-xs text-text-muted mt-0.5 mb-4">Filterable, exportable, scheduled</p>
          <div className="flex flex-col gap-2">
            {group.reports.map((report) => (
              <div key={report.name} className="py-2 border-b border-border-light last:border-0">
                <p className="text-sm font-medium text-text-dark">{report.name}</p>
                <p className="text-xs text-text-muted">{report.frequency}</p>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function AnalyticsContent() {
  const max = Math.max(...barData.map((d) => d.value));
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-text-dark mb-1">Academic Trends</h3>
        <p className="text-xs text-text-muted mb-4">Average performance across institutions</p>
        <div className="flex items-end gap-2 h-40">
          {barData.map((d, i) => (
            <div key={i} className="flex flex-col items-center flex-1 gap-1">
              <div className="w-full bg-primary/80 rounded-t-sm hover:bg-primary" style={{ height: `${(d.value / max) * 100}%` }} />
              <span className="text-[10px] text-text-muted">{d.label}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-text-dark mb-4">Institution Rankings</h3>
        <div className="flex flex-col gap-2">
          {ranking.map((r) => (
            <div key={r.institution} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${r.rank <= 3 ? "bg-primary-light text-primary" : "bg-surface text-text-muted"}`}>
                  {r.rank}
                </span>
                <span className="text-sm font-medium text-text-dark">{r.institution}</span>
              </div>
              <span className="text-xs text-text-muted">Perf: <span className="text-text-dark font-medium">{r.performance}</span> · Att: {r.attendance}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function ReportsPage() {
  const [generateOpen, setGenerateOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Cross-institution reporting and analytics"
        actions={
          <>
            <Select options={[{ label: "This Year", value: "year" }]} placeholder="Time Range" />
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
          { id: "analytics", label: "Analytics", content: <AnalyticsContent /> },
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
        <div className="space-y-4">
          <SelectField label="Report Type" required placeholder="Select report type" options={["Enrollment Summary", "Examination Performance", "Attendance Report", "Organization Revenue", "Outstanding Fees", "Staff Distribution"]} />
          <SelectField label="Scope" required placeholder="Select scope" options={["All Institutions", "Single Institution"]} />
          <Field label="Period">
            <TextInput placeholder="e.g. Jul 2026" />
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
        <div className="space-y-4">
          <SelectField label="Recurrence" required placeholder="Select recurrence" options={["Daily", "Weekly", "Monthly"]} />
          <SelectField label="Report Type" required placeholder="Select report type" options={["Enrollment Summary", "Examination Performance", "Attendance Report", "Organization Revenue", "Outstanding Fees", "Staff Distribution"]} />
          <Field label="Recipients Email">
            <TextInput type="email" placeholder="admin@metrogroup.edu" />
          </Field>
          <Field label="Time">
            <TextInput type="time" placeholder="09:00" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
