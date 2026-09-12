"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Info, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Session {
  id: number;
  term: string;
  course: string;
  group: string;
  dates: string;
  fee: string;
}

const eligibleChild = {
  name: "Kayode Eze",
  id: "STU-21411",
  className: "SS1 Science",
  failed: ["Mathematics"],
};

const notEligible = {
  name: "Chidi Eze",
  id: "STU-21401",
  className: "SS1 Science",
};

const remediationSessions: Session[] = [
  { id: 1, term: "2026 Summer", course: "Mathematics", group: "SS1 Math Remediation", dates: "Jul 20 – Aug 20", fee: "₦400" },
  { id: 2, term: "2026 Summer", course: "Mathematics", group: "Intensive", dates: "Jul 15 – Aug 10", fee: "₦500" },
  { id: 3, term: "2025/2026 Term 3", course: "Mathematics", group: "Math Recovery", dates: "Aug 3 – Aug 28", fee: "₦350" },
];

export default function ParentSummerSchoolPage() {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const enroll = () => {
    showToast("Enrollment submitted");
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader title="Summer School" subtitle="Credit recovery and summer enrichment for your children" />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-orange/40 bg-orange-light/40 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
        <p className="text-xs leading-relaxed text-text-dark">
          <span className="font-semibold">Kayode is eligible — enroll him for summer school.</span>{" "}
          Kayode Eze failed Mathematics this term. Enrolling in a remediation session will help him recover the credit before next term.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-text-dark">Credit Recovery · {eligibleChild.name}</h3>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-text-muted">{eligibleChild.id} · {eligibleChild.className}</span>
            <Badge variant="orange">Eligible</Badge>
          </div>

          <div className="mb-4">
            <span className="block text-xs font-medium text-text-dark mb-2">Failed Subjects</span>
            <div className="flex flex-col gap-2">
              {eligibleChild.failed.map((subject) => (
                <label key={subject} className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border-light bg-card cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject)}
                    onChange={() => toggleSubject(subject)}
                    className="h-4 w-4 rounded border-border-default accent-primary"
                  />
                  <span className="text-sm text-text-dark">{subject}</span>
                  <Badge variant="red" className="ml-auto">Failed</Badge>
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-text-dark mb-2">Remediation Sessions</span>
            <div className="flex flex-col gap-2">
              {remediationSessions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSession(s)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg border transition-colors flex items-center justify-between gap-3",
                    selectedSession?.id === s.id
                      ? "border-primary bg-primary-light/40"
                      : "border-border-light bg-card hover:bg-surface"
                  )}
                >
                  <div>
                    <div className="text-sm font-medium text-text-dark">{s.term} · {s.group}</div>
                    <div className="text-xs text-text-muted mt-0.5">{s.course} · {s.dates}</div>
                  </div>
                  <div className="text-sm font-semibold text-text-dark shrink-0">{s.fee}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <Button onClick={enroll}>Enroll & Pay</Button>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-text-dark mb-4">Enrolled Children</h3>
          <div className="flex flex-col gap-3">
            <div className="rounded-lg bg-surface px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-dark">{notEligible.name}</p>
                  <p className="text-xs text-text-muted">{notEligible.id} · {notEligible.className}</p>
                </div>
                <Badge variant="green">Not Eligible</Badge>
              </div>
              <p className="text-xs text-text-muted mt-2">Passed all subjects — no credit recovery required.</p>
            </div>
            <p className="text-xs text-text-muted">
              No children currently enrolled in summer school. Enroll {eligibleChild.name} above to get started.
            </p>
          </div>
        </Card>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}
