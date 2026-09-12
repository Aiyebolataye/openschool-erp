"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import type { TableRow } from "@/types";
import { Phone, CheckCircle } from "lucide-react";

type Status = "Treated" | "Referred" | "Parent Notified";

interface Visit {
  id: string;
  student: string;
  klass: string;
  symptoms: string;
  time: string;
  status: Status;
  treatment: string;
}

const initialVisits: Visit[] = [
  { id: "VIS-9021", student: "Adaeze Nwosu", klass: "JSS2 A", symptoms: "Headache and mild fever", time: "09:40", status: "Treated", treatment: "Paracetamol 500mg, rest in sick bay for 30 minutes." },
  { id: "VIS-9020", student: "Tunde Bakare", klass: "JSS3 A", symptoms: "Swollen sprained ankle", time: "10:15", status: "Referred", treatment: "Ice pack applied; referred for X-ray." },
  { id: "VIS-9019", student: "Fatima Bello", klass: "SS1 Science", symptoms: "Severe stomach ache and nausea", time: "11:05", status: "Parent Notified", treatment: "Oral rehydration, advised rest; parent informed." },
  { id: "VIS-9018", student: "Chinedu Eze", klass: "SS2 Art", symptoms: "Allergic skin reaction", time: "12:20", status: "Treated", treatment: "Antihistamine administered." },
  { id: "VIS-9017", student: "Zainab Adeyemi", klass: "SS3 Science", symptoms: "Sore throat and cough", time: "13:00", status: "Treated", treatment: "Cough syrup and warm salt water gargle." },
  { id: "VIS-9016", student: "Ifeoma Okafor", klass: "JSS1 B", symptoms: "Dizziness after PE", time: "14:10", status: "Parent Notified", treatment: "Fluids and supervised rest; parent called." },
];

const studentNames = [
  "Adaeze Nwosu",
  "Tunde Bakare",
  "Fatima Bello",
  "Chinedu Eze",
  "Zainab Adeyemi",
  "Ifeoma Okafor",
  "Seyi Balogun",
  "Ngozi Umeh",
  "Kemi Alade",
  "Musa Suleiman",
  "Amara Obi",
  "Damilola Ade",
];

const statusBadge = (s: Status) =>
  s === "Treated"
    ? { text: "Treated", variant: "green" as const }
    : s === "Referred"
      ? { text: "Referred", variant: "red" as const }
      : { text: "Parent Notified", variant: "orange" as const };

const columns = [
  { key: "student", label: "STUDENT" },
  { key: "klass", label: "CLASS" },
  { key: "symptoms", label: "SYMPTOMS" },
  { key: "time", label: "VISIT TIME" },
  { key: "status", label: "STATUS" },
];

export default function ClinicVisitsPage() {
  const [visits, setVisits] = useState<Visit[]>(initialVisits);
  const [search, setSearch] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Visit | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [newStudent, setNewStudent] = useState("");
  const [newSymptoms, setNewSymptoms] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newTreatment, setNewTreatment] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const q = search.trim().toLowerCase();
  const filtered = visits.filter(
    (v) =>
      !q ||
      v.student.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q) ||
      v.klass.toLowerCase().includes(q) ||
      v.symptoms.toLowerCase().includes(q) ||
      v.status.toLowerCase().includes(q)
  );

  const rows: TableRow[] = filtered.map((v) => ({
    student: (
      <div>
        <p className="text-sm font-medium text-text-dark">{v.student}</p>
        <p className="text-xs text-text-muted">{v.id}</p>
      </div>
    ),
    klass: v.klass,
    symptoms: v.symptoms,
    time: v.time,
    status: statusBadge(v.status),
  }));

  const openDetail = (row: TableRow, i: number) => {
    setSelected(filtered[i]);
    setDetailOpen(true);
  };

  const notifyParent = () => {
    if (!selected) return;
    showToast(`Parent of ${selected.student} notified via SMS`);
  };

  const markTreated = () => {
    if (!selected) return;
    setVisits((prev) => prev.map((v) => (v.id === selected.id ? { ...v, status: "Treated" } : v)));
    setSelected({ ...selected, status: "Treated" });
    showToast(`${selected.student} marked as treated`);
  };

  const addVisit = () => {
    if (!newStudent || !newSymptoms) return;
    const maxNum = Math.max(...visits.map((v) => parseInt(v.id.slice(4), 10)));
    setVisits((prev) => [
      ...prev,
      {
        id: `VIS-${maxNum + 1}`,
        student: newStudent,
        klass: "SS1 Science",
        symptoms: newSymptoms.trim(),
        time: newTime || "Just now",
        status: (newStatus || "Parent Notified") as Status,
        treatment: newTreatment.trim() || "Awaiting treatment notes.",
      },
    ]);
    setNewStudent("");
    setNewSymptoms("");
    setNewTime("");
    setNewTreatment("");
    setNewStatus("");
    setAddOpen(false);
    showToast("Visit logged");
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Sick Bay Visits"
        subtitle="Log and manage student clinic visits"
        actions={<Button onClick={() => setAddOpen(true)}>+ Log Visit</Button>}
      />

      <Card className="p-4 mb-6">
        <SearchInput
          placeholder="Search by student, ID, class, symptom or status..."
          value={search}
          onChange={setSearch}
          className="max-w-md"
        />
      </Card>

      <DataTable columns={columns} data={rows} onRowClick={openDetail} />

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.student ?? ""}
        subtitle={selected ? `${selected.id} · ${selected.klass} · ${selected.time}` : undefined}
        footer={
          selected && (
            <>
              <Button variant="secondary" onClick={notifyParent}>
                <Phone className="w-4 h-4" /> Notify Parent
              </Button>
              {selected.status !== "Treated" && (
                <Button onClick={markTreated}>
                  <CheckCircle className="w-4 h-4" /> Mark Treated
                </Button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Badge variant={statusBadge(selected.status).variant}>{selected.status}</Badge>
            </div>
            <div className="rounded-lg border border-border-light p-4">
              <p className="text-xs text-text-muted mb-1.5">Symptoms</p>
              <p className="text-sm text-text-dark leading-relaxed">{selected.symptoms}</p>
            </div>
            <div className="rounded-lg border border-border-light p-4">
              <p className="text-xs text-text-muted mb-1.5">Treatment</p>
              <p className="text-sm text-text-dark leading-relaxed">{selected.treatment}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Log Visit"
        subtitle="Record a new sick bay visit"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addVisit}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Student"
            required
            placeholder="Select student"
            options={studentNames}
            value={newStudent}
            onChange={(e) => setNewStudent(e.target.value)}
          />
          <Field label="Symptoms" required>
            <TextArea
              rows={3}
              placeholder="Describe the symptoms"
              value={newSymptoms}
              onChange={(e) => setNewSymptoms(e.target.value)}
            />
          </Field>
          <Field label="Visit Time">
            <TextInput type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
          </Field>
          <Field label="Treatment Notes">
            <TextArea
              rows={3}
              placeholder="Notes on treatment given"
              value={newTreatment}
              onChange={(e) => setNewTreatment(e.target.value)}
            />
          </Field>
          <SelectField
            label="Status"
            required
            placeholder="Select status"
            options={["Treated", "Referred", "Parent Notified"]}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          />
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
