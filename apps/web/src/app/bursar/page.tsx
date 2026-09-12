"use client";

import { useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import { Wallet, FileText, ChevronRight } from "lucide-react";

const kpis = [
  { label: "Revenue This Month", value: "₦2,850,000", detail: "+12% vs last month", detailColor: "green" as const },
  { label: "Outstanding Fees", value: "₦1,240,000", detail: "across 34 students", detailColor: "orange" as const },
  { label: "Fee Collection Rate", value: "87%", detail: "+3% this term", detailColor: "green" as const },
  { label: "Invoices Issued", value: "128", detail: "this term", detailColor: "blue" as const },
  { label: "Expenses This Month", value: "₦680,000", detail: "9 approved", detailColor: "muted" as const },
  { label: "Overdue Count", value: "23", detail: "₦480,000 owed", detailColor: "red" as const },
];

const recentPayments = [
  { id: "INV-2401", student: "Chidi Eze", klass: "SS2 Science", amount: "₦695,000", method: "Bank Transfer", status: { text: "Paid", variant: "green" as const } },
  { id: "INV-2400", student: "Tom Wallace", klass: "SS3 Art", amount: "₦695,000", method: "Bank Transfer", status: { text: "Paid", variant: "green" as const } },
  { id: "INV-2398", student: "Ngozi Eze", klass: "JSS3 A", amount: "₦200,000", method: "POS", status: { text: "Partial", variant: "orange" as const } },
  { id: "INV-2395", student: "Amara Okafor", klass: "SS2 Science", amount: "₦420,000", method: "Bank Transfer", status: { text: "Paid", variant: "green" as const } },
  { id: "INV-2392", student: "Tunde Bakare", klass: "SS1 Science", amount: "₦400,000", method: "Cheque", status: { text: "Partial", variant: "orange" as const } },
];

type RecentPayment = (typeof recentPayments)[number];

const overdueFees = [
  { id: "INV-2397", student: "Musa Bello", klass: "SS2 Science", amount: "₦435,000", days: "21 days overdue", status: { text: "Overdue", variant: "red" as const } },
  { id: "INV-2388", student: "Ibrahim Musa", klass: "SS3 Art", amount: "₦420,000", days: "14 days overdue", status: { text: "Overdue", variant: "red" as const } },
  { id: "INV-2381", student: "Yetunde Balogun", klass: "JSS2 B", amount: "₦250,000", days: "9 days overdue", status: { text: "Overdue", variant: "red" as const } },
  { id: "INV-2376", student: "Ada Obi", klass: "JSS2 B", amount: "₦180,000", days: "6 days overdue", status: { text: "Overdue", variant: "red" as const } },
];

type Overdue = (typeof overdueFees)[number];

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

export default function BursarDashboardPage() {
  const [recordOpen, setRecordOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [paymentDetailOpen, setPaymentDetailOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<RecentPayment | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [rpStudent, setRpStudent] = useState("");
  const [rpFee, setRpFee] = useState("");
  const [rpAmount, setRpAmount] = useState("");
  const [rpMethod, setRpMethod] = useState("");
  const [rpDate, setRpDate] = useState("");

  const [invStudent, setInvStudent] = useState("");
  const [invItems, setInvItems] = useState<string[]>([]);
  const [invDate, setInvDate] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleInvoiceItem = (item: string) => {
    setInvItems((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  const saveRecordPayment = () => {
    if (!rpStudent || !rpFee || !rpAmount || !rpMethod || !rpDate) return;
    setRecordOpen(false);
    setRpStudent("");
    setRpFee("");
    setRpAmount("");
    setRpMethod("");
    setRpDate("");
    showToast("Payment recorded");
  };

  const saveIssueInvoice = () => {
    if (!invStudent || invItems.length === 0 || !invDate) return;
    setInvoiceOpen(false);
    setInvStudent("");
    setInvItems([]);
    setInvDate("");
    showToast(`Invoice issued to ${invStudent}`);
  };

  const openPayment = (p: RecentPayment) => {
    setSelectedPayment(p);
    setPaymentDetailOpen(true);
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Bursary Overview"
        subtitle="Fee collections, invoices and expenses · Term 3 2026"
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="p-5 mb-6">
        <h3 className="text-sm font-semibold text-text-dark mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setRecordOpen(true)}>
            <Wallet className="w-4 h-4" /> Record Payment
          </Button>
          <Button variant="secondary" onClick={() => setInvoiceOpen(true)}>
            <FileText className="w-4 h-4" /> Issue Invoice
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-text-dark mb-2">Recent Payments</h3>
          <Card className="divide-y divide-border-light">
            {recentPayments.map((p) => (
              <button
                key={p.id}
                onClick={() => openPayment(p)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-surface/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-dark">{p.student}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {p.id} · {p.method}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-dark">{p.amount}</p>
                    <p className="text-[10px] text-text-muted">{p.klass}</p>
                  </div>
                  <Badge variant={p.status.variant}>{p.status.text}</Badge>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
              </button>
            ))}
            <Link
              href="/bursar/payments"
              className="block text-center text-xs font-medium text-primary hover:underline py-3"
            >
              View all payments →
            </Link>
          </Card>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-dark mb-2">Overdue Fees</h3>
          <Card className="divide-y divide-border-light">
            {overdueFees.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-dark truncate">{o.student}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {o.klass} · {o.days}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="text-sm font-semibold text-text-dark">{o.amount}</p>
                  <Badge variant={o.status.variant}>{o.status.text}</Badge>
                </div>
              </div>
            ))}
            <Link
              href="/bursar/invoices"
              className="block text-center text-xs font-medium text-primary hover:underline py-3"
            >
              View all invoices →
            </Link>
          </Card>
        </div>
      </div>

      <Modal
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        title="Record Payment"
        subtitle="Register a fee payment received"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRecordOpen(false)}>Cancel</Button>
            <Button onClick={saveRecordPayment}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Student"
            required
            placeholder="Select student"
            options={studentNames}
            value={rpStudent}
            onChange={(e) => setRpStudent(e.target.value)}
          />
          <SelectField
            label="Fee Item"
            required
            placeholder="Select fee item"
            options={feeItems}
            value={rpFee}
            onChange={(e) => setRpFee(e.target.value)}
          />
          <Field label="Amount" required>
            <TextInput
              placeholder="₦0.00"
              value={rpAmount}
              onChange={(e) => setRpAmount(e.target.value)}
            />
          </Field>
          <SelectField
            label="Method"
            required
            placeholder="Select method"
            options={["Bank Transfer", "POS", "Cash", "Cheque"]}
            value={rpMethod}
            onChange={(e) => setRpMethod(e.target.value)}
          />
          <Field label="Date" required>
            <TextInput type="date" value={rpDate} onChange={(e) => setRpDate(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        title="Issue Invoice"
        subtitle="Raise a fee invoice for a student"
        footer={
          <>
            <Button variant="secondary" onClick={() => setInvoiceOpen(false)}>Cancel</Button>
            <Button onClick={saveIssueInvoice}>Issue Invoice</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Student"
            required
            placeholder="Select student"
            options={studentNames}
            value={invStudent}
            onChange={(e) => setInvStudent(e.target.value)}
          />
          <Field label="Fee Items" required>
            <div className="flex flex-col gap-2">
              {feeItems.map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm text-text-dark">
                  <input
                    type="checkbox"
                    checked={invItems.includes(item)}
                    onChange={() => toggleInvoiceItem(item)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  {item}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Date" required>
            <TextInput type="date" value={invDate} onChange={(e) => setInvDate(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={paymentDetailOpen}
        onClose={() => setPaymentDetailOpen(false)}
        title={selectedPayment?.student ?? ""}
        subtitle={selectedPayment ? `${selectedPayment.id} · ${selectedPayment.klass}` : undefined}
        footer={
          <Button variant="secondary" onClick={() => setPaymentDetailOpen(false)}>Close</Button>
        }
      >
        {selectedPayment && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border-light p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Payment received</p>
                <p className="text-lg font-bold text-text-dark">{selectedPayment.amount}</p>
              </div>
              <Badge variant={selectedPayment.status.variant}>{selectedPayment.status.text}</Badge>
            </div>
            <p className="text-sm text-text-dark">
              {selectedPayment.student} paid {selectedPayment.amount} by{" "}
              <span className="font-medium">{selectedPayment.method}</span> for {selectedPayment.klass}.
            </p>
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