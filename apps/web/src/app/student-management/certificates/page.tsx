"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import type { TableRow } from "@/types";
import { Send } from "lucide-react";

type CertStatus = "Issued" | "Pending" | "Sent to Parent";

interface Certificate {
  id: string;
  student: string;
  klass: string;
  title: string;
  type: string;
  issueDate: string;
  status: CertStatus;
}

const initialCertificates: Certificate[] = [
  { id: "CERT-2081", student: "Ngozi Okonkwo", klass: "SS3 Art", title: "WAEC SSCE Certificate", type: "Academic", issueDate: "2026-08-24", status: "Issued" },
  { id: "CERT-2080", student: "Femi Balogun", klass: "SS3 Science", title: "First Aid & Safety Training", type: "Skills", issueDate: "2026-08-21", status: "Sent to Parent" },
  { id: "CERT-2079", student: "Chiamaka Nwankwo", klass: "SS1 Art", title: "National Art Exhibition", type: "External", issueDate: "2026-08-19", status: "Issued" },
  { id: "CERT-2078", student: "Blessing Eze", klass: "JSS2 A", title: "Swimming Proficiency Level 2", type: "Skills", issueDate: "2026-08-15", status: "Sent to Parent" },
  { id: "CERT-2077", student: "Tobi Adeyemi", klass: "SS2 Science", title: "Science Olympiad Participation", type: "Participation", issueDate: "2026-08-10", status: "Issued" },
  { id: "CERT-2076", student: "Ibrahim Lawal", klass: "SS2 Science", title: "Good Conduct Certificate", type: "Behaviour", issueDate: "2026-08-02", status: "Pending" },
  { id: "CERT-2075", student: "Adaobi Nwachukwu", klass: "SS2 Art", title: "Junior Choir Lead", type: "Academic", issueDate: "2026-07-28", status: "Issued" },
];

const certTypes = ["Academic", "Skills", "Participation", "Behaviour", "External"];

const studentOptions = [
  "Ngozi Okonkwo",
  "Tobi Adeyemi",
  "Zainab Abubakar",
  "Emeka Okafor",
  "Blessing Eze",
  "Femi Balogun",
  "Chiamaka Nwankwo",
  "Ibrahim Lawal",
  "Yemi Osho",
  "Adaobi Nwachukwu",
];

const statusBadge = (s: CertStatus) =>
  s === "Issued"
    ? { text: "Issued", variant: "green" as const }
    : s === "Pending"
      ? { text: "Pending", variant: "orange" as const }
      : { text: "Sent to Parent", variant: "blue" as const };

const columns = [
  { key: "student", label: "STUDENT" },
  { key: "title", label: "CERTIFICATE" },
  { key: "type", label: "TYPE" },
  { key: "issueDate", label: "ISSUE DATE" },
  { key: "status", label: "STATUS" },
];

export default function PortfolioOfficerCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>(initialCertificates);
  const [search, setSearch] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Certificate | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [newStudent, setNewStudent] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("");
  const [newDate, setNewDate] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const q = search.trim().toLowerCase();
  const filtered = certificates.filter(
    (c) =>
      !q ||
      c.student.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
  );

  const rows: TableRow[] = filtered.map((c) => ({
    student: (
      <div>
        <p className="text-sm font-medium text-text-dark">{c.student}</p>
        <p className="text-xs text-text-muted">{c.id}</p>
      </div>
    ),
    title: c.title,
    type: c.type,
    issueDate: c.issueDate,
    status: statusBadge(c.status),
  }));

  const openDetail = (row: TableRow, i: number) => {
    setSelected(filtered[i]);
    setDetailOpen(true);
  };

  const sendToParent = () => {
    if (!selected) return;
    setCertificates((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, status: "Sent to Parent" as CertStatus } : c))
    );
    setSelected({ ...selected, status: "Sent to Parent" });
    showToast(`Certificate sent to parent of ${selected.student}`);
  };

  const issueCertificate = () => {
    if (!newStudent || !newTitle || !newType || !newDate) return;
    const maxNum = Math.max(...certificates.map((c) => parseInt(c.id.slice(5), 10)));
    setCertificates((prev) => [
      ...prev,
      {
        id: `CERT-${maxNum + 1}`,
        student: newStudent,
        klass: "—",
        title: newTitle.trim(),
        type: newType,
        issueDate: newDate,
        status: "Issued",
      },
    ]);
    setNewStudent("");
    setNewTitle("");
    setNewType("");
    setNewDate("");
    setAddOpen(false);
    showToast(`Certificate issued to ${newStudent}`);
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Certificates"
        subtitle="Certificates issued and recorded in student portfolios"
        actions={<Button onClick={() => setAddOpen(true)}>+ Issue Certificate</Button>}
      />

      <Card className="p-4 mb-6">
        <SearchInput
          placeholder="Search by student, certificate, type or ID..."
          value={search}
          onChange={setSearch}
          className="max-w-md"
        />
      </Card>

      <DataTable columns={columns} data={rows} onRowClick={openDetail} />

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.title ?? ""}
        subtitle={selected ? `${selected.id} · issued ${selected.issueDate}` : undefined}
        footer={
          selected && (
            <>
              {selected.status !== "Sent to Parent" && (
                <Button onClick={sendToParent}>
                  <Send className="w-4 h-4" /> Send to Parent
                </Button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border-light p-4">
                <p className="text-xs text-text-muted">Student</p>
                <p className="text-sm font-medium text-text-dark">{selected.student}</p>
              </div>
              <div className="rounded-lg border border-border-light p-4">
                <p className="text-xs text-text-muted">Status</p>
                <Badge variant={statusBadge(selected.status).variant}>{selected.status}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border-light p-4">
                <p className="text-xs text-text-muted">Type</p>
                <p className="text-sm font-medium text-text-dark">{selected.type}</p>
              </div>
              <div className="rounded-lg border border-border-light p-4">
                <p className="text-xs text-text-muted">Issue Date</p>
                <p className="text-sm font-medium text-text-dark">{selected.issueDate}</p>
              </div>
            </div>
            <p className="text-sm text-text-dark leading-relaxed">
              This certificate has been recorded in{" "}
              <span className="font-medium">{selected.student}</span>'s portfolio. You can send a copy to the
              student's parent at any time.
            </p>
          </div>
        )}
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Issue Certificate"
        subtitle="Add a new certificate to a student's portfolio"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={issueCertificate}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Student"
            required
            placeholder="Select student"
            options={studentOptions}
            value={newStudent}
            onChange={(e) => setNewStudent(e.target.value)}
          />
          <Field label="Certificate Title" required>
            <TextInput
              placeholder="e.g. WAEC SSCE Certificate"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </Field>
          <SelectField
            label="Type"
            required
            placeholder="Select type"
            options={certTypes}
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          />
          <Field label="Issue Date" required>
            <TextInput type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
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