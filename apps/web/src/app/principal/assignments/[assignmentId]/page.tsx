"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";

const assignments: Record<string, { title: string; cls: string; teacher: string; due: string; status: { text: string; variant: "green" | "orange" | "muted" | "red" }; submissions: string }> = {
  "asg-1": { title: "Essay on Civic Responsibilities", cls: "SS1 Civic Ed", teacher: "Mrs. Ajayi", due: "Aug 5", status: { text: "Active", variant: "green" }, submissions: "38 / 42" },
  "asg-2": { title: "Algebra Problem Set 4", cls: "JSS2 Math", teacher: "Mr. Obi", due: "Aug 7", status: { text: "Active", variant: "green" }, submissions: "42 / 45" },
  "asg-3": { title: "Chemistry Lab Report", cls: "SS2 Chemistry", teacher: "Mr. Adeyemi", due: "Aug 1", status: { text: "Grading", variant: "orange" }, submissions: "31 / 38" },
  "asg-4": { title: "Literature Essay — Poetry", cls: "SS2 Art", teacher: "Ms. Tran", due: "Jul 30", status: { text: "Graded", variant: "muted" }, submissions: "40 / 40" },
};

interface StudentSubmission {
  id: string;
  name: string;
  studentId: string;
  cls: string;
  status: "Submitted" | "Late" | "Missing";
  score: number | null;
  comment: string;
}

const submissions: Record<string, StudentSubmission[]> = {
  "asg-1": [
    { id: "s1", name: "Chidi Eze", studentId: "STD-1042", cls: "SS1 Civic Ed", status: "Submitted", score: 88, comment: "Well-structured essay with strong arguments." },
    { id: "s2", name: "Ngozi Adeyemi", studentId: "STD-1055", cls: "SS1 Civic Ed", status: "Submitted", score: 92, comment: "Excellent critical analysis and clarity." },
    { id: "s3", name: "Emeka Nwosu", studentId: "STD-1038", cls: "SS1 Civic Ed", status: "Submitted", score: 75, comment: "Good effort but needs deeper discussion." },
    { id: "s4", name: "Amara Okafor", studentId: "STD-1047", cls: "SS1 Civic Ed", status: "Late", score: 68, comment: "Submitted two days late. Content was adequate." },
    { id: "s5", name: "Tunde Balogun", studentId: "STD-1051", cls: "SS1 Civic Ed", status: "Missing", score: null, comment: "No submission received." },
    { id: "s6", name: "Fatima Abubakar", studentId: "STD-1060", cls: "SS1 Civic Ed", status: "Submitted", score: 85, comment: "Clear writing and good use of examples." },
    { id: "s7", name: "Yemi Afolabi", studentId: "STD-1044", cls: "SS1 Civic Ed", status: "Submitted", score: 79, comment: "Solid work with minor spelling errors." },
    { id: "s8", name: "Ifeanyi Obi", studentId: "STD-1062", cls: "SS1 Civic Ed", status: "Submitted", score: 94, comment: "Outstanding. Could be used as a model response." },
  ],
  "asg-2": [
    { id: "s9", name: "Amara Okafor", studentId: "STD-1047", cls: "JSS2 Math", status: "Submitted", score: 90, comment: "All problems solved correctly." },
    { id: "s10", name: "Tunde Balogun", studentId: "STD-1051", cls: "JSS2 Math", status: "Submitted", score: 82, comment: "Good work on quadratics, review factorisation." },
    { id: "s11", name: "Fatima Abubakar", studentId: "STD-1060", cls: "JSS2 Math", status: "Submitted", score: 76, comment: "Made errors on question 5. Review simultaneous equations." },
    { id: "s12", name: "Yemi Afolabi", studentId: "STD-1044", cls: "JSS2 Math", status: "Late", score: 70, comment: "Partial credit. Submitted one day late." },
    { id: "s13", name: "Ifeanyi Obi", studentId: "STD-1062", cls: "JSS2 Math", status: "Submitted", score: 95, comment: "Perfect score. Well done." },
    { id: "s14", name: "Chidi Eze", studentId: "STD-1042", cls: "JSS2 Math", status: "Submitted", score: 88, comment: "Strong performance across all questions." },
    { id: "s15", name: "Ngozi Adeyemi", studentId: "STD-1055", cls: "JSS2 Math", status: "Submitted", score: 91, comment: "Excellent. Minor working-out layout issue." },
    { id: "s16", name: "Emeka Nwosu", studentId: "STD-1038", cls: "JSS2 Math", status: "Submitted", score: 64, comment: "Needs more practice with algebraic expressions." },
  ],
  "asg-3": [
    { id: "s17", name: "Tom Wallace", studentId: "STD-1071", cls: "SS2 Chemistry", status: "Submitted", score: 85, comment: "Well-documented lab procedure and analysis." },
    { id: "s18", name: "Ngozi Adeyemi", studentId: "STD-1055", cls: "SS2 Chemistry", status: "Submitted", score: 78, comment: "Good graphs but missing conclusion section." },
    { id: "s19", name: "Emeka Nwosu", studentId: "STD-1038", cls: "SS2 Chemistry", status: "Submitted", score: 72, comment: "Adequate report. Improve data interpretation." },
    { id: "s20", name: "Chidi Eze", studentId: "STD-1042", cls: "SS2 Chemistry", status: "Late", score: 65, comment: "Late submission. Partial data table." },
    { id: "s21", name: "Amara Okafor", studentId: "STD-1047", cls: "SS2 Chemistry", status: "Submitted", score: 90, comment: "Thorough analysis and well-structured report." },
    { id: "s22", name: "Tunde Balogun", studentId: "STD-1051", cls: "SS2 Chemistry", status: "Missing", score: null, comment: "No submission received." },
    { id: "s23", name: "Fatima Abubakar", studentId: "STD-1060", cls: "SS2 Chemistry", status: "Submitted", score: 80, comment: "Solid work with minor calculation errors." },
    { id: "s24", name: "Yemi Afolabi", studentId: "STD-1044", cls: "SS2 Chemistry", status: "Submitted", score: 74, comment: "Needs improvement in lab safety discussion." },
  ],
  "asg-4": [
    { id: "s25", name: "Amara Okafor", studentId: "STD-1047", cls: "SS2 Art", status: "Submitted", score: 93, comment: "Beautiful interpretation of poetic devices." },
    { id: "s26", name: "Chidi Eze", studentId: "STD-1042", cls: "SS2 Art", status: "Submitted", score: 87, comment: "Good analysis. Could explore more poems." },
    { id: "s27", name: "Ngozi Adeyemi", studentId: "STD-1055", cls: "SS2 Art", status: "Submitted", score: 91, comment: "Excellent thematic understanding." },
    { id: "s28", name: "Tunde Balogun", studentId: "STD-1051", cls: "SS2 Art", status: "Submitted", score: 82, comment: "Solid essay with room for deeper reflection." },
    { id: "s29", name: "Fatima Abubakar", studentId: "STD-1060", cls: "SS2 Art", status: "Submitted", score: 88, comment: "Well-written and insightful." },
    { id: "s30", name: "Yemi Afolabi", studentId: "STD-1044", cls: "SS2 Art", status: "Submitted", score: 76, comment: "Good effort. Review essay structure." },
    { id: "s31", name: "Ifeanyi Obi", studentId: "STD-1062", cls: "SS2 Art", status: "Submitted", score: 85, comment: "Clear and engaging writing style." },
    { id: "s32", name: "Tom Wallace", studentId: "STD-1071", cls: "SS2 Art", status: "Submitted", score: 90, comment: "Strong comparative analysis." },
  ],
};

const statusVariant: Record<string, "green" | "orange" | "red"> = {
  Submitted: "green",
  Late: "orange",
  Missing: "red",
};

export default function AssignmentDetailPage() {
  const params = useParams();
  const id = params.assignmentId as string;
  const assignment = assignments[id];
  const students = submissions[id] ?? [];

  const submitted = students.filter((s) => s.status === "Submitted").length;
  const late = students.filter((s) => s.status === "Late").length;
  const missing = students.filter((s) => s.status === "Missing").length;
  const graded = students.filter((s) => s.score !== null);
  const avgScore = graded.length > 0 ? (graded.reduce((sum, s) => sum + (s.score ?? 0), 0) / graded.length).toFixed(1) : "—";

  if (!assignment) {
    return (
      <div className="max-w-[1100px] mx-auto">
        <PageHeader title="Assignment Not Found" subtitle="" />
        <Link href="/principal/assignments">
          <Button variant="secondary">Back to Assignments</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="mb-4">
        <Link href="/principal/assignments" className="text-sm text-text-muted hover:text-text-dark transition-colors">
          ← Back to Assignments
        </Link>
      </div>

      <PageHeader
        title={assignment.title}
        subtitle={`${assignment.cls} · ${assignment.teacher} · Due ${assignment.due}`}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Submitted" value={String(submitted)} detail="" detailColor="green" />
        <StatCard label="Late" value={String(late)} detail="" detailColor="orange" />
        <StatCard label="Missing" value={String(missing)} detail="" detailColor="red" />
        <StatCard label="Average Score" value={`${avgScore}%`} detail="" detailColor="muted" />
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-border-light flex items-center justify-between">
          <p className="text-sm font-medium text-text-dark">Student Submissions ({students.length})</p>
          <Badge variant={assignment.status.variant}>{assignment.status.text}</Badge>
        </div>
        <div className="divide-y divide-border-light">
          {students.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-5 py-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-dark">{s.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{s.studentId} · {s.cls}</p>
                {s.comment && <p className="text-xs text-text-muted mt-1 italic">{s.comment}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                {s.score !== null && (
                  <span className="text-sm font-semibold text-text-dark">{s.score}%</span>
                )}
                <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
