"use client";

import { useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";

type InstitutionFinance = {
  name: string;
  plan: string;
  annual: string;
  collected: string;
  outstanding: string;
  rate: string;
  status: { text: string; variant: "green" | "orange" | "red" };
  termPayments: string[];
  invoices: { no: string; amount: string; period: string; status: { text: string; variant: "green" | "orange" | "red" | "muted" } }[];
};

type Invoice = {
  no: string;
  institution: string;
  amount: string;
  period: string;
  status: { text: string; variant: "green" | "orange" | "red" | "muted" };
};

const kpis = [
  { label: "Annual Revenue", value: "₦41.7M", detail: "+12.4% vs last year", detailColor: "green" as const },
  { label: "Outstanding Fees", value: "₦6.5M", detail: "5 institutions affected", detailColor: "orange" as const },
  { label: "Fee Collection Rate", value: "84.3%", detail: "+3.1% this quarter", detailColor: "green" as const },
  { label: "Pending Invoices", value: "8", detail: "3 overdue", detailColor: "orange" as const },
];

const institutions: InstitutionFinance[] = [
  {
    name: "Demo Academy",
    plan: "Premium",
    annual: "₦8,500,000",
    collected: "₦7,140,000",
    outstanding: "₦1,360,000",
    rate: "84%",
    status: { text: "Paid", variant: "green" },
    termPayments: ["Term 1 — ₦2,900,000 (paid)", "Term 2 — ₦2,900,000 (paid)", "Term 3 — ₦1,340,000 (pending)"],
    invoices: [
      { no: "INV-2026-0141", amount: "₦850,000", period: "Q1 2026", status: { text: "Paid", variant: "green" } },
      { no: "INV-2026-0147", amount: "₦425,000", period: "Q2 2026", status: { text: "Unpaid", variant: "orange" } },
    ],
  },
  {
    name: "Metropolitan Schools",
    plan: "Premium",
    annual: "₦12,000,000",
    collected: "₦9,600,000",
    outstanding: "₦2,400,000",
    rate: "80%",
    status: { text: "Partial", variant: "orange" },
    termPayments: ["Term 1 — ₦4,000,000 (paid)", "Term 2 — ₦4,000,000 (paid)", "Term 3 — ₦1,600,000 (pending)"],
    invoices: [
      { no: "INV-2026-0142", amount: "₦1,200,000", period: "Q1 2026", status: { text: "Paid", variant: "green" } },
      { no: "INV-2026-0146", amount: "₦600,000", period: "Q2 2026", status: { text: "Pending", variant: "muted" } },
    ],
  },
  {
    name: "Coastal Education Trust",
    plan: "Standard",
    annual: "₦6,500,000",
    collected: "₦5,525,000",
    outstanding: "₦975,000",
    rate: "85%",
    status: { text: "Partial", variant: "orange" },
    termPayments: ["Term 1 — ₦2,200,000 (paid)", "Term 2 — ₦2,200,000 (paid)", "Term 3 — ₦1,125,000 (pending)"],
    invoices: [
      { no: "INV-2026-0143", amount: "₦650,000", period: "Q1 2026", status: { text: "Unpaid", variant: "orange" } },
      { no: "INV-2026-0148", amount: "₦325,000", period: "Q2 2026", status: { text: "Overdue", variant: "red" } },
    ],
  },
  {
    name: "Pinnacle Learning",
    plan: "Standard",
    annual: "₦4,200,000",
    collected: "₦3,024,000",
    outstanding: "₦1,176,000",
    rate: "72%",
    status: { text: "Overdue", variant: "red" },
    termPayments: ["Term 1 — ₦1,400,000 (paid)", "Term 2 — ₦1,400,000 (paid)", "Term 3 — ₦224,000 (overdue)"],
    invoices: [
      { no: "INV-2026-0144", amount: "₦420,000", period: "Q1 2026", status: { text: "Overdue", variant: "red" } },
      { no: "INV-2026-0149", amount: "₦210,000", period: "Q2 2026", status: { text: "Unpaid", variant: "orange" } },
    ],
  },
  {
    name: "Sunrise International",
    plan: "Premium",
    annual: "₦10,500,000",
    collected: "₦9,870,000",
    outstanding: "₦630,000",
    rate: "94%",
    status: { text: "Paid", variant: "green" },
    termPayments: ["Term 1 — ₦3,500,000 (paid)", "Term 2 — ₦3,500,000 (paid)", "Term 3 — ₦2,870,000 (paid)"],
    invoices: [
      { no: "INV-2026-0145", amount: "₦1,050,000", period: "Q1 2026", status: { text: "Paid", variant: "green" } },
    ],
  },
];

const invoices: Invoice[] = [
  { no: "INV-2026-0141", institution: "Demo Academy", amount: "₦850,000", period: "Q1 2026", status: { text: "Paid", variant: "green" } },
  { no: "INV-2026-0142", institution: "Metropolitan Schools", amount: "₦1,200,000", period: "Q1 2026", status: { text: "Paid", variant: "green" } },
  { no: "INV-2026-0143", institution: "Coastal Education Trust", amount: "₦650,000", period: "Q1 2026", status: { text: "Unpaid", variant: "orange" } },
  { no: "INV-2026-0144", institution: "Pinnacle Learning", amount: "₦420,000", period: "Q1 2026", status: { text: "Overdue", variant: "red" } },
  { no: "INV-2026-0145", institution: "Sunrise International", amount: "₦1,050,000", period: "Q1 2026", status: { text: "Paid", variant: "green" } },
  { no: "INV-2026-0146", institution: "Metropolitan Schools", amount: "₦600,000", period: "Q2 2026", status: { text: "Pending", variant: "muted" } },
  { no: "INV-2026-0147", institution: "Demo Academy", amount: "₦425,000", period: "Q2 2026", status: { text: "Unpaid", variant: "orange" } },
  { no: "INV-2026-0148", institution: "Coastal Education Trust", amount: "₦325,000", period: "Q2 2026", status: { text: "Overdue", variant: "red" } },
];

const financeColumns = [
  { key: "name", label: "INSTITUTION", width: "200px" },
  { key: "plan", label: "SUBSCRIPTION PLAN", width: "120px" },
  { key: "annual", label: "ANNUAL FEE", width: "130px", align: "right" as const },
  { key: "collected", label: "FEES COLLECTED", width: "130px", align: "right" as const },
  { key: "outstanding", label: "OUTSTANDING", width: "130px", align: "right" as const },
  { key: "rate", label: "COLLECTION RATE", width: "130px", align: "right" as const },
  { key: "status", label: "STATUS", width: "90px" },
  { key: "actions", label: "ACTIONS", width: "90px", align: "right" as const },
];

const invoiceColumns = [
  { key: "no", label: "INVOICE NO", width: "160px" },
  { key: "institution", label: "INSTITUTION", width: "220px" },
  { key: "amount", label: "AMOUNT", width: "130px", align: "right" as const },
  { key: "period", label: "PERIOD", width: "110px" },
  { key: "status", label: "STATUS", width: "100px" },
];

export default function FinancePage() {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<InstitutionFinance | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  function openDetail(row: InstitutionFinance) {
    setSelected(row);
    setDetailOpen(true);
  }

  function sendReminder() {
    if (!selected) return;
    setDetailOpen(false);
    setSelected(null);
    showToast(`Payment reminder sent to ${selected.name}.`);
  }

  const financeRows = institutions.map((inst) => ({
    name: inst.name,
    plan: <Badge variant="blue">{inst.plan}</Badge>,
    annual: inst.annual,
    collected: inst.collected,
    outstanding: inst.outstanding,
    rate: inst.rate,
    status: inst.status,
    actions: <Button variant="ghost" size="sm" onClick={() => openDetail(inst)}>View</Button>,
  }));

  const q = search.trim().toLowerCase();
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      !q ||
      inv.institution.toLowerCase().includes(q) ||
      inv.no.toLowerCase().includes(q);
    const matchesStatus = !statusFilter || inv.status.text === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader title="Finance" subtitle="Consolidated finance across your institutions" />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-text-dark mb-3">Institution Finance</h3>
        <DataTable columns={financeColumns} data={financeRows} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-dark">Invoices</h3>
          <div className="flex items-center gap-2">
            <Select
              options={[{ label: "Paid", value: "Paid" }, { label: "Unpaid", value: "Unpaid" }, { label: "Overdue", value: "Overdue" }, { label: "Pending", value: "Pending" }]}
              placeholder="All Statuses"
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <SearchInput placeholder="Search invoices..." className="w-64" value={search} onChange={setSearch} />
          </div>
        </div>
        <DataTable columns={invoiceColumns} data={filteredInvoices} />
      </div>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Institution Finance Details"
        subtitle={selected?.name}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDetailOpen(false)}>Close</Button>
            <Button onClick={sendReminder}>Send Payment Reminder</Button>
          </>
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Subscription Plan</span>
                <Badge variant="blue">{selected.plan}</Badge>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Annual Fee</span>
                <span className="text-sm text-text-dark font-medium">{selected.annual}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Fees Collected</span>
                <span className="text-sm text-text-dark">{selected.collected}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-muted mb-1">Outstanding</span>
                <span className="text-sm text-text-dark">{selected.outstanding}</span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-text-muted mb-2">Term Payments</span>
              <div className="flex flex-col gap-1.5">
                {selected.termPayments.map((tp, i) => (
                  <div key={i} className="rounded-lg bg-surface px-3 py-2 text-sm text-text-dark">{tp}</div>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-text-muted mb-2">Outstanding Invoices</span>
              <div className="flex flex-col gap-2">
                {selected.invoices.map((inv) => (
                  <div key={inv.no} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-text-dark">{inv.no}</p>
                      <p className="text-xs text-text-muted">{inv.period}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-text-dark">{inv.amount}</span>
                      <Badge variant={inv.status.variant}>{inv.status.text}</Badge>
                    </div>
                  </div>
                ))}
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