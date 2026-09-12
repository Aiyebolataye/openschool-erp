"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";

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

type Action = {
  type: string;
  template: string;
  body: string;
};

type Automation = {
  id: number;
  name: string;
  trigger: string;
  status: { text: string; variant: "green" | "orange" | "red" };
  actions: Action[];
};

const initialAutomations: Automation[] = [
  {
    id: 1,
    name: "Late fee reminder",
    trigger: "Fee overdue > 3 days",
    status: { text: "Active", variant: "green" },
    actions: [{ type: "Send email", template: "Fee Overdue Notice", body: "Your child's fees are overdue. Please make payment to avoid further action." }],
  },
  {
    id: 2,
    name: "Absence notification",
    trigger: "Absent consecutive days > 2",
    status: { text: "Active", variant: "green" },
    actions: [{ type: "Send SMS", template: "Absence Alert", body: "Your child has been absent for 2 consecutive days." }],
  },
  {
    id: 3,
    name: "Result moderation alert",
    trigger: "Result submitted",
    status: { text: "Paused", variant: "orange" },
    actions: [{ type: "Notify admin", template: "", body: "" }],
  },
];

const triggerTypeOptions = ["Fee overdue", "Absent consecutive days", "Result submitted", "Low attendance", "Custom"];
const actionOptions = ["Send email", "Send SMS", "Notify admin", "Create task"];
const statusOptions = ["Active", "Paused"];
const reportTypeOptions = ["Academic", "Attendance", "Finance", "Behavior"];
const scopeOptions = ["Whole School", "Per Class", "Per Student"];
const formatOptions = ["PDF", "Excel"];
const recurrenceOptions = ["Daily", "Weekly", "Monthly"];
const templateOptions = ["Fee Overdue Notice", "Absence Alert", "Generic Notice", "Custom"];

const templateSamples: Record<string, string> = {
  "Fee Overdue Notice": "Your child's fees are overdue. Please make payment to avoid further action.",
  "Absence Alert": "Your child has been absent from school. Please contact the school office.",
  "Generic Notice": "A notice from your child's school.",
};

const decomposeTrigger = (trigger: string) => {
  for (const t of triggerTypeOptions) {
    if (t === "Custom") continue;
    if (trigger === t) return { type: t, details: "", custom: "" };
    if (trigger.startsWith(`${t} `)) return { type: t, details: trigger.slice(t.length + 1), custom: "" };
  }
  return { type: "Custom", details: "", custom: trigger };
};

function ReportsContent({ onSelect }: { onSelect: (name: string, category: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {reportGroups.map((g) => (
        <Card key={g.title} className="p-5">
          <h3 className="text-sm font-semibold text-text-dark mb-3">{g.title}</h3>
          <div className="flex flex-col gap-2">
            {g.reports.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onSelect(r, g.title)}
                className="py-2 border-b border-border-light last:border-0 text-left hover:bg-surface-secondary rounded px-1 transition-colors"
              >
                <p className="text-sm text-text-dark font-medium">{r}</p>
                <p className="text-xs text-text-muted">Filterable · Exportable · Scheduled</p>
              </button>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function AutomationContent({ automations, onSelect }: { automations: Automation[]; onSelect: (index: number) => void }) {
  return (
    <Card className="divide-y divide-border-light">
      {automations.map((a, i) => (
        <button
          key={a.id}
          type="button"
          onClick={() => onSelect(i)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-secondary transition-colors text-left"
        >
          <div>
            <p className="text-sm font-medium text-text-dark">{a.name}</p>
            <p className="text-xs text-text-muted mt-0.5">{a.trigger}</p>
          </div>
          <Badge variant={a.status.variant}>{a.status.text}</Badge>
        </button>
      ))}
    </Card>
  );
}

export default function ReportsPage() {
  const [generateOpen, setGenerateOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [addAutomationOpen, setAddAutomationOpen] = useState(false);
  const [reportDetailOpen, setReportDetailOpen] = useState(false);
  const [automationDetailOpen, setAutomationDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState({ name: "", category: "" });
  const [selectedAutomationIndex, setSelectedAutomationIndex] = useState(0);

  const [automations, setAutomations] = useState<Automation[]>(initialAutomations);

  const [genType, setGenType] = useState("");
  const [genScope, setGenScope] = useState("");
  const [genPeriod, setGenPeriod] = useState("");
  const [genFormat, setGenFormat] = useState("");

  const [schedRecurrence, setSchedRecurrence] = useState("");
  const [schedType, setSchedType] = useState("");
  const [schedEmail, setSchedEmail] = useState("");
  const [schedTime, setSchedTime] = useState("");

  const [autoName, setAutoName] = useState("");
  const [autoTriggerType, setAutoTriggerType] = useState("");
  const [autoTriggerDetails, setAutoTriggerDetails] = useState("");
  const [autoTriggerCustom, setAutoTriggerCustom] = useState("");
  const [autoActions, setAutoActions] = useState<Action[]>([]);
  const [autoStatus, setAutoStatus] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const resetGenerate = () => {
    setGenType("");
    setGenScope("");
    setGenPeriod("");
    setGenFormat("");
  };

  const resetSchedule = () => {
    setSchedRecurrence("");
    setSchedType("");
    setSchedEmail("");
    setSchedTime("");
  };

  const resetAddAutomation = () => {
    setAutoName("");
    setAutoTriggerType("");
    setAutoTriggerDetails("");
    setAutoTriggerCustom("");
    setAutoActions([]);
    setAutoStatus("");
    setEditingIndex(null);
  };

  const updateAction = (index: number, patch: Partial<Action>) => {
    setAutoActions((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  };

  const addAction = () => {
    setAutoActions((prev) => [...prev, { type: "", template: "", body: "" }]);
  };

  const removeAction = (index: number) => {
    setAutoActions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAutomation = () => {
    const composedTrigger =
      autoTriggerType === "Custom"
        ? autoTriggerCustom.trim()
        : [autoTriggerType, autoTriggerDetails].filter(Boolean).join(" ");
    const statusVariant = autoStatus === "Active" ? "green" : "orange";
    const newAutomation: Automation = {
      id: editingIndex !== null ? automations[editingIndex].id : automations.reduce((max, a) => Math.max(max, a.id), 0) + 1,
      name: autoName,
      trigger: composedTrigger,
      status: { text: autoStatus, variant: statusVariant as "green" | "orange" },
      actions: autoActions.map((a) => ({ ...a })),
    };
    setAutomations((prev) =>
      editingIndex !== null ? prev.map((a, i) => (i === editingIndex ? newAutomation : a)) : [...prev, newAutomation]
    );
    resetAddAutomation();
    setAddAutomationOpen(false);
  };

  const openEditAutomation = () => {
    const a = automations[selectedAutomationIndex];
    if (!a) return;
    const decomposed = decomposeTrigger(a.trigger);
    setEditingIndex(selectedAutomationIndex);
    setAutoName(a.name);
    setAutoTriggerType(decomposed.type);
    setAutoTriggerDetails(decomposed.details);
    setAutoTriggerCustom(decomposed.custom);
    setAutoActions(a.actions.map((x) => ({ ...x })));
    setAutoStatus(a.status.text);
    setAutomationDetailOpen(false);
    setAddAutomationOpen(true);
  };

  const handleSelectReport = (name: string, category: string) => {
    setSelectedReport({ name, category });
    setReportDetailOpen(true);
  };

  const handleSelectAutomation = (index: number) => {
    setSelectedAutomationIndex(index);
    setAutomationDetailOpen(true);
  };

  const toggleAutomationStatus = () => {
    setAutomations((prev) =>
      prev.map((a, i) => {
        if (i !== selectedAutomationIndex) return a;
        const isCurrentlyActive = a.status.text === "Active";
        return {
          ...a,
          status: {
            text: isCurrentlyActive ? "Paused" : "Active",
            variant: isCurrentlyActive ? ("orange" as const) : ("green" as const),
          },
        };
      })
    );
  };

  const selectedAutomation = automations[selectedAutomationIndex] ?? {
    name: "",
    trigger: "",
    status: { text: "", variant: "green" as const },
    actions: [] as Action[],
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Reports & Automation"
        subtitle="Generate reports and manage automation workflows"
        actions={
          <>
            <Button variant="secondary" onClick={() => setScheduleOpen(true)}>Schedule</Button>
            <Button variant="secondary" onClick={() => { resetAddAutomation(); setAddAutomationOpen(true); }}>+ Add Automation</Button>
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
          { id: "reports", label: "Reports", content: <ReportsContent onSelect={handleSelectReport} /> },
          { id: "automation", label: "Automation", content: <AutomationContent automations={automations} onSelect={handleSelectAutomation} /> },
        ]}
      />

      <Modal
        open={generateOpen}
        onClose={() => { setGenerateOpen(false); resetGenerate(); }}
        title="Generate Report"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setGenerateOpen(false); resetGenerate(); }}>Cancel</Button>
            <Button onClick={() => { setGenerateOpen(false); resetGenerate(); }}>Generate</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Report Type" required placeholder="Select type" options={reportTypeOptions} value={genType} onChange={(e) => setGenType(e.target.value)} />
          <SelectField label="Scope" required placeholder="Select scope" options={scopeOptions} value={genScope} onChange={(e) => setGenScope(e.target.value)} />
          <Field label="Period" required>
            <TextInput type="month" value={genPeriod} onChange={(e) => setGenPeriod(e.target.value)} />
          </Field>
          <SelectField label="Format" required placeholder="Select format" options={formatOptions} value={genFormat} onChange={(e) => setGenFormat(e.target.value)} />
        </div>
      </Modal>

      <Modal
        open={scheduleOpen}
        onClose={() => { setScheduleOpen(false); resetSchedule(); }}
        title="Schedule Report"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setScheduleOpen(false); resetSchedule(); }}>Cancel</Button>
            <Button onClick={() => { setScheduleOpen(false); resetSchedule(); }}>Schedule</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Recurrence" required placeholder="Select frequency" options={recurrenceOptions} value={schedRecurrence} onChange={(e) => setSchedRecurrence(e.target.value)} />
          <SelectField label="Report Type" required placeholder="Select type" options={reportTypeOptions} value={schedType} onChange={(e) => setSchedType(e.target.value)} />
          <Field label="Recipients Email" required>
            <TextInput type="email" placeholder="admin@school.com" value={schedEmail} onChange={(e) => setSchedEmail(e.target.value)} />
          </Field>
          <Field label="Time" required>
            <TextInput type="time" value={schedTime} onChange={(e) => setSchedTime(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={addAutomationOpen}
        onClose={() => { setAddAutomationOpen(false); resetAddAutomation(); }}
        title={editingIndex !== null ? "Edit Automation" : "Add Automation"}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setAddAutomationOpen(false); resetAddAutomation(); }}>Cancel</Button>
            <Button onClick={handleSaveAutomation}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Name" required>
            <TextInput placeholder="e.g. Late fee reminder" value={autoName} onChange={(e) => setAutoName(e.target.value)} />
          </Field>
          <SelectField label="Trigger Type" required placeholder="Select trigger type" options={triggerTypeOptions} value={autoTriggerType} onChange={(e) => setAutoTriggerType(e.target.value)} />
          {autoTriggerType === "Custom" ? (
            <Field label="Custom Trigger Description" required>
              <TextInput placeholder="e.g. Event cancelled at least 24h before" value={autoTriggerCustom} onChange={(e) => setAutoTriggerCustom(e.target.value)} />
            </Field>
          ) : autoTriggerType ? (
            <Field label="Trigger Details" required>
              <TextInput placeholder="e.g. > 3 days, > 2 consecutive" value={autoTriggerDetails} onChange={(e) => setAutoTriggerDetails(e.target.value)} />
            </Field>
          ) : null}
          <SelectField label="Status" required placeholder="Select status" options={statusOptions} value={autoStatus} onChange={(e) => setAutoStatus(e.target.value)} />
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium text-text-dark">Actions</span>
            {autoActions.map((action, i) => (
              <div key={i} className="border border-border-light rounded-lg p-3 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <SelectField
                      label="Action Type"
                      required
                      placeholder="Select action type"
                      options={actionOptions}
                      value={action.type}
                      onChange={(e) => updateAction(i, { type: e.target.value })}
                    />
                  </div>
                  <Button variant="ghost" onClick={() => removeAction(i)}>Remove</Button>
                </div>
                {action.type === "Send email" || action.type === "Send SMS" ? (
                  <>
                    <SelectField
                      label="Message Template"
                      required
                      placeholder="Select template"
                      options={templateOptions}
                      value={action.template}
                      onChange={(e) => {
                        const t = e.target.value;
                        updateAction(i, { template: t, body: t === "Custom" ? "" : (templateSamples[t] ?? "") });
                      }}
                    />
                    <Field label="Message Body" required>
                      <TextArea rows={3} placeholder="Message body" value={action.body} onChange={(e) => updateAction(i, { body: e.target.value })} />
                    </Field>
                  </>
                ) : null}
              </div>
            ))}
            <Button variant="secondary" onClick={addAction}>+ Add Action</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={reportDetailOpen}
        onClose={() => setReportDetailOpen(false)}
        title={selectedReport.name}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReportDetailOpen(false)}>Close</Button>
            <Button onClick={() => { setReportDetailOpen(false); setGenerateOpen(true); }}>Generate</Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="flex justify-between">
            <span className="text-sm text-text-muted">Category</span>
            <span className="text-sm font-medium text-text-dark">{selectedReport.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-muted">Filters</span>
            <span className="text-sm font-medium text-text-dark">Available</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-muted">Format</span>
            <span className="text-sm font-medium text-text-dark">PDF, Excel</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-muted">Last Generated</span>
            <span className="text-sm font-medium text-text-dark">—</span>
          </div>
        </div>
      </Modal>

      <Modal
        open={automationDetailOpen}
        onClose={() => setAutomationDetailOpen(false)}
        title={selectedAutomation.name}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAutomationDetailOpen(false)}>Close</Button>
            <Button variant="secondary" onClick={openEditAutomation}>Edit</Button>
            <Button onClick={() => { toggleAutomationStatus(); setAutomationDetailOpen(false); }}>
              {selectedAutomation.status.text === "Active" ? "Pause" : "Activate"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="flex justify-between">
            <span className="text-sm text-text-muted">Trigger</span>
            <span className="text-sm font-medium text-text-dark">{selectedAutomation.trigger}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted">Status</span>
            <Badge variant={selectedAutomation.status.variant}>{selectedAutomation.status.text}</Badge>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-text-muted">Actions</span>
            {selectedAutomation.actions.map((act, i) => (
              <div key={i} className="border border-border-light rounded-lg p-3 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge variant="blue">{act.type}</Badge>
                  {act.template && <span className="text-xs text-text-muted">{act.template}</span>}
                </div>
                <p className="text-sm text-text-dark">{act.body || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}