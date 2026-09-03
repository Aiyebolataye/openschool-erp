"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { StatCard } from "@/components/ui/stat-card";
import { ListCard } from "@/components/ui/list-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const kpis = [
  { label: "Classes Today", value: "4", detail: "", detailColor: "muted" as const },
  { label: "Students Assigned", value: "248", detail: "", detailColor: "muted" as const },
  { label: "Attendance Pending", value: "4", detail: "", detailColor: "orange" as const },
  { label: "Lesson Notes Pending", value: "2", detail: "", detailColor: "orange" as const },
  { label: "Assignments to Grade", value: "12", detail: "", detailColor: "red" as const },
  { label: "Upcoming Assessments", value: "3", detail: "", detailColor: "muted" as const },
];

const timetable = [
  { period: "1st (8–9)", subject: "SS1 Biology", cls: "SS1 Sci" },
  { period: "2nd (9–10)", subject: "SS2 Biology", cls: "SS2 Sci" },
  { period: "3rd (10–11)", subject: "Free", cls: "—" },
  { period: "4th (11–12)", subject: "SS3 Biology", cls: "SS3 Sci" },
];

const deadlines = [
  { title: "Biology Essay #3", cls: "SS1 Science", due: "Due tomorrow" },
  { title: "Lab Report — Osmosis", cls: "SS2 Science", due: "Due Fri" },
  { title: "Mid-term Quiz", cls: "SS3 Science", due: "Due Aug 10" },
];

const studentAlerts = [
  { avatar: "TO", avatarColor: "red" as const, title: "Tom Wallace", subtitle: "Repeated absence in SS3 Biology", right: <Badge variant="red">High</Badge> },
  { avatar: "AM", avatarColor: "orange" as const, title: "Amara Okafor", subtitle: "Declining performance trend", right: <Badge variant="orange">Med</Badge> },
];

const curriculum = [
  { topic: "Cell Biology", progress: 80 },
  { topic: "Genetics", progress: 45 },
  { topic: "Ecology", progress: 65 },
];

export default function TeacherDashboardPage() {
  const [lessonNoteOpen, setLessonNoteOpen] = useState(false);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [lnSubject, setLnSubject] = useState("");
  const [lnClass, setLnClass] = useState("");
  const [lnTopic, setLnTopic] = useState("");
  const [lnNotes, setLnNotes] = useState("");
  const [lnDate, setLnDate] = useState("");
  const [asSubject, setAsSubject] = useState("");
  const [asClass, setAsClass] = useState("");
  const [asTitle, setAsTitle] = useState("");
  const [asDueDate, setAsDueDate] = useState("");
  const [asInstructions, setAsInstructions] = useState("");

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Good morning, Mrs. Ajayi"
        subtitle="Here's your teaching overview for today · Term 3 2026"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setLessonNoteOpen(true)}>+ Lesson Note</Button>
            <Button onClick={() => setAssignmentOpen(true)}>+ Assignment</Button>
          </div>
        }
      />

      <Modal open={lessonNoteOpen} onClose={() => setLessonNoteOpen(false)} title="Add Lesson Note" footer={<><Button variant="secondary" onClick={() => setLessonNoteOpen(false)}>Cancel</Button><Button onClick={() => setLessonNoteOpen(false)}>Save</Button></>}>
        <div className="space-y-4">
          <SelectField label="Subject" required options={["Biology", "Chemistry", "Physics", "Mathematics"]} value={lnSubject} onChange={(e) => setLnSubject(e.target.value)} placeholder="Select subject" />
          <SelectField label="Class" required options={["SS1 Science", "SS2 Science"]} value={lnClass} onChange={(e) => setLnClass(e.target.value)} placeholder="Select class" />
          <Field label="Topic" required><TextInput placeholder="Enter topic" value={lnTopic} onChange={(e) => setLnTopic(e.target.value)} /></Field>
          <Field label="Notes" required><TextArea placeholder="Write lesson notes..." rows={5} value={lnNotes} onChange={(e) => setLnNotes(e.target.value)} /></Field>
          <Field label="Date" required><TextInput type="date" value={lnDate} onChange={(e) => setLnDate(e.target.value)} /></Field>
        </div>
      </Modal>

      <Modal open={assignmentOpen} onClose={() => setAssignmentOpen(false)} title="Create Assignment" footer={<><Button variant="secondary" onClick={() => setAssignmentOpen(false)}>Cancel</Button><Button onClick={() => setAssignmentOpen(false)}>Create</Button></>}>
        <div className="space-y-4">
          <SelectField label="Subject" required options={["Biology", "Chemistry", "Physics", "Mathematics"]} value={asSubject} onChange={(e) => setAsSubject(e.target.value)} placeholder="Select subject" />
          <SelectField label="Class" required options={["SS1 Science", "SS2 Science"]} value={asClass} onChange={(e) => setAsClass(e.target.value)} placeholder="Select class" />
          <Field label="Title" required><TextInput placeholder="Enter assignment title" value={asTitle} onChange={(e) => setAsTitle(e.target.value)} /></Field>
          <Field label="Due Date" required><TextInput type="date" value={asDueDate} onChange={(e) => setAsDueDate(e.target.value)} /></Field>
          <Field label="Instructions" required><TextArea placeholder="Write instructions..." rows={5} value={asInstructions} onChange={(e) => setAsInstructions(e.target.value)} /></Field>
        </div>
      </Modal>

      <div className="grid grid-cols-6 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-text-dark mb-3">Today's Timetable</h3>
          <div className="flex flex-col gap-2">
            {timetable.map((t) => (
              <div key={t.period} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                <span className="text-xs text-text-muted">{t.period}</span>
                <span className="text-sm font-medium text-text-dark">{t.subject}</span>
                <span className="text-xs text-text-muted">{t.cls}</span>
              </div>
            ))}
          </div>
        </Card>

        <ListCard
          title="Assignment Deadlines"
          items={deadlines.map((d) => ({ title: d.title, subtitle: d.cls + " · " + d.due }))}
        />

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-text-dark mb-3">Curriculum Progress</h3>
          <div className="flex flex-col gap-3">
            {curriculum.map((c) => (
              <div key={c.topic}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-text-dark">{c.topic}</span>
                  <span className="text-xs text-text-muted">{c.progress}%</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${c.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ListCard title="Student Alerts" items={studentAlerts} />
        <ListCard
          title="Upcoming Lessons"
          items={[
            { title: "SS1 Biology — Lesson 12", subtitle: "Today · 8:00 AM" },
            { title: "SS2 Biology — Genetics 2", subtitle: "Tomorrow · 9:00 AM" },
            { title: "SS3 Biology — Mock prep", subtitle: "Wed · 11:00 AM" },
          ]}
        />
      </div>
    </div>
  );
}
