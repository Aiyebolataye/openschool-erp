"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { Chatbox } from "@/components/ui/chatbox";

interface Thread {
  id: string;
  name: string;
  role: string;
  avatar: string;
  preview: string;
  time: string;
  unread: number;
}

const threads: Thread[] = [
  { id: "ajayi", name: "Mrs. Ajayi", role: "Form Teacher · SS1 Science", avatar: "A", preview: "Kayode is doing very well in English.", time: "10:24 AM", unread: 2 },
  { id: "okoye", name: "Mr. Okoye", role: "Hostel Warden · Red House", avatar: "O", preview: "Kayode settled in well this term.", time: "Yesterday", unread: 0 },
  { id: "office", name: "School Office", role: "Administration", avatar: "S", preview: "Term 3 fees are now due.", time: "2 days ago", unread: 1 },
];

const threadInitial: Record<string, { from: "me" | "them"; text: string; time: string }[]> = {
  ajayi: [
    { from: "them", text: "Good morning Mr. Eze. Kayode has been participating well in class.", time: "9:00 AM" },
    { from: "me", text: "Thank you, Mrs. Ajayi. Please keep an eye on his Mathematics.", time: "9:10 AM" },
  ],
  okoye: [
    { from: "them", text: "Hello Mr. Eze. Kayode is comfortable in Red House.", time: "Yesterday" },
    { from: "me", text: "Great, thank you Mr. Okoye.", time: "Yesterday" },
  ],
  office: [
    { from: "them", text: "Term 3 2026 fees are now due. Kindly make payment on the portal.", time: "2 days ago" },
  ],
};

export default function ParentMessagesPage() {
  const [active, setActive] = useState("ajayi");
  const [newOpen, setNewOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const activeThread = threads.find((t) => t.id === active)!;

  const sendNew = () => {
    setNewOpen(false);
    setRecipient("");
    setSubject("");
    setBody("");
    showToast("Message sent");
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Messages"
        subtitle="Chat with teachers, wardens and the school office"
        actions={<Button onClick={() => setNewOpen(true)}>+ New Message</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-2 md:col-span-1">
          <div className="flex flex-col">
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${active === t.id ? "bg-primary-light/40" : "hover:bg-surface"}`}
              >
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                  <span className="text-primary text-sm font-semibold">{t.avatar}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-dark truncate">{t.name}</p>
                    <span className="text-[10px] text-text-muted shrink-0">{t.time}</span>
                  </div>
                  <p className="text-xs text-text-muted truncate">{t.role}</p>
                  <p className="text-xs text-text-muted truncate mt-0.5">{t.preview}</p>
                </div>
                {t.unread > 0 && (
                  <Badge variant="blue">{t.unread}</Badge>
                )}
              </button>
            ))}
          </div>
        </Card>

        <div className="md:col-span-2">
          <Chatbox
            key={activeThread.id}
            title={activeThread.name}
            subtitle={activeThread.role}
            initial={threadInitial[activeThread.id]}
          />
        </div>
      </div>

      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="New Message"
        subtitle="Send a message to school staff"
        footer={
          <>
            <Button variant="secondary" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={sendNew}>Send</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Recipient"
            required
            placeholder="Select recipient"
            options={["Mrs. Ajayi — Form Teacher", "Mr. Okoye — Hostel Warden", "School Office"]}
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <Field label="Subject" required>
            <TextInput placeholder="Message subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
          <Field label="Message" required>
            <TextArea rows={4} placeholder="Write your message..." value={body} onChange={(e) => setBody(e.target.value)} />
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
