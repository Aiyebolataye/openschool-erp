"use client";

import { useState } from "react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";

const kpis = [
  { label: "ACTIVE SURVEYS", value: "8", detail: "", detailColor: "muted" as const },
  { label: "TOTAL RESPONSES", value: "3,240", detail: "+12% this month", detailColor: "green" as const },
  { label: "AVG RESPONSE RATE", value: "64.8%", detail: "+5.2%", detailColor: "green" as const },
  { label: "AVG SATISFACTION", value: "4.2/5", detail: "", detailColor: "muted" as const },
];

const data = [
  { survey: "Platform Satisfaction Q3", audience: "All Users", status: { text: "Active", variant: "green" as const }, responses: "1,240", rate: "68.2%", created: "Jul 1, 2026", closes: "Jul 31, 2026" },
  { survey: "Feature Priority Survey", audience: "Org Admins", status: { text: "Active", variant: "green" as const }, responses: "420", rate: "72.1%", created: "Jul 10, 2026", closes: "Aug 10, 2026" },
  { survey: "Onboarding Feedback", audience: "New Users", status: { text: "Active", variant: "green" as const }, responses: "890", rate: "54.3%", created: "Jun 15, 2026", closes: "Ongoing" },
  { survey: "Support Quality Review", audience: "Ticket Submitters", status: { text: "Closed", variant: "muted" as const }, responses: "340", rate: "61.8%", created: "May 1, 2026", closes: "May 31, 2026" },
  { survey: "NPS Assessment", audience: "All Users", status: { text: "Draft", variant: "muted" as const }, responses: "—", rate: "—", created: "Jul 25, 2026", closes: "Aug 25, 2026" },
];

const columns = [
  { key: "survey", label: "SURVEY", width: "200px" },
  { key: "audience", label: "AUDIENCE", width: "140px" },
  { key: "status", label: "STATUS", width: "90px" },
  { key: "responses", label: "RESPONSES", width: "90px" },
  { key: "rate", label: "RATE", width: "80px" },
  { key: "created", label: "CREATED", width: "100px" },
  { key: "closes", label: "CLOSES", width: "110px" },
  { key: "actions", label: "ACTIONS", width: "80px", align: "right" as const },
];

export default function SurveysPage() {
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<typeof data[number] | null>(null);
  const [audience, setAudience] = useState("");

  const dataWithActions = data.map((row) => ({
    ...row,
    actions: (
      <Button variant="ghost" size="sm" onClick={() => { setSelectedSurvey(row); setDetailOpen(true); }}>
        View
      </Button>
    ),
  }));

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Surveys"
        subtitle="Platform Admin / Surveys"
        actions={<Button onClick={() => setOpen(true)}>+ Create Survey</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select options={[{ label: "All Statuses", value: "all" }]} placeholder="All Statuses" />
          <SearchInput placeholder="Search surveys..." className="flex-1" />
        </div>
      </Card>

      <DataTable columns={columns} data={dataWithActions} />
      <Pagination currentPage={1} totalPages={2} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create Survey"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Create Survey</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Title" required>
            <TextInput placeholder="e.g. Platform Satisfaction Q3" />
          </Field>
          <SelectField label="Audience" required options={["All Users", "Org Admins", "Institution Admins", "New Users", "Ticket Submitters"]} placeholder="Select audience" value={audience} onChange={(e) => setAudience(e.target.value)} />
          <Field label="Description">
            <TextArea rows={4} placeholder="Describe the purpose of this survey..." />
          </Field>
          <Field label="Open Date" required>
            <TextInput type="date" />
          </Field>
          <Field label="Close Date" required>
            <TextInput type="date" />
          </Field>
        </div>
      </Modal>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Survey Details"
        footer={
          <Button variant="secondary" onClick={() => setDetailOpen(false)}>Close</Button>
        }
      >
        {selectedSurvey && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Survey</span>
                <span className="text-sm text-text-dark">{selectedSurvey.survey}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Status</span>
                <Badge variant={selectedSurvey.status.variant}>{selectedSurvey.status.text}</Badge>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Audience</span>
                <span className="text-sm text-text-dark">{selectedSurvey.audience}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Responses</span>
                <span className="text-sm text-text-dark">{selectedSurvey.responses}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Response Rate</span>
                <span className="text-sm text-text-dark">{selectedSurvey.rate}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Created</span>
                <span className="text-sm text-text-dark">{selectedSurvey.created}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Closes</span>
                <span className="text-sm text-text-dark">{selectedSurvey.closes}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
