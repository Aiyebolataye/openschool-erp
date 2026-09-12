"use client";

import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { Send, Ticket, AlertTriangle } from "lucide-react";

interface ChatMessage {
  from: "me" | "them";
  text: string;
  time: string;
}

interface Ticket {
  subject: string;
  institution: string;
  priority: { text: string; variant: "red" | "muted" | "blue" };
  status: { text: string; variant: "orange" | "blue" | "green" };
  updated: string;
  updates: string[];
}

const initialChat: ChatMessage[] = [
  { from: "them", text: "Hi! This is the platform support team. How can we help you today?", time: "10:02 AM" },
  { from: "me", text: "We're having trouble viewing student records in Greenfield Academy.", time: "10:04 AM" },
];

const initialTickets: Ticket[] = [
  {
    subject: "Subscription upgrade rejected",
    institution: "Greenfield Academy",
    priority: { text: "URGENT", variant: "red" },
    status: { text: "Open", variant: "orange" },
    updated: "2h ago",
    updates: ["Created — awaiting platform review.", "Platform Support: verified billing details."],
  },
  {
    subject: "Can't view student records",
    institution: "Coastal Education Trust",
    priority: { text: "NORMAL", variant: "muted" },
    status: { text: "In Progress", variant: "blue" },
    updated: "5h ago",
    updates: ["Created — raised by Live Chat.", "Platform Support: investigating access logs."],
  },
  {
    subject: "Billing discrepancy on invoice",
    institution: "Metropolitan Schools",
    priority: { text: "NORMAL", variant: "muted" },
    status: { text: "In Progress", variant: "blue" },
    updated: "1d ago",
    updates: ["Created — finance team notified.", "Platform Support: recalculating invoice #INV-2026-0122."],
  },
];

const now = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export default function OrgSupportPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialChat);
  const [draft, setDraft] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [hintVisible, setHintVisible] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [note, setNote] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const replyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  function send() {
    if (!draft.trim()) return;
    const text = draft.trim();
    setMessages((prev) => [...prev, { from: "me", text, time: now() }]);
    setDraft("");
    setHintVisible(true);
    if (replyTimeout.current) clearTimeout(replyTimeout.current);
    replyTimeout.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "them", text: "Thanks, our team is looking into this. We'll update you shortly.", time: now() },
      ]);
    }, 1000);
  }

  function raiseUrgent() {
    setHintVisible(false);
    showToast("Urgent ticket raised with Platform Support.");
  }

  function openDetail(ticket: Ticket) {
    setSelectedTicket(ticket);
    setNote("");
    setDetailOpen(true);
  }

  function addNote() {
    if (!selectedTicket || !note.trim()) return;
    const line = `You: ${note.trim()}`;
    setSelectedTicket({ ...selectedTicket, updates: [...selectedTicket.updates, line] });
    setTickets((prev) =>
      prev.map((t) => (t.subject === selectedTicket.subject ? { ...t, updates: [...t.updates, line], updated: "Just now" } : t))
    );
    setNote("");
    showToast("Note added to ticket.");
  }

  function submitRequest() {
    if (!newSubject.trim() || !newPriority || !newDescription.trim()) return;
    const newTicket: Ticket = {
      subject: newSubject.trim(),
      institution: "Organization-wide",
      priority: newPriority === "Urgent" ? { text: "URGENT", variant: "red" } : { text: "NORMAL", variant: "muted" },
      status: { text: "Open", variant: "orange" },
      updated: "Just now",
      updates: ["Request submitted — Platform Support has been notified."],
    };
    setTickets((prev) => [newTicket, ...prev]);
    setRequestOpen(false);
    setNewSubject("");
    setNewPriority("");
    setNewDescription("");
    showToast("Request submitted — Platform Support has been notified.");
  }

  const chatTab = (
    <div className="grid grid-cols-[1fr_280px] gap-4 items-start">
      <div className="flex flex-col h-[540px] rounded-xl border border-border-light bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-light bg-surface/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center">
              <span className="text-primary text-xs font-semibold">PS</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-dark">Platform Support</p>
              <p className="text-[11px] text-text-muted">Platform Admin desk</p>
            </div>
          </div>
          <Badge variant="green">● Online</Badge>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 bg-surface/30">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  m.from === "me" ? "bg-primary text-white rounded-br-sm" : "bg-card border border-border-light rounded-bl-sm"
                }`}
              >
                <p className={m.from === "me" ? "text-white" : "text-text-dark"}>{m.text}</p>
                <p className={`text-[10px] mt-1 ${m.from === "me" ? "text-white/70" : "text-text-muted"}`}>{m.time}</p>
              </div>
            </div>
          ))}
          {hintVisible && (
            <div className="flex items-center gap-3 bg-orange-light/60 border border-orange/30 rounded-lg px-3 py-2 self-center">
              <Ticket className="w-4 h-4 text-orange shrink-0" />
              <p className="text-xs text-text-dark">The platform admin may convert this chat to a ticket.</p>
              <Button size="sm" variant="danger" onClick={raiseUrgent}>
                <AlertTriangle className="w-3.5 h-3.5" />
                Raise as urgent ticket
              </Button>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-border-light flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message..."
            className="flex-1 h-10 px-3 rounded-lg border border-border-light bg-card text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <Button size="sm" onClick={send}>
            <Send className="w-4 h-4" />
            Send
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-semibold text-text-dark mb-3">Support Status</h3>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Response time</span>
            <span className="text-text-dark font-medium">~4h</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Avg. resolution</span>
            <span className="text-text-dark font-medium">24h</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Support hours</span>
            <span className="text-text-dark font-medium">24/7</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Open chats</span>
            <span className="text-text-dark font-medium">2</span>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-4 leading-relaxed">
          Urgent requests are prioritized by the Platform Admin desk and typically get a reply within 30 minutes.
        </p>
      </Card>
    </div>
  );

  const ticketsTab = (
    <div>
      <Card className="divide-y divide-border-light">
        {tickets.map((t) => (
          <button
            key={t.subject}
            onClick={() => openDetail(t)}
            className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-surface/60"
          >
            <div className="flex items-center gap-3">
              <Badge variant={t.priority.variant}>{t.priority.text}</Badge>
              <div>
                <p className="text-sm font-medium text-text-dark">{t.subject}</p>
                <p className="text-xs text-text-muted mt-0.5">{t.institution} · updated {t.updated}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={t.status.variant}>{t.status.text}</Badge>
              <span className="text-xs text-primary font-medium">View →</span>
            </div>
          </button>
        ))}
      </Card>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Support Center"
        subtitle="Chat with the Platform Admin team · they can raise a ticket for you"
        actions={<Button onClick={() => setRequestOpen(true)}>+ New Request</Button>}
      />

      <Tabs
        tabs={[
          { id: "chat", label: "Live Chat", content: chatTab },
          { id: "tickets", label: "My Tickets", content: ticketsTab },
        ]}
      />

      <Modal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        title="New Support Request"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRequestOpen(false)}>Cancel</Button>
            <Button onClick={submitRequest}>Submit Request</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Subject" required>
            <TextInput placeholder="Brief description of the issue" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} />
          </Field>
          <SelectField
            label="Priority"
            required
            placeholder="Select priority"
            options={["Low", "Medium", "High", "Urgent"]}
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
          />
          <Field label="Description" required>
            <TextArea rows={4} placeholder="Describe your request in detail..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
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
                <span className="block text-xs font-medium text-text-muted mb-1">Subject</span>
                <span className="text-sm text-text-dark">{selectedTicket.subject}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Institution</span>
                <span className="text-sm text-text-dark">{selectedTicket.institution}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Priority</span>
                <Badge variant={selectedTicket.priority.variant}>{selectedTicket.priority.text}</Badge>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Status</span>
                <Badge variant={selectedTicket.status.variant}>{selectedTicket.status.text}</Badge>
              </div>
            </div>
            <div>
              <span className="block text-xs font-medium text-text-muted mb-2">Updates</span>
              <div className="flex flex-col gap-2">
                {selectedTicket.updates.map((u, i) => (
                  <div key={i} className="rounded-lg bg-surface px-3 py-2 text-sm text-text-dark">{u}</div>
                ))}
              </div>
            </div>
            <div className="border-t border-border-light pt-4">
              <Field label="Add a note to this ticket">
                <TextArea rows={3} placeholder="Add an update to this ticket..." value={note} onChange={(e) => setNote(e.target.value)} />
              </Field>
              <div className="flex justify-end mt-3">
                <Button variant="secondary" size="sm" onClick={addNote}>Add Note</Button>
              </div>
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