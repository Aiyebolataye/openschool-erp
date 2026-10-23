"use client";

import { useState } from "react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";

type InvoiceStatus = "Pending" | "Paid" | "Overdue";

interface InvoiceRow {
  invoice: string;
  tenant: string;
  amount: string;
  status: { text: InvoiceStatus; variant: "orange" | "green" | "red" };
  periodStart: string;
  periodEnd: string;
}

const kpis = [
  { label: "ANNUAL REVENUE", value: "₦284,200", detail: "+12% vs last year", detailColor: "green" as const },
  { label: "PENDING INVOICES", value: "23", detail: "₦47,300 total pending", detailColor: "orange" as const },
  { label: "OVERDUE", value: "5", detail: "₦12,800 overdue", detailColor: "red" as const },
  { label: "COLLECTION RATE", value: "96.2%", detail: "Up 1.8% from last year", detailColor: "green" as const },
];

const initialRows: InvoiceRow[] = [
  { invoice: "INV-2026-0742", tenant: "Demo Academy", amount: "₦900,000", status: { text: "Pending", variant: "orange" }, periodStart: "Jan 1, 2026", periodEnd: "Jan 1, 2027" },
  { invoice: "INV-2026-0741", tenant: "Metropolitan Schools", amount: "₦450,000", status: { text: "Pending", variant: "orange" }, periodStart: "Jan 1, 2026", periodEnd: "Jan 1, 2027" },
  { invoice: "INV-2026-0740", tenant: "Coastal Education", amount: "₦250,000", status: { text: "Overdue", variant: "red" }, periodStart: "Jun 15, 2025", periodEnd: "Jun 15, 2026" },
  { invoice: "INV-2026-0739", tenant: "Pinnacle Learning", amount: "₦250,000", status: { text: "Paid", variant: "green" }, periodStart: "Jan 1, 2026", periodEnd: "Jan 1, 2027" },
  { invoice: "INV-2026-0738", tenant: "Sunrise International", amount: "₦900,000", status: { text: "Pending", variant: "orange" }, periodStart: "Jul 15, 2026", periodEnd: "Jul 15, 2027" },
];

const columns = [
  { key: "invoice", label: "INVOICE", width: "130px" },
  { key: "tenant", label: "TENANT", width: "200px" },
  { key: "amount", label: "AMOUNT", width: "100px", align: "right" as const },
  { key: "status", label: "STATUS", width: "100px" },
  { key: "periodStart", label: "PERIOD START", width: "120px" },
  { key: "periodEnd", label: "PERIOD END", width: "120px" },
  { key: "actions", label: "ACTIONS", width: "80px", align: "right" as const },
];

export default function BillingPage() {
  const [rows, setRows] = useState<InvoiceRow[]>(initialRows);
  const [selected, setSelected] = useState<InvoiceRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const markPaid = () => {
    if (!selected) return;
    setRows((prev) =>
      prev.map((r) =>
        r.invoice === selected.invoice
          ? { ...r, status: { text: "Paid", variant: "green" } }
          : r
      )
    );
    setSelected(null);
    setToast(`Invoice ${selected.invoice} marked as paid`);
    setTimeout(() => setToast(null), 3000);
  };

  const q = search.trim().toLowerCase();
  const filteredRows = rows.filter((row) => {
    const matchesSearch =
      !q ||
      row.tenant.toLowerCase().includes(q) ||
      row.invoice.toLowerCase().includes(q);
    const matchesStatus = !statusFilter || row.status.text === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const data = filteredRows.map((row) => ({
    ...row,
    actions: (
      <Button variant="ghost" size="sm" onClick={() => setSelected(row)}>
        View
      </Button>
    ),
  }));

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Billing & Invoices"
        subtitle="Platform Admin / Billing"
      />

      <div className="flex items-center gap-3 mb-6 bg-primary-light/40 text-primary border border-primary-light rounded-xl px-4 py-3 text-sm">
        <span className="font-medium">Note:</span>
        <span>All plans are billed annually.</span>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select options={[{ label: "Pending", value: "Pending" }, { label: "Paid", value: "Paid" }, { label: "Overdue", value: "Overdue" }]} placeholder="All Statuses" value={statusFilter} onChange={setStatusFilter} />
          <SearchInput placeholder="Search invoices..." className="flex-1" value={search} onChange={setSearch} />
        </div>
      </Card>

      <DataTable columns={columns} data={data} />
      <Pagination currentPage={1} totalPages={5} />

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={`Invoice ${selected?.invoice ?? ""}`}
        subtitle={selected?.tenant}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>
            {selected?.status.text !== "Paid" && (
              <Button onClick={markPaid}>Mark Paid</Button>
            )}
          </>
        }
      >
        {selected && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Tenant</span>
              <span className="font-medium text-text-dark">{selected.tenant}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Amount</span>
              <span className="font-medium text-text-dark">{selected.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Status</span>
              <Badge variant={selected.status.variant}>{selected.status.text}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Billing Period Start</span>
              <span className="font-medium text-text-dark">{selected.periodStart}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Billing Period End</span>
              <span className="font-medium text-text-dark">{selected.periodEnd}</span>
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
