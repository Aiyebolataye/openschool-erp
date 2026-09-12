"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import type { TableRow } from "@/types";
import { Wallet } from "lucide-react";

type PaymentStatus = "Paid" | "Partial" | "Overdue";

interface Payment {
  id: string;
  student: string;
  term: string;
  total: number;
  paid: number;
  method: string;
  status: PaymentStatus;
}

const statusBadge = (s: PaymentStatus) =>
  s === "Paid"
    ? { text: "Paid", variant: "green" as const }
    : s === "Partial"
      ? { text: "Partial", variant: "orange" as const }
      : { text: "Overdue", variant: "red" as const };

const naira = (n: number) => `₦${n.toLocaleString()}`;

const initialPayments: Payment[] = [
  { id: "INV-2401", student: "Chidi Eze", term: "Term 3 2026", total: 695000, paid: 695000, method: "Bank Transfer", status: "Paid" },
  { id: "INV-2400", student: "Tom Wallace", term: "Term 3 2026", total: 695000, paid: 695000, method: "Bank Transfer", status: "Paid" },
  { id: "INV-2398", student: "Ngozi Eze", term: "Term 3 2026", total: 420000, paid: 200000, method: "POS", status: "Partial" },
  { id: "INV-2397", student: "Musa Bello", term: "Term 3 2026", total: 435000, paid: 0, method: "—", status: "Overdue" },
  { id: "INV-2395", student: "Amara Okafor", term: "Term 3 2026", total: 420000, paid: 420000, method: "Bank Transfer", status: "Paid" },
  { id: "INV-2392", student: "Tunde Bakare", term: "Term 2 2026", total: 695000, paid: 400000, method: "Cheque", status: "Partial" },
  { id: "INV-2388", student: "Ibrahim Musa", term: "Term 3 2026", total: 420000, paid: 0, method: "—", status: "Overdue" },
];

const columns = [
  { key: "invoice", label: "INVOICE" },
  { key: "student", label: "STUDENT" },
  { key: "term", label: "TERM" },
  { key: "amount", label: "AMOUNT", align: "right" as const },
  { key: "method", label: "METHOD" },
  { key: "status", label: "STATUS" },
];

const studentNames = [
  "Chidi Eze",
  "Tom Wallace",
  "Ngozi Eze",
  "Amara Okafor",
  "Musa Bello",
  "Tunde Bakare",
  "Ibrahim Musa",
  "Yetunde Balogun",
];

const feeItems = ["Tuition — ₦420,000", "Boarding — ₦250,000", "PTA Levy — ₦5,000", "External Exam Fees — ₦35,000", "Sports Levy — ₦15,000"];

export default function BursarPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [recordOpen, setRecordOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [additional, setAdditional] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [recStudent, setRecStudent] = useState("");
  const [recFee, setRecFee] = useState("");
  const [recAmount, setRecAmount] = useState("");
  const [recMethod, setRecMethod] = useState("");
  const [recDate, setRecDate] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const rows: TableRow[] = payments.map((p) => ({
    invoice: (
      <div>
        <p className="text-sm font-medium text-text-dark">{p.id}</p>
        <p className="text-xs text-text-muted">{p.term}</p>
      </div>
    ),
    student: p.student,
    term: p.term,
    amount: (
      <div className="text-right">
        <p className="text-sm font-semibold text-text-dark">{naira(p.paid)}</p>
        <p className="text-xs text-text-muted">of {naira(p.total)}</p>
      </div>
    ),
    method: p.method,
    status: statusBadge(p.status),
  }));

  const openDetail = (row: TableRow, i: number) => {
    setSelected(payments[i]);
    setAdditional("");
    setDetailOpen(true);
  };

  const saveRecord = () => {
    if (!recStudent || !recFee || !recAmount || !recMethod || !recDate) return;
    const amount = parseInt(recAmount, 10) || 0;
    setPayments((prev) => [
      ...prev,
      {
        id: `INV-${Math.max(...prev.map((p) => parseInt(p.id.slice(4), 10))) + 1}`,
        student: recStudent,
        term: "Term 3 2026",
        total: amount,
        paid: amount,
        method: recMethod,
        status: "Paid",
      },
    ]);
    setRecordOpen(false);
    setRecStudent("");
    setRecFee("");
    setRecAmount("");
    setRecMethod("");
    setRecDate("");
    showToast(`${naira(amount)} recorded from ${recStudent}`);
  };

  const updatePayment = () => {
    if (!selected) return;
    const next = (parseInt(additional, 10) || 0) + selected.paid;
    const status: PaymentStatus = next >= selected.total ? "Paid" : next > 0 ? "Partial" : "Overdue";
    setPayments((prev) => prev.map((p) => (p.id === selected.id ? { ...p, paid: next, status } : p)));
    setSelected({ ...selected, paid: next, status });
    setAdditional("");
    setDetailOpen(false);
    showToast("Payment updated");
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Payments"
        subtitle="Fee payments received across all classes"
        actions={
          <Button onClick={() => setRecordOpen(true)}>
            <Wallet className="w-4 h-4" /> Record Payment
          </Button>
        }
      />

      <DataTable columns={columns} data={rows} onRowClick={openDetail} />

      <Modal
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        title="Record Payment"
        subtitle="Register a fee payment received"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRecordOpen(false)}>Cancel</Button>
            <Button onClick={saveRecord}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Student"
            required
            placeholder="Select student"
            options={studentNames}
            value={recStudent}
            onChange={(e) => setRecStudent(e.target.value)}
          />
          <SelectField
            label="Fee Item"
            required
            placeholder="Select fee item"
            options={feeItems}
            value={recFee}
            onChange={(e) => setRecFee(e.target.value)}
          />
          <Field label="Amount" required>
            <TextInput
              placeholder="₦0.00"
              value={recAmount}
              onChange={(e) => setRecAmount(e.target.value)}
            />
          </Field>
          <SelectField
            label="Method"
            required
            placeholder="Select method"
            options={["Bank Transfer", "POS", "Cash", "Cheque"]}
            value={recMethod}
            onChange={(e) => setRecMethod(e.target.value)}
          />
          <Field label="Date" required>
            <TextInput type="date" value={recDate} onChange={(e) => setRecDate(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.student ?? ""}
        subtitle={selected ? `${selected.id} · ${selected.term}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDetailOpen(false)}>Cancel</Button>
            <Button onClick={updatePayment}>Update</Button>
          </>
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted">Total</p>
                <p className="text-sm font-bold text-text-dark mt-1">{naira(selected.total)}</p>
              </div>
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted">Paid</p>
                <p className="text-sm font-bold text-green mt-1">{naira(selected.paid)}</p>
              </div>
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted">Balance</p>
                <p className="text-sm font-bold text-text-dark mt-1">{naira(selected.total - selected.paid)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border-light p-4">
              <div>
                <p className="text-xs text-text-muted">Method</p>
                <p className="text-sm font-medium text-text-dark">{selected.method}</p>
              </div>
              <Badge variant={statusBadge(selected.status).variant}>{selected.status}</Badge>
            </div>
            {selected.total - selected.paid > 0 && (
              <Field label="Additional Payment">
                <TextInput
                  placeholder="₦0.00"
                  value={additional}
                  onChange={(e) => setAdditional(e.target.value)}
                />
              </Field>
            )}
          </div>
        )}
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}