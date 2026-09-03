"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { Download, UploadCloud } from "lucide-react";

const documents = [
  { name: "Staff Handbook 2026.pdf", category: { text: "Policy", variant: "blue" as const }, uploaded: "Jan 15, 2026", size: "2.4 MB" },
  { name: "Compliance Checklist.xlsx", category: { text: "Compliance", variant: "muted" as const }, uploaded: "Mar 22, 2026", size: "890 KB" },
  { name: "Brand Guidelines.pdf", category: { text: "Branding", variant: "purple" as const }, uploaded: "Feb 10, 2026", size: "5.1 MB" },
  { name: "SOP - Admissions.docx", category: { text: "SOP", variant: "orange" as const }, uploaded: "Apr 5, 2026", size: "340 KB" },
  { name: "Annual Report 2025.pdf", category: { text: "Report", variant: "green" as const }, uploaded: "Dec 1, 2025", size: "8.2 MB" },
];

export default function DocumentsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Documents"
        subtitle="Shared organization document library (permission-controlled)"
        actions={<Button onClick={() => setOpen(true)}>+ Upload Document</Button>}
      />

      <div className="mb-6">
        <SearchInput placeholder="Search documents..." className="max-w-sm" />
      </div>

      <Card className="divide-y divide-border-light">
        {documents.map((d) => (
          <div key={d.name} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Badge variant={d.category.variant}>{d.category.text}</Badge>
              <div>
                <p className="text-sm font-medium text-text-dark">{d.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{d.size} · uploaded {d.uploaded}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
          </div>
        ))}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Upload Document"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Upload</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border-light rounded-lg px-6 py-8 text-center bg-surface/50">
            <UploadCloud className="w-8 h-8 text-text-muted" />
            <p className="text-sm font-medium text-text-dark">Drag &amp; drop or click to upload</p>
            <p className="text-xs text-text-muted">PDF, DOCX, XLSX up to 25MB</p>
          </div>
          <Field label="Document Title" required>
            <TextInput placeholder="e.g. Staff Handbook 2026" />
          </Field>
          <SelectField label="Category" required placeholder="Select category" options={["Policy", "Report", "Template", "Other"]} />
          <Field label="Description">
            <TextArea rows={3} placeholder="Add a short description..." />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
