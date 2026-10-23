"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { Send, Plus } from "lucide-react";

interface Message {
  from: "me" | "them";
  text: string;
  time: string;
}

interface Thread {
  id: string;
  name: string;
  relation: string;
  initials: string;
  unread: boolean;
}

const initialThreads: Thread[] = [
  { id: "t1", name: "Mr. Kalu", relation: "Driver · Gwarinpa Line · Demo 1", initials: "CK", unread: true },
  { id: "t2", name: "Mrs. Ngozi Obi", relation: "Bus Matron · Demo 2", initials: "NO", unread: false },
  { id: "t3", name: "School Admin", relation: "Administration · Main Office", initials: "SA", unread: true },
  { id: "t4", name: "Mallam Usman Abdullahi", relation: "Driver · Kubwa Line · Demo 2", initials: "UA", unread: false },
];

const initialMessages: Record<string, Message[]> = {
  t1: [
    { from: "them", text: "Good morning, sir. Gwarinpa Line is loaded and ready to depart.", time: "6:40 AM" },
    { from: "me", text: "Good. Keep an eye on the Life Camp junction traffic this morning.", time: "6:42 AM" },
  ],
  t2: [
    { from: "them", text: "All 24 students checked in on Demo 2 for the Kubwa Line.", time: "6:50 AM" },
    { from: "me", text: "Thanks, Mrs. Obi. Note that the bus is going for service after drop-off.", time: "6:52 AM" },
  ],
  t3: [
    { from: "them", text: "The bus fees for Term 3 were fully reconciled this morning.", time: "8:05 AM" },
    { from: "me", text: "Great. Can you share the updated route enrolment numbers?", time: "8:10 AM" },
  ],
  t4: [
    { from: "them", text: "Kubwa Line is 25 minutes late due to the Bwari junction accident.", time: "7:10 AM" },
    { from: "me", text: "Noted. Notify parents on the route and keep me posted.", time: "7:12 AM" },
  ],
};

const recipientOptions = ["Mr. Kalu", "Mrs. Ngozi Obi", "School Admin", "Mallam Usman Abdullahi", "Mr. Emeka Obi", "Mr. Suleiman Musa"];

const now = () =>
  new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export default function TransportManagerCommunicationPage() {
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [selectedId, setSelectedId] = useState<string | null>("t1");
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(initialMessages);
  const [draft, setDraft] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [newRecipient, setNewRecipient] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selected = threads.find((t) => t.id === selectedId);
  const currentMessages = selectedId ? messagesMap[selectedId] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages.length]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const send = () => {
    if (!selectedId || !draft.trim()) return;
    setMessagesMap((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), { from: "me", text: draft.trim(), time: now() }],
    }));
    setDraft("");
  };

  const createThread = () => {
    if (!newRecipient || !newBody.trim()) return;
    const id = `t${threads.length + 1}`;
    const initials = newRecipient
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    setThreads((prev) => [
      { id, name: newRecipient, relation: newSubject.trim() || "New conversation", initials, unread: false },
      ...prev,
    ]);
    setMessagesMap((prev) => ({ ...prev, [id]: [{ from: "me", text: newBody.trim(), time: now() }] }));
    setSelectedId(id);
    setNewRecipient("");
    setNewSubject("");
    setNewBody("");
    setNewOpen(false);
    showToast("Message sent");
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Communication"
        subtitle="Message drivers, bus matrons and the school administration"
        actions={
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="w-4 h-4" /> New Message
          </Button>
        }
      />

      <div className="grid grid-cols-[320px_1fr] gap-0 rounded-xl border border-border-light bg-card overflow-hidden" style={{ height: "600px" }}>
        <div className="border-r border-border-light flex flex-col">
          <div className="p-3 border-b border-border-light">
            <input
              placeholder="Search conversations..."
              className="w-full h-9 px-3 rounded-lg border border-border-light bg-surface text-sm text-text-dark placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-dark truncate">{t.name}</p>
                    {t.unread && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-[11px] text-text-muted truncate">{t.relation}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          {selected ? (
            <>
              <div className="flex items-center gap-3 px-5 py-3 border-b border-border-light bg-surface/60">
                <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center">
                  <span className="text-primary text-xs font-semibold">{selected.initials}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-dark">{selected.name}</p>
                  <p className="text-[11px] text-text-muted">{selected.relation}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 bg-surface/30">
                {currentMessages.length === 0 && (
                  <p className="text-xs text-text-muted text-center mt-10">Start the conversation.</p>
                )}
                {currentMessages.map((m, i) => (
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
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="New Message"
        subtitle="Start a new conversation"
        footer={
          <>
            <Button variant="secondary" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={createThread}>Send</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Recipient"
            required
            placeholder="Select recipient"
            options={recipientOptions}
            value={newRecipient}
            onChange={(e) => setNewRecipient(e.target.value)}
          />
          <Field label="Subject">
            <TextInput
              placeholder="Subject"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
            />
          </Field>
          <Field label="Body" required>
            <TextArea
              rows={4}
              placeholder="Write your message..."
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
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