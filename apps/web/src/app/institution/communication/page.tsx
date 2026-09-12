"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";

const kpis = [
  { label: "Messages (7d)", value: "12,400", detail: "", detailColor: "muted" as const },
  { label: "Delivery Rate", value: "98.2%", detail: "", detailColor: "green" as const },
  { label: "Documents", value: "46", detail: "", detailColor: "muted" as const },
  { label: "Draft Campaigns", value: "3", detail: "", detailColor: "muted" as const },
];

const channels = [
  { name: "Email", detail: "12 templates", status: { text: "Active", variant: "green" as const }, description: "Primary communication channel for formal notices, reports, and newsletters.", rules: "Templates must be approved by administration before use. Max 5 sends per day.", version: "v3.2 — Updated Jul 2026" },
  { name: "SMS", detail: "8 templates", status: { text: "Active", variant: "green" as const }, description: "Short message service for urgent alerts and reminders.", rules: "Character limit: 160. Use only for time-sensitive notifications.", version: "v2.1 — Updated May 2026" },
  { name: "WhatsApp", detail: "6 templates", status: { text: "Linked", variant: "blue" as const }, description: "Instant messaging integration for parent-teacher updates.", rules: "Requires WhatsApp Business API key. Group messages limited to 256 recipients.", version: "v1.4 — Updated Aug 2026" },
  { name: "Announcements", detail: "Rules configured", status: { text: "Active", variant: "green" as const }, description: "School-wide announcement broadcasting system.", rules: "All announcements require principal approval. Scheduling enabled for future dates.", version: "v2.0 — Updated Jun 2026" },
];

const documents = [
  { name: "Student Handbook.pdf", category: { text: "Policy", variant: "blue" as const }, detail: "3.2 MB · Jan 10, 2026", pages: 48, author: "Admin Office", description: "Comprehensive guide covering student policies, codes of conduct, and school procedures for the current academic year." },
  { name: "Term 3 Timetable.xlsx", category: { text: "Timetable", variant: "orange" as const }, detail: "420 KB · Jul 28, 2026", pages: 4, author: "Academic Office", description: "Master timetable for Term 3 covering all classes and subject allocations." },
  { name: "Code of Conduct.docx", category: { text: "Policy", variant: "blue" as const }, detail: "180 KB · Mar 2, 2026", pages: 12, author: "Student Affairs", description: "Detailed behavioral expectations and disciplinary procedures for all students." },
  { name: "Payroll Register.xlsx", category: { text: "Finance", variant: "green" as const }, detail: "1.1 MB · Jul 30, 2026", pages: 6, author: "Finance Department", description: "Confidential payroll records for the month of July 2026." },
];

const templateOptions = ["None", "Fee Reminder", "Attendance Alert", "Event Announcement", "Parent-Teacher Meeting", "Results Notification", "School Closure Notice"];

const templateContent: Record<string, { subject: string; body: string }> = {
  "Fee Reminder": {
    subject: "Fee Payment Reminder",
    body: "Dear Parent, this is a reminder that your child's school fees are due by {due_date}. Please make payment on time to avoid disruption of classes. Thank you.",
  },
  "Attendance Alert": {
    subject: "Attendance Alert",
    body: "Dear Parent, our records show that your child was marked absent today. Please contact the school office if this is in error. Regards, Administration.",
  },
  "Event Announcement": {
    subject: "Upcoming School Event",
    body: "Dear Parent, we are pleased to announce {event} taking place on {date} at {venue}. We look forward to seeing you there. Best regards, Administration.",
  },
  "Parent-Teacher Meeting": {
    subject: "Parent-Teacher Meeting",
    body: "Dear Parent, you are invited to the Parent-Teacher Meeting on {date} at {time}. Please book a slot with your child's teachers via the portal. Best regards.",
  },
  "Results Notification": {
    subject: "Your child's results are ready",
    body: "Dear Parent, your child's results are now available on the school portal. Please log in to view and download them. Thank you, Administration.",
  },
  "School Closure Notice": {
    subject: "School Closure Notice",
    body: "Dear Parent, please be informed that school will be closed on {date} due to {reason}. Lessons resume on {resume_date}. Stay safe. Regards, Administration.",
  },
};

const recipientOptions = ["All Parents", "All Staff", "Specific Staff", "Specific Parent", "Specific Class", "Specific Student"];

const staffOptions = [
  "Mrs. Ajayi (Biology Teacher)",
  "Mr. Obi (Math Teacher)",
  "Ms. Tran (Literature Teacher)",
  "Mr. Adeyemi (HOD Sciences)",
  "Mrs. Okafor (Bursar)",
  "Mr. Kalu (Librarian)",
];

const parentOptions = [
  "Mr. Eze (Parent of Chidi)",
  "Mrs. Okafor (Parent of Amara)",
  "Mr. Wallace (Parent of Tom)",
  "Mrs. Lim (Parent of Grace)",
  "Mrs. Smith (Parent of Daniel)",
];

function List({ rows, onRowClick }: { rows: { title: string; detail: string; status?: { text: string; variant: "green" | "red" | "orange" | "muted" | "blue" }; href?: string }[]; onRowClick?: (index: number) => void }) {
  const rowClass = "flex items-center justify-between px-5 py-4 transition-colors";
  return (
    <Card className="divide-y divide-border-light">
      {rows.map((r, i) => {
        const inner = (
          <>
            <div>
              <p className="text-sm font-medium text-text-dark">{r.title}</p>
              <p className="text-xs text-text-muted mt-0.5">{r.detail}</p>
            </div>
            {r.status && <Badge variant={r.status.variant}>{r.status.text}</Badge>}
          </>
        );
        if (r.href) {
          return (
            <Link key={r.title} href={r.href} className={`${rowClass} cursor-pointer hover:bg-surface-secondary`}>
              {inner}
            </Link>
          );
        }
        return (
          <div key={r.title} className={`${rowClass} ${onRowClick ? "cursor-pointer hover:bg-surface-secondary" : ""}`} onClick={() => onRowClick?.(i)}>
            {inner}
          </div>
        );
      })}
    </Card>
  );
}

export default function CommunicationPage() {
  const [msgOpen, setMsgOpen] = useState(false);
  const [documentDetailOpen, setDocumentDetailOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);

  const [recipient, setRecipient] = useState("");
  const [specificStaff, setSpecificStaff] = useState("");
  const [specificParent, setSpecificParent] = useState("");
  const [template, setTemplate] = useState("None");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState("");
  const [sendConfirmation, setSendConfirmation] = useState("");

  const isSpecificStaff = recipient === "Specific Staff";
  const isSpecificParent = recipient === "Specific Parent";

  function handleSend() {
    const recipientLabel = isSpecificStaff ? specificStaff : isSpecificParent ? specificParent : recipient;
    setSendConfirmation(`Message sent to ${recipientLabel} via ${channel}`);
    setTimeout(() => setSendConfirmation(""), 4000);
    resetForm();
    setMsgOpen(false);
  }

  function resetForm() {
    setRecipient("");
    setSpecificStaff("");
    setSpecificParent("");
    setTemplate("None");
    setSubject("");
    setBody("");
    setChannel("");
  }

  function handleTemplateChange(value: string) {
    setTemplate(value);
    const content = templateContent[value];
    if (content) {
      setSubject(content.subject);
      setBody(content.body);
    }
  }

  function handleDocumentClick(index: number) {
    setSelectedDocument(index);
    setDocumentDetailOpen(true);
  }

  return (
    <div className="max-w-[1000px] mx-auto">
      <PageHeader
        title="Communication & Docs"
        subtitle="Messages, templates, broadcasts, and document library"
        actions={<Button onClick={() => setMsgOpen(true)}>+ New Message</Button>}
      />

      {sendConfirmation && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {sendConfirmation}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Tabs
        tabs={[
          { id: "communication", label: "Communication", content: <List rows={channels.map((c) => ({ title: c.name, detail: c.detail, status: c.status, href: `/institution/communication/templates?channel=${c.name}` }))} /> },
          { id: "documents", label: "Documents", content: <List rows={documents.map((d) => ({ title: d.name, detail: d.detail, status: d.category }))} onRowClick={handleDocumentClick} /> },
        ]}
      />

      <Modal
        open={msgOpen}
        onClose={() => { setMsgOpen(false); resetForm(); }}
        title="New Message"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setMsgOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSend}>Send</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Recipient"
            required
            placeholder="Select recipient"
            options={recipientOptions}
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          {isSpecificStaff && (
            <SelectField
              label="Select Staff"
              required
              placeholder="Select a staff member"
              options={staffOptions}
              value={specificStaff}
              onChange={(e) => setSpecificStaff(e.target.value)}
            />
          )}
          {isSpecificParent && (
            <SelectField
              label="Select Parent"
              required
              placeholder="Select a parent"
              options={parentOptions}
              value={specificParent}
              onChange={(e) => setSpecificParent(e.target.value)}
            />
          )}
          <SelectField
            label="Template"
            placeholder="Select a template"
            options={templateOptions}
            value={template}
            onChange={(e) => handleTemplateChange(e.target.value)}
          />
          <Field label="Subject" required>
            <TextInput placeholder="Enter subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
          <Field label="Body" required>
            <TextArea rows={4} placeholder="Type your message..." value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
          <SelectField
            label="Channel"
            required
            placeholder="Select channel"
            options={["Email", "SMS", "Push"]}
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={documentDetailOpen}
        onClose={() => setDocumentDetailOpen(false)}
        title={selectedDocument !== null ? documents[selectedDocument].name : ""}
        footer={<Button variant="secondary" onClick={() => setDocumentDetailOpen(false)}>Close</Button>}
      >
        {selectedDocument !== null && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Category</p>
              <Badge variant={documents[selectedDocument].category.variant}>{documents[selectedDocument].category.text}</Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-text-dark">{documents[selectedDocument].description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Author</p>
                <p className="text-sm text-text-dark">{documents[selectedDocument].author}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Pages</p>
                <p className="text-sm text-text-dark">{documents[selectedDocument].pages}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">File Info</p>
              <p className="text-sm text-text-dark">{documents[selectedDocument].detail}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
