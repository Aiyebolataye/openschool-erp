"use client";

import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";

const kpis = [
  { label: "TOTAL SUBSCRIPTIONS", value: "127", detail: "+12 this month", detailColor: "green" as const },
  { label: "ACTIVE", value: "89", detail: "70.1%", detailColor: "green" as const },
  { label: "TRIAL", value: "22", detail: "", detailColor: "muted" as const },
  { label: "GRACE PERIOD", value: "8", detail: "", detailColor: "muted" as const },
  { label: "MONTHLY REVENUE", value: "$284K", detail: "+8.3% vs last month", detailColor: "green" as const },
];

const data = [
  { tenant: "Greenfield Academy", slug: "greenfield-academy", plan: { text: "Enterprise", variant: "blue" as const }, status: { text: "Active", variant: "green" as const }, startDate: "Jan 15, 2025", endDate: "Jan 14, 2026", mrr: "$2,400", actions: "View" },
  { tenant: "Metropolitan Schools", slug: "metropolitan-schools", plan: { text: "Pro", variant: "blue" as const }, status: { text: "Active", variant: "green" as const }, startDate: "Mar 22, 2025", endDate: "Mar 21, 2026", mrr: "$1,200", actions: "View" },
  { tenant: "Coastal Education Trust", slug: "coastal-ed-trust", plan: { text: "Starter", variant: "muted" as const }, status: { text: "Trial", variant: "orange" as const }, startDate: "Jun 8, 2025", endDate: "Jul 8, 2025", mrr: "$0", actions: "View" },
  { tenant: "Pinnacle Learning Center", slug: "pinnacle-learning", plan: { text: "Basic", variant: "muted" as const }, status: { text: "Grace Period", variant: "orange" as const }, startDate: "Nov 3, 2024", endDate: "Nov 2, 2025", mrr: "$400", actions: "View" },
  { tenant: "Sunrise International", slug: "sunrise-intl", plan: { text: "Enterprise", variant: "blue" as const }, status: { text: "Active", variant: "green" as const }, startDate: "Aug 19, 2025", endDate: "Aug 18, 2026", mrr: "$3,600", actions: "View" },
];

const columns = [
  { key: "tenant", label: "TENANT", width: "200px" },
  { key: "plan", label: "PLAN", width: "100px" },
  { key: "status", label: "STATUS", width: "110px" },
  { key: "startDate", label: "START DATE", width: "110px" },
  { key: "endDate", label: "END DATE", width: "110px" },
  { key: "mrr", label: "MRR", width: "80px", align: "right" as const },
  { key: "actions", label: "ACTIONS", width: "80px", align: "right" as const },
];

export default function SubscriptionsPage() {
  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Subscriptions"
        subtitle="Platform Admin / Subscriptions"
      />

      <div className="grid grid-cols-5 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select options={[{ label: "All Statuses", value: "all" }]} placeholder="All Statuses" />
          <Select options={[{ label: "All Plans", value: "all" }]} placeholder="All Plans" />
          <SearchInput placeholder="Search by tenant or plan..." className="flex-1" />
        </div>
      </Card>

      <DataTable columns={columns} data={data} />
      <Pagination currentPage={1} totalPages={26} />
    </div>
  );
}
