"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea } from "@/components/ui/form";
import { Chatbox } from "@/components/ui/chatbox";
import { useDiscReports, useDiscCases, uid } from "@/lib/app-store";
import { MessageSquare, Copy, Check } from "lucide-react";
import type { BadgeVariant } from "@/types";

const STUDENTS: Record<string, { name: string; className: string; parent: string; guardianPhone: string; email: string; admission: string; dob: string; arm: string; hostel?: string; hostelAdmin?: string; hostelAdminPhone?: string }> = {
  "STU-21401": { name: "Chidi Eze", className: "SS1 Science", parent: "Mr. Eze", guardianPhone: "+234 801 234 5678", email: "chidi@student.edu", admission: "2024-09-01", dob: "2010-03-12", arm: "Science" },
  "STU-21402": { name: "Amara Okafor", className: "SS2 Science", parent: "Mrs. Okafor", guardianPhone: "+234 802 333 4455", email: "amara@student.edu", admission: "2023-09-01", dob: "2009-07-25", arm: "Science" },
  "STU-21403": { name: "Ngozi Adeyemi", className: "SS1 Science", parent: "Mrs. Adeyemi", guardianPhone: "+234 803 111 2299", email: "ngozi@student.edu", admission: "2024-09-01", dob: "2010-11-02", arm: "Science" },
  "STU-21404": { name: "Tom Wallace", className: "SS3 Science", parent: "Mr. Wallace", guardianPhone: "+234 804 555 6677", email: "tom@student.edu", admission: "2022-09-01", dob: "2008-01-19", arm: "Science", hostel: "Blue House — Boys", hostelAdmin: "Mr. Ba", hostelAdminPhone: "+234 810 222 3344" },
  "STU-21405": { name: "Grace Lim", className: "SS2 Science", parent: "Mrs. Lim", guardianPhone: "+234 805 777 8899", email: "grace@student.edu", admission: "2023-09-01", dob: "2009-05-30", arm: "Science", hostel: "Green House — Girls", hostelAdmin: "Mrs. Obi", hostelAdminPhone: "+234 810 333 4455" },
  "STU-21406": { name: "Omar Farouk", className: "SS3 Art", parent: "Mr. Farouk", guardianPhone: "+234 806 999 1122", email: "omar@student.edu", admission: "2022-09-01", dob: "2008-08-14", arm: "Art", hostel: "Red House — Boys", hostelAdmin: "Mr. Okoye", hostelAdminPhone: "+234 810 555 7788" },
};

const PERFORMANCE: Record<string, { subject: string; ca: number; exam: number }[]> = {
  "STU-21401": [
    { subject: "Biology", ca: 34, exam: 54 },
    { subject: "Chemistry", ca: 31, exam: 49 },
    { subject: "Physics", ca: 29, exam: 46 },
    { subject: "Mathematics", ca: 27, exam: 45 },
    { subject: "English", ca: 23, exam: 37 },
    { subject: "Literature", ca: 19, exam: 30 },
  ],
  "STU-21402": [
    { subject: "Biology", ca: 21, exam: 34 },
    { subject: "Chemistry", ca: 18, exam: 28 },
    { subject: "Physics", ca: 20, exam: 32 },
    { subject: "Mathematics", ca: 30, exam: 48 },
    { subject: "English", ca: 33, exam: 55 },
    { subject: "Literature", ca: 35, exam: 57 },
  ],
  "STU-21403": [
    { subject: "Biology", ca: 28, exam: 44 },
    { subject: "Chemistry", ca: 26, exam: 40 },
    { subject: "Physics", ca: 24, exam: 38 },
    { subject: "Mathematics", ca: 22, exam: 36 },
    { subject: "English", ca: 18, exam: 27 },
    { subject: "Literature", ca: 16, exam: 22 },
  ],
  "STU-21404": [
    { subject: "Biology", ca: 25, exam: 40 },
    { subject: "Chemistry", ca: 27, exam: 43 },
    { subject: "Physics", ca: 30, exam: 50 },
    { subject: "Mathematics", ca: 31, exam: 52 },
    { subject: "English", ca: 26, exam: 40 },
    { subject: "Literature", ca: 24, exam: 39 },
  ],
  "STU-21405": [
    { subject: "Biology", ca: 22, exam: 36 },
    { subject: "Chemistry", ca: 24, exam: 38 },
    { subject: "Physics", ca: 14, exam: 24 },
    { subject: "Mathematics", ca: 26, exam: 44 },
    { subject: "English", ca: 32, exam: 53 },
    { subject: "Literature", ca: 34, exam: 56 },
  ],
  "STU-21406": [
    { subject: "Biology", ca: 16, exam: 26 },
    { subject: "Chemistry", ca: 15, exam: 24 },
    { subject: "Physics", ca: 13, exam: 21 },
    { subject: "Mathematics", ca: 20, exam: 34 },
    { subject: "English", ca: 30, exam: 50 },
    { subject: "Literature", ca: 36, exam: 58 },
  ],
};

const FALLBACK_PERFORMANCE = [
  { subject: "Biology", ca: 25, exam: 40 },
  { subject: "Chemistry", ca: 23, exam: 36 },
  { subject: "Physics", ca: 21, exam: 34 },
  { subject: "Mathematics", ca: 26, exam: 42 },
  { subject: "English", ca: 30, exam: 48 },
  { subject: "Literature", ca: 28, exam: 44 },
];

function perfGrade(total: number): { letter: string; variant: BadgeVariant; remark: string } {
  if (total >= 70) return { letter: "A", variant: "green", remark: "Excellent" };
  if (total >= 60) return { letter: "B", variant: "blue", remark: "Very Good" };
  if (total >= 50) return { letter: "C", variant: "purple", remark: "Good" };
  if (total >= 45) return { letter: "D", variant: "orange", remark: "Pass" };
  if (total >= 40) return { letter: "E", variant: "muted", remark: "Pass" };
  return { letter: "F", variant: "red", remark: "Fail" };
}

export default function StudentProfilePage() {
  const { studentId } = useParams<{ studentId: string }>();
  const student = STUDENTS[studentId] ?? { name: "Student", className: "—", parent: "Guardian", guardianPhone: "—", email: "—", admission: "—", dob: "—", arm: "—" };
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const copyPhone = () => {
    navigator.clipboard.writeText(student.guardianPhone).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [reports, setReports] = useDiscReports();
  const [cases] = useDiscCases();

  const studentCases = cases.filter((c) => c.studentId === studentId);
  const studentReports = reports.filter((r) => r.studentId === studentId);

  const perfRows = PERFORMANCE[studentId] ?? FALLBACK_PERFORMANCE;

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  const fileReport = () => {
    if (!reportReason) return;
    setReports((prev) => [
      ...prev,
      {
        id: uid(),
        studentName: student.name,
        studentId,
        className: student.className,
        reason: reportReason,
        details: reportDetails,
        reportedBy: "Dr. Okon",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        status: "pending",
      },
    ]);
    setReportOpen(false);
    setReportReason("");
    setReportDetails("");
  };

  return (
    <div className="max-w-[1000px] mx-auto">
      <PageHeader
        title={student.name}
        subtitle={`${student.className} · Student ID ${studentId}`}
        actions={
          <div className="flex items-center gap-3">
            <Link href="/student" target="_blank"><Button variant="secondary" size="sm">Student Portal</Button></Link>
            <Link href="/parent" target="_blank"><Button variant="secondary" size="sm">Parent Portal</Button></Link>
            <Button variant="secondary" onClick={() => setReportOpen(true)}>Report to Principal</Button>
            <Link href="/teacher/classroom"><Button>Back to Classroom</Button></Link>
          </div>
        }
      />

      {/* Student info strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="flex items-center gap-3 rounded-xl border border-border-light bg-card p-4 col-span-2">
          <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
            <span className="text-primary text-lg font-bold">{student.name[0]}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-dark">{student.name}</p>
            <p className="text-xs text-text-muted">{student.className} · {student.arm} arm</p>
          </div>
        </div>
        <Card className="p-4">
          <p className="text-[11px] text-text-muted mb-1">Guardian</p>
          <p className="text-sm font-semibold text-text-dark">{student.parent}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-text-muted">{student.guardianPhone}</p>
            <button onClick={copyPhone} className="text-text-muted hover:text-primary" title="Copy phone number">
              {copied ? <Check className="w-3.5 h-3.5 text-green" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setChatOpen(true)}>
            <MessageSquare className="w-3.5 h-3.5" /> Message
          </Button>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] text-text-muted mb-1">Date of Birth</p>
          <p className="text-sm font-semibold text-text-dark">{student.dob}</p>
          <p className="text-xs text-text-muted mt-0.5">Admitted {student.admission}</p>
        </Card>
      </div>

      {/* Hostel details for boarding students */}
      {student.hostel && (
        <Card className="p-4 mb-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="blue">Boarding Student</Badge>
              <h3 className="text-sm font-semibold text-text-dark">Hostel Assignment</h3>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] text-text-muted mb-1">Hostel</p>
              <p className="text-sm font-semibold text-text-dark">{student.hostel}</p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted mb-1">Hostel Admin / Warden</p>
              <p className="text-sm font-semibold text-text-dark">{student.hostelAdmin}</p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted mb-1">Contact</p>
              <p className="text-sm font-semibold text-text-dark">{student.hostelAdminPhone}</p>
            </div>
          </div>
        </Card>
      )}

      <Tabs
        tabs={[
          {
            id: "overview",
            label: "Overview",
            content: (
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-text-dark mb-3">Personal Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-text-muted">Full Name</span><span className="font-medium text-text-dark">{student.name}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Student ID</span><span className="font-medium text-text-dark">{studentId}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Class</span><span className="font-medium text-text-dark">{student.className}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Arm</span><span className="font-medium text-text-dark">{student.arm}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Date of Birth</span><span className="font-medium text-text-dark">{student.dob}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Admission Date</span><span className="font-medium text-text-dark">{student.admission}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Email</span><span className="font-medium text-text-dark">{student.email}</span></div>
                  </div>
                </Card>
                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-text-dark mb-3">Guardian / Family</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-text-muted">Parent / Guardian</span><span className="font-medium text-text-dark">{student.parent}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Phone</span><span className="font-medium text-text-dark">{student.guardianPhone}</span></div>
                  </div>
                  <div className="mt-4 rounded-lg bg-surface p-3">
                    <p className="text-xs text-text-muted">Disciplinary cases</p>
                    <p className="text-sm font-bold text-text-dark mt-1">{studentCases.filter((c) => c.status === "open").length} open</p>
                  </div>
                </Card>
              </div>
            ),
          },
          {
            id: "performance",
            label: "Performance",
            content: (
              <Card className="overflow-hidden">
                <div className="px-5 py-4 border-b border-border-light">
                  <h3 className="text-sm font-semibold text-text-dark">Term 3 Results</h3>
                  <p className="text-xs text-text-muted mt-0.5">Subject scores & performance for {student.name}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface text-left text-[11px] uppercase tracking-wide text-text-muted">
                        <th className="px-5 py-2.5 font-semibold">Subject</th>
                        <th className="px-5 py-2.5 font-semibold">CA Score</th>
                        <th className="px-5 py-2.5 font-semibold">Exam Score</th>
                        <th className="px-5 py-2.5 font-semibold">Total</th>
                        <th className="px-5 py-2.5 font-semibold">Grade</th>
                        <th className="px-5 py-2.5 font-semibold">Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                      {perfRows.map((row) => {
                        const total = row.ca + row.exam;
                        const grade = perfGrade(total);
                        return (
                          <tr key={row.subject} className="hover:bg-surface/50">
                            <td className="px-5 py-3 font-medium text-text-dark">{row.subject}</td>
                            <td className="px-5 py-3 text-text-dark">{row.ca}/40</td>
                            <td className="px-5 py-3 text-text-dark">{row.exam}/60</td>
                            <td className="px-5 py-3 font-semibold text-text-dark">{total}/100</td>
                            <td className="px-5 py-3"><Badge variant={grade.variant}>{grade.letter}</Badge></td>
                            <td className="px-5 py-3 text-text-dark">{grade.remark}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            ),
          },
          {
            id: "discipline",
            label: "Discipline",
            content: (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button variant="secondary" onClick={() => setReportOpen(true)}>Report to Principal</Button>
                </div>
                <Card className="divide-y divide-border-light">
                  {studentCases.length === 0 && (
                    <p className="px-5 py-8 text-center text-sm text-text-muted">No disciplinary cases on record.</p>
                  )}
                  {studentCases.map((c) => (
                    <div key={c.id} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-text-dark">{c.reason}</p>
                        <p className="text-xs text-text-muted mt-0.5">Opened {c.date} · Global case</p>
                      </div>
                      <Badge variant={c.status === "open" ? "orange" : "green"}>{c.status === "open" ? "Open" : "Resolved"}</Badge>
                    </div>
                  ))}
                </Card>
                <Card className="divide-y divide-border-light">
                  <div className="px-5 py-3">
                    <h3 className="text-sm font-semibold text-text-dark">Your Reports to the Principal</h3>
                  </div>
                  {studentReports.length === 0 && (
                    <p className="px-5 py-6 text-center text-sm text-text-muted">No reports submitted.</p>
                  )}
                  {studentReports.map((r) => (
                    <div key={r.id} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-text-dark">{r.reason}</p>
                        <p className="text-xs text-text-muted mt-0.5">{r.date}</p>
                      </div>
                      <Badge variant={r.status === "pending" ? "orange" : r.status === "approved" ? "green" : "red"}>
                        {r.status === "pending" ? "Pending Review" : r.status === "approved" ? "Approved → Case" : "Rejected"}
                      </Badge>
                    </div>
                  ))}
                </Card>
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Report Student to Principal"
        subtitle={`File a report against ${student.name}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReportOpen(false)}>Cancel</Button>
            <Button onClick={fileReport}>Submit Report</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Reason" required>
            <TextInput placeholder="e.g. Repeated tardiness, disruptive behaviour" value={reportReason} onChange={(e) => setReportReason(e.target.value)} />
          </Field>
          <Field label="Details" required>
            <TextArea rows={4} placeholder="Describe what happened..." value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} />
          </Field>
        </div>
      </Modal>
      {/* Chat modal for guardian */}
      <Modal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title={`Message ${student.parent}`}
        subtitle={`Parent of ${student.name}`}
      >
        <Chatbox
          title={student.parent}
          subtitle={`Parent of ${student.name} · ${student.className}`}
          initial={[]}
        />
      </Modal>
    </div>
  );
}
