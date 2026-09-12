"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { Send, Paperclip, FileText, X } from "lucide-react";

interface Attachment {
  name: string;
  url: string;
}

interface Message {
  from: "me" | "them";
  text: string;
  time: string;
  attachment?: Attachment;
}

interface Thread {
  id: string;
  name: string;
  relation: string;
  initials: string;
  messages: Message[];
}

const initialThreads: Thread[] = [
  {
    id: "t1",
    name: "Sarah Mitchell",
    relation: "Institution Admin · Greenfield Academy",
    initials: "SM",
    messages: [
      { from: "them", text: "Hi, we need guidance on bulk SMS pricing for next term.", time: "2h ago" },
      { from: "me", text: "Happy to help — sending over the rate card shortly.", time: "1h ago" },
    ],
  },
  {
    id: "t2",
    name: "James Okafor",
    relation: "Institution Admin · Metropolitan Schools",
    initials: "JO",
    messages: [
      { from: "them", text: "Can you share the new student data import template?", time: "1d ago" },
      { from: "me", text: "Sure, I'll send the updated template now.", time: "1d ago" },
    ],
  },
  {
    id: "t3",
    name: "Maria Santos",
    relation: "Institution Admin · Coastal Education Trust",
    initials: "MS",
    messages: [
      { from: "them", text: "The exam results upload failed again this morning.", time: "3h ago" },
      { from: "me", text: "Noted — we're investigating the upload pipeline.", time: "3h ago" },
    ],
  },
  {
    id: "t4",
    name: "Head of Operations",
    relation: "Organization Staff",
    initials: "HO",
    messages: [
      { from: "them", text: "Reminder: the annual operations review is due Friday.", time: "1d ago" },
      { from: "me", text: "Thanks, we'll have the metrics ready.", time: "1d ago" },
    ],
  },
  {
    id: "t5",
    name: "Finance Officer",
    relation: "Organization Staff",
    initials: "FO",
    messages: [
      { from: "them", text: "Please confirm the Q2 subsidy figures for Coastal.", time: "5h ago" },
      { from: "me", text: "Confirming now and will share the breakdown.", time: "4h ago" },
    ],
  },
];

const institutionAdmins = ["Sarah Mitchell", "James Okafor", "Maria Santos"];
const organizationStaff = ["Head of Operations", "Finance Officer"];
const adminRelations: Record<string, string> = {
  "Sarah Mitchell": "Institution Admin · Greenfield Academy",
  "James Okafor": "Institution Admin · Metropolitan Schools",
  "Maria Santos": "Institution Admin · Coastal Education Trust",
  "Head of Operations": "Organization Staff",
  "Finance Officer": "Organization Staff",
};

const now = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const initialsFor = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export default function CommunicationPage() {
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pendingFile, setPendingFile] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [newOpen, setNewOpen] = useState(false);
  const [recipientType, setRecipientType] = useState("");
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const selected = threads.find((t) => t.id === selectedId);
  const currentMessages = selected?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages.length]);

  function send() {
    if (!selectedId) return;
    if (!draft.trim() && !pendingFile) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === selectedId
          ? { ...t, messages: [...t.messages, { from: "me" as const, text: draft.trim(), time: now(), attachment: pendingFile || undefined }] }
          : t
      )
    );
    setDraft("");
    setPendingFile(null);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile({ name: file.name, url: URL.createObjectURL(file) });
    e.target.value = "";
  }

  function createThread() {
    if (!recipient || !subject.trim() || !body.trim()) return;
    const id = `t${threads.length + 1}`;
    const newThread: Thread = {
      id,
      name: recipient,
      relation: adminRelations[recipient] || recipientType,
      initials: initialsFor(recipient),
      messages: [{ from: "me", text: `${subject.trim()} — ${body.trim()}`, time: now() }],
    };
    setThreads((prev) => [newThread, ...prev]);
    setSelectedId(id);
    setNewOpen(false);
    setRecipientType("");
    setRecipient("");
    setSubject("");
    setBody("");
  }

  const recipients = recipientType === "Institution Admin" ? institutionAdmins : recipientType === "Organization Staff" ? organizationStaff : [];

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Communication"
        subtitle="Message institution admins and organization staff"
        actions={<Button onClick={() => setNewOpen(true)}>+ New Message</Button>}
      />

      <div className="grid grid-cols-[320px_1fr] gap-0 rounded-xl border border-border-light bg-card overflow-hidden" style={{ height: "620px" }}>
        <div className="border-r border-border-light flex flex-col">
          <div className="p-3 border-b border-border-light">
            <p className="text-sm font-semibold text-text-dark">Conversations</p>
            <p className="text-[11px] text-text-muted mt-0.5">Institution admins & organization staff</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  selectedId === t.id ? "bg-primary-light/50" : "hover:bg-surface"
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                  <span className="text-primary text-xs font-semibold">{t.initials}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-dark truncate">{t.name}</p>
                  <p className="text-[11px] text-text-muted truncate">{t.relation}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          {selected ? (
            <>
              <div className="flex items-center justify-between px-5 py-3 border-b border-border-light bg-surface/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center">
                    <span className="text-primary text-xs font-semibold">{selected.initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-dark">{selected.name}</p>
                    <p className="text-[11px] text-text-muted">{selected.relation}</p>
                  </div>
                </div>
                <Badge variant="green">● Online</Badge>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 bg-surface/30">
                {currentMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                        m.from === "me"
                          ? "bg-primary text-white rounded-br-sm"
                          : "bg-card border border-border-light rounded-bl-sm"
                      }`}
                    >
                      {m.attachment && (
                        <div className="mb-2">
                          {m.attachment.url.startsWith("blob:") && m.attachment.name.match(/\.(png|jpe?g|gif|webp)$/i) ? (
                            <img src={m.attachment.url} alt={m.attachment.name} className="rounded-lg max-h-40 object-cover" />
                          ) : (
                            <a href={m.attachment.url} download={m.attachment.name} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${m.from === "me" ? "bg-white/20 text-white" : "bg-surface text-text-dark"}`}>
                              <Paperclip className="w-3.5 h-3.5" /> {m.attachment.name}
                            </a>
                          )}
                        </div>
                      )}
                      {m.text && <p className={m.from === "me" ? "text-white" : "text-text-dark"}>{m.text}</p>}
                      <p className={`text-[10px] mt-1 ${m.from === "me" ? "text-white/70" : "text-text-muted"}`}>{m.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex flex-col border-t border-border-light">
                {pendingFile && (
                  <div className="flex items-center gap-2 px-4 pt-3">
                    <div className="flex items-center gap-2 rounded-lg bg-surface border border-border-light px-2 py-1 text-xs">
                      <FileText className="w-4 h-4 text-text-muted shrink-0" />
                      <span className="text-text-dark max-w-[200px] truncate">{pendingFile.name}</span>
                      <button onClick={() => setPendingFile(null)} className="text-text-muted hover:text-red transition-colors" aria-label="Remove attachment">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="px-4 py-3 flex items-center gap-2">
                  <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" className="hidden" onChange={handleFile} />
                  <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} aria-label="Attach file">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Type a message..."
                    className="flex-1 h-10 px-3 rounded-lg border border-border-light bg-card text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <Button size="sm" onClick={send}>
                    <Send className="w-4 h-4" /> Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-surface/30">
              <p className="text-sm text-text-muted">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="New Message"
        footer={
          <>
            <Button variant="secondary" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={createThread}>Send Message</Button>
          </>
        }
      >
        <div className="space-y-4">
          <SelectField
            label="Recipient Type"
            required
            placeholder="Select recipient type"
            options={["Institution Admin", "Organization Staff"]}
            value={recipientType}
            onChange={(e) => {
              setRecipientType(e.target.value);
              setRecipient("");
            }}
          />
          <SelectField
            label="Recipient"
            required
            placeholder="Select recipient"
            options={recipients}
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <Field label="Subject" required>
            <TextInput placeholder="Message subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
          <Field label="Body" required>
            <TextArea rows={4} placeholder="Write your message..." value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}