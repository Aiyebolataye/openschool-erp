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
import { useState } from "react";

const kpis = [
  { label: "Flagged for Credit Recovery", value: "34", detail: "", detailColor: "orange" as const },
  { label: "Enrolled in Summer School", value: "18", detail: "", detailColor: "green" as const },
  { label: "Fee Collected", value: "$9,200", detail: "of $18,400", detailColor: "muted" as const },
  { label: "Waiting List", value: "6", detail: "", detailColor: "blue" as const },
];

const recovery = [
  { student: "Tom Wallace", id: "STU-21403", cls: "SS3 Art", failed: "Mathematics, Physics", status: { text: "Flagged", variant: "orange" as const }, action: "Enroll" },
  { student: "Grace Lim", id: "STU-21404", cls: "SS2 Science", failed: "Chemistry", status: { text: "Flagged", variant: "orange" as const }, action: "Enroll" },
  { student: "Daniel Smith", id: "STU-21405", cls: "JSS1 A", failed: "English", status: { text: "Enrolled", variant: "green" as const }, action: "View" },
  { student: "Amara Okafor", id: "STU-21402", cls: "JSS2 B", failed: "Mathematics", status: { text: "Enrolled", variant: "green" as const }, action: "View" },
];

const program = [
  { title: "SS3 Math Remediation", group: "Group A", students: "12", capacity: "20", fee: "$400", schedule: "Aug 3 – Aug 28", status: { text: "Active", variant: "green" as const } },
  { title: "SS2 Chemistry Recovery", group: "Group B", students: "10", capacity: "20", fee: "$350", schedule: "Aug 3 – Aug 28", status: { text: "Active", variant: "green" as const } },
  { title: "JSS English Boost", group: "Group C", students: "8", capacity: "20", fee: "$300", schedule: "Aug 10 – Aug 30", status: { text: "Scheduled", variant: "orange" as const } },
];

const payments = [
  { payment: "INV-2201", student: "Daniel Smith", amount: "$400", method: { text: "Paid", variant: "green" as const }, plan: "One-time", date: "Jul 28, 2026" },
  { payment: "INV-2202", student: "Amara Okafor", amount: "$175", method: { text: "Installment 1/2", variant: "blue" as const }, plan: "Installments", date: "Jul 29, 2026" },
  { payment: "INV-2203", student: "Grace Lim", amount: "$350", method: { text: "Paid", variant: "green" as const }, plan: "One-time", date: "Jul 30, 2026" },
];

const recoveryColumns = [
  { key: "student", label: "STUDENT", width: "130px" },
  { key: "id", label: "ID", width: "105px" },
  { key: "cls", label: "CLASS", width: "110px" },
  { key: "failed", label: "FAILED COURSE(S)", width: "170px" },
  { key: "status", label: "STATUS", width: "90px" },
  { key: "action", label: "", width: "70px", align: "right" as const },
];

const programColumns = [
  { key: "title", label: "GROUP", width: "180px" },
  { key: "group", label: "NAME", width: "90px" },
  { key: "students", label: "STUDENTS", width: "90px", align: "center" as const },
  { key: "capacity", label: "CAPACITY", width: "90px", align: "center" as const },
  { key: "fee", label: "FEE", width: "80px" },
  { key: "schedule", label: "SCHEDULE", width: "130px" },
  { key: "status", label: "STATUS", width: "90px" },
];

const paymentColumns = [
  { key: "payment", label: "INVOICE", width: "100px" },
  { key: "student", label: "STUDENT", width: "120px" },
  { key: "amount", label: "AMOUNT", width: "90px" },
  { key: "method", label: "METHOD", width: "110px" },
  { key: "plan", label: "PLAN", width: "110px" },
  { key: "date", label: "DATE", width: "110px" },
];

export default function SummerSchoolPage() {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Summer School & Credit Recovery"
        subtitle="Students who fail courses can pay and enroll in Summer School to recover credits"
        actions={
          <>
            <Button variant="secondary" onClick={() => setSessionOpen(true)}>+ New Session</Button>
            <Button onClick={() => setEnrollOpen(true)}>+ Enroll Student</Button>
          </>
        }
      />

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
                <p className="text-xs text-text-muted">
                  Students flagged for failing a course are offered a paid Summer School credit-recovery plan. Enroll them to schedule remediation, generate an invoice, and track completion.
                </p>
                <DataTable columns={recoveryColumns} data={recovery} />
              </div>
            ),
          },
          {
            id: "program",
            label: "Summer School Program",
            content: (
              <div className="space-y-4">
                <p className="text-xs text-text-muted">
                  Remediation groups run as a Summer School Program with capacity limits, waiting lists, and automatic invoice generation.
                </p>
                <DataTable columns={programColumns} data={program} />
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
            <Button onClick={() => setEnrollOpen(false)}>Enroll & Generate Invoice</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Student" required placeholder="Select student" options={["Tom Wallace", "Grace Lim", "Chidi Eze", "Omar Farouk"]} />
          <SelectField label="Failed Course(s)" required placeholder="Select course(s)" options={["Mathematics", "Physics", "Chemistry", "English", "Biology"]} />
          <SelectField label="Remediation Group" required placeholder="Select group" options={["Group A – SS3 Math", "Group B – SS2 Chemistry", "Group C – JSS English"]} />
          <Field label="Start Date" required>
            <TextInput type="date" />
          </Field>
          <Field label="End Date" required>
            <TextInput type="date" />
          </Field>
          <SelectField label="Fee Plan" required placeholder="Select plan" options={["One-time — $400", "Installments (2 × $200)", "Recurring weekly"]} />
          <Field label="Amount" required>
            <TextInput type="number" placeholder="0.00" />
          </Field>
          <Field label="Notes">
            <TextArea rows={3} placeholder="Optional assessment notes" />
          </Field>
        </div>
      </Modal>

      <Modal
        open={sessionOpen}
        onClose={() => setSessionOpen(false)}
        title="New Summer School Session"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSessionOpen(false)}>Cancel</Button>
            <Button onClick={() => setSessionOpen(false)}>Create Session</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Session Name" required>
            <TextInput placeholder="e.g. 2026 Summer Credit Recovery" />
          </Field>
          <SelectField label="Academic Term" required placeholder="Select term" options={["2025/2026 Term 3", "2026/2027 Term 1"]} />
          <SelectField label="Capacity" required placeholder="Select capacity" options={["10", "20", "30", "Unlimited"]} />
          <SelectField label="Enrollment Approval" required placeholder="Select" options={["Automatic", "Requires Approval"]} />
          <Field label="Start Date" required>
            <TextInput type="date" />
          </Field>
          <Field label="End Date" required>
            <TextInput type="date" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
