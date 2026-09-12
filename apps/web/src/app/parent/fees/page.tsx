"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/ui/data-table";
import { ListCard } from "@/components/ui/list-card";
import type { TableRow } from "@/types";

const naira = (n: number) => `₦${n.toLocaleString()}`;

interface Invoice {
  no: string;
  child: string;
  term: string;
  items: string;
  amount: number;
  status: "Overdue" | "Outstanding" | "Paid";
  date: string;
}

const initialInvoices: Invoice[] = [
  { no: "INV-2413", child: "Kayode Eze", term: "Term 3 2026", items: "Tuition + Boarding + PTA", amount: 675000, status: "Outstanding", date: "01 Sep 2026" },
  { no: "INV-2412", child: "Chidi Eze", term: "Term 3 2026", items: "Tuition + PTA Levy", amount: 425000, status: "Overdue", date: "01 Sep 2026" },
];

const history: Invoice[] = [
  { no: "INV-2409", child: "Kayode Eze", term: "Term 2 2026", items: "Tuition + Boarding + PTA", amount: 675000, status: "Paid", date: "12 Jun 2026" },
  { no: "INV-2408", child: "Chidi Eze", term: "Term 2 2026", items: "Tuition + PTA Levy", amount: 425000, status: "Paid", date: "12 Jun 2026" },
  { no: "INV-2401", child: "Kayode Eze", term: "Term 1 2026", items: "Tuition + Boarding + PTA", amount: 675000, status: "Paid", date: "10 Jan 2026" },
  { no: "INV-2400", child: "Chidi Eze", term: "Term 1 2026", items: "Tuition + PTA Levy", amount: 425000, status: "Paid", date: "10 Jan 2026" },
];

const statusBadge = (s: Invoice["status"]) =>
  s === "Paid"
    ? { text: "Paid", variant: "green" as const }
    : s === "Overdue"
      ? { text: "Overdue", variant: "red" as const }
      : { text: "Outstanding", variant: "orange" as const };

export default function ParentFeesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const outstandingTotal = invoices.reduce((sum, i) => sum + i.amount, 0);
  const overdueCount = invoices.filter((i) => i.status === "Overdue").length;

  const columns = [
    { key: "no", label: "INVOICE NO" },
    { key: "child", label: "CHILD" },
    { key: "term", label: "TERM" },
    { key: "items", label: "ITEMS" },
    { key: "amount", label: "AMOUNT", align: "right" as const },
    { key: "status", label: "STATUS" },
    { key: "action", label: "", align: "right" as const },
  ];

  const rows: TableRow[] = invoices.map((inv) => ({
    no: inv.no,
    child: inv.child,
    term: inv.term,
    items: inv.items,
    amount: naira(inv.amount),
    status: statusBadge(inv.status),
    action: (
      <Button size="sm" onClick={() => setPayInvoice(inv)}>Pay Now</Button>
    ),
  }));

  const confirmPayment = () => {
    if (!payInvoice) return;
    setInvoices((prev) =>
      prev.map((i) => (i.no === payInvoice.no ? { ...i, status: "Paid" as const } : i))
    );
    const amount = payInvoice.amount;
    setPayInvoice(null);
    showToast(`Payment of ${naira(amount)} confirmed`);
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader title="Fees & Payments" subtitle="Outstanding fee invoices and payment history for your wards" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Outstanding" value={naira(outstandingTotal)} detail="Across both children" detailColor="red" />
        <StatCard label="Overdue Invoices" value={String(overdueCount)} detail="Action required" detailColor="orange" />
        <StatCard label="Paid This Year" value="₦2.2m" detail="4 invoices settled" detailColor="green" />
      </div>

      <h3 className="text-sm font-semibold text-text-dark mb-3">Outstanding Invoices</h3>
      <DataTable columns={columns} data={rows} className="mb-6" />

      <ListCard
        title="Payment History"
        subtitle="Recent payments made for your wards"
        badge={<Badge variant="green">4 paid</Badge>}
        items={history.map((h) => ({
          title: `${h.no} · ${h.child} · ${h.term}`,
          subtitle: `${h.items} · ${h.date}`,
          right: (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-dark">{naira(h.amount)}</span>
              <Badge variant="green">Paid</Badge>
            </div>
          ),
        }))}
      />

      {payInvoice && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setPayInvoice(null)} aria-hidden="true" />
          <div className="relative bg-card rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-primary px-6 py-5 text-white">
              <p className="text-sm font-semibold uppercase tracking-wide">Secure Payment</p>
              <p className="text-xs text-white/80 mt-0.5">Paystack · encrypted</p>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              <div>
                <p className="text-xs text-text-muted">Invoice {payInvoice.no}</p>
                <p className="text-sm font-medium text-text-dark">{payInvoice.child} · {payInvoice.term}</p>
              </div>
              <div className="rounded-lg bg-surface px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-text-muted">Amount to pay</span>
                <span className="text-xl font-bold text-text-dark">{naira(payInvoice.amount)}</span>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1.5">Card Details</p>
                <div className="rounded-lg border border-border-light p-3 text-sm text-text-muted bg-card">
                  4242 4242 4242 4242
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border-light bg-surface/50">
              <Button variant="secondary" onClick={() => setPayInvoice(null)}>Cancel</Button>
              <Button onClick={confirmPayment}>Confirm Payment</Button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}
