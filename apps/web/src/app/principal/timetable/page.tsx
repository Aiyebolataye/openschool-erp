"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RotateCcw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { SelectField } from "@/components/ui/form";

interface SlotValue {
  cls: string;
  subject: string;
  teacher: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = ["8:00 – 8:40", "8:45 – 9:25", "9:30 – 10:10", "10:30 – 11:10", "11:15 – 11:55", "12:00 – 12:40", "1:30 – 2:10", "2:15 – 2:55"];
const CLASSES = ["SS1 Science", "SS1 Art", "SS1 Business", "SS2 Science", "SS2 Art", "SS2 Business", "SS3 Science", "SS3 Art", "SS3 Business"];
const SUBJECTS = ["Biology", "Chemistry", "Physics", "Mathematics", "English", "Literature", "History", "Geography", "Economics", "Accounting", "Further Maths"];

const classShort: Record<string, string> = {
  "SS1 Science": "SS1 Sci",
  "SS1 Art": "SS1 Art",
  "SS1 Business": "SS1 Bus",
  "SS2 Science": "SS2 Sci",
  "SS2 Art": "SS2 Art",
  "SS2 Business": "SS2 Bus",
  "SS3 Science": "SS3 Sci",
  "SS3 Art": "SS3 Art",
  "SS3 Business": "SS3 Bus",
};

const TEACHERS = [
  { name: "Mrs. Ajayi", subjects: ["Biology"] },
  { name: "Dr. Okon", subjects: ["Biology"] },
  { name: "Mr. Obi", subjects: ["Mathematics"] },
  { name: "Ms. Tran", subjects: ["Literature", "English"] },
  { name: "Mr. Adeyemi", subjects: ["Chemistry", "Physics"] },
  { name: "Mrs. Okafor", subjects: ["Accounting"] },
  { name: "Mr. Kalu", subjects: ["History", "Geography"] },
  { name: "Mrs. Lim", subjects: ["Further Maths", "Economics"] },
];

const shortCls = (cls: string) => classShort[cls] ?? cls;
const keyOf = (day: string, time: string) => `${day}|${time}`;

function slot(day: string, time: string, cls: string, subject: string, teacher: string): [string, SlotValue] {
  return [keyOf(day, time), { cls, subject, teacher }];
}

const SAMPLE_SLOTS: Record<string, SlotValue> = Object.fromEntries([
  slot("Monday", "8:00 – 8:40", "SS1 Science", "Biology", "Mrs. Ajayi"),
  slot("Monday", "8:45 – 9:25", "SS1 Art", "English", "Ms. Tran"),
  slot("Monday", "9:30 – 10:10", "SS2 Science", "Physics", "Mr. Adeyemi"),
  slot("Monday", "11:15 – 11:55", "SS1 Business", "Economics", "Mrs. Lim"),
  slot("Monday", "1:30 – 2:10", "SS3 Science", "Further Maths", "Mrs. Lim"),
  slot("Tuesday", "8:00 – 8:40", "SS2 Science", "Chemistry", "Mr. Adeyemi"),
  slot("Tuesday", "8:45 – 9:25", "SS3 Science", "Mathematics", "Mr. Obi"),
  slot("Tuesday", "10:30 – 11:10", "SS1 Business", "Accounting", "Mrs. Okafor"),
  slot("Tuesday", "12:00 – 12:40", "SS1 Art", "Literature", "Ms. Tran"),
  slot("Tuesday", "2:15 – 2:55", "SS2 Art", "Geography", "Mr. Kalu"),
  slot("Wednesday", "8:45 – 9:25", "SS3 Art", "History", "Mr. Kalu"),
  slot("Wednesday", "9:30 – 10:10", "SS3 Science", "Physics", "Mr. Adeyemi"),
  slot("Wednesday", "10:30 – 11:10", "SS1 Science", "Mathematics", "Mr. Obi"),
  slot("Wednesday", "11:15 – 11:55", "SS2 Art", "Literature", "Ms. Tran"),
  slot("Wednesday", "1:30 – 2:10", "SS1 Art", "English", "Ms. Tran"),
  slot("Thursday", "8:00 – 8:40", "SS2 Business", "Economics", "Mrs. Lim"),
  slot("Thursday", "9:30 – 10:10", "SS3 Science", "Biology", "Dr. Okon"),
  slot("Thursday", "10:30 – 11:10", "SS2 Science", "Mathematics", "Mr. Obi"),
  slot("Thursday", "11:15 – 11:55", "SS1 Science", "Chemistry", "Mr. Adeyemi"),
  slot("Thursday", "2:15 – 2:55", "SS3 Art", "Geography", "Mr. Kalu"),
  slot("Friday", "8:45 – 9:25", "SS3 Business", "Accounting", "Mrs. Okafor"),
  slot("Friday", "9:30 – 10:10", "SS1 Art", "History", "Mr. Kalu"),
  slot("Friday", "11:15 – 11:55", "SS2 Science", "Further Maths", "Mrs. Lim"),
  slot("Friday", "1:30 – 2:10", "SS1 Business", "English", "Ms. Tran"),
]);

const colTemplate = "110px repeat(5, minmax(150px, 1fr))";

export default function PrincipalTimetablePage() {
  const [slots, setSlots] = useState<Record<string, SlotValue>>(() => ({ ...SAMPLE_SLOTS }));
  const [assignOpen, setAssignOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [cls, setCls] = useState("");
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(null), 3000);
    return () => clearTimeout(t);
  }, [success]);

  const isEditing = editingKey !== null;

  const workload = useMemo(() => {
    const counts = TEACHERS.map((t) => ({ name: t.name, count: 0 }));
    Object.values(slots).forEach((v) => {
      const entry = counts.find((c) => c.name === v.teacher);
      if (entry) entry.count += 1;
    });
    const max = Math.max(1, ...counts.map((c) => c.count));
    return counts.map((c) => ({ ...c, pct: Math.round((c.count / max) * 100) }));
  }, [slots]);

  const openAdd = (d = "", t = "") => {
    setEditingKey(null);
    setDay(d);
    setTime(t);
    setCls("");
    setSubject("");
    setTeacher("");
    setError(null);
    setSuggestion(null);
    setAssignOpen(true);
  };

  const openEdit = (d: string, t: string, val: SlotValue) => {
    setEditingKey(keyOf(d, t));
    setDay(d);
    setTime(t);
    setCls(val.cls);
    setSubject(val.subject);
    setTeacher(val.teacher);
    setError(null);
    setSuggestion(null);
    setAssignOpen(true);
  };

  const closeModal = () => {
    setAssignOpen(false);
    setEditingKey(null);
    setError(null);
    setSuggestion(null);
  };

  const removeSlot = (k: string) => {
    setSlots((prev) => {
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const resetSample = () => {
    setSlots({ ...SAMPLE_SLOTS });
    setSuccess("Sample timetable restored");
    closeModal();
  };

  const teachersForSubject = subject
    ? TEACHERS.filter((t) => t.subjects.includes(subject)).map((t) => t.name)
    : TEACHERS.map((t) => t.name);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    setSubject(next);
    if (!teachersForSubject.includes(teacher) && next) {
      const first = TEACHERS.find((t) => t.subjects.includes(next));
      setTeacher(first ? first.name : "");
    }
  };

  const handleSave = () => {
    if (!day || !time || !cls || !subject || !teacher) {
      setError("Please fill in every field before saving.");
      return;
    }
    const targetKey = keyOf(day, time);
    const occupant = slots[targetKey];
    const inPlace = isEditing && editingKey === targetKey;
    setSuggestion(null);

    if (occupant && !inPlace) {
      if (occupant.teacher === teacher && occupant.cls !== cls) {
        setError(`${teacher} is already teaching ${occupant.subject} for ${shortCls(occupant.cls)} at this time.`);
        const free = TIME_SLOTS.find((t) => !slots[keyOf(day, t)]);
        if (free) setSuggestion(`${teacher} is free at ${free} on ${day} — apply?`);
        return;
      }
      if (occupant.cls === cls) {
        setError(`Class ${shortCls(cls)} already has ${occupant.subject} at this time.`);
        return;
      }
      setError(`This period is already booked for ${shortCls(occupant.cls)} (${occupant.subject}).`);
      return;
    }

    setSlots((prev) => {
      const next = { ...prev };
      if (isEditing && editingKey && editingKey !== targetKey) delete next[editingKey];
      next[targetKey] = { cls, subject, teacher };
      return next;
    });
    setSuccess(`${shortCls(cls)} · ${subject} · ${teacher} scheduled for ${day}, ${time}`);
    closeModal();
  };

  const applySuggestion = (s: string) => {
    setTime(s);
    setError(null);
    setSuggestion(null);
  };

  return (
    <div className="max-w-[1280px] mx-auto">
      <PageHeader
        title="Timetable Builder"
        subtitle="Build & adjust the school's weekly timetable · the system checks teacher, class and subject conflicts"
        actions={
          <>
            <Button variant="ghost" onClick={resetSample}>
              <RotateCcw className="w-4 h-4" /> Reset sample
            </Button>
            <Button onClick={() => openAdd()}>
              <Plus className="w-4 h-4" /> Assign lesson
            </Button>
          </>
        }
      />

      {success && (
        <div className="mb-4">
          <Badge variant="green">{success}</Badge>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0 w-full">
          <Card className="p-4 overflow-hidden">
            <div className="overflow-x-auto -mx-4 px-4">
              <div style={{ minWidth: 900 }}>
                <div
                  className="grid gap-2 mb-2"
                  style={{ gridTemplateColumns: colTemplate }}
                >
                  <div className="flex items-end pb-2 px-2">
                    <span className="text-[10px] uppercase tracking-wide text-text-muted font-medium">Time</span>
                  </div>
                  {DAYS.map((d) => (
                    <div key={d} className="text-center pb-2 px-2">
                      <span className="text-xs font-semibold text-text-dark">{d.slice(0, 3)}</span>
                    </div>
                  ))}
                </div>

                {TIME_SLOTS.map((t) => (
                  <div
                    key={t}
                    className="grid gap-2 mb-2"
                    style={{ gridTemplateColumns: colTemplate }}
                  >
                    <div className="px-2 py-1.5 flex items-start justify-end">
                      <span className="text-[10px] text-text-muted text-right leading-tight">{t}</span>
                    </div>
                    {DAYS.map((d) => {
                      const k = keyOf(d, t);
                      const val = slots[k];
                      if (!val) {
                        return (
                          <button
                            key={k}
                            onClick={() => openAdd(d, t)}
                            className="group min-h-[66px] rounded-lg border border-dashed border-border-light text-text-muted hover:border-primary hover:text-primary flex items-center justify-center transition-colors"
                            aria-label={`Add lesson ${d} ${t}`}
                          >
                            <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        );
                      }
                      return (
                        <div
                          key={k}
                          className="relative group min-h-[66px] rounded-lg border border-border-light bg-surface/60 hover:bg-primary-light/20 hover:border-primary/40 transition-colors p-2"
                        >
                          <button
                            onClick={() => openEdit(d, t, val)}
                            className="w-full h-full text-left"
                            aria-label={`Edit ${d} ${t}`}
                          >
                            <span className="block text-[11px] font-semibold text-text-dark leading-tight">{shortCls(val.cls)}</span>
                            <span className="block text-[11px] text-primary font-medium leading-tight mt-0.5">{val.subject}</span>
                            <span className="block text-[10px] text-text-muted leading-tight mt-0.5">{val.teacher}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSlot(k);
                            }}
                            className="absolute top-1 right-1 p-0.5 rounded text-text-muted hover:text-red hover:bg-red-light opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Remove ${d} ${t}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="w-full lg:w-[320px] shrink-0">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-dark">Teacher Workload</h3>
              <span className="text-[11px] text-text-muted">periods/week</span>
            </div>
            <div className="flex flex-col gap-3">
              {workload.map((w) => (
                <div key={w.name} className="flex items-center gap-2">
                  <div className="w-28 shrink-0 truncate">
                    <span className="text-xs font-medium text-text-dark block leading-tight truncate">{w.name}</span>
                    <span className="text-[10px] text-text-muted">{w.count} period{w.count === 1 ? "" : "s"}</span>
                  </div>
                  <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
                    <div
                      className={`h-full rounded-full ${w.count === 0 ? "bg-orange-light" : "bg-primary"}`}
                      style={{ width: `${Math.max(w.count === 0 ? 4 : 8, w.pct)}%` }}
                    />
                  </div>
                  {w.count === 0 && <Badge variant="orange">No load</Badge>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={assignOpen}
        onClose={closeModal}
        title={isEditing ? "Edit assignment" : "Assign lesson"}
        subtitle="The system checks class, teacher and subject conflicts before saving"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSave}>{isEditing ? "Save changes" : "Save assignment"}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Day" required placeholder="Select day" value={day} options={DAYS} onChange={(e) => setDay(e.target.value)} />
            <SelectField label="Time slot" required placeholder="Select time" value={time} options={TIME_SLOTS} onChange={(e) => setTime(e.target.value)} />
          </div>
          <SelectField label="Class" required placeholder="Select class" value={cls} options={CLASSES} onChange={(e) => setCls(e.target.value)} />
          <SelectField label="Subject" required placeholder="Select subject" value={subject} options={SUBJECTS} onChange={handleSubjectChange} />
          <SelectField label="Teacher" required placeholder="Select teacher" value={teacher} options={teachersForSubject} onChange={(e) => setTeacher(e.target.value)} />
          {error && (
            <div className="rounded-lg bg-red-light/60 border border-red/20 px-3 py-2.5">
              <p className="text-xs text-red font-medium">{error}</p>
              {suggestion && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-text-muted">{suggestion}</span>
                  <Button variant="secondary" size="sm" onClick={() => applySuggestion(suggestion)}>Apply suggested time</Button>
                </div>
              )}
            </div>
          )}
          {!subject && (
            <p className="text-[11px] text-text-muted">Pick a subject first to see only teachers who can teach it.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
