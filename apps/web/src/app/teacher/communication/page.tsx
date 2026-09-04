"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Send } from "lucide-react";

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
  messages: Message[];
}

const initialThreads: Thread[] = [
  {
    id: "t1",
    name: "Mrs. Okafor",
    relation: "Parent · Amara Okafor",
    initials: "MO",
    unread: true,
    messages: [
      { from: "them", text: "Thank you for the update on Amara's progress!", time: "2h ago" },
      { from: "me", text: "You're welcome. She's doing well in Biology this term.", time: "1h ago" },
    ],
  },
  {
    id: "t2",
    name: "HOD Sciences",
    relation: "Mr. Adeyemi",
    initials: "HA",
    unread: false,
    messages: [
      { from: "them", text: "Please submit lesson notes by Friday.", time: "1d ago" },
      { from: "me", text: "Noted. I'll have them ready by Thursday.", time: "1d ago" },
    ],
  },
  {
    id: "t3",
    name: "SS1 Science Parents",
    relation: "Classroom group",
    initials: "SS",
    unread: true,
    messages: [
      { from: "them", text: "Re: Sports day permission", time: "1d ago" },
      { from: "me", text: "Permission forms are due next Monday.", time: "1d ago" },
    ],
  },
  {
    id: "t4",
    name: "Mr. Obi",
    relation: "Mathematics Teacher",
    initials: "MO",
    unread: false,
    messages: [
      { from: "me", text: "Do you have the timetable for next week?", time: "2d ago" },
      { from: "them", text: "Yes, I'll send it over shortly.", time: "2d ago" },
    ],
  },
];

const now = () =>
  new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export default function CommunicationPage() {
  const [threads] = useState<Thread[]>(initialThreads);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() =>
    Object.fromEntries(initialThreads.map((t) => [t.id, t.messages]))
  );
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selected = threads.find((t) => t.id === selectedId);
  const currentMessages = selectedId ? messagesMap[selectedId] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages.length]);

  const send = () => {
    if (!draft.trim() || !selectedId) return;
    setMessagesMap((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), { from: "me", text: draft.trim(), time: now() }],
    }));
    setDraft("");
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Communication"
        subtitle="Message parents, students, and staff"
      />

      <div className="grid grid-cols-[320px_1fr] gap-0 rounded-xl border border-border-light bg-card overflow-hidden" style={{ height: "600px" }}>
        {/* Thread list */}
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
    </div>
  );
}
