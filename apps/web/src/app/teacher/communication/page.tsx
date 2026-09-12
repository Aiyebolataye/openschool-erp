"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Send, Paperclip, FileText, X } from "lucide-react";

interface Attachment {
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Message {
  from: "me" | "them";
  text: string;
  time: string;
  attachments?: Attachment[];
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

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function CommunicationPage() {
  const [threads] = useState<Thread[]>(initialThreads);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() =>
    Object.fromEntries(initialThreads.map((t) => [t.id, t.messages]))
  );
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selected = threads.find((t) => t.id === selectedId);
  const currentMessages = selectedId ? messagesMap[selectedId] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages.length]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const next: Attachment[] = Array.from(files).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      url: URL.createObjectURL(f),
    }));
    setAttachments((prev) => [...prev, ...next]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const send = () => {
    if (!selectedId) return;
    if (!draft.trim() && attachments.length === 0) return;
    setMessagesMap((prev) => ({
      ...prev,
      [selectedId]: [
        ...(prev[selectedId] || []),
        { from: "me", text: draft.trim(), attachments, time: now() },
      ],
    }));
    setDraft("");
    setAttachments([]);
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
                      {m.text && <p className={m.from === "me" ? "text-white" : "text-text-dark"}>{m.text}</p>}
                      {m.attachments && m.attachments.length > 0 && (
                        <div className="mt-2 flex flex-col gap-2">
                          {m.attachments.map((a, j) =>
                            a.type.startsWith("image/") ? (
                              <img key={j} src={a.url} alt={a.name} className="max-h-40 rounded-lg object-cover" />
                            ) : (
                              <div key={j} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${m.from === "me" ? "bg-white/10" : "bg-surface"}`}>
                                <FileText className="w-4 h-4 shrink-0" />
                                <span className="truncate max-w-[180px]">{a.name}</span>
                                <a href={a.url} download={a.name} className={`shrink-0 underline ${m.from === "me" ? "text-white/80 hover:text-white" : "text-primary"}`}>Download</a>
                              </div>
                            )
                          )}
                        </div>
                      )}
                      <p className={`text-[10px] mt-1 ${m.from === "me" ? "text-white/70" : "text-text-muted"}`}>{m.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex flex-col border-t border-border-light">
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-4 pt-3">
                    {attachments.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-surface border border-border-light px-2 py-1 text-xs">
                        {a.type.startsWith("image/") ? (
                          <img src={a.url} alt={a.name} className="w-8 h-8 rounded object-cover" />
                        ) : (
                          <FileText className="w-4 h-4 text-text-muted shrink-0" />
                        )}
                        <span className="text-text-dark max-w-[150px] truncate">{a.name}</span>
                        <span className="text-text-muted shrink-0">{formatSize(a.size)}</span>
                        <button
                          onClick={() => removeAttachment(i)}
                          className="text-text-muted hover:text-red transition-colors"
                          aria-label="Remove attachment"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="px-4 py-3 flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} aria-label="Attach file">
                    <Paperclip className="w-4 h-4" />
                  </Button>
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
