"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { uid } from "@/lib/app-store";
import { DataTable } from "@/components/ui/data-table";
import { useParams, useRouter } from "next/navigation";
import { useSubjectNotes, useSubjectAssignments, useSubjectAssessments, useSubjectPerformance, useDiscCases } from "@/lib/app-store";

const SUBJECTS: Record<string, { name: string; dept: string; classes: string[]; teacher: string; overview: string }> = {
  biology: {
    name: "Biology",
    dept: "Sciences",
    classes: ["SS1 Science", "SS2 Science", "SS3 Science"],
    teacher: "Dr. Okon",
    overview: "This course covers the structure and function of living organisms, cell biology, genetics, ecology and practical laboratory work across the three science classes.",
  },
  "integrated-science": {
    name: "Integrated Science",
    dept: "Sciences",
    classes: ["SS1 Science", "SS2 Science"],
    teacher: "Dr. Okon",
    overview: "An interdisciplinary introduction to the physical and life sciences combining physics, chemistry and biology concepts.",
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

export default function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const subject = SUBJECTS[id] ?? SUBJECTS["biology"];
  const scheme = SCHEME[id] ?? SCHEME["biology"];

  const [notes, setNotes] = useSubjectNotes(subject.name);
  const [assignments, setAssignments] = useSubjectAssignments(subject.name);
  const [assessments, setAssessments] = useSubjectAssessments(subject.name);
  const [performance, setPerformance] = useSubjectPerformance(subject.name);
  const [cases] = useDiscCases();

  const noteByModule = new Map(notes.map((n) => [n.module, n]));

  const [overview, setOverview] = useState(subject.overview);
  const [classes, setClasses] = useState(subject.classes);
  const [editingOverview, setEditingOverview] = useState(false);
  const [draftOverview, setDraftOverview] = useState(subject.overview);
  const [draftClasses, setDraftClasses] = useState(subject.classes.join(", "));

  const saveOverview = () => {
    setOverview(draftOverview.trim());
    setClasses(draftClasses.split(",").map((c) => c.trim()).filter(Boolean));
    setEditingOverview(false);
  };

  const [perfKind, setPerfKind] = useState("Assignment");
  const [perfTitle, setPerfTitle] = useState("");
  const [perfScores, setPerfScores] = useState<Record<string, string>>({});

  const addPerformance = () => {
    if (!perfTitle) return;
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const records = students
      .filter((s) => perfScores[s.id])
      .map((s) => ({
        id: uid(),
        subject: subject.name,
        studentName: s.name,
        studentId: s.id,
        className: s.cls,
        kind: perfKind as "Assignment" | "Assessment" | "Exam",
        title: perfTitle,
        score: perfScores[s.id] || "",
        date,
      }));
    if (records.length > 0) {
      setPerformance([...performance, ...records]);
      setPerfTitle("");
      setPerfScores({});
    }
  };

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
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-text-dark">Subject Overview</h3>
                    {!editingOverview && (
                      <Button variant="ghost" size="sm" onClick={() => { setDraftOverview(overview); setDraftClasses(classes.join(", ")); setEditingOverview(true); }}>
                        Edit
                      </Button>
                    )}
                  </div>
                  {editingOverview ? (
                    <div className="space-y-3">
                      <TextArea rows={5} value={draftOverview} onChange={(e) => setDraftOverview(e.target.value)} placeholder="Describe the course overview..." />
                      <Field label="Classes">
                        <TextInput value={draftClasses} onChange={(e) => setDraftClasses(e.target.value)} placeholder="e.g. SS1 Science, SS2 Science, SS3 Science" />
                      </Field>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={saveOverview}>Save</Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditingOverview(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-text-dark leading-relaxed">{overview}</p>
                  )}
                </Card>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4">
                    <p className="text-[11px] text-text-muted mb-1">Classes</p>
                    <p className="text-sm font-semibold text-text-dark">{classes.join(", ")}</p>
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
                  <div
                    key={s.id}
                    onClick={() => router.push(`/teacher/students/${s.id}`)}
                    className="flex items-center justify-between px-5 py-4 cursor-pointer transition-colors hover:bg-surface/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-dark">{s.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">{s.id} · {s.cls}</p>
                    </div>
                    <Badge variant={s.status.variant as "green"}>{s.status.text}</Badge>
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
                <p className="text-xs text-text-muted">Scheme of work — the full list of topics for Term 3. Notes become part of the scheme once approved by the head teacher.</p>
                <Card className="divide-y divide-border-light">
                  {scheme.map((m) => {
                    const note = noteByModule.get(m.module);
                    const approved = note?.approved;
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
                              <p className="text-xs text-primary mt-1">
                                Note: {note.title}
                                {note.subtopics?.length ? ` · ${note.subtopics.length} subtopics` : ""}
                                {approved && <span className="ml-2 text-green font-medium">(Approved)</span>}
                                {!approved && <span className="ml-2 text-orange font-medium">(Pending approval)</span>}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {note ? (
                            <Badge variant={approved ? "green" : "orange"}>{approved ? "Covered" : "Draft"}</Badge>
                          ) : (
                            <Badge variant="muted">Not covered</Badge>
                          )}
                          {approved ? (
                            <span className="text-xs text-text-muted italic px-3 py-1.5">Locked</span>
                          ) : (
                            <Link href={`/teacher/subjects/${id}/notes/new?module=${m.module}`}>
                              <Button variant="secondary" size="sm">{note ? "Edit Note" : "Add Note"}</Button>
                            </Link>
                          )}
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
                  <Link href="/teacher/assignments/new">
                    <Button>+ New Assignment</Button>
                  </Link>
                </div>
                <Card className="divide-y divide-border-light">
                  {assignments.length === 0 && (
                    <div className="px-5 py-8 text-center text-sm text-text-muted">No assignments yet.</div>
                  )}
                  {assignments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-text-dark">{a.title}</p>
                        <p className="text-xs text-text-muted mt-0.5">{a.cls} · due {a.due || "TBD"}</p>
                      </div>
                      <Badge variant={a.status === "approved" ? "green" : "orange"}>{a.status === "approved" ? "Approved" : "Pending"}</Badge>
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
                  <Link href="/teacher/assessments/new">
                    <Button>+ New Assessment</Button>
                  </Link>
                </div>
                <Card className="divide-y divide-border-light">
                  {assessments.length === 0 && (
                    <div className="px-5 py-8 text-center text-sm text-text-muted">No assessments yet.</div>
                  )}
                  {assessments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="blue">{a.type}</Badge>
                        <div>
                          <p className="text-sm font-medium text-text-dark">{a.title}</p>
                          <p className="text-xs text-text-muted mt-0.5">{a.cls} · {a.date}</p>
                        </div>
                      </div>
                      <Badge variant={a.status === "approved" ? "green" : "orange"}>{a.status === "approved" ? "Approved" : "Pending"}</Badge>
                    </div>
                  ))}
                </Card>
              </div>
            ),
          },
          {
            id: "performance",
            label: "Performance",
            content: (
              <div className="space-y-4">
                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-text-dark mb-3">Record Performance</h3>
                  <p className="text-xs text-text-muted mb-4">Enter scores for all students in this subject at once. Scores not entered will be left blank.</p>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <SelectField label="Type" required options={["Assignment", "Assessment", "Exam"]} value={perfKind} onChange={(e) => setPerfKind(e.target.value)} />
                    <div className="col-span-2">
                      <Field label="Title" required><TextInput placeholder="e.g. Assignment 1, Mid-term Exam" value={perfTitle} onChange={(e) => setPerfTitle(e.target.value)} /></Field>
                    </div>
                  </div>
                  <div className="space-y-0 border border-border-light rounded-lg overflow-hidden">
                    <div className="grid grid-cols-[1fr_80px] gap-0 bg-surface px-4 py-2 border-b border-border-light">
                      <span className="text-xs font-semibold text-text-muted uppercase">Student</span>
                      <span className="text-xs font-semibold text-text-muted uppercase">Score</span>
                    </div>
                    {students.map((s) => (
                      <div key={s.id} className="grid grid-cols-[1fr_80px] gap-0 px-4 py-2 border-b border-border-light last:border-0">
                        <div>
                          <p className="text-sm text-text-dark">{s.name}</p>
                          <p className="text-[11px] text-text-muted">{s.id} · {s.cls}</p>
                        </div>
                        <TextInput
                          placeholder="—"
                          value={perfScores[s.id] || ""}
                          onChange={(e) => setPerfScores((prev) => ({ ...prev, [s.id]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-3">
                    <Button size="sm" onClick={addPerformance}>Save Scores</Button>
                  </div>
                </Card>

                {performance.length > 0 && (
                  <DataTable
                    columns={[
                      { key: "studentName", label: "STUDENT", width: "140px" },
                      { key: "className", label: "CLASS", width: "110px" },
                      { key: "kind", label: "TYPE", width: "100px" },
                      { key: "title", label: "TITLE", width: "150px" },
                      { key: "score", label: "SCORE", width: "80px" },
                      { key: "date", label: "DATE", width: "100px" },
                    ]}
                    data={performance.map((p) => ({
                      studentName: p.studentName,
                      className: p.className,
                      kind: { text: p.kind, variant: (p.kind === "Exam" ? "red" : p.kind === "Assessment" ? "purple" : "blue") as "red" | "purple" | "blue" },
                      title: p.title,
                      score: p.score,
                      date: p.date,
                    }))}
                  />
                )}
                {performance.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border-light p-8 text-center">
                    <p className="text-sm text-text-muted">No performance records yet for this subject.</p>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
