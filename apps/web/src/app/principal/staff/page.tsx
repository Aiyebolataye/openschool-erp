"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { SearchInput } from "@/components/ui/search-input";
import { useState } from "react";

const kpis = [
  { label: "Total Staff", value: "620", detail: "", detailColor: "muted" as const },
  { label: "Teachers", value: "410", detail: "", detailColor: "muted" as const },
  { label: "On Leave", value: "4", detail: "", detailColor: "muted" as const },
  { label: "Pending Onboarding", value: "9", detail: "", detailColor: "orange" as const },
];

const staff = [
  { name: "Mrs. Ajayi", role: "Biology Teacher", dept: "Sciences", status: { text: "Active", variant: "green" as const } },
  { name: "Mr. Obi", role: "Math Teacher", dept: "Sciences", status: { text: "Active", variant: "green" as const } },
  { name: "Ms. Tran", role: "Literature Teacher", dept: "Arts", status: { text: "Active", variant: "green" as const } },
  { name: "Mr. Adeyemi", role: "HOD Sciences", dept: "Sciences", status: { text: "Leave", variant: "orange" as const } },
];

function List({ rows }: { rows: { title: string; sub: string; status: { text: string; variant: "green" | "red" | "orange" | "muted" | "blue" } }[] }) {
  return (
    <Card className="divide-y divide-border-light">
      {rows.map((r) => (
        <div key={r.title} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-text-dark">{r.title}</p>
            <p className="text-xs text-text-muted mt-0.5">{r.sub}</p>
          </div>
          <Badge variant={r.status.variant}>{r.status.text}</Badge>
        </div>
      ))}
    </Card>
  );
}

export default function PrincipalStaffPage() {
  const [search, setSearch] = useState("");
  const [viewStaff, setViewStaff] = useState<(typeof staff)[number] | null>(null);

  const q = search.trim().toLowerCase();
  const filtered = staff.filter(
    (s) =>
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      s.dept.toLowerCase().includes(q)
  );

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Staff"
        subtitle="View teaching and non-teaching staff"
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <SearchInput placeholder="Search by name, role, or department..." className="flex-1" value={search} onChange={setSearch} />
        </div>
      </Card>

      <Card className="divide-y divide-border-light">
        {filtered.map((s) => (
          <div key={s.name} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-text-dark">{s.name}</p>
              <p className="text-xs text-text-muted mt-0.5">{s.role} · {s.dept}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={s.status.variant}>{s.status.text}</Badge>
              <Button variant="ghost" size="sm" onClick={() => setViewStaff(s)}>View</Button>
            </div>
          </div>
        ))}
      </Card>

      <Modal
        open={!!viewStaff}
        onClose={() => setViewStaff(null)}
        title={viewStaff ? viewStaff.name : "Staff"}
        footer={<Button onClick={() => setViewStaff(null)}>Close</Button>}
      >
        {viewStaff && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted">Role</p>
                <p className="text-sm font-medium text-text-dark">{viewStaff.role}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Department</p>
                <p className="text-sm font-medium text-text-dark">{viewStaff.dept}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Status</p>
                <Badge variant={viewStaff.status.variant}>{viewStaff.status.text}</Badge>
              </div>
            </div>
            <p className="text-xs text-text-muted rounded-lg bg-surface p-3">
              Contact the institution administrator to update staff details.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
