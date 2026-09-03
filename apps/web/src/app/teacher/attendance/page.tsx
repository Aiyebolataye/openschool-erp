"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Download } from "lucide-react";

const kpis = [
  { label: "Classrooms", value: "2", detail: "", detailColor: "muted" as const },
  { label: "Marked Today", value: "1", detail: "", detailColor: "green" as const },
  { label: "Pending", value: "1", detail: "", detailColor: "orange" as const },
  { label: "Today's Rate", value: "92%", detail: "", detailColor: "green" as const },
];

const data = [
  { cls: { text: "SS1 Science", variant: "muted" as const }, students: "42", present: "39", absent: "2", late: "1", status: { text: "Marked", variant: "green" as const }, actions: "Edit" },
  { cls: { text: "SS2 Science", variant: "muted" as const }, students: "40", present: "—", absent: "—", late: "—", status: { text: "Pending", variant: "orange" as const }, actions: "Mark" },
];

const columns = [
  { key: "cls", label: "CLASSROOM", width: "140px" },
  { key: "students", label: "STUDENTS", width: "90px" },
  { key: "present", label: "PRESENT", width: "90px" },
  { key: "absent", label: "ABSENT", width: "90px" },
  { key: "late", label: "LATE", width: "70px" },
  { key: "status", label: "STATUS", width: "90px" },
  { key: "actions", label: "ACTIONS", width: "80px", align: "right" as const },
];

export default function AttendancePage() {
  const [open, setOpen] = useState(false);
  const [cls, setCls] = useState("");
  const [date, setDate] = useState("");
  const [present, setPresent] = useState("");
  const [absent, setAbsent] = useState("");
  const [late, setLate] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Attendance"
        subtitle="Mark daily attendance for your classroom as class teacher"
        actions={<Button variant="secondary"><Download className="w-4 h-4" /> Export</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="blue">Today, Jul 28 2026</Badge>
          <span className="text-sm text-text-muted">Class teachers mark attendance for their classroom daily</span>
        </div>
        <Button onClick={() => setOpen(true)}>Mark Attendance</Button>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Mark Attendance" footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Save</Button></>}>
        <div className="space-y-4">
          <SelectField label="Class" required options={["SS1 Science", "SS2 Science"]} value={cls} onChange={(e) => setCls(e.target.value)} placeholder="Select class" />
          <Field label="Date" required><TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="Today" /></Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Present" required><TextInput type="number" min={0} placeholder="0" value={present} onChange={(e) => setPresent(e.target.value)} /></Field>
            <Field label="Absent" required><TextInput type="number" min={0} placeholder="0" value={absent} onChange={(e) => setAbsent(e.target.value)} /></Field>
            <Field label="Late" required><TextInput type="number" min={0} placeholder="0" value={late} onChange={(e) => setLate(e.target.value)} /></Field>
          </div>
          <Field label="Notes"><TextArea placeholder="Add any notes..." rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
        </div>
      </Modal>

      <DataTable columns={columns} data={data} />
    </div>
  );
}
