"use client";

import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";

const kpis = [
  { label: "MONTHLY REVENUE", value: "$284,200", detail: "+12% vs last month", detailColor: "green" as const },
  { label: "PENDING INVOICES", value: "23", detail: "$47,300 total pending", detailColor: "orange" as const },
  { label: "OVERDUE", value: "5", detail: "$12,800 overdue", detailColor: "red" as const },
  { label: "COLLECTION RATE", value: "96.2%", detail: "Up 1.8% from last quarter", detailColor: "green" as const },
];

const data = [
  { invoice: "INV-2026-0742", tenant: "Greenfield Academy", amount: "$2,400", status: { text: "Pending", variant: "orange" as const }, date: "Jul 1, 2026", dueDate: "Jul 31, 2026", actions: "View" },
  { invoice: "INV-2026-0741", tenant: "Metropolitan Schools", amount: "$1,200", status: { text: "Pending", variant: "orange" as const }, date: "Jul 1, 2026", dueDate: "Jul 31, 2026", actions: "View" },
  { invoice: "INV-2026-0740", tenant: "Coastal Education", amount: "$800", status: { text: "Overdue", variant: "red" as const }, date: "Jun 15, 2026", dueDate: "Jul 15, 2026", actions: "View" },
  { invoice: "INV-2026-0739", tenant: "Pinnacle Learning", amount: "$400", status: { text: "Paid", variant: "green" as const }, date: "Jul 1, 2026", dueDate: "Jul 31, 2026", actions: "View" },
  { invoice: "INV-2026-0738", tenant: "Sunrise International", amount: "$3,600", status: { text: "Pending", variant: "orange" as const }, date: "Jul 15, 2026", dueDate: "Aug 14, 2026", actions: "View" },
];

const columns = [
  { key: "invoice", label: "INVOICE", width: "140px" },
  { key: "tenant", label: "TENANT", width: "200px" },
  { key: "amount", label: "AMOUNT", width: "90px", align: "right" as const },
  { key: "status", label: "STATUS", width: "90px" },
  { key: "date", label: "DATE", width: "100px" },
  { key: "dueDate", label: "DUE DATE", width: "110px" },
  { key: "actions", label: "ACTIONS", width: "80px", align: "right" as const },
];

export default function BillingPage() {
  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Billing & Invoices"
        subtitle="Platform Admin / Billing"
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select options={[{ label: "All Statuses", value: "all" }]} placeholder="All Statuses" />
          <SearchInput placeholder="Search invoices..." className="flex-1" />
        </div>
      </Card>

      <DataTable columns={columns} data={data} />
      <Pagination currentPage={1} totalPages={5} />
    </div>
  );
}
