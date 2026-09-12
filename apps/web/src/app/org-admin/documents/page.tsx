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

type DocRow = {
  name: string;
  category: { text: string; variant: "blue" | "muted" | "purple" | "orange" | "green" };
  uploaded: string;
  size: string;
  description: string;
};

const initialData: DocRow[] = [
  { name: "Staff Handbook 2026.pdf", category: { text: "Policy", variant: "blue" }, uploaded: "Jan 15, 2026", size: "2.4 MB", description: "Comprehensive staff handbook covering policies, conduct, and benefits for the 2026 year." },
  { name: "Compliance Checklist.xlsx", category: { text: "Compliance", variant: "muted" }, uploaded: "Mar 22, 2026", size: "890 KB", description: "Quarterly compliance checklist for all institutions under the organization." },
  { name: "Brand Guidelines.pdf", category: { text: "Branding", variant: "purple" }, uploaded: "Feb 10, 2026", size: "5.1 MB", description: "Organization branding guidelines including logo usage, color palette, and typography." },
  { name: "SOP - Admissions.docx", category: { text: "SOP", variant: "orange" }, uploaded: "Apr 5, 2026", size: "340 KB", description: "Standard operating procedure for the admissions process across institutions." },
  { name: "Annual Report 2025.pdf", category: { text: "Report", variant: "green" }, uploaded: "Dec 1, 2025", size: "8.2 MB", description: "Organization annual report for 2025 covering performance and financial summaries." },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocRow[]>(initialData);
  const [open, setOpen] = useState(false);
  const [viewItem, setViewItem] = useState<DocRow | null>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [docName, setDocName] = useState("");
  const [docCategory, setDocCategory] = useState("");
  const [docDescription, setDocDescription] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const q = search.trim().toLowerCase();
  const filtered = documents.filter(
    (d) => !q || d.name.toLowerCase().includes(q) || d.category.text.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
  );

  function handleUpload() {
    if (!docName.trim()) return;
    setOpen(false);
    setDocName("");
    setDocCategory("");
    setDocDescription("");
    showToast("Document uploaded successfully");
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Documents"
        subtitle="Shared organization document library (permission-controlled)"
        actions={<Button onClick={() => setOpen(true)}>+ Upload Document</Button>}
      />

      <div className="mb-6">
        <SearchInput placeholder="Search documents..." className="max-w-sm" value={search} onChange={(val) => setSearch(val)} />
      </div>

      <Card className="divide-y divide-border-light">
        {filtered.map((d) => (
          <div
            key={d.name}
            onClick={() => setViewItem(d)}
            className="flex items-center justify-between px-5 py-4 hover:bg-surface/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Badge variant={d.category.variant}>{d.category.text}</Badge>
              <div>
                <p className="text-sm font-medium text-text-dark">{d.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{d.size} · uploaded {d.uploaded}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                showToast(`Downloading ${d.name}…`);
              }}
            >
              <Download className="w-4 h-4" />
            </Button>
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
            <Button onClick={handleUpload}>Upload</Button>
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
            <TextInput placeholder="e.g. Staff Handbook 2026" value={docName} onChange={(e) => setDocName(e.target.value)} />
          </Field>
          <SelectField label="Category" required placeholder="Select category" options={["Policy", "Report", "Template", "Other"]} value={docCategory} onChange={(e) => setDocCategory(e.target.value)} />
          <Field label="Description">
            <TextArea rows={3} placeholder="Add a short description..." value={docDescription} onChange={(e) => setDocDescription(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title={viewItem?.name ?? ""}
        subtitle={viewItem?.category.text}
        footer={<Button variant="secondary" onClick={() => setViewItem(null)}>Close</Button>}
      >
        {viewItem && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-text-muted">Size</span>
                <p className="text-sm font-medium text-text-dark">{viewItem.size}</p>
              </div>
              <div>
                <span className="text-xs text-text-muted">Uploaded</span>
                <p className="text-sm font-medium text-text-dark">{viewItem.uploaded}</p>
              </div>
            </div>
            <div className="border-t border-border-light pt-4">
              <span className="text-xs text-text-muted">Description</span>
              <p className="text-sm text-text-dark mt-1">{viewItem.description}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => showToast(`Downloading ${viewItem.name}…`)}>
              <Download className="w-4 h-4" /> Download
            </Button>
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