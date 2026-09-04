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
  { label: "OPEN TICKETS", value: "23", detail: "3 urgent", detailColor: "red" as const },
  { label: "IN PROGRESS", value: "12", detail: "", detailColor: "muted" as const },
  { label: "RESOLVED TODAY", value: "8", detail: "", detailColor: "green" as const },
  { label: "AVG RESOLUTION", value: "4.2h", detail: "-18% vs last week", detailColor: "green" as const },
];

const data = [
  { ticket: "TKT-1042", subject: "Integration not syncing", org: "Greenfield Academy", priority: { text: "URGENT", variant: "red" as const }, status: { text: "Open", variant: "orange" as const }, assignee: "Maria Garcia", created: "1 hr ago" },
  { ticket: "TKT-1041", subject: "Billing question", org: "Pacific Academy", priority: { text: "NORMAL", variant: "muted" as const }, status: { text: "In Progress", variant: "blue" as const }, assignee: "James Wilson", created: "3 hrs ago" },
  { ticket: "TKT-1040", subject: "SSO configuration help", org: "Metropolitan Schools", priority: { text: "NORMAL", variant: "muted" as const }, status: { text: "Open", variant: "orange" as const }, assignee: "Unassigned", created: "5 hrs ago" },
  { ticket: "TKT-1039", subject: "Data export request", org: "Sunrise International", priority: { text: "LOW", variant: "muted" as const }, status: { text: "Resolved", variant: "green" as const }, assignee: "Dr. Sarah Chen", created: "1 day ago" },
  { ticket: "TKT-1038", subject: "Feature request: Bulk import", org: "Coastal Education", priority: { text: "NORMAL", variant: "muted" as const }, status: { text: "Resolved", variant: "green" as const }, assignee: "Aisha Patel", created: "2 days ago" },
];

const columns = [
  { key: "ticket", label: "TICKET", width: "100px" },
  { key: "subject", label: "SUBJECT", width: "220px" },
  { key: "org", label: "ORGANIZATION", width: "160px" },
  { key: "priority", label: "PRIORITY", width: "90px" },
  { key: "status", label: "STATUS", width: "100px" },
  { key: "assignee", label: "ASSIGNEE", width: "140px" },
  { key: "created", label: "CREATED", width: "100px" },
  { key: "actions", label: "ACTIONS", width: "80px", align: "right" as const },
];

export default function SupportPage() {
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<typeof data[number] | null>(null);
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");

  const dataWithActions = data.map((row) => ({
    ...row,
    actions: (
      <Button variant="ghost" size="sm" onClick={() => { setSelectedTicket(row); setDetailOpen(true); }}>
        View
      </Button>
    ),
  }));

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Support Center"
        subtitle="Platform Admin / Support Center"
        actions={<Button onClick={() => setOpen(true)}>+ Create Ticket</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select options={[{ label: "All Statuses", value: "all" }]} placeholder="All Statuses" />
          <Select options={[{ label: "All Priorities", value: "all" }]} placeholder="All Priorities" />
          <SearchInput placeholder="Search tickets..." className="flex-1" />
        </div>
      </Card>

      <DataTable columns={columns} data={dataWithActions} />
      <Pagination currentPage={1} totalPages={5} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create Ticket"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Create Ticket</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Subject" required>
            <TextInput placeholder="e.g. SSO configuration help" />
          </Field>
          <SelectField label="Category" required options={["Billing", "Technical", "Account", "Feature Request"]} placeholder="Select category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <SelectField label="Priority" required options={["Low", "Medium", "High", "Urgent"]} placeholder="Select priority" value={priority} onChange={(e) => setPriority(e.target.value)} />
          <Field label="Description" required>
            <TextArea rows={5} placeholder="Describe the issue in detail..." />
          </Field>
        </div>
      </Modal>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Ticket Details"
        footer={
          <Button variant="secondary" onClick={() => setDetailOpen(false)}>Close</Button>
        }
      >
        {selectedTicket && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Ticket</span>
                <span className="text-sm text-text-dark">{selectedTicket.ticket}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Status</span>
                <Badge variant={selectedTicket.status.variant}>{selectedTicket.status.text}</Badge>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Subject</span>
                <span className="text-sm text-text-dark">{selectedTicket.subject}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Priority</span>
                <Badge variant={selectedTicket.priority.variant}>{selectedTicket.priority.text}</Badge>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Organization</span>
                <span className="text-sm text-text-dark">{selectedTicket.org}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Assignee</span>
                <span className="text-sm text-text-dark">{selectedTicket.assignee}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Created</span>
                <span className="text-sm text-text-dark">{selectedTicket.created}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
