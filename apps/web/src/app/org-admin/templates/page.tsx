"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";

type TemplateRow = {
  name: string;
  description: string;
  type: { text: string; variant: "red" | "muted" };
};

const initialData: TemplateRow[] = [
  { name: "Academic Structure", description: "Levels, sessions, terms, classes", type: { text: "Mandatory", variant: "red" } },
  { name: "Fee Categories", description: "Standard fee structure for org", type: { text: "Optional", variant: "muted" } },
  { name: "Branding", description: "Org logo and color scheme", type: { text: "Mandatory", variant: "red" } },
  { name: "Report Cards", description: "Standard report card layout", type: { text: "Optional", variant: "muted" } },
  { name: "Documents", description: "Policies and compliance documents", type: { text: "Mandatory", variant: "red" } },
  { name: "Staff Roles", description: "Default staff role definitions", type: { text: "Optional", variant: "muted" } },
  { name: "Communication Templates", description: "Email and SMS templates", type: { text: "Optional", variant: "muted" } },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateRow[]>(initialData);
  const [open, setOpen] = useState(false);
  const [viewItem, setViewItem] = useState<TemplateRow | null>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const q = search.trim().toLowerCase();
  const filtered = templates.filter(
    (t) => !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.type.text.toLowerCase().includes(q)
  );

  function handleCreate() {
    if (!name.trim()) return;
    const newTemplate: TemplateRow = {
      name: name.trim(),
      description: subject || "No subject provided.",
      type: { text: "Optional", variant: "muted" },
    };
    setTemplates((prev) => [newTemplate, ...prev]);
    setOpen(false);
    setName("");
    setCategory("");
    setSubject("");
    setBody("");
    showToast("Template created");
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Templates"
        subtitle="Organization-wide templates that can be pushed to institutions (accept, modify, or ignore)"
        actions={<Button onClick={() => setOpen(true)}>+ Create Template</Button>}
      />

      <div className="mb-6">
        <SearchInput placeholder="Search templates..." className="max-w-sm" value={search} onChange={(val) => setSearch(val)} />
      </div>

      <Card className="divide-y divide-border-light">
        {filtered.map((t) => (
          <div
            key={t.name}
            onClick={() => setViewItem(t)}
            className="flex items-center justify-between px-5 py-4 hover:bg-surface/50 transition-colors cursor-pointer"
          >
            <div>
              <p className="text-sm font-medium text-text-dark">{t.name}</p>
              <p className="text-xs text-text-muted mt-0.5">{t.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={t.type.variant}>{t.type.text}</Badge>
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  showToast(`${t.name} pushed to institutions`);
                }}
              >
                Push to Institutions
              </Button>
            </div>
          </div>
        ))}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create Template"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Template</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Template Name" required>
            <TextInput placeholder="e.g. End of Term Notice" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <SelectField label="Category" required placeholder="Select category" options={["Email", "SMS", "Document"]} value={category} onChange={(e) => setCategory(e.target.value)} />
          <Field label="Subject" required>
            <TextInput placeholder="e.g. End of Term Parent Notice" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
          <Field label="Body" required>
            <TextArea rows={5} placeholder="Write your template content..." value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title={viewItem?.name ?? ""}
        subtitle={viewItem?.description}
        footer={<Button variant="secondary" onClick={() => setViewItem(null)}>Close</Button>}
      >
        {viewItem && (
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-xs text-text-muted">Type</span>
              <div className="mt-0.5"><Badge variant={viewItem.type.variant}>{viewItem.type.text}</Badge></div>
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