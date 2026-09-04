"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { Send } from "lucide-react";

interface Message {
  from: "me" | "them";
  text: string;
  time: string;
}

interface Thread {
  id: string;
  name: string;
  role: string;
  initials: string;
  unread: boolean;
  messages: Message[];
}

const initialThreads: Thread[] = [
  {
    id: "t1",
    name: "Mrs. Okafor",
    role: "Parent · Amara Okafor",
    initials: "MO",
    unread: true,
    messages: [
      { from: "them", text: "Good morning, I wanted to discuss Amara's attendance this term.", time: "9:00 AM" },
      { from: "me", text: "Good morning, Mrs. Okafor. Yes, Amara has been absent 4 times this month. We'd like to discuss a plan.", time: "9:15 AM" },
      { from: "them", text: "Thank you for the update. I will ensure she is more regular.", time: "9:30 AM" },
    ],
  },
  {
    id: "t2",
    name: "Mr. Adeyemi",
    role: "HOD Sciences",
    initials: "MA",
    unread: false,
    messages: [
      { from: "me", text: "Please submit the departmental results by Friday.", time: "2:00 PM" },
      { from: "them", text: "Will do. We're finalizing the moderation now.", time: "2:30 PM" },
    ],
  },
  {
    id: "t3",
    name: "Mr. Obi",
    role: "Mathematics Teacher",
    initials: "MO",
    unread: true,
    messages: [
      { from: "them", text: "I've posted the JSS2 Math lesson content for your review.", time: "11:00 AM" },
    ],
  },
  {
    id: "t4",
    name: "Mrs. Eze",
    role: "Parent · Chidi Eze",
    initials: "ME",
    unread: false,
    messages: [
      { from: "them", text: "Will there be a parent-teacher meeting this term?", time: "Yesterday" },
      { from: "me", text: "Yes, it's scheduled for August 4th at 4:00 PM.", time: "Yesterday" },
    ],
  },
  {
    id: "t5",
    name: "SS1 Science Parents",
    role: "Classroom group · 42 members",
    initials: "SS",
    unread: false,
    messages: [
      { from: "me", text: "Reminder: Mid-term exams start August 10th. Please ensure students prepare.", time: "Jul 25" },
    ],
  },
];

const now = () =>
  new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export default function PrincipalCommunicationPage() {
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [announceOpen, setAnnounceOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selected = threads.find((t) => t.id === selectedId);

  const totalUnread = threads.filter((t) => t.unread).length;

  const filtered = threads.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.role.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages.length]);

  const send = () => {
    if (!draft.trim() || !selectedId) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === selectedId
          ? { ...t, unread: false, messages: [...t.messages, { from: "me", text: draft.trim(), time: now() }] }
          : t
      )
    );
    setDraft("");
  };

  const selectThread = (id: string) => {
    setSelectedId(id);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unread: false } : t)));
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Communication"
        subtitle="Chat with staff and parents"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setAnnounceOpen(true)}>Announcement</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-border-light bg-card p-5">
          <p className="text-[11px] text-text-muted mb-1">Read Messages</p>
          <p className="text-2xl font-display font-bold text-text-dark">{threads.length * 3 - totalUnread}</p>
        </div>
        <div className="rounded-xl border border-border-light bg-card p-5">
          <p className="text-[11px] text-text-muted mb-1">Unread Messages</p>
          <p className="text-2xl font-display font-bold text-orange">{totalUnread}</p>
        </div>
      </div>

      <div className="grid grid-cols-[320px_1fr] gap-0 rounded-xl border border-border-light bg-card overflow-hidden" style={{ height: "600px" }}>
        {/* Thread list */}
        <div className="border-r border-border-light flex flex-col">
          <div className="p-3 border-b border-border-light">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff or parents..."
              className="w-full h-9 px-3 rounded-lg border border-border-light bg-surface text-sm text-text-dark placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => selectThread(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  selectedId === t.id ? "bg-primary-light/50" : "hover:bg-surface"
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                  <span className="text-primary text-xs font-semibold">{t.initials}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-dark truncate">{t.name}</p>
                    {t.unread && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-[11px] text-text-muted truncate">{t.role}</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-text-muted text-center py-8">No contacts match your search.</p>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex flex-col">
          {selected ? (
            <>
              <div className="flex items-center gap-3 px-5 py-3 border-b border-border-light bg-surface/60">
                <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center">
                  <span className="text-primary text-xs font-semibold">{selected.initials}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-dark">{selected.name}</p>
                  <p className="text-[11px] text-text-muted">{selected.role}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 bg-surface/30">
                {selected.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                        m.from === "me"
                          ? "bg-primary text-white rounded-br-sm"
                          : "bg-card border border-border-light rounded-bl-sm"
                      }`}
                    >
                      <p className={m.from === "me" ? "text-white" : "text-text-dark"}>{m.text}</p>
                      <p className={`text-[10px] mt-1 ${m.from === "me" ? "text-white/70" : "text-text-muted"}`}>{m.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="px-4 py-3 border-t border-border-light flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type a message..."
                  className="flex-1 h-9 px-3 rounded-lg border border-border-light bg-card text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <Button size="sm" onClick={send}>
                  <Send className="w-4 h-4" /> Send
                </Button>
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
        open={announceOpen}
        onClose={() => setAnnounceOpen(false)}
        title="Broadcast Announcement"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAnnounceOpen(false)}>Cancel</Button>
            <Button onClick={() => setAnnounceOpen(false)}>Send Announcement</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Audience" required placeholder="Select audience" options={["All Staff", "All Teachers", "All Parents", "All Students", "Entire School"]} />
          <Field label="Subject" required>
            <TextInput placeholder="Announcement subject" />
          </Field>
          <Field label="Message" required>
            <TextArea rows={5} placeholder="Write your announcement..." />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
