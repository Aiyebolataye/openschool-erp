"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";

const portfolios = [
  { student: "Chidi Eze", id: "STU-21401", cls: "SS1 Science", cert: "Merit Certificate — Term 2", status: { text: "Issued", variant: "green" as const }, date: "Jul 15" },
  { student: "Amara Okafor", id: "STU-21402", cls: "JSS2 B", cert: "Best Behaviour Award", status: { text: "Issued", variant: "green" as const }, date: "Jul 10" },
  { student: "Tom Wallace", id: "STU-21403", cls: "SS3 Art", cert: "Academic Distinction", status: { text: "Draft", variant: "orange" as const }, date: "Aug 1" },
  { student: "Grace Lim", id: "STU-21404", cls: "SS2 Science", cert: "Science Fair Winner", status: { text: "Draft", variant: "orange" as const }, date: "Aug 3" },
];

const studentMap: Record<string, { id: string; cls: string }> = {
  "STU-21401 — Chidi Eze": { id: "STU-21401", cls: "SS1 Science" },
  "STU-21402 — Amara Okafor": { id: "STU-21402", cls: "JSS2 B" },
  "STU-21403 — Tom Wallace": { id: "STU-21403", cls: "SS3 Art" },
  "STU-21404 — Grace Lim": { id: "STU-21404", cls: "SS2 Science" },
};

const studentOptions = Object.keys(studentMap);

const certTypes = ["Merit Certificate", "Best Behaviour Award", "Academic Distinction", "Science Fair Winner", "Sports Excellence", "Attendance Award", "Leadership Award"];

export default function PrincipalPortfolioPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<typeof portfolios[number] | null>(null);

  const [studentValue, setStudentValue] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [certType, setCertType] = useState("");
  const [customCertType, setCustomCertType] = useState("");

  function onStudentSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setStudentValue(value);
    const info = studentMap[value];
    if (info) {
      setStudentId(info.id);
      setStudentClass(info.cls);
    } else {
      setStudentId("");
      setStudentClass("");
    }
  }

  function resetCreateForm() {
    setStudentValue("");
    setStudentId("");
    setStudentClass("");
    setCertType("");
    setCustomCertType("");
  }

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Portfolio & Certificates"
        subtitle="Create and manage student achievement certificates and portfolios"
        actions={<Button onClick={() => setCreateOpen(true)}>+ Create Certificate</Button>}
      />

      <Card className="divide-y divide-border-light">
        {portfolios.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-text-dark">{p.student} · {p.id}</p>
              <p className="text-xs text-text-muted mt-0.5">{p.cert} · {p.cls} · {p.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={p.status.variant as "green"}>{p.status.text}</Badge>
              <Button variant="ghost" size="sm" onClick={() => { setPreviewItem(p); setPreviewOpen(true); }}>Preview</Button>
            </div>
          </div>
        ))}
      </Card>

      {/* Certificate Preview */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Certificate Preview"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button onClick={() => setPreviewOpen(false)}>Download PDF</Button>
          </>
        }
      >
        {previewItem && (
          <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 bg-surface/50 text-center">
            <div className="mb-4">
              <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Greenfield Academy</p>
              <div className="w-12 h-1 bg-primary rounded-full mx-auto mb-4" />
            </div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Certificate of Achievement</p>
            <p className="text-xl font-display font-bold text-text-dark mb-1">This is to certify that</p>
            <p className="text-2xl font-display font-bold text-primary mb-2">{previewItem.student}</p>
            <p className="text-sm text-text-dark mb-1">of <span className="font-semibold">{previewItem.cls}</span></p>
            <p className="text-sm text-text-dark mb-4">has been awarded the</p>
            <p className="text-lg font-display font-bold text-primary italic mb-4">{previewItem.cert}</p>
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-border-light">
              <div className="text-left">
                <p className="text-xs text-text-muted">Date Issued</p>
                <p className="text-sm font-medium text-text-dark">{previewItem.date}, 2026</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted">Principal</p>
                <p className="text-sm font-medium text-text-dark">Dr. Okon</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Certificate Modal */}
      <Modal
        open={createOpen}
        onClose={() => { resetCreateForm(); setCreateOpen(false); }}
        title="Create Certificate"
        footer={
          <>
            <Button variant="secondary" onClick={() => { resetCreateForm(); setCreateOpen(false); }}>Cancel</Button>
            <Button onClick={() => { resetCreateForm(); setCreateOpen(false); }}>Create Certificate</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Student"
            required
            placeholder="Select student"
            value={studentValue}
            onChange={onStudentSelect}
            options={studentOptions}
          />
          <Field label="Student ID" required>
            <TextInput value={studentId} readOnly placeholder="Auto-filled from student" />
          </Field>
          <Field label="Class" required>
            <TextInput value={studentClass} readOnly placeholder="Auto-filled from student" />
          </Field>
          <SelectField
            label="Certificate Type"
            required
            placeholder="Select type"
            value={certType}
            onChange={(e) => setCertType(e.target.value)}
            options={[...certTypes, "Other"]}
          />
          {certType === "Other" && (
            <Field label="Custom Certificate Type" required>
              <TextInput placeholder="Enter certificate type" value={customCertType} onChange={(e) => setCustomCertType(e.target.value)} />
            </Field>
          )}
          <Field label="Description / Citation">
            <TextArea rows={3} placeholder="Optional description for the certificate citation..." />
          </Field>
          <Field label="Term / Session" required>
            <TextInput value="Term 3, 2026 Session" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
