"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const kpis = [
  { label: "Student Alerts", value: "3", detail: "", detailColor: "muted" as const },
  { label: "Recommended Interventions", value: "2", detail: "", detailColor: "orange" as const },
  { label: "Parent Meetings", value: "4", detail: "scheduled", detailColor: "muted" as const },
];

const alerts = [
  { title: "Repeated absenteeism", student: "Amara Okafor · SS1 Science", level: { text: "HIGH", variant: "red" as const }, action: "Refer" },
  { title: "Academic decline in Math", student: "Tom Wallace · SS1 Science", level: { text: "MEDIUM", variant: "orange" as const }, action: "Review" },
  { title: "Wellbeing check recommended", student: "Grace Lim · SS1 Science", level: { text: "LOW", variant: "muted" as const }, action: "Review" },
];

export default function StudentSuccessPage() {
  const [open, setOpen] = useState(false);
  const [student, setStudent] = useState("");
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");

  return (
    <div className="max-w-[1000px] mx-auto">
      <PageHeader
        title="Student Success"
        subtitle="Identify students requiring support and recommend interventions"
        actions={<Button onClick={() => setOpen(true)}>+ Create Intervention</Button>}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Create Intervention" footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Save</Button></>}>
        <div className="space-y-4">
          <SelectField label="Student" required options={["Tom Wallace", "Grace Lim", "Amara Okafor"]} value={student} onChange={(e) => setStudent(e.target.value)} placeholder="Select student" />
          <SelectField label="Type" required options={["Academic", "Wellbeing", "Behavior", "Attendance"]} value={type} onChange={(e) => setType(e.target.value)} placeholder="Select type" />
          <Field label="Title" required><TextInput placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
          <Field label="Details"><TextArea placeholder="Add details about this intervention" rows={4} value={details} onChange={(e) => setDetails(e.target.value)} /></Field>
          <SelectField label="Action Owner" required options={["Class Teacher", "HOD Sciences", "Guidance Counselor", "Parent"]} value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Select owner" />
          <Field label="Due Date" required><TextInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></Field>
        </div>
      </Modal>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="divide-y divide-border-light">
        {alerts.map((a) => (
          <div key={a.student} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-text-dark">{a.title}</p>
              <p className="text-xs text-text-muted mt-0.5">{a.student}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={a.level.variant as "red"}>{a.level.text}</Badge>
              <Button variant="secondary" size="sm">{a.action || "View"}</Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
