"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Phone, Mail } from "lucide-react";

interface Subject {
  code: string;
  name: string;
  teacher: string;
  teacherTitle: string;
  teacherEmail: string;
  teacherPhone: string;
  score: number;
  classAverage: number;
  position: string;
  remark: string;
  comment: string;
  tone: "green" | "blue" | "orange" | "red" | "purple" | "muted";
}

const subjects: Subject[] = [
  {
    code: "BIO",
    name: "Biology",
    teacher: "Mrs. Funmilayo Ajayi",
    teacherTitle: "Senior Biology Teacher · Class Teacher SS1 Science",
    teacherEmail: "f.ajayi@greenfield.edu.ng",
    teacherPhone: "+234 810 555 2210",
    score: 83,
    classAverage: 71,
    position: "2nd of 42",
    remark: "Excellent",
    comment: "Chidi shows a strong grasp of cell biology. Keep up the consistent revision of diagrams.",
    tone: "green",
  },
  {
    code: "CHM",
    name: "Chemistry",
    teacher: "Mr. Adewale Adeyemi",
    teacherTitle: "Chemistry Teacher · Head of Sciences",
    teacherEmail: "a.adeyemi@greenfield.edu.ng",
    teacherPhone: "+234 810 555 2211",
    score: 75,
    classAverage: 66,
    position: "5th of 42",
    remark: "Very Good",
    comment: "Solid work with balancing equations. Practice more numerical problems on moles.",
    tone: "blue",
  },
  {
    code: "PHY",
    name: "Physics",
    teacher: "Dr. Ngozi Obi",
    teacherTitle: "Physics Teacher",
    teacherEmail: "n.obi@greenfield.edu.ng",
    teacherPhone: "+234 810 555 2212",
    score: 72,
    classAverage: 64,
    position: "7th of 42",
    remark: "Very Good",
    comment: "Good understanding of motion. Pay more attention to units when solving problems.",
    tone: "purple",
  },
  {
    code: "MTH",
    name: "Mathematics",
    teacher: "Mr. Samuel Adekunle",
    teacherTitle: "Mathematics Teacher",
    teacherEmail: "s.adekunle@greenfield.edu.ng",
    teacherPhone: "+234 810 555 2213",
    score: 70,
    classAverage: 63,
    position: "9th of 42",
    remark: "Good",
    comment: "Adequate performance. Solve past questions on quadratic equations before the exam.",
    tone: "orange",
  },
  {
    code: "ENG",
    name: "English Language",
    teacher: "Mrs. Yetunde Balogun",
    teacherTitle: "English Teacher",
    teacherEmail: "y.balogun@greenfield.edu.ng",
    teacherPhone: "+234 810 555 2214",
    score: 82,
    classAverage: 70,
    position: "3rd of 42",
    remark: "Excellent",
    comment: "Chidi writes with clarity and good structure. Continue wide reading to build vocabulary.",
    tone: "red",
  },
  {
    code: "LIT",
    name: "Literature-in-English",
    teacher: "Miss Chioma Nnamdi",
    teacherTitle: "Literature Teacher",
    teacherEmail: "c.nnamdi@greenfield.edu.ng",
    teacherPhone: "+234 810 555 2215",
    score: 86,
    classAverage: 72,
    position: "1st of 42",
    remark: "Excellent",
    comment: "Outstanding textual analysis of the prescribed drama texts. A joy to have in class.",
    tone: "muted",
  },
];

const toneAvatar: Record<string, string> = {
  green: "bg-green-light text-green",
  blue: "bg-primary-light text-primary",
  orange: "bg-orange-light text-orange",
  red: "bg-red-light text-red",
  purple: "bg-purple-light text-purple",
  muted: "bg-surface text-text-muted",
};

function initialsOf(name: string) {
  return name
    .replace(/^(Mrs\.|Mr\.|Dr\.|Miss|Ms\.)\s*/, "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function gradeFor(score: number) {
  if (score >= 75) return { text: "A", variant: "green" as const };
  if (score >= 65) return { text: "B", variant: "blue" as const };
  if (score >= 60) return { text: "C", variant: "orange" as const };
  if (score >= 50) return { text: "D", variant: "purple" as const };
  return { text: "F", variant: "red" as const };
}

export default function StudentSubjectsPage() {
  const [selected, setSelected] = useState<Subject | null>(null);
  const [open, setOpen] = useState(false);

  const openSubject = (s: Subject) => {
    setSelected(s);
    setOpen(true);
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="My Subjects"
        subtitle="SS1 Science · 6 subjects · Third Term, 2025/2026"
      />

      <div className="grid grid-cols-3 gap-4">
        {subjects.map((s) => (
          <button
            key={s.code}
            onClick={() => openSubject(s)}
            className="text-left bg-card rounded-xl border border-border-light p-5 hover:border-primary/40 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-bold text-text-dark text-lg">{s.name}</span>
              <Badge variant={gradeFor(s.score).variant}>{gradeFor(s.score).text}</Badge>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${toneAvatar[s.tone]}`}>
                <span className="text-[10px] font-semibold">{initialsOf(s.teacher)}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-text-dark truncate">{s.teacher}</p>
                <p className="text-[11px] text-text-muted truncate">SS1 Science · {s.code}</p>
              </div>
            </div>
            <div className="rounded-lg bg-surface px-3 py-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-text-muted font-medium">Term Score</span>
                <span className="text-sm font-bold text-text-dark">{s.score}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-border-light overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${s.score}%` }}
                />
              </div>
              <p className="text-[11px] text-text-muted mt-1.5">
                Class avg {s.classAverage}% · Position {s.position}
              </p>
            </div>
          </button>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={selected?.name ?? ""}
        subtitle={selected ? `${selected.code} · SS1 Science` : undefined}
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border-light p-4 flex items-center gap-3">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${toneAvatar[selected.tone]}`}>
                <span className="text-xs font-semibold">{initialsOf(selected.teacher)}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-dark">{selected.teacher}</p>
                <p className="text-xs text-text-muted">{selected.teacherTitle}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-text-muted flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {selected.teacherEmail}
                  </span>
                  <span className="text-[11px] text-text-muted flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {selected.teacherPhone}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border-light divide-y divide-border-light">
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs text-text-muted">Term Score</span>
                <span className="text-sm font-semibold text-text-dark">
                  {selected.score}% · Grade {gradeFor(selected.score).text}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs text-text-muted">Class Average</span>
                <span className="text-sm font-semibold text-text-dark">{selected.classAverage}%</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs text-text-muted">Position in Class</span>
                <span className="text-sm font-semibold text-text-dark">{selected.position}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs text-text-muted">Remark</span>
                <Badge variant={gradeFor(selected.score).variant}>{selected.remark}</Badge>
              </div>
            </div>

            <div className="rounded-xl bg-green-light/50 border border-green/20 px-4 py-3">
              <p className="text-xs font-semibold text-text-dark mb-1">Teacher&apos;s Comment</p>
              <p className="text-xs text-text-dark leading-relaxed">“{selected.comment}”</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
