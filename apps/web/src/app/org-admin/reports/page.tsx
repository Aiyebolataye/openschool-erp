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
  { label: "Revenue YTD", value: "₦3.4M", detail: "+8.3%", detailColor: "green" as const },
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

function ReportsContent({ onSelect }: { onSelect: (group: string, name: string, frequency: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {reportGroups.map((group) => (
        <Card key={group.title} className="p-5">
          <h3 className="text-sm font-semibold text-text-dark">{group.title}</h3>
          <p className="text-xs text-text-muted mt-0.5 mb-4">Filterable, exportable, scheduled</p>
          <div className="flex flex-col gap-2">
            {group.reports.map((report) => (
              <button
                key={report.name}
                onClick={() => onSelect(group.title, report.name, report.frequency)}
                className="text-left py-2 border-b border-border-light last:border-0 hover:bg-surface/50 transition-colors rounded-sm"
              >
                <p className="text-sm font-medium text-text-dark">{report.name}</p>
                <p className="text-xs text-text-muted">{report.frequency}</p>
              </button>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function AnalyticsContent({ onSelect }: { onSelect: (r: (typeof ranking)[number]) => void }) {
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
            <button
              key={r.institution}
              onClick={() => onSelect(r)}
              className="flex items-center justify-between py-2 border-b border-border-light last:border-0 hover:bg-surface/50 transition-colors rounded-sm"
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${r.rank <= 3 ? "bg-primary-light text-primary" : "bg-surface text-text-muted"}`}>
                  {r.rank}
                </span>
                <span className="text-sm font-medium text-text-dark">{r.institution}</span>
              </div>
              <span className="text-xs text-text-muted">Perf: <span className="text-text-dark font-medium">{r.performance}</span> · Att: {r.attendance}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function ReportsPage() {
  const [generateOpen, setGenerateOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [viewReport, setViewReport] = useState<{ group: string; name: string; frequency: string } | null>(null);
  const [viewRanking, setViewRanking] = useState<{ institution: string; performance: string; attendance: string } | null>(null);
  const [timeRange, setTimeRange] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [genType, setGenType] = useState("");
  const [genScope, setGenScope] = useState("");
  const [genPeriod, setGenPeriod] = useState("");
  const [genFormat, setGenFormat] = useState("");

  const [schedRecurrence, setSchedRecurrence] = useState("");
  const [schedType, setSchedType] = useState("");
  const [schedEmail, setSchedEmail] = useState("");
  const [schedTime, setSchedTime] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Cross-institution reporting and analytics"
        actions={
          <>
            <Select
              options={[{ label: "This Year", value: "year" }, { label: "This Month", value: "month" }, { label: "This Week", value: "week" }]}
              placeholder="Time Range"
              value={timeRange}
              onChange={(val) => setTimeRange(val)}
            />
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
          { id: "reports", label: "Reports", content: <ReportsContent onSelect={(group, name, frequency) => setViewReport({ group, name, frequency })} /> },
          { id: "analytics", label: "Analytics", content: <AnalyticsContent onSelect={(r) => setViewRanking(r)} /> },
        ]}
      />

      <Modal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        title="Generate Report"
        footer={
          <>
            <Button variant="secondary" onClick={() => setGenerateOpen(false)}>Cancel</Button>
            <Button onClick={() => { setGenerateOpen(false); setGenType(""); setGenScope(""); setGenPeriod(""); setGenFormat(""); showToast("Report generated successfully"); }}>Generate</Button>
          </>
        }
      >
        <div className="space-y-4">
          <SelectField label="Report Type" required placeholder="Select report type" options={["Enrollment Summary", "Examination Performance", "Attendance Report", "Organization Revenue", "Outstanding Fees", "Staff Distribution"]} value={genType} onChange={(e) => setGenType(e.target.value)} />
          <SelectField label="Scope" required placeholder="Select scope" options={["All Institutions", "Single Institution"]} value={genScope} onChange={(e) => setGenScope(e.target.value)} />
          <Field label="Period">
            <TextInput placeholder="e.g. Jul 2026" value={genPeriod} onChange={(e) => setGenPeriod(e.target.value)} />
          </Field>
          <SelectField label="Format" required placeholder="Select format" options={["PDF", "Excel"]} value={genFormat} onChange={(e) => setGenFormat(e.target.value)} />
        </div>
      </Modal>

      <Modal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title="Schedule Report"
        footer={
          <>
            <Button variant="secondary" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={() => { setScheduleOpen(false); setSchedRecurrence(""); setSchedType(""); setSchedEmail(""); setSchedTime(""); showToast("Report scheduled"); }}>Schedule</Button>
          </>
        }
      >
        <div className="space-y-4">
          <SelectField label="Recurrence" required placeholder="Select recurrence" options={["Daily", "Weekly", "Monthly"]} value={schedRecurrence} onChange={(e) => setSchedRecurrence(e.target.value)} />
          <SelectField label="Report Type" required placeholder="Select report type" options={["Enrollment Summary", "Examination Performance", "Attendance Report", "Organization Revenue", "Outstanding Fees", "Staff Distribution"]} value={schedType} onChange={(e) => setSchedType(e.target.value)} />
          <Field label="Recipients Email">
            <TextInput type="email" placeholder="admin@metrogroup.edu" value={schedEmail} onChange={(e) => setSchedEmail(e.target.value)} />
          </Field>
          <Field label="Time">
            <TextInput type="time" placeholder="09:00" value={schedTime} onChange={(e) => setSchedTime(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={!!viewReport}
        onClose={() => setViewReport(null)}
        title={viewReport?.name ?? ""}
        subtitle={viewReport?.group}
        footer={<Button variant="secondary" onClick={() => setViewReport(null)}>Close</Button>}
      >
        {viewReport && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-text-muted">Category</span>
                <p className="text-sm font-medium text-text-dark">{viewReport.group}</p>
              </div>
              <div>
                <span className="text-xs text-text-muted">Frequency</span>
                <p className="text-sm font-medium text-text-dark">{viewReport.frequency}</p>
              </div>
            </div>
            <p className="text-xs text-text-muted">This report can be generated on demand or scheduled for automatic delivery.</p>
          </div>
        )}
      </Modal>

      <Modal
        open={!!viewRanking}
        onClose={() => setViewRanking(null)}
        title={viewRanking?.institution ?? ""}
        subtitle="Institution ranking details"
        footer={<Button variant="secondary" onClick={() => setViewRanking(null)}>Close</Button>}
      >
        {viewRanking && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-text-muted">Rank</span>
                <p className="text-sm font-medium text-text-dark">#{viewRanking.institution === ranking[0].institution ? 1 : ranking.find((r) => r.institution === viewRanking.institution)?.rank ?? "—"}</p>
              </div>
              <div>
                <span className="text-xs text-text-muted">Performance</span>
                <p className="text-sm font-medium text-text-dark">{viewRanking.performance}</p>
              </div>
              <div>
                <span className="text-xs text-text-muted">Attendance</span>
                <p className="text-sm font-medium text-text-dark">{viewRanking.attendance}</p>
              </div>
            </div>
            <div className="border-t border-border-light pt-4">
              <Badge variant="green">{viewRanking.performance}</Badge>
            </div>
          </div>
        )}
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}