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
  { label: "Active Surveys", value: "4", detail: "", detailColor: "muted" as const },
  { label: "Total Responses", value: "1,280", detail: "", detailColor: "muted" as const },
  { label: "Avg Response Rate", value: "62%", detail: "", detailColor: "green" as const },
];

type Survey = {
  title: string;
  audience: string;
  status: { text: string; variant: "green" | "muted" };
  responses: string;
  description: string;
};

const initialData: Survey[] = [
  { title: "Staff Satisfaction Survey", audience: "All organization staff", status: { text: "Active", variant: "green" }, responses: "342", description: "Quarterly pulse check on staff engagement, workload, and well-being across all institutions." },
  { title: "Parent Satisfaction (Greenfield)", audience: "Greenfield parents", status: { text: "Active", variant: "green" }, responses: "610", description: "Annual satisfaction survey for parents of Greenfield Academy students." },
  { title: "Institution Performance Review", audience: "Institution Admins", status: { text: "Closed", variant: "muted" }, responses: "18", description: "Feedback from institution admins on platform performance and support." },
  { title: "Internal Audit Self-Assessment", audience: "Compliance team", status: { text: "Draft", variant: "muted" }, responses: "—", description: "Self-assessment checklist for the compliance team ahead of the annual audit." },
];

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>(initialData);
  const [open, setOpen] = useState(false);
  const [viewItem, setViewItem] = useState<Survey | null>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const q = search.trim().toLowerCase();
  const filtered = surveys.filter(
    (s) => !q || s.title.toLowerCase().includes(q) || s.audience.toLowerCase().includes(q) || s.status.text.toLowerCase().includes(q)
  );

  function handleCreate() {
    if (!title.trim()) return;
    const newSurvey: Survey = {
      title: title.trim(),
      audience: audience || "All",
      status: { text: "Draft", variant: "muted" },
      responses: "—",
      description: description || "No description provided.",
    };
    setSurveys((prev) => [newSurvey, ...prev]);
    setOpen(false);
    setTitle("");
    setAudience("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    showToast("Survey created");
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Surveys"
        subtitle="Organization surveys, view individually or aggregated across institutions"
        actions={<Button onClick={() => setOpen(true)}>+ Create Survey</Button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <div className="mb-6">
        <SearchInput placeholder="Search surveys..." className="max-w-sm" value={search} onChange={(val) => setSearch(val)} />
      </div>

      <Card className="divide-y divide-border-light">
        {filtered.map((s) => (
          <div
            key={s.title}
            onClick={() => setViewItem(s)}
            className="flex items-center justify-between px-5 py-4 hover:bg-surface/50 transition-colors cursor-pointer"
          >
            <div>
              <p className="text-sm font-medium text-text-dark">{s.title}</p>
              <p className="text-xs text-text-muted mt-0.5">{s.audience} · {s.responses} responses</p>
            </div>
            <Badge variant={s.status.variant}>{s.status.text}</Badge>
          </div>
        ))}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create Survey"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Survey</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title" required>
            <TextInput placeholder="e.g. Staff Satisfaction Survey" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <SelectField label="Audience" required placeholder="Select audience" options={["All Staff", "Institution Admins", "Principals", "Parents", "All"]} value={audience} onChange={(e) => setAudience(e.target.value)} />
          <Field label="Description" required>
            <TextArea rows={4} placeholder="Describe the purpose of this survey..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" required>
              <TextInput placeholder="e.g. Aug 10, 2026" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <Field label="End Date" required>
              <TextInput placeholder="e.g. Aug 24, 2026" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Field>
          </div>
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
                <span className="text-xs text-text-muted">Responses</span>
                <p className="text-sm font-medium text-text-dark">{viewItem.responses}</p>
              </div>
            </div>
            <div className="border-t border-border-light pt-4">
              <span className="text-xs text-text-muted">Description</span>
              <p className="text-sm text-text-dark mt-1">{viewItem.description}</p>
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