"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, SelectField, TextArea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Send, Plus, CheckCheck } from "lucide-react";

interface Message {
  from: "me" | "them";
  text: string;
  time: string;
}

interface Thread {
  id: string;
  name: string;
  role: string;
  tone: "green" | "blue" | "orange" | "purple";
  unread: number;
  lastTime: string;
  messages: Message[];
}

const initialThreads: Thread[] = [
  {
    id: "t1",
    name: "Mrs. Funmilayo Ajayi",
    role: "Form Teacher · Biology",
    tone: "green",
    unread: 2,
    lastTime: "9:04 AM",
    messages: [
      { from: "them", text: "Good morning Chidi. Please see me after assembly — we need to talk about your science practical group.", time: "Yesterday" },
      { from: "me", text: "Good morning ma. I will come right after assembly.", time: "Yesterday" },
      { from: "them", text: "Also, remember to submit the heart diagram assignment before Tuesday. Your last submission was very neat.", time: "9:04 AM" },
    ],
  },
  {
    id: "t2",
    name: "Dad (Mr. Eze)",
    role: "Guardian · Father",
    tone: "blue",
    unread: 0,
    lastTime: "Yesterday",
    messages: [
      { from: "them", text: "Chidi, did the school fees receipt get to you? Let me know when school closes on Friday.", time: "Yesterday" },
      { from: "me", text: "Yes Daddy, I collected the receipt from the bursary. School closes 2:20 pm on Friday.", time: "Yesterday" },
    ],
  },
  {
    id: "t3",
    name: "Mr. Okoye",
    role: "Hostel Warden · Red House",
    tone: "purple",
    unread: 0,
    lastTime: "Mon",
    messages: [
      { from: "them", text: "Hello Chidi, your brother Kayode left his track suit in the common room. Kindly remind him to collect it.", time: "Mon" },
      { from: "me", text: "Alright sir, I will tell him today. Thank you.", time: "Mon" },
    ],
  },
];

const toneMap: Record<string, string> = {
  green: "bg-green-light text-green",
  blue: "bg-primary-light text-primary",
  orange: "bg-orange-light text-orange",
  purple: "bg-purple-light text-purple",
};

function initialsOf(name: string) {
  const core = name
    .replace(/\(.*?\)/g, "")
    .replace(/\b(Mrs|Mr|Dr|Miss|Ms|Engr|Chief|Alhaji|Hajia)\.?\s*/g, "")
    .trim();
  return core
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function now() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

const recipientOptions = [
  "Mrs. Funmilayo Ajayi",
  "Mr. Adewale Adeyemi",
  "Dr. Ngozi Obi",
  "Mr. Samuel Adekunle",
  "Mrs. Yetunde Balogun",
  "Miss Chioma Nnamdi",
  "Mr. Eze (Dad)",
  "Mr. Okoye (Hostel Warden)",
];

export default function StudentMessagesPage() {
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [activeId, setActiveId] = useState(initialThreads[0].id);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [newText, setNewText] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const active = threads.find((t) => t.id === activeId) ?? threads[0];

  const q = search.trim().toLowerCase();
  const visible = threads.filter(
    (t) => !q || t.name.toLowerCase().includes(q) || t.role.toLowerCase().includes(q)
  );

  const selectThread = (id: string) => {
    setActiveId(id);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t)));
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const time = now();
    setThreads((prev) =>
      prev.map((t) =>
        t.id === active.id
          ? { ...t, unread: 0, lastTime: time, messages: [...t.messages, { from: "me", text, time }] }
          : t
      )
    );
    setDraft("");
  };

  const createMessage = () => {
    if (!recipient || !newText.trim()) return;
    const time = now();
    const existing = threads.find((t) => t.name === recipient);
    if (existing) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === existing.id
            ? { ...t, unread: 0, lastTime: time, messages: [...t.messages, { from: "me", text: newText.trim(), time }] }
            : t
        )
      );
      setActiveId(existing.id);
    } else {
      const tones: Thread["tone"][] = ["green", "blue", "orange", "purple"];
      const thread: Thread = {
        id: `t${Date.now()}`,
        name: recipient,
        role: "School contact",
        tone: tones[threads.length % tones.length],
        unread: 0,
        lastTime: time,
        messages: [{ from: "me", text: newText.trim(), time }],
      };
      setThreads((prev) => [...prev, thread]);
      setActiveId(thread.id);
    }
    setNewOpen(false);
    setRecipient("");
    setNewText("");
    showToast("Message sent");
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Messages"
        subtitle="Chat with your teachers, parents and school staff"
        actions={
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="w-4 h-4" /> New Message
          </Button>
        }
      />

      <Card className="h-[620px] overflow-hidden flex">
        <div className="w-[320px] shrink-0 border-r border-border-light flex flex-col">
          <div className="p-3 border-b border-border-light">
            <SearchInput placeholder="Search conversations..." value={search} onChange={setSearch} />
          </div>
          <div className="flex-1 overflow-y-auto">
            {visible.length === 0 && (
              <p className="text-xs text-text-muted text-center mt-8 px-4">No conversations found.</p>
            )}
            {visible.map((t) => (
              <button
                key={t.id}
                onClick={() => selectThread(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                  t.id === active.id ? "bg-surface" : "hover:bg-surface/60"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${toneMap[t.tone]}`}>
                  <span className="text-xs font-semibold">{initialsOf(t.name)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-text-dark truncate">{t.name}</p>
                    <span className="text-[10px] text-text-muted shrink-0">{t.lastTime}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-text-muted truncate">{t.role}</p>
                    {t.unread > 0 ? (
                      <Badge variant="green">{t.unread}</Badge>
                    ) : (
                      <span className="text-[10px] text-text-muted/60 shrink-0">Read</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border-light bg-surface/60">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${toneMap[active.tone]}`}>
                <span className="text-xs font-semibold">{initialsOf(active.name)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-dark">{active.name}</p>
                <p className="text-[11px] text-text-muted">{active.role}</p>
              </div>
            </div>
            <Badge variant="green">● Online</Badge>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 bg-surface/30">
            {active.messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    m.from === "me"
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-card border border-border-light rounded-bl-sm"
                  }`}
                >
                  <p className={m.from === "me" ? "text-white" : "text-text-dark"}>{m.text}</p>
                  <p className={`text-[10px] mt-1 flex items-center gap-1 ${m.from === "me" ? "text-white/70" : "text-text-muted"}`}>
                    {m.from === "me" && <CheckCheck className="w-3 h-3" />}
                    {m.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-border-light flex items-center gap-2 bg-card">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message..."
              className="flex-1 h-10 px-3 rounded-lg border border-border-light bg-card text-sm text-text-dark placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <Button size="sm" onClick={send}>
              <Send className="w-4 h-4" /> Send
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="New Message"
        subtitle="Start a conversation with a teacher, parent or staff member"
        footer={
          <>
            <Button variant="secondary" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={createMessage}>Send Message</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Recipient"
            required
            placeholder="Choose a contact"
            options={recipientOptions}
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <Field label="Message" required>
            <TextArea
              rows={4}
              placeholder="Type your message..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />
          </Field>
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}
