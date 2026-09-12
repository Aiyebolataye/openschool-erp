"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";

const performanceData: Record<string, { avg: string; top: string; atRisk: string; flag: { text: string; variant: "green" | "red" | "orange" } }> = {
  Biology: { avg: "74.2%", top: "Chidi Eze (96%)", atRisk: "2 students", flag: { text: "Healthy", variant: "green" } },
  Mathematics: { avg: "68.5%", top: "Ngozi Adeyemi (95%)", atRisk: "5 students", flag: { text: "At Risk", variant: "red" } },
  English: { avg: "79.8%", top: "Amara Okafor (91%)", atRisk: "1 student", flag: { text: "Healthy", variant: "green" } },
  Chemistry: { avg: "71.3%", top: "Tom Wallace (88%)", atRisk: "3 students", flag: { text: "Monitor", variant: "orange" } },
};

const studentScores: Record<string, { name: string; id: string; cls: string; score: string; grade: string; status: string }[]> = {
  Biology: [
    { name: "Chidi Eze", id: "STU-21401", cls: "SS1 Science", score: "96%", grade: "A", status: "Healthy" },
    { name: "Ngozi Adeyemi", id: "STU-21403", cls: "SS1 Science", score: "85%", grade: "A", status: "Healthy" },
    { name: "Amara Okafor", id: "STU-21402", cls: "SS2 Science", score: "78%", grade: "B", status: "Healthy" },
    { name: "Tom Wallace", id: "STU-21404", cls: "SS2 Science", score: "64%", grade: "C", status: "Monitor" },
    { name: "Grace Lim", id: "STU-21405", cls: "SS2 Science", score: "58%", grade: "D", status: "Monitor" },
    { name: "Daniel Smith", id: "STU-21405", cls: "SS3 Art", score: "44%", grade: "E", status: "At Risk" },
    { name: "Omar Farouk", id: "STU-21406", cls: "SS3 Art", score: "39%", grade: "F", status: "At Risk" },
  ],
  Mathematics: [
    { name: "Ngozi Adeyemi", id: "STU-21403", cls: "SS1 Science", score: "95%", grade: "A", status: "Healthy" },
    { name: "Chidi Eze", id: "STU-21401", cls: "SS1 Science", score: "88%", grade: "A", status: "Healthy" },
    { name: "Amara Okafor", id: "STU-21402", cls: "SS2 Science", score: "72%", grade: "B", status: "Healthy" },
    { name: "Tom Wallace", id: "STU-21404", cls: "SS2 Science", score: "60%", grade: "C", status: "Monitor" },
    { name: "Grace Lim", id: "STU-21405", cls: "SS2 Science", score: "52%", grade: "D", status: "At Risk" },
    { name: "Daniel Smith", id: "STU-21405", cls: "SS3 Art", score: "41%", grade: "E", status: "At Risk" },
    { name: "Omar Farouk", id: "STU-21406", cls: "SS3 Art", score: "35%", grade: "F", status: "At Risk" },
  ],
  English: [
    { name: "Amara Okafor", id: "STU-21402", cls: "SS2 Science", score: "91%", grade: "A", status: "Healthy" },
    { name: "Chidi Eze", id: "STU-21401", cls: "SS1 Science", score: "86%", grade: "A", status: "Healthy" },
    { name: "Ngozi Adeyemi", id: "STU-21403", cls: "SS1 Science", score: "80%", grade: "A", status: "Healthy" },
    { name: "Tom Wallace", id: "STU-21404", cls: "SS2 Science", score: "69%", grade: "C", status: "Healthy" },
    { name: "Grace Lim", id: "STU-21405", cls: "SS2 Science", score: "62%", grade: "C", status: "Healthy" },
    { name: "Daniel Smith", id: "STU-21405", cls: "SS3 Art", score: "51%", grade: "D", status: "Monitor" },
    { name: "Omar Farouk", id: "STU-21406", cls: "SS3 Art", score: "45%", grade: "E", status: "Monitor" },
  ],
  Chemistry: [
    { name: "Tom Wallace", id: "STU-21404", cls: "SS2 Science", score: "88%", grade: "A", status: "Healthy" },
    { name: "Chidi Eze", id: "STU-21401", cls: "SS1 Science", score: "82%", grade: "A", status: "Healthy" },
    { name: "Ngozi Adeyemi", id: "STU-21403", cls: "SS1 Science", score: "75%", grade: "B", status: "Healthy" },
    { name: "Amara Okafor", id: "STU-21402", cls: "SS2 Science", score: "68%", grade: "C", status: "Monitor" },
    { name: "Grace Lim", id: "STU-21405", cls: "SS2 Science", score: "55%", grade: "D", status: "Monitor" },
    { name: "Daniel Smith", id: "STU-21405", cls: "SS3 Art", score: "43%", grade: "E", status: "At Risk" },
    { name: "Omar Farouk", id: "STU-21406", cls: "SS3 Art", score: "37%", grade: "F", status: "At Risk" },
  ],
};

function gradeColor(g: string) {
  if (g === "A") return "green" as const;
  if (g === "B") return "blue" as const;
  if (g === "C") return "orange" as const;
  return "red" as const;
}

export default function SubjectPerformancePage() {
  const { subject } = useParams<{ subject: string }>();
  const info = performanceData[subject] ?? { avg: "—", top: "—", atRisk: "—", flag: { text: "Healthy", variant: "green" as const } };
  const scores = studentScores[subject] ?? [];

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title={subject ? `${subject} Performance` : "Subject Performance"}
        subtitle="Student-by-student performance breakdown"
        actions={
          <Link href="/principal/assignments">
            <Button variant="secondary">← Back to Assignments</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Class Average" value={info.avg} detail="" detailColor="muted" />
        <StatCard label="Top Performer" value="Top" detail={info.top} detailColor="green" />
        <StatCard label="At Risk" value={info.atRisk} detail="" detailColor="red" />
        <StatCard label="Status" value={info.flag.text} detail="" detailColor={info.flag.variant} />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light text-text-muted text-left">
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Class</th>
                <th className="px-5 py-3 font-medium text-right">Score</th>
                <th className="px-5 py-3 font-medium text-center">Grade</th>
                <th className="px-5 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {scores.map((s) => (
                <tr key={s.id + s.name} className="hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3 font-medium">
                    <Link href={`/teacher/students/${s.id}`} className="text-text-dark hover:text-primary transition-colors">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-text-muted font-mono text-xs">{s.id}</td>
                  <td className="px-5 py-3 text-text-muted">{s.cls}</td>
                  <td className="px-5 py-3 text-right font-medium text-text-dark">{s.score}</td>
                  <td className="px-5 py-3 text-center">
                    <Badge variant={gradeColor(s.grade)}>{s.grade}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Badge variant={s.status === "Healthy" ? "green" : s.status === "Monitor" ? "orange" : "red"}>{s.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
