"use client";

import { useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";

const kpis = [
  { label: "Active Announcements", value: "3", detail: "", detailColor: "muted" as const },
  { label: "Scheduled", value: "2", detail: "", detailColor: "muted" as const },
  { label: "Total Sent", value: "24", detail: "", detailColor: "muted" as const },
];

type Announcement = {
  title: string;
  audience: string;
  status: { text: string; variant: "green" | "orange" | "muted" };
  scheduled: string;
  sent: string;
  body: string;
};

const initialData: Announcement[] = [
  { title: "End of Term Staff Briefing", audience: "Institution Admins, Principals", status: { text: "Published", variant: "green" }, scheduled: "Jul 28, 2026", sent: "24 recipients", body: "All institution admins and principals are invited to the end-of-term staff briefing scheduled for next week. Attendance is mandatory." },
  { title: "New Uniform Policy for 2027", audience: "All staff & parents", status: { text: "Scheduled", variant: "orange" }, scheduled: "Aug 5, 2026", sent: "Pending", body: "A new uniform policy will take effect for the 2027 academic year. Full details have been shared with all institutions." },
  { title: "Financial Reporting Deadline", audience: "Finance Directors", status: { text: "Draft", variant: "muted" }, scheduled: "Aug 12, 2026", sent: "Pending", body: "Finance directors are reminded to submit their quarterly financial reports before the deadline." },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialData);
  const [open, setOpen] = useState(false);
  const [viewItem, setViewItem] = useState<Announcement | null>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("");
  const [body, setBody] = useState("");
  const [schedule, setSchedule] = useState("");
  const [priority, setPriority] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const q = search.trim().toLowerCase();
  const filtered = announcements.filter(
    (a) => !q || a.title.toLowerCase().includes(q) || a.audience.toLowerCase().includes(q) || a.status.text.toLowerCase().includes(q)
  );

  function handleCreate() {
    if (!title.trim()) return;
    const newAnn: Announcement = {
      title: title.trim(),
      audience: audience || "All",
      status: schedule ? { text: "Scheduled", variant: "orange" } : { text: "Published", variant: "green" },
      scheduled: schedule || "Now",
      sent: schedule ? "Pending" : "0 recipients",
      body: body || "No body provided.",
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    setOpen(false);
    setTitle("");
    setAudience("");
    setBody("");
    setSchedule("");
    setPriority("");
    showToast(schedule ? "Announcement scheduled" : "Announcement published");
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Organization Announcements"
        subtitle="Organization-wide announcements to institutions"
        actions={<Button onClick={() => setOpen(true)}>+ New Announcement</Button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <div className="mb-6">
        <SearchInput placeholder="Search announcements..." className="max-w-sm" value={search} onChange={(val) => setSearch(val)} />
      </div>

      <Card className="divide-y divide-border-light">
        {filtered.map((a) => (
          <div
            key={a.title}
            onClick={() => setViewItem(a)}
            className="flex items-center justify-between px-5 py-4 hover:bg-surface/50 transition-colors cursor-pointer"
          >
            <div>
              <p className="text-sm font-medium text-text-dark">{a.title}</p>
              <p className="text-xs text-text-muted mt-0.5">{a.audience} · {a.scheduled} · {a.sent}</p>
            </div>
            <Badge variant={a.status.variant}>{a.status.text}</Badge>
          </div>
        ))}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New Announcement"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Announcement</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title" required>
            <TextInput placeholder="e.g. End of Term Staff Briefing" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <SelectField label="Audience" required placeholder="Select audience" options={["All Staff", "Institution Admins", "Principals", "Parents", "All"]} value={audience} onChange={(e) => setAudience(e.target.value)} />
          <Field label="Body" required>
            <TextArea rows={4} placeholder="Write your announcement message..." value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
          <Field label="Schedule">
            <TextInput placeholder="e.g. Aug 10, 2026" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
          </Field>
          <SelectField label="Priority" placeholder="Select priority" options={["Low", "Normal", "High", "Urgent"]} value={priority} onChange={(e) => setPriority(e.target.value)} />
        </div>
      </Modal>

      <Modal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title={viewItem?.title ?? ""}
        subtitle={viewItem?.audience}
        footer={<Button variant="secondary" onClick={() => setViewItem(null)}>Close</Button>}
      >
        {viewItem && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-text-muted">Status</span>
                <div className="mt-0.5"><Badge variant={viewItem.status.variant}>{viewItem.status.text}</Badge></div>
              </div>
              <div>
                <span className="text-xs text-text-muted">Scheduled</span>
                <p className="text-sm font-medium text-text-dark">{viewItem.scheduled}</p>
              </div>
              <div>
                <span className="text-xs text-text-muted">Delivered To</span>
                <p className="text-sm font-medium text-text-dark">{viewItem.sent}</p>
              </div>
            </div>
            <div className="border-t border-border-light pt-4">
              <span className="text-xs text-text-muted">Message</span>
              <p className="text-sm text-text-dark mt-1">{viewItem.body}</p>
            </div>
          </div>
        )}
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}