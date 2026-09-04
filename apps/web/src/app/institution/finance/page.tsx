"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { useState } from "react";

const kpis = [
  { label: "Revenue This Month", value: "$284K", detail: "+6.2%", detailColor: "green" as const },
  { label: "Outstanding Fees", value: "$92K", detail: "312 overdue", detailColor: "orange" as const },
  { label: "Fees Configured", value: "12", detail: "", detailColor: "muted" as const },
  { label: "Overdue Invoices", value: "42", detail: "", detailColor: "red" as const },
];

const fees = [
  { name: "Tuition — SS1", type: { text: "Tuition", variant: "blue" as const }, target: "SS1 (Science, Art, Business)", amount: "$420", freq: "Per term", status: { text: "Active", variant: "green" as const } },
  { name: "Tuition — JSS1", type: { text: "Tuition", variant: "blue" as const }, target: "JSS1 (A, B)", amount: "$380", freq: "Per term", status: { text: "Active", variant: "green" as const } },
  { name: "Boarding Fee", type: { text: "Boarding", variant: "purple" as const }, target: "Boarding students", amount: "$520", freq: "Per term", status: { text: "Active", variant: "green" as const } },
  { name: "PTA Levy", type: { text: "Ad-hoc", variant: "orange" as const }, target: "All students", amount: "$30", freq: "One-time", status: { text: "Active", variant: "green" as const } },
  { name: "Lab Fee — Science", type: { text: "Ad-hoc", variant: "orange" as const }, target: "SS Science classes", amount: "$45", freq: "Per term", status: { text: "Draft", variant: "muted" as const } },
];

const payments = [
  { student: "Chidi Eze", term: "Term 3", total: "$420", paid: "$420", status: { text: "Clear", variant: "green" as const }, actions: "View" },
  { student: "Amara Okafor", term: "Term 3", total: "$420", paid: "$300", status: { text: "Partial", variant: "orange" as const }, actions: "View" },
  { student: "Grace Lim", term: "Term 3", total: "$120", paid: "$0", status: { text: "Overdue", variant: "red" as const }, actions: "View" },
];

const feeColumns = [
  { key: "name", label: "FEE", width: "140px" },
  { key: "type", label: "TYPE", width: "90px" },
  { key: "target", label: "APPLIES TO", width: "200px" },
  { key: "amount", label: "AMOUNT", width: "90px" },
  { key: "freq", label: "FREQUENCY", width: "100px" },
  { key: "status", label: "STATUS", width: "90px" },
];

const paymentColumns = [
  { key: "student", label: "STUDENT", width: "140px" },
  { key: "term", label: "TERM", width: "90px" },
  { key: "total", label: "TOTAL", width: "90px" },
  { key: "paid", label: "PAID", width: "90px" },
  { key: "status", label: "STATUS", width: "90px" },
  { key: "actions", label: "ACTIONS", width: "70px", align: "right" as const },
];

const classTuition = [
  { cls: "JSS1 (A, B)", amount: "$380" },
  { cls: "JSS2 (A, B)", amount: "$400" },
  { cls: "JSS3 (A, B)", amount: "$400" },
  { cls: "SS1", amount: "$420" },
  { cls: "SS2", amount: "$440" },
  { cls: "SS3", amount: "$440" },
];

function ClassTuitionTable() {
  return (
    <Card className="divide-y divide-border-light">
      {classTuition.map((c) => (
        <div key={c.cls} className="flex items-center justify-between px-5 py-4">
          <p className="text-sm font-medium text-text-dark">{c.cls}</p>
          <p className="text-sm text-text-muted">{c.amount} / term</p>
        </div>
      ))}
    </Card>
  );
}

export default function FinancePage() {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [feeOpen, setFeeOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Finance"
        subtitle="Manage fees, payments, and student invoices"
        actions={
          <>
            <Button variant="secondary" onClick={() => setPaymentOpen(true)}>+ Record Payment</Button>
            <Button onClick={() => setFeeOpen(true)}>+ Add Fee</Button>
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
            id: "fees",
            label: "Fee Structure",
            content: (
              <div className="space-y-4">
                <p className="text-xs text-text-muted">
                  Configure fees and target who they apply to. Tuition can differ per class, and new / ad-hoc fees can be added and attached to all students, specific classes, or boarding/day students only.
                </p>
                <DataTable columns={feeColumns} data={fees} />
              </div>
            ),
          },
          {
            id: "classTuition",
            label: "Class Tuition",
            content: (
              <div className="space-y-4">
                <p className="text-xs text-text-muted">Base tuition per class. These amounts are applied when the applicable tuition fee is billed.</p>
                <ClassTuitionTable />
              </div>
            ),
          },
          {
            id: "payments",
            label: "Payments",
            content: (
              <div className="space-y-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Select options={[{ label: "All Terms", value: "all" }]} placeholder="All Terms" />
                    <Select options={[{ label: "All Statuses", value: "all" }]} placeholder="All Statuses" />
                  </div>
                </Card>
                <DataTable columns={paymentColumns} data={payments} />
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Record Payment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPaymentOpen(false)}>Cancel</Button>
            <Button onClick={() => setPaymentOpen(false)}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Student" required placeholder="Select student" options={["Chidi Eze", "Amara Okafor", "Grace Lim", "Tom Wallace", "Daniel Smith"]} />
          <SelectField label="Fee Item" required placeholder="Select fee item" options={["Tuition", "Boarding", "PTA", "Exam", "Lab Fee"]} />
          <Field label="Amount" required>
            <TextInput type="number" placeholder="0.00" />
          </Field>
          <SelectField label="Payment Method" required placeholder="Select method" options={["Cash", "Card", "Transfer"]} />
          <Field label="Date" required>
            <TextInput type="date" />
          </Field>
          <Field label="Receipt Note">
            <TextInput placeholder="Optional note" />
          </Field>
        </div>
      </Modal>

      <Modal
        open={feeOpen}
        onClose={() => setFeeOpen(false)}
        title="Add Fee"
        subtitle="Define a fee and choose who it applies to"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFeeOpen(false)}>Cancel</Button>
            <Button onClick={() => setFeeOpen(false)}>Save Fee</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Fee Name" required>
            <TextInput placeholder="e.g. Tuition, Boarding, Lab Fee" />
          </Field>
          <SelectField label="Fee Type" required placeholder="Select type" options={["Tuition", "Boarding", "Ad-hoc", "PTA", "Exam"]} />
          <SelectField label="Applies To" required placeholder="Select audience" options={["All Students", "Specific Class / Classes", "Boarding Students Only", "Day Students Only"]} />
          <SelectField label="Class (if applying to a class)" placeholder="Select class" options={["JSS1 A", "JSS1 B", "JSS2 B", "SS1 Science", "SS1 Art", "SS1 Business", "SS2", "SS3"]} />
          <Field label="Amount" required>
            <TextInput type="number" placeholder="0.00" />
          </Field>
          <SelectField label="Frequency" required placeholder="Select frequency" options={["Per term", "One-time", "Per session", "Monthly"]} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-dark">Notification Channels</label>
            <div className="flex items-center gap-5">
              <label className="flex items-center gap-2 text-sm text-text-dark cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded border-border-default text-primary accent-primary" defaultChecked={false} />
                Email
              </label>
              <label className="flex items-center gap-2 text-sm text-text-dark cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded border-border-default text-primary accent-primary" defaultChecked={false} />
                SMS
              </label>
              <label className="flex items-center gap-2 text-sm text-text-dark cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded border-border-default text-primary accent-primary" defaultChecked />
                WhatsApp
              </label>
            </div>
            <p className="text-xs text-text-muted">Parents will be notified about this fee via the selected channels</p>
          </div>
          <Field label="Notes">
            <TextArea rows={2} placeholder="Optional notes about this fee" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
