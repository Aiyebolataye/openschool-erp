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

const kpis = [
  { label: "TOTAL SUBSCRIPTIONS", value: "127", detail: "+12 this month", detailColor: "green" as const },
  { label: "ACTIVE", value: "89", detail: "70.1%", detailColor: "green" as const },
  { label: "TRIAL", value: "22", detail: "", detailColor: "muted" as const },
  { label: "GRACE PERIOD", value: "8", detail: "", detailColor: "muted" as const },
  { label: "MONTHLY REVENUE", value: "₦284K", detail: "+8.3% vs last month", detailColor: "green" as const },
];

const initialData = [
  { tenant: "Greenfield Academy", slug: "greenfield-academy", plan: { text: "Enterprise", variant: "blue" as const }, status: { text: "Active", variant: "green" as const }, startDate: "Jan 15, 2025", endDate: "Jan 14, 2026", mrr: "₦2,400" },
  { tenant: "Metropolitan Schools", slug: "metropolitan-schools", plan: { text: "Pro", variant: "blue" as const }, status: { text: "Active", variant: "green" as const }, startDate: "Mar 22, 2025", endDate: "Mar 21, 2026", mrr: "₦1,200" },
  { tenant: "Coastal Education Trust", slug: "coastal-ed-trust", plan: { text: "Starter", variant: "muted" as const }, status: { text: "Trial", variant: "orange" as const }, startDate: "Jun 8, 2025", endDate: "Jul 8, 2025", mrr: "₦0" },
  { tenant: "Pinnacle Learning Center", slug: "pinnacle-learning", plan: { text: "Basic", variant: "muted" as const }, status: { text: "Grace Period", variant: "orange" as const }, startDate: "Nov 3, 2024", endDate: "Nov 2, 2025", mrr: "₦400" },
  { tenant: "Sunrise International", slug: "sunrise-intl", plan: { text: "Enterprise", variant: "blue" as const }, status: { text: "Active", variant: "green" as const }, startDate: "Aug 19, 2025", endDate: "Aug 18, 2026", mrr: "₦3,600" },
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

type SubRow = {
  tenant: string;
  slug: string;
  plan: { text: string; variant: "blue" | "muted" };
  status: { text: string; variant: "green" | "orange" | "red" };
  startDate: string;
  endDate: string;
  mrr: string;
};

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<SubRow[]>(initialData);
  const [viewSub, setViewSub] = useState<SubRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  function extendTrial() {
    if (!viewSub) return;
    setSubs((prev) =>
      prev.map((s) => (s.slug === viewSub.slug ? { ...s, endDate: "Aug 8, 2025" } : s))
    );
    setViewSub(null);
    showToast("Trial extended by 30 days");
  }

  function cancelSubscription() {
    if (!viewSub) return;
    setSubs((prev) =>
      prev.map((s) => (s.slug === viewSub.slug ? { ...s, status: { text: "Cancelled", variant: "red" } } : s))
    );
    setViewSub(null);
    showToast("Subscription cancelled");
  }

  const q = search.trim().toLowerCase();
  const filtered = subs.filter((s) => {
    const matchesSearch =
      !q ||
      s.tenant.toLowerCase().includes(q) ||
      s.plan.text.toLowerCase().includes(q) ||
      s.status.text.toLowerCase().includes(q);
    const matchesStatus = !statusFilter || s.status.text === statusFilter;
    const matchesPlan = !planFilter || s.plan.text === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const tableData = filtered.map((s) => ({
    ...s,
    actions: (
      <Button variant="ghost" size="sm" onClick={() => setViewSub(s)}>View</Button>
    ),
  }));

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
          <Select options={[{ label: "Active", value: "Active" }, { label: "Trial", value: "Trial" }, { label: "Grace Period", value: "Grace Period" }, { label: "Cancelled", value: "Cancelled" }]} placeholder="All Statuses" value={statusFilter} onChange={setStatusFilter} />
          <Select options={[{ label: "Enterprise", value: "Enterprise" }, { label: "Pro", value: "Pro" }, { label: "Starter", value: "Starter" }, { label: "Basic", value: "Basic" }]} placeholder="All Plans" value={planFilter} onChange={setPlanFilter} />
          <SearchInput placeholder="Search by tenant or plan..." className="flex-1" value={search} onChange={setSearch} />
        </div>
      </Card>

      <DataTable columns={columns} data={tableData} />
      <Pagination currentPage={1} totalPages={26} />

      <Modal
        open={!!viewSub}
        onClose={() => setViewSub(null)}
        title={viewSub?.tenant ?? ""}
        subtitle={viewSub?.slug}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setViewSub(null)}>Close</Button>
            {viewSub?.status.text === "Trial" ? (
              <Button size="sm" onClick={extendTrial}>Extend Trial</Button>
            ) : (
              <Button variant="danger" size="sm" onClick={cancelSubscription}>Cancel Subscription</Button>
            )}
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Badge variant={viewSub?.plan.variant}>{viewSub?.plan.text}</Badge>
            <Badge variant={viewSub?.status.variant}>{viewSub?.status.text}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-medium text-text-muted">Tenant</span>
              <p className="text-sm text-text-dark mt-1">{viewSub?.tenant}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-text-muted">Slug</span>
              <p className="text-sm text-text-dark mt-1">{viewSub?.slug}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-medium text-text-muted">Start Date</span>
              <p className="text-sm text-text-dark mt-1">{viewSub?.startDate}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-text-muted">End Date</span>
              <p className="text-sm text-text-dark mt-1">{viewSub?.endDate}</p>
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-text-muted">MRR</span>
            <p className="text-sm text-text-dark mt-1">{viewSub?.mrr}</p>
          </div>
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}