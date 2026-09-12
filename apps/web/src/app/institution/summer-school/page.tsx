"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { useState } from "react";

const kpis = [
  { label: "Flagged for Credit Recovery", value: "34", detail: "", detailColor: "orange" as const },
  { label: "Enrolled in Summer School", value: "18", detail: "", detailColor: "green" as const },
  { label: "Fee Collected", value: "₦9,200", detail: "of ₦18,400", detailColor: "muted" as const },
  { label: "Waiting List", value: "6", detail: "", detailColor: "blue" as const },
];

interface ParentContact {
  name: string;
  phone: string;
}

interface RecoveryRow {
  student: string;
  id: string;
  cls: string;
  parent: ParentContact;
  failed: string[];
  status: { text: string; variant: "green" | "orange" };
}

interface ProgramRow {
  id: string;
  subject: string;
  group: string;
  capacity: string;
  fee: string;
  start: string;
  end: string;
  status: { text: string; variant: "green" | "orange" };
}

interface PaymentRow {
  payment: string;
  student: string;
  amount: string;
  method: { text: string; variant: "green" | "blue" };
  plan: string;
  date: string;
  [key: string]: string | { text: string; variant: "green" | "blue" };
}

interface Session {
  id: number;
  term: string;
  course: string;
  group: string;
  dates: string;
  capacity: string;
  fee: string;
}

const studentSubjects: Record<string, string[]> = {
  "Tom Wallace": ["Mathematics", "Physics"],
  "Grace Lim": ["Chemistry"],
  "Daniel Smith": ["English"],
  "Amara Okafor": ["Mathematics"],
  "Chidi Eze": ["English"],
  "Omar Farouk": ["Mathematics"],
};

const remediationSessions: Session[] = [
  { id: 1, term: "2025/2026 Term 3", course: "Mathematics", group: "SS3 Math Remediation", dates: "Aug 3 – Aug 28", capacity: "20", fee: "₦400" },
  { id: 2, term: "2026 Summer", course: "Mathematics", group: "Intensive", dates: "Jul 15 – Aug 10", capacity: "30", fee: "₦500" },
  { id: 3, term: "2025/2026 Term 3", course: "Physics", group: "SS3 Physics Recovery", dates: "Aug 3 – Aug 28", capacity: "20", fee: "₦400" },
  { id: 4, term: "2026 Summer", course: "Physics", group: "Intensive", dates: "Jul 15 – Aug 10", capacity: "25", fee: "₦450" },
  { id: 5, term: "2025/2026 Term 3", course: "Chemistry", group: "SS2 Chemistry Recovery", dates: "Aug 3 – Aug 28", capacity: "20", fee: "₦350" },
  { id: 6, term: "2026 Summer", course: "Chemistry", group: "Intensive", dates: "Jul 15 – Aug 10", capacity: "25", fee: "₦450" },
  { id: 7, term: "2026 Summer", course: "English", group: "JSS English Boost", dates: "Aug 10 – Aug 30", capacity: "20", fee: "₦300" },
  { id: 8, term: "2025/2026 Term 3", course: "English", group: "JSS English Boost", dates: "Aug 3 – Aug 28", capacity: "20", fee: "₦300" },
];

const recoveryColumns = [
  { key: "student", label: "STUDENT", width: "120px" },
  { key: "id", label: "ID", width: "100px" },
  { key: "cls", label: "CLASS", width: "100px" },
  { key: "parent", label: "PARENT CONTACT", width: "170px" },
  { key: "failed", label: "FAILED COURSE(S)", width: "190px" },
  { key: "status", label: "STATUS", width: "90px" },
  { key: "action", label: "", width: "180px", align: "right" as const },
];

const paymentColumns = [
  { key: "payment", label: "INVOICE", width: "100px" },
  { key: "student", label: "STUDENT", width: "120px" },
  { key: "amount", label: "AMOUNT", width: "90px" },
  { key: "method", label: "METHOD", width: "110px" },
  { key: "plan", label: "PLAN", width: "110px" },
  { key: "date", label: "DATE", width: "110px" },
];

function fmtRange(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return "TBD";
  return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", opts)}`;
}

function eligibleForSubject(recovery: RecoveryRow[], subject: string) {
  return recovery.filter((r) => r.status.text === "Flagged" && r.failed.includes(subject));
}

function ProgramTable({ data, recovery, onRowClick }: { data: ProgramRow[]; recovery: RecoveryRow[]; onRowClick: (row: ProgramRow) => void }) {
  const headers = ["SUBJECT", "GROUP", "ELIGIBLE STUDENTS", "CAPACITY", "FEE", "SCHEDULE", "STATUS"];
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-light">
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const eligible = eligibleForSubject(recovery, row.subject);
              return (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row)}
                  className="border-b border-border-light last:border-0 hover:bg-surface/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm font-medium text-text-dark">{row.subject}</td>
                  <td className="px-4 py-3 text-sm text-text-muted">{row.group}</td>
                  <td className="px-4 py-3">
                    {eligible.length === 0 ? (
                      <span className="text-sm text-text-muted">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {eligible.map((r) => (
                          <Badge key={r.student} variant="muted">{r.student}</Badge>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-dark">{row.capacity}</td>
                  <td className="px-4 py-3 text-sm text-text-dark">₦{row.fee}</td>
                  <td className="px-4 py-3 text-sm text-text-muted">{fmtRange(row.start, row.end)}</td>
                  <td className="px-4 py-3"><Badge variant={row.status.variant}>{row.status.text}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function SummerSchoolPage() {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [recovery, setRecovery] = useState<RecoveryRow[]>([
    { student: "Tom Wallace", id: "STU-21403", cls: "SS3 Art", parent: { name: "Mr. Wallace", phone: "+234 803 111 2233" }, failed: ["Mathematics", "Physics"], status: { text: "Flagged", variant: "orange" } },
    { student: "Omar Farouk", id: "STU-21406", cls: "SS3 Science", parent: { name: "Mrs. Farouk", phone: "+234 802 444 5566" }, failed: ["Mathematics"], status: { text: "Flagged", variant: "orange" } },
    { student: "Grace Lim", id: "STU-21404", cls: "SS2 Science", parent: { name: "Mrs. Lim", phone: "+234 809 777 8899" }, failed: ["Chemistry"], status: { text: "Flagged", variant: "orange" } },
    { student: "Chidi Eze", id: "STU-21407", cls: "JSS2 A", parent: { name: "Mr. Eze", phone: "+234 805 222 3344" }, failed: ["English"], status: { text: "Flagged", variant: "orange" } },
    { student: "Daniel Smith", id: "STU-21405", cls: "JSS1 A", parent: { name: "Mr. Smith", phone: "+234 806 555 6677" }, failed: ["English"], status: { text: "Enrolled", variant: "green" } },
    { student: "Amara Okafor", id: "STU-21402", cls: "JSS2 B", parent: { name: "Mrs. Okafor", phone: "+234 808 333 4455" }, failed: ["Mathematics"], status: { text: "Enrolled", variant: "green" } },
  ]);

  const [program, setProgram] = useState<ProgramRow[]>([
    { id: "PRG-1", subject: "Mathematics", group: "SS3 Math Remediation", capacity: "20", fee: "400", start: "2026-08-03", end: "2026-08-28", status: { text: "Active", variant: "green" } },
    { id: "PRG-2", subject: "Chemistry", group: "SS2 Chemistry Recovery", capacity: "20", fee: "350", start: "2026-08-03", end: "2026-08-28", status: { text: "Active", variant: "green" } },
    { id: "PRG-3", subject: "English", group: "JSS English Boost", capacity: "20", fee: "300", start: "2026-08-10", end: "2026-08-30", status: { text: "Scheduled", variant: "orange" } },
  ]);

  const [payments, setPayments] = useState<PaymentRow[]>([
    { payment: "INV-2201", student: "Daniel Smith", amount: "₦400", method: { text: "Paid", variant: "green" }, plan: "One-time", date: "Jul 28, 2026" },
    { payment: "INV-2202", student: "Amara Okafor", amount: "₦175", method: { text: "Installment 1/2", variant: "blue" }, plan: "Installments", date: "Jul 29, 2026" },
    { payment: "INV-2203", student: "Grace Lim", amount: "₦350", method: { text: "Paid", variant: "green" }, plan: "One-time", date: "Jul 30, 2026" },
  ]);

  const [enrollStudent, setEnrollStudent] = useState("");
  const [enrollFailed, setEnrollFailed] = useState<string[]>([]);
  const [enrollGroup, setEnrollGroup] = useState("");
  const [enrollStart, setEnrollStart] = useState("");
  const [enrollEnd, setEnrollEnd] = useState("");
  const [enrollFeePlan, setEnrollFeePlan] = useState("");
  const [enrollAmount, setEnrollAmount] = useState("");
  const [enrollNotes, setEnrollNotes] = useState("");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const [sessionName, setSessionName] = useState("");
  const [sessionTerm, setSessionTerm] = useState("");
  const [sessionCapacity, setSessionCapacity] = useState("");
  const [sessionApproval, setSessionApproval] = useState("");
  const [sessionStart, setSessionStart] = useState("");
  const [sessionEnd, setSessionEnd] = useState("");

  const [viewRow, setViewRow] = useState<RecoveryRow | null>(null);
  const [recoverySearch, setRecoverySearch] = useState("");

  const [programOpen, setProgramOpen] = useState(false);
  const [activeProgram, setActiveProgram] = useState<ProgramRow | null>(null);
  const [programDraft, setProgramDraft] = useState({ fee: "0", capacity: "20", start: "", end: "" });
  const [checkedEligible, setCheckedEligible] = useState<string[]>([]);

  const programEligible = activeProgram ? eligibleForSubject(recovery, activeProgram.subject) : [];

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const resetEnrollForm = () => {
    setEnrollStudent("");
    setEnrollFailed([]);
    setEnrollGroup("");
    setEnrollStart("");
    setEnrollEnd("");
    setEnrollFeePlan("");
    setEnrollAmount("");
    setEnrollNotes("");
    setSelectedSession(null);
  };

  const openEmptyEnroll = () => {
    resetEnrollForm();
    setEnrollOpen(true);
  };

  const openEnrollFor = (student: string) => {
    resetEnrollForm();
    setEnrollStudent(student);
    setEnrollFailed(studentSubjects[student] ?? []);
    setEnrollOpen(true);
  };

  const openView = (idx: number) => {
    setViewRow(recovery[idx]);
    setViewOpen(true);
  };

  const toggleSubject = (subject: string) => {
    setEnrollFailed((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const openProgram = (row: ProgramRow) => {
    setActiveProgram(row);
    setProgramDraft({ fee: row.fee, capacity: row.capacity, start: row.start, end: row.end });
    setCheckedEligible([]);
    setProgramOpen(true);
  };

  const toggleEligible = (student: string) => {
    setCheckedEligible((prev) =>
      prev.includes(student) ? prev.filter((s) => s !== student) : [...prev, student]
    );
  };

  const handleEnroll = () => {
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const fee = selectedSession ? selectedSession.fee.replace("₦", "") : enrollAmount || "400";
    const existingIdx = recovery.findIndex((r) => r.student === enrollStudent);
    if (existingIdx >= 0) {
      setRecovery((prev) =>
        prev.map((r, i) =>
          i === existingIdx ? { ...r, failed: enrollFailed, status: { text: "Enrolled", variant: "green" } } : r
        )
      );
    } else {
      setRecovery((prev) => [
        ...prev,
        {
          student: enrollStudent,
          id: `STU-${String(21410 + prev.length)}`,
          cls: "—",
          parent: { name: "", phone: "" },
          failed: enrollFailed,
          status: { text: "Enrolled", variant: "green" },
        },
      ]);
    }
    setPayments((prev) => [
      ...prev,
      {
        payment: `INV-${String(2201 + prev.length).padStart(4, "0")}`,
        student: enrollStudent,
        amount: `₦${fee}`,
        method: { text: "Paid", variant: "green" },
        plan: enrollFeePlan || "One-time",
        date: today,
      },
    ]);
    setEnrollOpen(false);
    resetEnrollForm();
    showToast(`Enrolled ${enrollStudent} — invoice generated`);
  };

  const handleSaveProgram = () => {
    if (!activeProgram) return;
    setProgram((prev) =>
      prev.map((p) => (p.id === activeProgram.id ? { ...p, ...programDraft } : p))
    );
    showToast("Program details updated");
  };

  const handleEnrollSelected = () => {
    if (!activeProgram) return;
    const selected = checkedEligible;
    const count = selected.length;
    setRecovery((prev) =>
      prev.map((r) =>
        selected.includes(r.student) ? { ...r, status: { text: "Enrolled", variant: "green" } } : r
      )
    );
    setProgram((prev) =>
      prev.map((p) => (p.id === activeProgram.id ? { ...p, ...programDraft } : p))
    );
    setProgramOpen(false);
    setActiveProgram(null);
    setCheckedEligible([]);
    showToast(
      count > 0
        ? `Enrolled ${count} student${count === 1 ? "" : "s"} in ${activeProgram.group}`
        : "No students selected"
    );
  };

  const handleCreateSession = () => {
    setProgram((prev) => [
      ...prev,
      {
        id: `PRG-${Date.now()}`,
        subject: sessionName || "New Session",
        group: `Group ${String.fromCharCode(65 + prev.length)}`,
        capacity: sessionCapacity || "20",
        fee: "0",
        start: sessionStart,
        end: sessionEnd,
        status: { text: "Scheduled", variant: "orange" },
      },
    ]);
    setSessionOpen(false);
    setSessionName("");
    setSessionTerm("");
    setSessionCapacity("");
    setSessionApproval("");
    setSessionStart("");
    setSessionEnd("");
    showToast("Session created");
  };

  const failedSubjects = studentSubjects[enrollStudent] ?? [];
  const availableSessions = remediationSessions.filter((s) => enrollFailed.includes(s.course));

  const q = recoverySearch.trim().toLowerCase();
  const visibleRecovery = q
    ? recovery.filter(
        (r) =>
          r.student.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.failed.some((f) => f.toLowerCase().includes(q))
      )
    : recovery;

  const recoveryRows = visibleRecovery.map((r) => {
    const origIdx = recovery.indexOf(r);
    return {
      ...r,
      parent: (
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium text-text-dark">{r.parent.name}</span>
          <span className="text-xs text-text-muted">{r.parent.phone}</span>
        </div>
      ),
      failed: (
        <div className="flex flex-wrap gap-1">
          {r.failed.map((f) => (
            <Badge key={f} variant="orange">{f}</Badge>
          ))}
        </div>
      ),
      action: (
        <div className="flex items-center justify-end gap-1">
          {r.status.text === "Flagged" && (
            <Button size="sm" variant="ghost" onClick={() => showToast(`Alert sent to ${r.parent.name} via SMS & WhatsApp`)}>
              Notify
            </Button>
          )}
          {r.status.text === "Flagged" ? (
            <Button size="sm" onClick={() => openEnrollFor(r.student)}>Enroll</Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => openView(origIdx)}>View</Button>
          )}
        </div>
      ),
    };
  });

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Summer School & Credit Recovery"
        subtitle="Students who fail courses can pay and enroll in Summer School to recover credits"
        actions={
          <>
            <Button variant="secondary" onClick={() => setSessionOpen(true)}>+ New Session</Button>
            <Button onClick={openEmptyEnroll}>+ Enroll Student</Button>
          </>
        }
      />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary-light/30 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-xs leading-relaxed text-text-dark">
          Summer school enrollment is done by <span className="font-semibold">PARENTS</span>. Parents are automatically alerted via email/SMS/WhatsApp when a student becomes eligible (a failed course is recorded) and again when enrollment opens.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Tabs
        tabs={[
          {
            id: "recovery",
            label: "Credit Recovery",
            content: (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-text-muted">
                    Students flagged for failing a course are offered a paid Summer School credit-recovery plan. Enroll them to schedule remediation, generate an invoice, and track completion.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => showToast("Parent notification sent to 34 eligible students")}>
                    Notify Parents
                  </Button>
                </div>
                <SearchInput placeholder="Search by student, ID, or failed subject..." className="max-w-sm" value={recoverySearch} onChange={setRecoverySearch} />
                <DataTable columns={recoveryColumns} data={recoveryRows} />
              </div>
            ),
          },
          {
            id: "program",
            label: "Summer School Program",
            content: (
              <div className="space-y-4">
                <p className="text-xs text-text-muted">
                  Remediation groups run as a Summer School Program with capacity limits, waiting lists, and automatic invoice generation. Click a program to enroll eligible students.
                </p>
                <ProgramTable data={program} recovery={recovery} onRowClick={openProgram} />
              </div>
            ),
          },
          {
            id: "payments",
            label: "Payments",
            content: <DataTable columns={paymentColumns} data={payments} />,
          },
        ]}
      />

      <Modal
        open={enrollOpen}
        onClose={() => setEnrollOpen(false)}
        title="Enroll in Summer School"
        subtitle="Credit recovery for students who failed a course"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEnrollOpen(false)}>Cancel</Button>
            <Button onClick={handleEnroll}>Enroll & Generate Invoice</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Student"
            required
            placeholder="Select student"
            options={Object.keys(studentSubjects)}
            value={enrollStudent}
            onChange={(e) => setEnrollStudent(e.target.value)}
          />

          <Card className="p-4">
            <span className="block text-xs font-medium text-text-dark mb-2">
              Failed Subjects <span className="text-red ml-0.5">*</span>
            </span>
            {failedSubjects.length === 0 ? (
              <p className="text-xs text-text-muted">No failed courses on record for this student.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {failedSubjects.map((subject) => (
                  <label key={subject} className="flex items-center gap-2 text-sm text-text-dark cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enrollFailed.includes(subject)}
                      onChange={() => toggleSubject(subject)}
                      className="h-4 w-4 rounded border-border-default text-primary accent-primary"
                    />
                    {subject}
                  </label>
                ))}
              </div>
            )}
          </Card>

          {availableSessions.length > 0 && (
            <div>
              <span className="block text-xs font-medium text-text-dark mb-2">Remediation Sessions</span>
              <div className="flex flex-col gap-2">
                {availableSessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedSession(s);
                      setEnrollAmount(s.fee.replace("₦", ""));
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg border transition-colors flex items-center justify-between gap-3",
                      selectedSession?.id === s.id
                        ? "border-primary bg-primary-light/40"
                        : "border-border-light bg-card hover:bg-surface"
                    )}
                  >
                    <div>
                      <div className="text-sm font-medium text-text-dark">{s.term} · {s.group}</div>
                      <div className="text-xs text-text-muted mt-0.5">{s.dates}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-text-dark">{s.fee}</div>
                      <div className="text-xs text-text-muted">Capacity {s.capacity}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <SelectField label="Remediation Group" required placeholder="Select group" options={["Group A – SS3 Math", "Group B – SS2 Chemistry", "Group C – JSS English"]} value={enrollGroup} onChange={(e) => setEnrollGroup(e.target.value)} />
          <Field label="Start Date" required>
            <TextInput type="date" value={enrollStart} onChange={(e) => setEnrollStart(e.target.value)} />
          </Field>
          <Field label="End Date" required>
            <TextInput type="date" value={enrollEnd} onChange={(e) => setEnrollEnd(e.target.value)} />
          </Field>
          <SelectField label="Fee Plan" required placeholder="Select plan" options={["One-time — ₦400", "Installments (2 × ₦200)", "Recurring weekly"]} value={enrollFeePlan} onChange={(e) => setEnrollFeePlan(e.target.value)} />
          <Field label="Amount" required>
            <TextInput type="number" placeholder="0.00" value={enrollAmount} onChange={(e) => setEnrollAmount(e.target.value)} />
          </Field>
          <Field label="Notes">
            <TextArea rows={3} placeholder="Optional assessment notes" value={enrollNotes} onChange={(e) => setEnrollNotes(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={programOpen}
        onClose={() => setProgramOpen(false)}
        title={activeProgram ? `${activeProgram.subject} · ${activeProgram.group}` : "Summer School Program"}
        subtitle="Eligible students who failed this subject"
        footer={
          <>
            <Button variant="secondary" onClick={() => setProgramOpen(false)}>Cancel</Button>
            <Button variant="secondary" onClick={handleSaveProgram}>Save Changes</Button>
            <Button onClick={handleEnrollSelected} disabled={checkedEligible.length === 0}>Enroll Selected</Button>
          </>
        }
      >
        {activeProgram && (
          <div className="flex flex-col gap-4">
            <div>
              <span className="block text-xs font-medium text-text-dark mb-2">Eligible Students</span>
              {programEligible.length === 0 ? (
                <p className="text-sm text-text-muted">No eligible students for this subject.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {programEligible.map((s) => (
                    <label key={s.student} className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-border-light bg-card cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checkedEligible.includes(s.student)}
                          onChange={() => toggleEligible(s.student)}
                          className="h-4 w-4 rounded border-border-default text-primary accent-primary"
                        />
                        <div>
                          <div className="text-sm font-medium text-text-dark">{s.student}</div>
                          <div className="text-xs text-text-muted">{s.id} · {s.cls} · {s.parent.name}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-end gap-1">
                        {s.failed.map((f) => (
                          <Badge key={f} variant="orange">{f}</Badge>
                        ))}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Fee (₦)" required>
                <TextInput type="number" placeholder="0.00" value={programDraft.fee} onChange={(e) => setProgramDraft((p) => ({ ...p, fee: e.target.value }))} />
              </Field>
              <Field label="Capacity" required>
                <TextInput type="number" placeholder="0" value={programDraft.capacity} onChange={(e) => setProgramDraft((p) => ({ ...p, capacity: e.target.value }))} />
              </Field>
              <Field label="Start Date" required>
                <TextInput type="date" value={programDraft.start} onChange={(e) => setProgramDraft((p) => ({ ...p, start: e.target.value }))} />
              </Field>
              <Field label="End Date" required>
                <TextInput type="date" value={programDraft.end} onChange={(e) => setProgramDraft((p) => ({ ...p, end: e.target.value }))} />
              </Field>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title="Recovery Record"
        subtitle={viewRow ? `${viewRow.student} · ${viewRow.id}` : ""}
        footer={
          <>
            <Button variant="secondary" onClick={() => setViewOpen(false)}>Close</Button>
            <Button onClick={() => openEnrollFor(viewRow?.student ?? "")}>Enroll</Button>
          </>
        }
      >
        {viewRow && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs text-text-muted mb-1">Student</span>
                <span className="text-sm font-medium text-text-dark">{viewRow.student}</span>
              </div>
              <div>
                <span className="block text-xs text-text-muted mb-1">ID</span>
                <span className="text-sm font-medium text-text-dark">{viewRow.id}</span>
              </div>
              <div>
                <span className="block text-xs text-text-muted mb-1">Class</span>
                <span className="text-sm font-medium text-text-dark">{viewRow.cls}</span>
              </div>
              <div>
                <span className="block text-xs text-text-muted mb-1">Status</span>
                <Badge variant={viewRow.status.variant}>{viewRow.status.text}</Badge>
              </div>
            </div>
            <div>
              <span className="block text-xs text-text-muted mb-1.5">Failed Course(s)</span>
              <div className="flex flex-wrap gap-2">
                {viewRow.failed.map((f) => (
                  <Badge key={f} variant="orange">{f}</Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="block text-xs text-text-muted mb-1">Parent Contact</span>
              <p className="text-sm text-text-dark">{viewRow.parent.name} · {viewRow.parent.phone}</p>
            </div>
            <div>
              <span className="block text-xs text-text-muted mb-1">Recovery Plan</span>
              <p className="text-sm text-text-dark">
                Enrolled in the Summer School credit-recovery program. Remediation sessions scheduled and invoice generated.
              </p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={sessionOpen}
        onClose={() => setSessionOpen(false)}
        title="New Summer School Session"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSessionOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSession}>Create Session</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Subject" required>
            <TextInput placeholder="e.g. Mathematics, English" value={sessionName} onChange={(e) => setSessionName(e.target.value)} />
          </Field>
          <SelectField label="Academic Term" required placeholder="Select term" options={["2025/2026 Term 3", "2026/2027 Term 1"]} value={sessionTerm} onChange={(e) => setSessionTerm(e.target.value)} />
          <SelectField label="Capacity" required placeholder="Select capacity" options={["10", "20", "30", "Unlimited"]} value={sessionCapacity} onChange={(e) => setSessionCapacity(e.target.value)} />
          <SelectField label="Enrollment Approval" required placeholder="Select" options={["Automatic", "Requires Approval"]} value={sessionApproval} onChange={(e) => setSessionApproval(e.target.value)} />
          <Field label="Start Date" required>
            <TextInput type="date" value={sessionStart} onChange={(e) => setSessionStart(e.target.value)} />
          </Field>
          <Field label="End Date" required>
            <TextInput type="date" value={sessionEnd} onChange={(e) => setSessionEnd(e.target.value)} />
          </Field>
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}
    </div>
  );
}
