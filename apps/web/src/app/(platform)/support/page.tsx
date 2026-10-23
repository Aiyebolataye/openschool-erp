"use client";

import { useState } from "react";
import { Send } from "lucide-react";
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
import { Tabs } from "@/components/ui/tabs";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";

const kpis = [
  { label: "OPEN TICKETS", value: "23", detail: "3 urgent", detailColor: "red" as const },
  { label: "IN PROGRESS", value: "12", detail: "", detailColor: "muted" as const },
  { label: "RESOLVED TODAY", value: "8", detail: "", detailColor: "green" as const },
  { label: "AVG RESOLUTION", value: "4.2h", detail: "-18% vs last week", detailColor: "green" as const },
];

const initialTickets = [
  { ticket: "TKT-1042", subject: "Integration not syncing", org: "Demo Academy", priority: { text: "URGENT", variant: "red" as const }, status: { text: "Open", variant: "orange" as const }, assignee: "Maria Garcia", created: "1 hr ago" },
  { ticket: "TKT-1041", subject: "Billing question", org: "Pacific Academy", priority: { text: "NORMAL", variant: "muted" as const }, status: { text: "In Progress", variant: "blue" as const }, assignee: "James Wilson", created: "3 hrs ago" },
  { ticket: "TKT-1040", subject: "SSO configuration help", org: "Metropolitan Schools", priority: { text: "NORMAL", variant: "muted" as const }, status: { text: "Open", variant: "orange" as const }, assignee: "Unassigned", created: "5 hrs ago" },
  { ticket: "TKT-1039", subject: "Data export request", org: "Sunrise International", priority: { text: "LOW", variant: "muted" as const }, status: { text: "Resolved", variant: "green" as const }, assignee: "Dr. Sarah Chen", created: "1 day ago" },
  { ticket: "TKT-1038", subject: "Feature request: Bulk import", org: "Coastal Education", priority: { text: "NORMAL", variant: "muted" as const }, status: { text: "Resolved", variant: "green" as const }, assignee: "Aisha Patel", created: "2 days ago" },
];

type TicketRow = {
  ticket: string;
  subject: string;
  org: string;
  priority: { text: string; variant: "red" | "muted" | "orange" | "blue" };
  status: { text: string; variant: "orange" | "blue" | "green" };
  assignee: string;
  created: string;
};

type ChatMessage = { from: "me" | "them"; text: string; time: string };

type Thread = {
  id: string;
  name: string;
  role: string;
  messages: ChatMessage[];
};

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

const initialThreads: Thread[] = [
  {
    id: "Demo Academy",
    name: "Demo Academy Admin",
    role: "Organization",
    messages: [
      { from: "them", text: "We can't sync attendance.", time: "9:41 AM" },
      { from: "me", text: "Hi Jane, could you share the exact error message?", time: "9:45 AM" },
      { from: "them", text: "It says \"sync timeout on /attendance\".", time: "9:47 AM" },
    ],
  },
  {
    id: "Metropolitan Schools",
    name: "Metropolitan Admin",
    role: "Organization",
    messages: [
      { from: "them", text: "Billing issue on our latest invoice.", time: "10:12 AM" },
    ],
  },
  {
    id: "Sunrise International",
    name: "Sunrise International Admin",
    role: "Organization",
    messages: [
      { from: "them", text: "Can we export term reports as CSV?", time: "Yesterday" },
    ],
  },
];

function statusVariant(status: string): "orange" | "blue" | "green" {
  if (status === "Open") return "orange";
  if (status === "In Progress") return "blue";
  return "green";
}

function priorityVariant(priority: string): "red" | "orange" | "blue" | "muted" {
  if (priority === "Urgent") return "red";
  if (priority === "High") return "orange";
  if (priority === "Medium") return "blue";
  return "muted";
}

const now = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export default function SupportPage() {
  const [tickets, setTickets] = useState<TicketRow[]>(initialTickets);
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [activeThread, setActiveThread] = useState<string>(initialThreads[0].id);
  const [reply, setReply] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketRow | null>(null);
  const [editStatus, setEditStatus] = useState("");

  const [subject, setSubject] = useState("");
  const [relatesTo, setRelatesTo] = useState("");
  const [relateTarget, setRelateTarget] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  const institutions = ["Demo Primary", "Metropolitan High", "Coastal Elementary", "Pinnacle Academy", "Sunrise International School"];
  const organizations = ["Demo Academy", "Metropolitan Schools", "Coastal Education Trust", "Pinnacle Learning Center", "Sunrise International"];

  function openDetail(row: TicketRow) {
    setSelectedTicket(row);
    setEditStatus(row.status.text);
    setDetailOpen(true);
  }

  function saveStatus() {
    if (!selectedTicket) return;
    setTickets((prev) =>
      prev.map((t) =>
        t.ticket === selectedTicket.ticket ? { ...t, status: { text: editStatus, variant: statusVariant(editStatus) } } : t
      )
    );
    setSelectedTicket((prev) => (prev ? { ...prev, status: { text: editStatus, variant: statusVariant(editStatus) } } : prev));
  }

  function resolveTicket(id: string) {
    const ticket = tickets.find((t) => t.ticket === id);
    if (!ticket) return;
    setTickets((prev) =>
      prev.map((t) => (t.ticket === id ? { ...t, status: { text: "Resolved", variant: "green" } } : t))
    );
    const autoMessage = `🎫 Your ticket ${id} has been reviewed and completed. If you need further help, reply here.`;
    setThreads((prev) => {
      const existing = prev.find((th) => th.id === ticket.org);
      if (existing) {
        return prev.map((th) =>
          th.id === ticket.org
            ? { ...th, messages: [...th.messages, { from: "me" as const, text: autoMessage, time: now() }] }
            : th
        );
      }
      return [...prev, { id: ticket.org, name: ticket.org, role: "Organization", messages: [{ from: "me" as const, text: autoMessage, time: now() }] }];
    });
    setActiveThread(ticket.org);
    setDetailOpen(false);
    setSelectedTicket(null);
    showToast(`Ticket ${id} resolved & user notified`);
  }

  function handleCreateTicket() {
    const id = `TKT-${1043 + tickets.length}`;
    setTickets((prev) => [
      {
        ticket: id,
        subject,
        org: relateTarget || "Unassigned",
        priority: { text: priority.toUpperCase(), variant: priorityVariant(priority) },
        status: { text: "Open", variant: "orange" },
        assignee: "Unassigned",
        created: "Just now",
      },
      ...prev,
    ]);
    setOpen(false);
    setSubject("");
    setRelatesTo("");
    setRelateTarget("");
    setPriority("");
    setDescription("");
    showToast(`Ticket ${id} created`);
  }

  function sendReply() {
    if (!reply.trim()) return;
    const text = reply.trim();
    setThreads((prev) =>
      prev.map((th) =>
        th.id === activeThread ? { ...th, messages: [...th.messages, { from: "me" as const, text, time: now() }] } : th
      )
    );
    setReply("");
  }

  const q = search.trim().toLowerCase();
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      !q ||
      t.subject.toLowerCase().includes(q) ||
      t.org.toLowerCase().includes(q) ||
      t.ticket.toLowerCase().includes(q);
    const matchesStatus = !statusFilter || t.status.text === statusFilter;
    const matchesPriority = !priorityFilter || t.priority.text === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const dataWithActions = filteredTickets.map((row) => ({
    ...row,
    actions: (
      <Button variant="ghost" size="sm" onClick={() => openDetail(row)}>View</Button>
    ),
  }));

  const active = threads.find((th) => th.id === activeThread) ?? threads[0];

  const chatPanel = (
    <div className="flex h-[520px] rounded-xl border border-border-light bg-card overflow-hidden">
      <div className="w-72 border-r border-border-light flex flex-col bg-surface/30">
        <div className="px-4 py-3 border-b border-border-light">
          <p className="text-sm font-semibold text-text-dark">Conversations</p>
          <p className="text-[11px] text-text-muted">Organizations & Institutions</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.map((th) => (
            <button
              key={th.id}
              onClick={() => setActiveThread(th.id)}
              className={`w-full text-left px-4 py-3 border-b border-border-light transition-colors ${th.id === activeThread ? "bg-primary-light/40" : "hover:bg-surface"}`}
            >
              <p className="text-sm font-medium text-text-dark">{th.name}</p>
              <p className="text-[11px] text-text-muted">{th.role}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="px-5 py-3 border-b border-border-light flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-dark">{active.name}</p>
            <p className="text-[11px] text-text-muted">{active.role}</p>
          </div>
          <Badge variant="green">● Online</Badge>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 bg-surface/30">
          {active.messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${m.from === "me" ? "bg-primary text-white rounded-br-sm" : "bg-card border border-border-light rounded-bl-sm"}`}>
                <p className={m.from === "me" ? "text-white" : "text-text-dark"}>{m.text}</p>
                <p className={`text-[10px] mt-1 ${m.from === "me" ? "text-white/70" : "text-text-muted"}`}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-border-light flex items-center gap-2">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendReply()}
            placeholder="Reply as platform admin..."
            className="flex-1 h-10 px-3 rounded-lg border border-border-light bg-card text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <Button size="sm" onClick={sendReply}>
            <Send className="w-4 h-4" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );

  const ticketsTab = (
    <div>
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select options={[{ label: "Open", value: "Open" }, { label: "In Progress", value: "In Progress" }, { label: "Resolved", value: "Resolved" }]} placeholder="All Statuses" value={statusFilter} onChange={setStatusFilter} />
          <Select options={[{ label: "URGENT", value: "URGENT" }, { label: "HIGH", value: "HIGH" }, { label: "NORMAL", value: "NORMAL" }, { label: "LOW", value: "LOW" }]} placeholder="All Priorities" value={priorityFilter} onChange={setPriorityFilter} />
          <SearchInput placeholder="Search tickets..." className="flex-1" value={search} onChange={setSearch} />
        </div>
      </Card>
      <DataTable columns={columns} data={dataWithActions} />
      <Pagination currentPage={1} totalPages={5} />
    </div>
  );

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

      <Tabs
        tabs={[
          { id: "tickets", label: "Tickets", content: ticketsTab },
          { id: "chat", label: "Live Chat", content: chatPanel },
        ]}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create Ticket"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTicket}>Create Ticket</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Subject" required>
            <TextInput placeholder="e.g. SSO configuration help" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
          <SelectField label="Relates To" required placeholder="Select type" options={["Institution", "Organization"]} value={relatesTo} onChange={(e) => { setRelatesTo(e.target.value); setRelateTarget(""); }} />
          {relatesTo === "Institution" && (
            <SelectField label="Institution" required placeholder="Select institution" options={institutions} value={relateTarget} onChange={(e) => setRelateTarget(e.target.value)} />
          )}
          {relatesTo === "Organization" && (
            <SelectField label="Organization" required placeholder="Select organization" options={organizations} value={relateTarget} onChange={(e) => setRelateTarget(e.target.value)} />
          )}
          <SelectField label="Priority" required options={["Low", "Medium", "High", "Urgent"]} placeholder="Select priority" value={priority} onChange={(e) => setPriority(e.target.value)} />
          <Field label="Description" required>
            <TextArea rows={5} placeholder="Describe the issue in detail..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Ticket Details"
        footer={
          <>
            <Button variant="secondary" onClick={() => { saveStatus(); setDetailOpen(false); setSelectedTicket(null); }}>Close</Button>
            <Button onClick={() => resolveTicket(selectedTicket?.ticket ?? "")}>Resolve & Notify</Button>
          </>
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
            <SelectField label="Status" options={["Open", "In Progress", "Resolved"]} value={editStatus} onChange={(e) => setEditStatus(e.target.value)} />
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
