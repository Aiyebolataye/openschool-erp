"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { useParams } from "next/navigation";
import { useSubjectNotes, useDiscCases } from "@/lib/app-store";

const SUBJECTS: Record<string, { name: string; dept: string; classes: string[]; teacher: string; overview: string }> = {
  biology: {
    name: "Biology",
    dept: "Sciences",
    classes: ["SS1 Science", "SS2 Science", "SS3 Science"],
    teacher: "Dr. Okon",
    overview:
      "This course covers the structure and function of living organisms, cell biology, genetics, ecology and practical laboratory work across the three science classes. Emphasis is placed on the West African Senior School Certificate (WASSCE) syllabus and inquiry-based practicals.",
  },
  "integrated-science": {
    name: "Integrated Science",
    dept: "Sciences",
    classes: ["SS1 Science", "SS2 Science"],
    teacher: "Dr. Okon",
    overview:
      "An interdisciplinary introduction to the physical and life sciences combining physics, chemistry and biology concepts for JSS/SS students, with a focus on hands-on experimentation and everyday applications.",
  },
};

const SCHEME: Record<string, { module: string; topic: string; week: string }[]> = {
  biology: [
    { module: "M1", topic: "Cell Structure & Organelles", week: "Week 1-2" },
    { module: "M2", topic: "Cell Division: Mitosis & Meiosis", week: "Week 3-4" },
    { module: "M3", topic: "Genetics: Heredity & DNA", week: "Week 5-6" },
    { module: "M4", topic: "Evolution & Classification", week: "Week 7-8" },
    { module: "M5", topic: "Ecology & Ecosystems", week: "Week 9-10" },
    { module: "M6", topic: "Human Anatomy & Systems", week: "Week 11-12" },
  ],
};

const students = [
  { name: "Chidi Eze", id: "STU-21401", cls: "SS1 Science", status: { text: "Active", variant: "green" as const } },
  { name: "Amara Okafor", id: "STU-21402", cls: "SS2 Science", status: { text: "Active", variant: "green" as const } },
  { name: "Ngozi Adeyemi", id: "STU-21403", cls: "SS1 Science", status: { text: "Active", variant: "green" as const } },
  { name: "Tom Wallace", id: "STU-21404", cls: "SS3 Science", status: { text: "Active", variant: "green" as const } },
  { name: "Grace Lim", id: "STU-21405", cls: "SS2 Science", status: { text: "Active", variant: "green" as const } },
];

const initialAssignments = [
  { title: "Biology Essay #3", cls: "SS1 Science", submissions: "40 / 42", due: "Aug 4", status: { text: "Grading", variant: "orange" as const } },
  { title: "Genetics Worksheet", cls: "SS2 Science", submissions: "0 / 40", due: "Aug 6", status: { text: "Active", variant: "green" as const } },
];

const initialAssessments = [
  { title: "Mid-term Quiz — Cell Bio", cls: "SS1 Science", type: { text: "Quiz", variant: "blue" as const }, status: { text: "Published", variant: "green" as const }, date: "Aug 3" },
  { title: "Practical — Microscopy", cls: "SS2 Science", type: { text: "Practical", variant: "purple" as const }, status: { text: "Scheduled", variant: "orange" as const }, date: "Aug 8" },
  { title: "CA Test 2 — Genetics", cls: "SS3 Science", type: { text: "CA", variant: "muted" as const }, status: { text: "Draft", variant: "muted" as const }, date: "Aug 12" },
];

export default function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const subject = SUBJECTS[id] ?? SUBJECTS["biology"];
  const scheme = SCHEME[id] ?? SCHEME["biology"];

  const [notes, setNotes] = useSubjectNotes(subject.name);
  const [cases] = useDiscCases();

  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentCls, setAssignmentCls] = useState("");
  const [assignmentDue, setAssignmentDue] = useState("");
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [assessmentCls, setAssessmentCls] = useState("");
  const [assessmentType, setAssessmentType] = useState("");
  const [assessmentDate, setAssessmentDate] = useState("");
  const [savedAssignments, setSavedAssignments] = useState<{ title: string; cls: string; submissions: string; due: string; status: { text: string; variant: "green" | "orange" | "muted" | "red" | "blue" | "purple" } }[]>(initialAssignments);
  const [savedAssessments, setSavedAssessments] = useState<{ title: string; cls: string; type: { text: string; variant: "green" | "orange" | "muted" | "red" | "blue" | "purple" }; status: { text: string; variant: "green" | "orange" | "muted" | "red" | "blue" | "purple" }; date: string }[]>(initialAssessments);

  const noteByModule = new Map(notes.map((n) => [n.module, n]));

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title={subject.name}
        subtitle={`${subject.dept} Department · Taught by ${subject.teacher} · Term 3`}
        actions={
          <Link href={`/teacher/subjects/${id}/notes/new`} className="inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors bg-primary text-white hover:bg-primary-hover h-10 px-4 text-sm">
            + Add Note
          </Link>
        }
      />

      <Tabs
        tabs={[
          {
            id: "overview",
            label: "Overview",
            content: (
              <div className="space-y-4">
                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-text-dark mb-2">Subject Overview</h3>
                  <p className="text-sm text-text-dark leading-relaxed">{subject.overview}</p>
                </Card>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4">
                    <p className="text-[11px] text-text-muted mb-1">Classes</p>
                    <p className="text-sm font-semibold text-text-dark">{subject.classes.join(", ")}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-[11px] text-text-muted mb-1">Students Enrolled</p>
                    <p className="text-sm font-semibold text-text-dark">{students.length}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-[11px] text-text-muted mb-1">Scheme Modules</p>
                    <p className="text-sm font-semibold text-text-dark">{scheme.length}</p>
                  </Card>
                </div>
              </div>
            ),
          },
          {
            id: "students",
            label: "Students",
            content: (
              <Card className="divide-y divide-border-light">
                {students.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-text-dark">{s.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">{s.id} · {s.cls}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={s.status.variant as "green"}>{s.status.text}</Badge>
                      <Button variant="ghost" size="sm">
                        <Link href={`/teacher/students/${s.id}`}>Profile</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </Card>
            ),
          },
          {
            id: "scheme",
            label: "Scheme of Work",
            content: (
              <div className="space-y-4">
                <p className="text-xs text-text-muted">Scheme of work — the full list of topics for Term 3. Add a note to cover a module; approved notes become part of the scheme.</p>
                <Card className="divide-y divide-border-light">
                  {scheme.map((m) => {
                    const note = noteByModule.get(m.module);
                    return (
                      <div key={m.module} className="flex items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                            <span className="text-primary text-xs font-bold">{m.module}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-dark">{m.topic}</p>
                            <p className="text-xs text-text-muted mt-0.5">{m.week}</p>
                            {note && (
                              <p className="text-xs text-primary mt-1">Note: {note.title}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {note ? (
                            <Badge variant="green">Covered</Badge>
                          ) : (
                            <Badge variant="muted">Not covered</Badge>
                          )}
                          <Link href={`/teacher/subjects/${id}/notes/new?module=${m.module}`}>
                            <Button variant="secondary" size="sm">{note ? "Edit Note" : "Add Note"}</Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </Card>
              </div>
            ),
          },
          {
            id: "assignments",
            label: "Assignments",
            content: (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <Button onClick={() => setAssignmentOpen(true)}>+ New Assignment</Button>
                </div>
                <Card className="divide-y divide-border-light">
                  {savedAssignments.map((a) => (
                    <div key={a.title} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-text-dark">{a.title}</p>
                        <p className="text-xs text-text-muted mt-0.5">{a.cls} · {a.submissions} · due {a.due}</p>
                      </div>
                      <Badge variant={a.status.variant as "orange"}>{a.status.text}</Badge>
                    </div>
                  ))}
                </Card>
              </div>
            ),
          },
          {
            id: "assessments",
            label: "Assessments",
            content: (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <Button onClick={() => setAssessmentOpen(true)}>+ New Assessment</Button>
                </div>
                <Card className="divide-y divide-border-light">
                  {savedAssessments.map((a) => (
                    <div key={a.title} className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Badge variant={a.type.variant as "blue"}>{a.type.text}</Badge>
                        <div>
                          <p className="text-sm font-medium text-text-dark">{a.title}</p>
                          <p className="text-xs text-text-muted mt-0.5">{a.cls} · {a.date}</p>
                        </div>
                      </div>
                      <Badge variant={a.status.variant as "green"}>{a.status.text}</Badge>
                    </div>
                  ))}
                </Card>
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={assignmentOpen}
        onClose={() => setAssignmentOpen(false)}
        title="New Assignment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignmentOpen(false)}>Cancel</Button>
            <Button onClick={() => { setSavedAssignments((p) => [...p, { title: assignmentTitle || "Untitled Assignment", cls: assignmentCls || subject.classes[0], submissions: "0 / —", due: assignmentDue || "TBD", status: { text: "Active", variant: "green" as const } }]); setAssignmentOpen(false); }}>Create Assignment</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title" required>
            <TextInput placeholder="e.g. Genetics Worksheet" value={assignmentTitle} onChange={(e) => setAssignmentTitle(e.target.value)} />
          </Field>
          <SelectField label="Class" required placeholder="Select class" options={subject.classes} value={assignmentCls} onChange={(e) => setAssignmentCls(e.target.value)} />
          <Field label="Due Date" required>
            <TextInput type="date" value={assignmentDue} onChange={(e) => setAssignmentDue(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={assessmentOpen}
        onClose={() => setAssessmentOpen(false)}
        title="New Assessment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssessmentOpen(false)}>Cancel</Button>
            <Button onClick={() => { setSavedAssessments((p) => [...p, { title: assessmentTitle || "Untitled Assessment", cls: assessmentCls || subject.classes[0], type: { text: assessmentType || "Quiz", variant: "blue" as const }, status: { text: "Draft", variant: "muted" as const }, date: assessmentDate || "TBD" }]); setAssessmentOpen(false); }}>Create Assessment</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title" required>
            <TextInput placeholder="e.g. Mid-term Quiz" value={assessmentTitle} onChange={(e) => setAssessmentTitle(e.target.value)} />
          </Field>
          <SelectField label="Class" required placeholder="Select class" options={subject.classes} value={assessmentCls} onChange={(e) => setAssessmentCls(e.target.value)} />
          <SelectField label="Type" required placeholder="Select type" options={["Quiz", "CA", "Practical", "Exam"]} value={assessmentType} onChange={(e) => setAssessmentType(e.target.value)} />
          <Field label="Date" required>
            <TextInput type="date" value={assessmentDate} onChange={(e) => setAssessmentDate(e.target.value)} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
