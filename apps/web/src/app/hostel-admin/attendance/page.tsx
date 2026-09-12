"use client";

import { useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Field, TextInput } from "@/components/ui/form";
import { ClipboardCheck } from "lucide-react";

type Mark = "Present" | "Absent" | "Late" | null;

const initialRoll = [
  { id: "STU-21401", name: "Chidi Eze", room: "3-A" },
  { id: "STU-21404", name: "Tom Wallace", room: "12-B" },
  { id: "STU-21406", name: "Omar Farouk", room: "5-C" },
  { id: "STU-21407", name: "David Okafor", room: "7-D" },
  { id: "STU-21408", name: "Emeka Nwosu", room: "3-B" },
  { id: "STU-21409", name: "Tunde Bakare", room: "6-A" },
  { id: "STU-21410", name: "Femi Adigun", room: "8-A" },
  { id: "STU-21411", name: "Kayode Eze", room: "2-C" },
  { id: "STU-21412", name: "Yusuf Bello", room: "3-A" },
  { id: "STU-21413", name: "Bayo Adeleke", room: "3-A" },
  { id: "STU-21414", name: "Ibrahim Musa", room: "12-B" },
  { id: "STU-21415", name: "Kingsley Okoli", room: "3-A" },
];

const markStyles: Record<Exclude<Mark, null>, string> = {
  Present: "bg-green-light text-green",
  Absent: "bg-red-light text-red",
  Late: "bg-orange-light text-orange",
};

const markIdle = "bg-surface text-text-muted hover:bg-border-light";

export default function HostelAdminAttendancePage() {
  const [date, setDate] = useState("2026-09-06");
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const checkedIn = initialRoll.filter((b) => marks[b.id] === "Present" || marks[b.id] === "Late").length;
  const absent = initialRoll.filter((b) => marks[b.id] === "Absent").length;
  const unaccounted = initialRoll.filter((b) => !marks[b.id]).length;

  const submit = () => {
    showToast(`Bed check submitted for ${date}`);
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Bed Checks"
        subtitle="Evening roll call & night attendance"
        actions={
          <Button onClick={submit}>
            <ClipboardCheck className="w-4 h-4" /> Submit Bed Check
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Checked-in" value={String(checkedIn)} detail="present & late" detailColor="green" />
        <StatCard label="Absent" value={String(absent)} detail="marked absent" detailColor="red" />
        <StatCard label="Unaccounted" value={String(unaccounted)} detail="not yet marked" detailColor="orange" />
      </div>

      <Card className="p-4 mb-6">
        <Field label="Roll Call Date">
          <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} className="max-w-xs" />
        </Field>
      </Card>

      <Card className="divide-y divide-border-light overflow-hidden">
        {initialRoll.map((b) => {
          const current = marks[b.id] ?? null;
          return (
            <div key={b.id} className="flex items-center justify-between px-5 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-dark">{b.name}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {b.id} · Room {b.room}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {(["Present", "Absent", "Late"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMarks((prev) => ({ ...prev, [b.id]: current === m ? null : m }))}
                    className={`px-3 h-8 rounded-lg text-xs font-medium transition-colors ${
                      current === m ? markStyles[m] : markIdle
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </Card>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}