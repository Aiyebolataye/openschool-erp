"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import type { TableRow } from "@/types";
import { FileText, BellRing } from "lucide-react";

type InvoiceStatus = "Issued" | "Paid" | "Overdue";

interface Invoice {
  id: string;
  student: string;
  items: string[];
  total: number;
  status: InvoiceStatus;
  date: string;
}

const statusBadge = (s: InvoiceStatus) =>
  s === "Paid"
    ? { text: "Paid", variant: "green" as const }
    : s === "Overdue"
      ? { text: "Overdue", variant: "red" as const }
      : { text: "Issued", variant: "blue" as const };

const naira = (n: number) => `₦${n.toLocaleString()}`;

const initialInvoices: Invoice[] = [
  { id: "INV-2401", student: "Chidi Eze", items: ["Tuition", "Boarding", "PTA Levy"], total: 675000, status: "Paid", date: "05 Sep 2026" },
  { id: "INV-2400", student: "Tom Wallace", items: ["Tuition", "Boarding", "PTA Levy"], total: 675000, status: "Paid", date: "05 Sep 2026" },
  { id: "INV-2398", student: "Ngozi Eze", items: ["Tuition", "PTA Levy"], total: 425000, status: "Overdue", date: "04 Sep 2026" },
  { id: "INV-2397", student: "Musa Bello", items: ["Tuition", "External Exam Fees", "PTA Levy"], total: 460000, status: "Overdue", date: "03 Sep 2026" },
  { id: "INV-2395", student: "Amara Okafor", items: ["Tuition", "PTA Levy"], total: 425000, status: "Paid", date: "02 Sep 2026" },
  { id: "INV-2392", student: "Tunde Bakare", items: ["Tuition", "Boarding", "PTA Levy"], total: 675000, status: "Issued", date: "01 Sep 2026" },
  { id: "INV-2388", student: "Ibrahim Musa", items: ["Tuition", "PTA Levy"], total: 425000, status: "Issued", date: "30 Aug 2026" },
];

const columns = [
  { key: "invoiceNo", label: "INVOICE NO" },
  { key: "student", label: "STUDENT" },
  { key: "items", label: "ITEMS" },
  { key: "total", label: "TOTAL", align: "right" as const },
  { key: "status", label: "STATUS" },
  { key: "date", label: "DATE" },
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

const feeItems = [
  { name: "Tuition", amount: 420000 },
  { name: "Boarding", amount: 250000 },
  { name: "PTA Levy", amount: 5000 },
  { name: "External Exam Fees", amount: 35000 },
  { name: "Sports Levy", amount: 15000 },
];

export default function BursarInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [issueOpen, setIssueOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [issueStudent, setIssueStudent] = useState("");
  const [issueItems, setIssueItems] = useState<string[]>([]);
  const [issueDate, setIssueDate] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const rows: TableRow[] = invoices.map((inv) => ({
    invoiceNo: (
      <div>
        <p className="text-sm font-medium text-text-dark">{inv.id}</p>
        <p className="text-xs text-text-muted">{inv.items.length} item(s)</p>
      </div>
    ),
    student: inv.student,
    items: inv.items.join(" + "),
    total: naira(inv.total),
    status: statusBadge(inv.status),
    date: inv.date,
  }));

  const openDetail = (row: TableRow, i: number) => {
    setSelected(invoices[i]);
    setDetailOpen(true);
  };

  const toggleItem = (name: string) => {
    setIssueItems((prev) => (prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]));
  };

  const saveIssue = () => {
    if (!issueStudent || issueItems.length === 0 || !issueDate) return;
    const total = feeItems.filter((f) => issueItems.includes(f.name)).reduce((sum, f) => sum + f.amount, 0);
    setInvoices((prev) => [
      ...prev,
      {
        id: `INV-${Math.max(...prev.map((i) => parseInt(i.id.slice(4), 10))) + 1}`,
        student: issueStudent,
        items: issueItems,
        total,
        status: "Issued",
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      },
    ]);
    setIssueOpen(false);
    setIssueStudent("");
    setIssueItems([]);
    setIssueDate("");
    showToast(`Invoice issued to ${issueStudent}`);
  };

  const sendReminder = () => {
    if (!selected) return;
    setDetailOpen(false);
    showToast(`Reminder sent to ${selected.student}`);
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Invoices"
        subtitle="Fee invoices raised for students"
        actions={
          <Button onClick={() => setIssueOpen(true)}>
            <FileText className="w-4 h-4" /> Issue Invoice
          </Button>
        }
      />

      <DataTable columns={columns} data={rows} onRowClick={openDetail} />

      <Modal
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        title="Issue Invoice"
        subtitle="Raise a fee invoice for a student"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIssueOpen(false)}>Cancel</Button>
            <Button onClick={saveIssue}>Issue Invoice</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Student"
            required
            placeholder="Select student"
            options={studentNames}
            value={issueStudent}
            onChange={(e) => setIssueStudent(e.target.value)}
          />
          <Field label="Fee Items" required>
            <div className="flex flex-col gap-2">
              {feeItems.map((f) => (
                <label key={f.name} className="flex items-center justify-between text-sm text-text-dark">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={issueItems.includes(f.name)}
                      onChange={() => toggleItem(f.name)}
                      className="w-4 h-4 rounded accent-primary"
                    />
                    {f.name}
                  </span>
                  <span className="text-text-muted">{naira(f.amount)}</span>
                </label>
              ))}
            </div>
          </Field>
          <Field label="Date" required>
            <TextInput type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.id ?? ""}
        subtitle={selected?.student}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDetailOpen(false)}>Close</Button>
            {selected?.status !== "Paid" && (
              <Button onClick={sendReminder}>
                <BellRing className="w-4 h-4" /> Send Reminder
              </Button>
            )}
          </>
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border-light p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Invoice total</p>
                <p className="text-lg font-bold text-text-dark">{naira(selected.total)}</p>
                <p className="text-xs text-text-muted mt-0.5">{selected.date}</p>
              </div>
              <Badge variant={statusBadge(selected.status).variant}>{selected.status}</Badge>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-2">Fee items</p>
              <div className="flex flex-col gap-2">
                {selected.items.map((item) => {
                  const fee = feeItems.find((f) => f.name === item);
                  return (
                    <div key={item} className="flex items-center justify-between rounded-lg bg-surface px-4 py-2.5 text-sm">
                      <span className="text-text-dark">{item}</span>
                      <span className="text-text-muted">{fee ? naira(fee.amount) : "—"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
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