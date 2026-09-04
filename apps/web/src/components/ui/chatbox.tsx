"use client";

import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Image as ImageIcon, X } from "lucide-react";

interface Message {
  from: "me" | "them";
  text: string;
  time: string;
  attachment?: { name: string; type: "file" | "image"; url: string };
}

interface ChatboxProps {
  title: string;
  subtitle?: string;
  initial?: Message[];
}

const now = () =>
  new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export function Chatbox({ title, subtitle, initial = [] }: ChatboxProps) {
  const [messages, setMessages] = useState<Message[]>(initial);
  const [draft, setDraft] = useState("");
  const [pendingFile, setPendingFile] = useState<{ name: string; type: "file" | "image"; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const send = () => {
    if (!draft.trim() && !pendingFile) return;
    setMessages((m) => [
      ...m,
      { from: "me", text: draft.trim() || (pendingFile ? `Sent ${pendingFile.type === "image" ? "an image" : "a file"}` : ""), time: now(), attachment: pendingFile || undefined },
    ]);
    setDraft("");
    setPendingFile(null);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, type: "file" | "image") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPendingFile({ name: file.name, type, url });
    e.target.value = "";
  };

  return (
    <div className="flex flex-col h-[480px] rounded-xl border border-border-light bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-light bg-surface/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center">
            <span className="text-primary text-xs font-semibold">{title[0]}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-dark">{title}</p>
            {subtitle && <p className="text-[11px] text-text-muted">{subtitle}</p>}
          </div>
        </div>
        <Badge variant="green">● Online</Badge>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 bg-surface/30">
        {messages.length === 0 && (
          <p className="text-xs text-text-muted text-center mt-10">
            Start the conversation. Messages are seen by both parties.
          </p>
        )}
        {messages.map((m, i) => (
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
                  {m.attachment.type === "image" ? (
                    <img src={m.attachment.url} alt={m.attachment.name} className="rounded-lg max-h-48 object-cover" />
                  ) : (
                    <a href={m.attachment.url} download={m.attachment.name} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${m.from === "me" ? "bg-white/20" : "bg-surface"} text-xs ${m.from === "me" ? "text-white" : "text-text-dark"}`}>
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
      </div>

      {pendingFile && (
        <div className="px-4 py-2 border-t border-border-light flex items-center gap-2 bg-surface/50">
          {pendingFile.type === "image" ? (
            <img src={pendingFile.url} alt="" className="w-10 h-10 rounded object-cover" />
          ) : (
            <Paperclip className="w-4 h-4 text-text-muted" />
          )}
          <span className="text-xs text-text-dark truncate flex-1">{pendingFile.name}</span>
          <button onClick={() => setPendingFile(null)} className="text-text-muted hover:text-red"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      <div className="px-4 py-3 border-t border-border-light flex items-center gap-2">
        <input type="file" ref={fileInputRef} className="sr-only" onChange={(e) => handleFile(e, "file")} />
        <input type="file" ref={imageInputRef} className="sr-only" accept="image/*" onChange={(e) => handleFile(e, "image")} />
        <button onClick={() => fileInputRef.current?.click()} className="w-9 h-9 rounded-lg text-text-muted hover:bg-surface hover:text-text-dark flex items-center justify-center" title="Attach file">
          <Paperclip className="w-4 h-4" />
        </button>
        <button onClick={() => imageInputRef.current?.click()} className="w-9 h-9 rounded-lg text-text-muted hover:bg-surface hover:text-text-dark flex items-center justify-center" title="Send image">
          <ImageIcon className="w-4 h-4" />
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
          className="flex-1 h-9 px-3 rounded-lg border border-border-light bg-card text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <Button size="sm" onClick={send}>
          <Send className="w-4 h-4" />
          Send
        </Button>
      </div>
    </div>
  );
}
