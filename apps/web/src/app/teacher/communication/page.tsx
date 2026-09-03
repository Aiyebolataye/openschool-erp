"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const threads = [
  { person: "Mrs. Okafor", relation: "Parent · Amara Okafor", last: "Thank you for the update!", time: "2h ago", unread: true },
  { person: "HOD Sciences", relation: "Mr. Adeyemi", last: "Please submit lesson notes by Friday", time: "1d ago", unread: false },
  { person: "SS1 Science Parents", relation: "Classroom group", last: "Re: Sports day permission", time: "1d ago", unread: true },
];

export default function CommunicationPage() {
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState("");

  return (
    <div className="max-w-[1000px] mx-auto">
      <PageHeader
        title="Communication"
        subtitle="Message parents, students, HOD, and administrators"
        actions={
          <>
            <Button variant="secondary">Announcement</Button>
            <Button onClick={() => setOpen(true)}>+ New Message</Button>
          </>
        }
      />
      <Modal open={open} onClose={() => setOpen(false)} title="New Message" footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Send</Button></>}>
        <div className="space-y-4">
          <SelectField label="Recipient" required options={["All My Parents", "A Parent", "HOD", "Administrator"]} value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Select recipient" />
          <Field label="Recipient Name"><TextInput placeholder="Enter recipient name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} /></Field>
          <Field label="Subject" required><TextInput placeholder="Enter subject" value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
          <Field label="Body" required><TextArea placeholder="Write your message..." rows={4} value={body} onChange={(e) => setBody(e.target.value)} /></Field>
          <SelectField label="Channel" required options={["Email", "SMS", "Push"]} value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="Select channel" />
        </div>
      </Modal>

      <Card className="divide-y divide-border-light">
        {threads.map((t) => (
          <div key={t.person} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                <span className="text-primary text-xs font-semibold">{t.person.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-dark flex items-center gap-2">
                  {t.person}
                  {t.unread && <span className="w-2 h-2 rounded-full bg-primary" />}
                </p>
                <p className="text-xs text-text-muted mt-0.5">{t.relation} · {t.last}</p>
              </div>
            </div>
            <span className="text-xs text-text-muted shrink-0">{t.time}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
