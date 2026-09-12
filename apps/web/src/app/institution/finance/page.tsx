"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { useState } from "react";

const kpis = [
  { label: "Revenue This Month", value: "₦284K", detail: "+6.2%", detailColor: "green" as const },
  { label: "Outstanding Fees", value: "₦92K", detail: "312 overdue", detailColor: "orange" as const },
  { label: "Fees Configured", value: "12", detail: "", detailColor: "muted" as const },
  { label: "Overdue Invoices", value: "42", detail: "", detailColor: "red" as const },
];

const classOptions = [
  "All Students",
  "JSS1 A",
  "JSS1 B",
  "JSS2 A",
  "JSS2 B",
  "JSS3 A",
  "JSS3 B",
  "SS1 Science",
  "SS1 Art",
  "SS1 Business",
  "SS2 Science",
  "SS2 Art",
  "SS2 Business",
  "SS3 Science",
  "SS3 Art",
  "SS3 Business",
  "Boarding Students Only",
  "Day Students Only",
];

const initialFees = [
  { id: 1, name: "Tuition — SS1 Science", type: "Tuition", typeVariant: "blue" as const, target: "SS1 Science", amount: "₦420", freq: "Per term", notes: "" },
  { id: 2, name: "Tuition — JSS1 A", type: "Tuition", typeVariant: "blue" as const, target: "JSS1 A", amount: "₦380", freq: "Per term", notes: "" },
  { id: 3, name: "Boarding Fee", type: "Boarding", typeVariant: "purple" as const, target: "Boarding Students Only", amount: "₦520", freq: "Per term", notes: "" },
  { id: 4, name: "PTA Levy", type: "Ad-hoc", typeVariant: "orange" as const, target: "All Students", amount: "₦30", freq: "One-time", notes: "" },
  { id: 5, name: "Lab Fee — Science", type: "Ad-hoc", typeVariant: "orange" as const, target: "SS2 Science", amount: "₦45", freq: "Per term", notes: "" },
];

const initialPayments = [
  { id: 1, student: "Chidi Eze", term: "Term 3", total: 420, paid: 420, status: "Clear", statusVariant: "green" as const },
  { id: 2, student: "Amara Okafor", term: "Term 3", total: 420, paid: 300, status: "Partial", statusVariant: "orange" as const },
  { id: 3, student: "Grace Lim", term: "Term 3", total: 120, paid: 0, status: "Overdue", statusVariant: "red" as const },
];

function computePaymentStatus(paid: number, total: number): { text: string; variant: "green" | "orange" | "red" } {
  if (paid >= total) return { text: "Clear", variant: "green" };
  if (paid > 0) return { text: "Partial", variant: "orange" };
  return { text: "Overdue", variant: "red" };
}

function FeeTable({ data, onRowClick }: { data: typeof initialFees; onRowClick: (item: typeof initialFees[number]) => void }) {
  const headers = ["FEE", "TYPE", "APPLIES TO", "AMOUNT", "FREQUENCY"];
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
            {data.map((f) => (
              <tr
                key={f.id}
                onClick={() => onRowClick(f)}
                className="border-b border-border-light last:border-0 hover:bg-surface/50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 text-sm font-medium text-text-dark">{f.name}</td>
                <td className="px-4 py-3"><Badge variant={f.typeVariant}>{f.type}</Badge></td>
                <td className="px-4 py-3 text-sm text-text-muted">{f.target}</td>
                <td className="px-4 py-3 text-sm text-text-dark">{f.amount}</td>
                <td className="px-4 py-3 text-sm text-text-muted">{f.freq}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PaymentTable({ data, onRowClick }: { data: typeof initialPayments; onRowClick: (item: typeof initialPayments[number]) => void }) {
  const headers = ["STUDENT", "TERM", "TOTAL", "PAID", "STATUS", ""];
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-light">
              {headers.map((h) => (
                <th key={h} className={`px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider ${h === "" ? "text-right" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr
                key={p.id}
                onClick={() => onRowClick(p)}
                className="border-b border-border-light last:border-0 hover:bg-surface/50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 text-sm font-medium text-text-dark">{p.student}</td>
                <td className="px-4 py-3 text-sm text-text-muted">{p.term}</td>
                <td className="px-4 py-3 text-sm text-text-dark">₦{p.total}</td>
                <td className="px-4 py-3 text-sm text-text-dark">₦{p.paid}</td>
                <td className="px-4 py-3"><Badge variant={p.statusVariant}>{p.status}</Badge></td>
                <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm">View</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function FinancePage() {
  const [fees, setFees] = useState(initialFees);
  const [payments, setPayments] = useState(initialPayments);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [feeOpen, setFeeOpen] = useState(false);

  const [selectedFee, setSelectedFee] = useState<typeof initialFees[number] | null>(null);
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [feeEditing, setFeeEditing] = useState(false);
  const [feeForm, setFeeForm] = useState({ name: "", type: "", target: "", amount: "", freq: "" });

  const [selectedPayment, setSelectedPayment] = useState<typeof initialPayments[number] | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentPaid, setPaymentPaid] = useState("");

  function handleFeeRowClick(fee: typeof initialFees[number]) {
    setSelectedFee(fee);
    setFeeForm({ name: fee.name, type: fee.type, target: fee.target, amount: fee.amount.replace("₦", ""), freq: fee.freq });
    setFeeEditing(false);
    setFeeModalOpen(true);
  }

  function handleFeeSave() {
    if (!selectedFee) return;
    const amountNum = parseFloat(feeForm.amount);
    const newAmount = isNaN(amountNum) ? selectedFee.amount : `₦${amountNum}`;
    setFees((prev) =>
      prev.map((f) =>
        f.id === selectedFee.id
          ? { ...f, name: feeForm.name, type: feeForm.type, target: feeForm.target, amount: newAmount, freq: feeForm.freq }
          : f
      )
    );
    setFeeEditing(false);
    setFeeModalOpen(false);
  }

  function handlePaymentRowClick(p: typeof initialPayments[number]) {
    setSelectedPayment(p);
    setPaymentPaid(String(p.paid));
    setPaymentModalOpen(true);
  }

  function handlePaymentSave() {
    if (!selectedPayment) return;
    const num = parseFloat(paymentPaid);
    if (isNaN(num)) return;
    const clamped = Math.min(num, selectedPayment.total);
    const newStatus = computePaymentStatus(clamped, selectedPayment.total);
    setPayments((prev) =>
      prev.map((p) =>
        p.id === selectedPayment.id
          ? { ...p, paid: clamped, status: newStatus.text, statusVariant: newStatus.variant }
          : p
      )
    );
    setPaymentModalOpen(false);
  }

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
                <FeeTable data={fees} onRowClick={handleFeeRowClick} />
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
                <PaymentTable data={payments} onRowClick={handlePaymentRowClick} />
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
          <SelectField label="Applies To" required placeholder="Select audience" options={classOptions} />
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

      <Modal
        open={feeModalOpen}
        onClose={() => { setFeeModalOpen(false); setFeeEditing(false); }}
        title={feeEditing ? "Edit Fee" : "Fee Details"}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setFeeModalOpen(false); setFeeEditing(false); }}>Cancel</Button>
            {feeEditing ? (
              <Button onClick={handleFeeSave}>Save Changes</Button>
            ) : (
              <Button onClick={() => setFeeEditing(true)}>Edit</Button>
            )}
          </>
        }
      >
        {selectedFee && (
          <div className="flex flex-col gap-4">
            <Field label="Fee Name">
              <TextInput
                value={feeForm.name}
                onChange={(e) => setFeeForm((p) => ({ ...p, name: e.target.value }))}
                disabled={!feeEditing}
              />
            </Field>
            <SelectField
              label="Fee Type"
              placeholder="Select type"
              options={["Tuition", "Boarding", "Ad-hoc", "PTA", "Exam"]}
              value={feeForm.type}
              onChange={(e) => setFeeForm((p) => ({ ...p, type: e.target.value }))}
              disabled={!feeEditing}
            />
            <SelectField
              label="Applies To"
              placeholder="Select class"
              options={classOptions}
              value={selectedFee.target}
              onChange={(e) => setFeeForm((p) => ({ ...p, target: e.target.value }))}
              disabled={!feeEditing}
            />
            <Field label="Amount">
              <TextInput
                type="number"
                value={feeForm.amount}
                onChange={(e) => setFeeForm((p) => ({ ...p, amount: e.target.value }))}
                disabled={!feeEditing}
              />
            </Field>
            <SelectField
              label="Frequency"
              placeholder="Select frequency"
              options={["Per term", "One-time", "Per session", "Monthly"]}
              value={feeForm.freq}
              onChange={(e) => setFeeForm((p) => ({ ...p, freq: e.target.value }))}
              disabled={!feeEditing}
            />
          </div>
        )}
      </Modal>

      <Modal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Payment Details"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPaymentModalOpen(false)}>Cancel</Button>
            <Button onClick={handlePaymentSave}>Save Changes</Button>
          </>
        }
      >
        {selectedPayment && (
          <div className="flex flex-col gap-4">
            <Field label="Student">
              <TextInput value={selectedPayment.student} disabled />
            </Field>
            <Field label="Term">
              <TextInput value={selectedPayment.term} disabled />
            </Field>
            <Field label="Total">
              <TextInput value={`₦${selectedPayment.total}`} disabled />
            </Field>
            <Field label="Paid Amount (₦)" required>
              <TextInput
                type="number"
                value={paymentPaid}
                onChange={(e) => setPaymentPaid(e.target.value)}
              />
            </Field>
            <Field label="Balance">
              <TextInput
                value={`₦${Math.max(0, selectedPayment.total - parseFloat(paymentPaid || "0"))}`}
                disabled
              />
            </Field>
            <Field label="Status">
              <Badge variant={computePaymentStatus(parseFloat(paymentPaid || "0"), selectedPayment.total).variant}>
                {computePaymentStatus(parseFloat(paymentPaid || "0"), selectedPayment.total).text}
              </Badge>
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}