"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { useState } from "react";

interface StudentGrade {
  name: string;
  id: string;
  class: string;
  subject: string;
  caScore: number;
  examScore: number;
  total: number;
  grade: string;
  approved: boolean | null;
}

interface ResultRow {
  title: string;
  cls: string;
  teacher: string;
  status: { text: string; variant: "orange" | "red" | "green" | "muted" | "blue" };
  students: StudentGrade[];
}

const mockStudentGrades: Record<string, StudentGrade[]> = {
  "SS2 Term 3 — Science": [
    { name: "Adaobi Nwosu", id: "STD-2201", class: "SS2 Science", subject: "Physics", caScore: 18, examScore: 52, total: 70, grade: "B", approved: null },
    { name: "Chinedu Okafor", id: "STD-2202", class: "SS2 Science", subject: "Physics", caScore: 12, examScore: 38, total: 50, grade: "D", approved: null },
    { name: "Fatima Bello", id: "STD-2203", class: "SS2 Science", subject: "Physics", caScore: 20, examScore: 65, total: 85, grade: "A", approved: null },
    { name: "Emeka Obi", id: "STD-2204", class: "SS2 Science", subject: "Physics", caScore: 15, examScore: 44, total: 59, grade: "C", approved: null },
    { name: "Amina Yusuf", id: "STD-2205", class: "SS2 Science", subject: "Physics", caScore: 8, examScore: 28, total: 36, grade: "F", approved: null },
    { name: "Tunde Bakare", id: "STD-2206", class: "SS2 Science", subject: "Physics", caScore: 17, examScore: 55, total: 72, grade: "B", approved: null },
  ],
  "JSS3 Mock Results": [
    { name: "Ifeoma Eze", id: "STD-3301", class: "JSS3", subject: "Mathematics", caScore: 16, examScore: 48, total: 64, grade: "C", approved: null },
    { name: "Yusuf Abdullahi", id: "STD-3302", class: "JSS3", subject: "Mathematics", caScore: 19, examScore: 62, total: 81, grade: "A", approved: null },
    { name: "Blessing Okoro", id: "STD-3303", class: "JSS3", subject: "Mathematics", caScore: 10, examScore: 30, total: 40, grade: "E", approved: null },
    { name: "Kola Adebayo", id: "STD-3304", class: "JSS3", subject: "Mathematics", caScore: 14, examScore: 42, total: 56, grade: "D", approved: null },
  ],
  "SS1 Result Correction": [
    { name: "Chiamaka Igwe", id: "STD-1101", class: "SS1 Art", subject: "Literature", caScore: 22, examScore: 58, total: 80, grade: "A", approved: null },
    { name: "Oluwaseun Adesanya", id: "STD-1102", class: "SS1 Art", subject: "Literature", caScore: 11, examScore: 34, total: 45, grade: "E", approved: null },
    { name: "Ngozi Obi", id: "STD-1103", class: "SS1 Art", subject: "Literature", caScore: 15, examScore: 50, total: 65, grade: "C", approved: null },
  ],
};

const moderation: ResultRow[] = [
  { title: "SS2 Term 3 — Science", cls: "SS2 Science", teacher: "Mrs. Ajayi", status: { text: "Moderation", variant: "orange" }, students: mockStudentGrades["SS2 Term 3 — Science"] },
  { title: "JSS3 Mock Results", cls: "JSS3", teacher: "Mr. Obi", status: { text: "Moderation", variant: "orange" }, students: mockStudentGrades["JSS3 Mock Results"] },
  { title: "SS1 Result Correction", cls: "SS1 Art", teacher: "Ms. Tran", status: { text: "Correction", variant: "red" }, students: mockStudentGrades["SS1 Result Correction"] },
];

const published: ResultRow[] = [
  { title: "SS3 Term 2 Final", cls: "SS3", teacher: "Mrs. Ajayi", status: { text: "Published", variant: "green" }, students: [] },
  { title: "JSS2 Term 2 Final", cls: "JSS2", teacher: "Mr. Obi", status: { text: "Published", variant: "green" }, students: [] },
];

const recovery = [
  { title: "Mathematics Failure Flags", detail: "12 students · SS3", status: { text: "Flagged", variant: "orange" as const } },
  { title: "Physics Failure Flags", detail: "8 students · SS2", status: { text: "Flagged", variant: "orange" as const } },
  { title: "Summer School Enrollment", detail: "18 enrolled · 6 waiting", status: { text: "Active", variant: "green" as const } },
];

function gradeColor(g: string) {
  if (g === "A") return "green";
  if (g === "B") return "blue";
  if (g === "C") return "orange";
  if (g === "D" || g === "E") return "red";
  return "red";
}

function DetailView({ row, onBack }: { row: ResultRow; onBack: () => void }) {
  const [students, setStudents] = useState<StudentGrade[]>(row.students);
  const [comments, setComments] = useState<Record<string, string>>({});

  function approveAll() {
    setStudents((s) => s.map((st) => ({ ...st, approved: true })));
  }
  function rejectAll() {
    setStudents((s) => s.map((st) => ({ ...st, approved: false })));
  }
  function approveOne(idx: number) {
    setStudents((s) => s.map((st, i) => (i === idx ? { ...st, approved: true } : st)));
  }
  function rejectOne(idx: number) {
    setStudents((s) => s.map((st, i) => (i === idx ? { ...st, approved: false } : st)));
  }

  const allDecided = students.every((s) => s.approved !== null);
  const pendingCount = students.filter((s) => s.approved === null).length;

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title={row.title}
        subtitle={`${row.cls} · ${row.teacher}`}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onBack}>Back to list</Button>
            {!allDecided && (
              <>
                <Button variant="danger" onClick={rejectAll}>Reject All</Button>
                <Button onClick={approveAll}>Approve All</Button>
              </>
            )}
            {allDecided && <Badge variant="green">All reviewed</Badge>}
          </div>
        }
      />

      <div className="flex items-center gap-4 mb-4">
        <Badge variant={row.status.variant}>{row.status.text}</Badge>
        {pendingCount > 0 && <span className="text-sm text-text-muted">{pendingCount} pending review</span>}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light text-text-muted text-left">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Class</th>
                <th className="px-5 py-3 font-medium">Subject</th>
                <th className="px-5 py-3 font-medium text-right">CA</th>
                <th className="px-5 py-3 font-medium text-right">Exam</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
                <th className="px-5 py-3 font-medium text-center">Grade</th>
                <th className="px-5 py-3 font-medium">Comments</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {students.map((s, idx) => (
                <tr key={s.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-text-dark">{s.name}</td>
                  <td className="px-5 py-3 text-text-muted font-mono text-xs">{s.id}</td>
                  <td className="px-5 py-3 text-text-muted">{s.class}</td>
                  <td className="px-5 py-3 text-text-muted">{s.subject}</td>
                  <td className="px-5 py-3 text-right text-text-dark">{s.caScore}</td>
                  <td className="px-5 py-3 text-right text-text-dark">{s.examScore}</td>
                  <td className="px-5 py-3 text-right font-medium text-text-dark">{s.total}</td>
                  <td className="px-5 py-3 text-center">
                    <Badge variant={gradeColor(s.grade) as any}>{s.grade}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <input
                      value={comments[s.id] ?? ""}
                      onChange={(e) => setComments((prev) => ({ ...prev, [s.id]: e.target.value }))}
                      placeholder="Add comment..."
                      className="w-40 px-2 py-1 rounded-md border border-border-light text-xs text-text-dark bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </td>
                  <td className="px-5 py-3 text-right">
                    {s.approved === null && (
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" className="text-xs h-7 px-2" onClick={() => rejectOne(idx)}>Reject</Button>
                        <Button variant="ghost" className="text-xs h-7 px-2 text-green" onClick={() => approveOne(idx)}>Approve</Button>
                      </div>
                    )}
                    {s.approved === true && <Badge variant="green">Approved</Badge>}
                    {s.approved === false && <Badge variant="red">Rejected</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5 mt-4">
        <h3 className="text-sm font-semibold text-text-dark mb-2">Batch Comments</h3>
        <p className="text-xs text-text-muted mb-3">Comments shown to all stakeholders for this result set.</p>
        <textarea
          placeholder="Add a comment for this batch of results..."
          className="w-full px-3 py-2 rounded-lg border border-border-light bg-card text-sm text-text-dark placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
          rows={3}
        />
        <div className="flex justify-end mt-3">
          <Button size="sm">Save Comments</Button>
        </div>
      </Card>
    </div>
  );
}

function List({ rows }: { rows: { title: string; sub: string; right?: string; status?: { text: string; variant: "green" | "red" | "orange" | "muted" | "blue" }; onClick?: () => void }[] }) {
  return (
    <Card className="divide-y divide-border-light">
      {rows.map((r) => (
        <div
          key={r.title}
          className={`flex items-center justify-between px-5 py-4 ${r.onClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}`}
          onClick={r.onClick}
        >
          <div>
            <p className="text-sm font-medium text-text-dark">{r.title}</p>
            <p className="text-xs text-text-muted mt-0.5">{r.sub}{r.right ? ` · ${r.right}` : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            {r.status && <Badge variant={r.status.variant}>{r.status.text}</Badge>}
            {r.onClick && (
              <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        </div>
      ))}
    </Card>
  );
}

export default function PrincipalResultsPage() {
  const [selectedResult, setSelectedResult] = useState<ResultRow | null>(null);

  if (selectedResult) {
    return <DetailView row={selectedResult} onBack={() => setSelectedResult(null)} />;
  }

  const kpis = [
    { label: "Results in Moderation", value: String(moderation.length), detail: "", detailColor: "orange" as const },
    { label: "Published", value: String(published.length), detail: "", detailColor: "green" as const },
    { label: "Corrections", value: String(moderation.filter((m) => m.status.variant === "red").length), detail: "", detailColor: "red" as const },
    { label: "Credit Recovery Flagged", value: "34", detail: "", detailColor: "blue" as const },
  ];

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Results"
        subtitle="Moderate results, publish, and manage credit recovery"
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Tabs
        tabs={[
          {
            id: "moderation",
            label: "Moderation & Corrections",
            content: (
              <List
                rows={moderation.map((m) => ({
                  title: m.title,
                  sub: `${m.cls} · ${m.teacher}`,
                  status: m.status,
                  onClick: () => setSelectedResult(m),
                }))}
              />
            ),
          },
          {
            id: "published",
            label: "Published",
            content: (
              <List
                rows={published.map((p) => ({
                  title: p.title,
                  sub: `${p.cls} · ${p.teacher}`,
                  status: p.status,
                  onClick: () => setSelectedResult(p),
                }))}
              />
            ),
          },
          {
            id: "recovery",
            label: "Credit Recovery",
            content: (
              <List rows={recovery.map((r) => ({ title: r.title, sub: r.detail, status: r.status }))} />
            ),
          },
        ]}
      />
    </div>
  );
}
