"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { StatCard } from "@/components/ui/stat-card";
import { Chatbox } from "@/components/ui/chatbox";
import { Download } from "lucide-react";

const roster = [
  { name: "Chidi Eze", id: "STU-21401", attendance: "96%", status: { text: "Present", variant: "green" as const } },
  { name: "Amara Okafor", id: "STU-21402", attendance: "88%", status: { text: "Absent", variant: "red" as const } },
  { name: "Ngozi Adeyemi", id: "STU-21403", attendance: "100%", status: { text: "Present", variant: "green" as const } },
  { name: "Tom Wallace", id: "STU-21404", attendance: "72%", status: { text: "Present", variant: "green" as const } },
];

const discipline = [
  { student: "Tom Wallace", case: "Repeated tardiness", status: { text: "Open", variant: "orange" as const }, date: "Jul 28" },
  { student: "Grace Lim", case: "Unauthorized absence", status: { text: "Resolved", variant: "green" as const }, date: "Jul 22" },
];

const academics = [
  { subject: "Biology", avg: "82%", top: "Chidi Eze (96%)", flag: { text: "2 at risk", variant: "orange" as const } },
  { subject: "Mathematics", avg: "78%", top: "Ngozi Adeyemi (95%)", flag: { text: "3 at risk", variant: "red" as const } },
  { subject: "English", avg: "85%", top: "Amara Okafor (91%)", flag: { text: "Healthy", variant: "green" as const } },
];

const parents = [
  { student: "Amara Okafor", parent: "Mrs. Okafor", last: "Welcome note sent", action: "Message" },
  { student: "Tom Wallace", parent: "Mr. Wallace", last: "Attendance alert sent", action: "Message" },
];

function RosterContent() {
  return (
    <Card className="divide-y divide-border-light">
      {roster.map((r) => (
        <Link key={r.id} href={`/teacher/students/${r.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-surface/60 transition-colors">
          <div>
            <p className="text-sm font-medium text-text-dark">{r.name}</p>
            <p className="text-xs text-text-muted mt-0.5">{r.id} · Attendance {r.attendance}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={r.status.variant as "green"}>{r.status.text}</Badge>
            <span className="text-xs text-primary font-medium">View Profile</span>
          </div>
        </Link>
      ))}
    </Card>
  );
}

function AttendanceContent() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-text-muted">Daily attendance for <span className="text-text-dark font-medium">SS1 Science</span> · Tue, Jul 28 2026</p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm"><Download className="w-4 h-4" /> Export</Button>
          <Button size="sm">Save Attendance</Button>
        </div>
      </div>
      <Card className="divide-y divide-border-light">
        {roster.map((r) => (
          <div key={r.id} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-text-dark">{r.name}</p>
              <p className="text-xs text-text-muted mt-0.5">{r.id}</p>
            </div>
            <div className="flex items-center gap-1">
              {["Present", "Absent", "Late", "Excused"].map((s) => (
                <span key={s} className={`px-3 py-1.5 rounded-md text-xs cursor-pointer border ${r.status.text === s ? "bg-primary text-white border-primary" : "border-border-light text-text-muted hover:bg-surface"}`}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function DisciplineContent() {
  return (
    <Card className="divide-y divide-border-light">
      {discipline.map((d) => (
        <div key={d.student} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-text-dark">{d.student}</p>
            <p className="text-xs text-text-muted mt-0.5">{d.case} · {d.date}</p>
          </div>
          <Badge variant={d.status.variant as "orange"}>{d.status.text}</Badge>
        </div>
      ))}
    </Card>
  );
}

function AcademicsContent() {
  return (
    <Card className="divide-y divide-border-light">
      {academics.map((a) => (
        <div key={a.subject} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-text-dark">{a.subject}</p>
            <p className="text-xs text-text-muted mt-0.5">Average {a.avg} · Top: {a.top}</p>
          </div>
          <Badge variant={a.flag.variant as "orange"}>{a.flag.text}</Badge>
        </div>
      ))}
    </Card>
  );
}

function CommunicationContent() {
  return (
    <div className="space-y-4">
      <Chatbox title="Mrs. Okafor" subtitle="Parent of Amara Okafor · SS2 Science" />
      <Card className="divide-y divide-border-light">
        {parents.map((p) => (
          <Link key={p.student} href={`/teacher/students/STU-21402`} className="flex items-center justify-between px-5 py-4 hover:bg-surface/60 transition-colors">
            <div>
              <p className="text-sm font-medium text-text-dark">{p.student} · {p.parent}</p>
              <p className="text-xs text-text-muted mt-0.5">{p.last}</p>
            </div>
            <Button variant="ghost" size="sm">Open Chat</Button>
          </Link>
        ))}
      </Card>
    </div>
  );
}

export default function ClassroomDetailPage() {
  const [open, setOpen] = useState(false);
  const [audience, setAudience] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  return (
    <div className="max-w-[1000px] mx-auto">
      <PageHeader
        title="SS1 Science · My Classroom"
        subtitle="Class teacher overview — monitor, take attendance, and support your students"
        actions={<Button onClick={() => setOpen(true)}>+ Message Parents</Button>}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Message Parents" footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Send</Button></>}>
        <div className="space-y-4">
          <SelectField label="Audience" required options={["All Parents", "A specific parent"]} value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Select audience" />
          <Field label="Subject" required><TextInput placeholder="Enter subject" value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
          <Field label="Body" required><TextArea placeholder="Write your message..." rows={4} value={body} onChange={(e) => setBody(e.target.value)} /></Field>
        </div>
      </Modal>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Students" value="42" detail="" detailColor="muted" />
        <StatCard label="Attendance Today" value="92%" detail="Marked" detailColor="green" />
        <StatCard label="Discipline Cases" value="1" detail="open" detailColor="orange" />
        <StatCard label="Avg Academics" value="82.4%" detail="+2.1%" detailColor="green" />
      </div>

      <Tabs
        tabs={[
          { id: "students", label: "Students", content: <RosterContent /> },
          { id: "attendance", label: "Attendance", content: <AttendanceContent /> },
          { id: "discipline", label: "Discipline", content: <DisciplineContent /> },
          { id: "academics", label: "Academics", content: <AcademicsContent /> },
          { id: "communication", label: "Communication", content: <CommunicationContent /> },
        ]}
      />
    </div>
  );
}
