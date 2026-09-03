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
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { Chatbox } from "@/components/ui/chatbox";
import { useDiscReports, useDiscCases, uid } from "@/lib/app-store";

const STUDENTS: Record<string, { name: string; className: string; parent: string; guardianPhone: string; email: string; admission: string; dob: string; arm: string }> = {
  "STU-21401": { name: "Chidi Eze", className: "SS1 Science", parent: "Mr. Eze", guardianPhone: "+234 801 234 5678", email: "chidi@student.edu", admission: "2024-09-01", dob: "2010-03-12", arm: "Science" },
  "STU-21402": { name: "Amara Okafor", className: "SS2 Science", parent: "Mrs. Okafor", guardianPhone: "+234 802 333 4455", email: "amara@student.edu", admission: "2023-09-01", dob: "2009-07-25", arm: "Science" },
  "STU-21403": { name: "Ngozi Adeyemi", className: "SS1 Science", parent: "Mrs. Adeyemi", guardianPhone: "+234 803 111 2299", email: "ngozi@student.edu", admission: "2024-09-01", dob: "2010-11-02", arm: "Science" },
  "STU-21404": { name: "Tom Wallace", className: "SS3 Science", parent: "Mr. Wallace", guardianPhone: "+234 804 555 6677", email: "tom@student.edu", admission: "2022-09-01", dob: "2008-01-19", arm: "Science" },
  "STU-21405": { name: "Grace Lim", className: "SS2 Science", parent: "Mrs. Lim", guardianPhone: "+234 805 777 8899", email: "grace@student.edu", admission: "2023-09-01", dob: "2009-05-30", arm: "Science" },
};

export default function StudentProfilePage() {
  const { studentId } = useParams<{ studentId: string }>();
  const student = STUDENTS[studentId] ?? { name: "Student", className: "—", parent: "Guardian", guardianPhone: "—", email: "—", admission: "—", dob: "—", arm: "—" };

  const [reports, setReports] = useDiscReports();
  const [cases] = useDiscCases();

  const studentCases = cases.filter((c) => c.studentId === studentId);
  const studentReports = reports.filter((r) => r.studentId === studentId);

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
          <p className="text-xs text-text-muted mt-0.5">{student.guardianPhone}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] text-text-muted mb-1">Date of Birth</p>
          <p className="text-sm font-semibold text-text-dark">{student.dob}</p>
          <p className="text-xs text-text-muted mt-0.5">Admitted {student.admission}</p>
        </Card>
      </div>

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
                    <div className="flex justify-between"><span className="text-text-muted">Arm</span><span className="font-medium text-text-dark">{student.arm}</span></div>
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
            id: "communication",
            label: "Message Parents",
            content: (
              <Chatbox
                title={student.parent}
                subtitle={`Parent of ${student.name} · ${student.className}`}
                initial={[
                  { from: "them", text: `Good morning, I'm ${student.parent}, ${student.name}'s parent.`, time: "8:05 AM" },
                  { from: "me", text: `Good morning! ${student.name} has been doing well in Biology recently.`, time: "8:12 AM" },
                ]}
              />
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
          <SelectField label="Reason" required options={["Repeated tardiness", "Disruptive behaviour", "Bullying", "Suspected substance use", "Unauthorized absence", "Academic misconduct", "Other"]} value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Select reason" />
          <Field label="Details" required>
            <TextArea rows={4} placeholder="Describe what happened..." value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
