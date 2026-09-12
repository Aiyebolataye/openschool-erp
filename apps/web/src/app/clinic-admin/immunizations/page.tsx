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
import { Syringe } from "lucide-react";

type Status = "Up to Date" | "Due Soon" | "Overdue";

interface Immunization {
  id: string;
  student: string;
  klass: string;
  vaccine: string;
  dateGiven: string;
  nextDue: string;
  status: Status;
}

const initialImmunizations: Immunization[] = [
  { id: "IMM-401", student: "Adaeze Nwosu", klass: "JSS2 A", vaccine: "Hepatitis B", dateGiven: "12 Mar 2026", nextDue: "12 Sep 2026", status: "Up to Date" },
  { id: "IMM-402", student: "Tunde Bakare", klass: "JSS3 A", vaccine: "BCG", dateGiven: "04 Feb 2026", nextDue: "—", status: "Up to Date" },
  { id: "IMM-403", student: "Fatima Bello", klass: "SS1 Science", vaccine: "Measles / Rubella", dateGiven: "20 Jan 2026", nextDue: "20 Jan 2027", status: "Up to Date" },
  { id: "IMM-404", student: "Chinedu Eze", klass: "SS2 Art", vaccine: "Tetanus (Td)", dateGiven: "08 Sep 2025", nextDue: "08 Sep 2026", status: "Due Soon" },
  { id: "IMM-405", student: "Zainab Adeyemi", klass: "SS3 Science", vaccine: "Yellow Fever", dateGiven: "15 Jun 2025", nextDue: "15 Jun 2026", status: "Overdue" },
  { id: "IMM-406", student: "Ifeoma Okafor", klass: "JSS1 B", vaccine: "Hepatitis B", dateGiven: "30 Mar 2026", nextDue: "30 Sep 2026", status: "Up to Date" },
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

const vaccineOptions = [
  "Hepatitis B",
  "BCG",
  "Measles / Rubella",
  "Tetanus (Td)",
  "Yellow Fever",
  "Polio (IPV)",
  "HPV",
];

const statusBadge = (s: Status) =>
  s === "Up to Date"
    ? { text: "Up to Date", variant: "green" as const }
    : s === "Due Soon"
      ? { text: "Due Soon", variant: "orange" as const }
      : { text: "Overdue", variant: "red" as const };

const columns = [
  { key: "student", label: "STUDENT" },
  { key: "vaccine", label: "VACCINE" },
  { key: "dateGiven", label: "DATE GIVEN" },
  { key: "nextDue", label: "NEXT DUE" },
  { key: "status", label: "STATUS" },
];

export default function ClinicImmunizationsPage() {
  const [records, setRecords] = useState<Immunization[]>(initialImmunizations);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [newStudent, setNewStudent] = useState("");
  const [newVaccine, setNewVaccine] = useState("");
  const [newDateGiven, setNewDateGiven] = useState("");
  const [newNextDue, setNewNextDue] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const q = search.trim().toLowerCase();
  const filtered = records.filter(
    (r) =>
      !q ||
      r.student.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.klass.toLowerCase().includes(q) ||
      r.vaccine.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
  );

  const rows: TableRow[] = filtered.map((r) => ({
    student: (
      <div>
        <p className="text-sm font-medium text-text-dark">{r.student}</p>
        <p className="text-xs text-text-muted">{r.klass}</p>
      </div>
    ),
    vaccine: r.vaccine,
    dateGiven: r.dateGiven,
    nextDue: r.nextDue,
    status: statusBadge(r.status),
  }));

  const addRecord = () => {
    if (!newStudent || !newVaccine || !newDateGiven) return;
    const maxNum = Math.max(...records.map((r) => parseInt(r.id.slice(4), 10)));
    setRecords((prev) => [
      ...prev,
      {
        id: `IMM-${maxNum + 1}`,
        student: newStudent,
        klass: "SS1 Science",
        vaccine: newVaccine,
        dateGiven: newDateGiven,
        nextDue: newNextDue || "—",
        status: "Up to Date",
      },
    ]);
    setNewStudent("");
    setNewVaccine("");
    setNewDateGiven("");
    setNewNextDue("");
    setAddOpen(false);
    showToast("Immunization recorded");
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Immunization Records"
        subtitle="Track student vaccination records"
        actions={<Button onClick={() => setAddOpen(true)}>+ Record Immunization</Button>}
      />

      <Card className="p-4 mb-6">
        <SearchInput
          placeholder="Search by student, class, vaccine or status..."
          value={search}
          onChange={setSearch}
          className="max-w-md"
        />
      </Card>

      <DataTable columns={columns} data={rows} />

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Record Immunization"
        subtitle="Add a new immunization record"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addRecord}>Save</Button>
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
          <SelectField
            label="Vaccine"
            required
            placeholder="Select vaccine"
            options={vaccineOptions}
            value={newVaccine}
            onChange={(e) => setNewVaccine(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date Given" required>
              <TextInput type="date" value={newDateGiven} onChange={(e) => setNewDateGiven(e.target.value)} />
            </Field>
            <Field label="Next Due">
              <TextInput type="date" value={newNextDue} onChange={(e) => setNewNextDue(e.target.value)} />
            </Field>
          </div>
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