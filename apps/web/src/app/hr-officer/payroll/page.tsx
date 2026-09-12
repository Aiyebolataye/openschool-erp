"use client";

import { useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { SelectField } from "@/components/ui/form";
import type { TableRow } from "@/types";
import { Wallet } from "lucide-react";

type RunStatus = "Paid" | "Pending" | "Processing";
type Group = "Academic Staff" | "Non-Academic Staff";

interface PayStaff {
  name: string;
  role: string;
  group: Group;
  salary: number;
}

interface PayLine {
  name: string;
  role: string;
  gross: number;
  tax: number;
  net: number;
}

interface PayrollRun {
  id: string;
  period: string;
  group: string;
  runType: string;
  status: RunStatus;
  staff: PayLine[];
}

const payrollStaff: PayStaff[] = [
  { name: "Chief Ebere Nnamdi", role: "Principal", group: "Non-Academic Staff", salary: 650000 },
  { name: "Dr. Folake Akinwande", role: "Vice Principal (Academics)", group: "Non-Academic Staff", salary: 480000 },
  { name: "Mrs. Yetunde Alabi", role: "Bursar", group: "Non-Academic Staff", salary: 350000 },
  { name: "Mrs. Ngozi Bello", role: "HR & Payroll Officer", group: "Non-Academic Staff", salary: 280000 },
  { name: "Mr. Chukwuemeka Obi", role: "Physics Teacher", group: "Academic Staff", salary: 320000 },
  { name: "Mrs. Adaeze Okafor", role: "Chemistry Teacher", group: "Academic Staff", salary: 310000 },
  { name: "Mr. Emeka Nwosu", role: "Mathematics Teacher", group: "Academic Staff", salary: 300000 },
  { name: "Miss Funke Adeyemi", role: "English Teacher", group: "Academic Staff", salary: 290000 },
  { name: "Mr. Segun Oyelaran", role: "Biology Teacher", group: "Academic Staff", salary: 285000 },
  { name: "Mr. Tunde Bakare", role: "Accountant", group: "Non-Academic Staff", salary: 260000 },
  { name: "Miss Blessing Eze", role: "Admin Secretary", group: "Non-Academic Staff", salary: 150000 },
  { name: "Mr. Dipo Salako", role: "Groundsman", group: "Non-Academic Staff", salary: 120000 },
];

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const buildRun = (
  id: string,
  period: string,
  group: string,
  runType: string,
  status: RunStatus
): PayrollRun => {
  const roster =
    group === "Academic Staff"
      ? payrollStaff.filter((p) => p.group === "Academic Staff")
      : group === "Non-Academic Staff"
        ? payrollStaff.filter((p) => p.group === "Non-Academic Staff")
        : payrollStaff;
  const staff = roster.map((p) => {
    const tax = Math.round(p.salary * 0.1);
    return { name: p.name, role: p.role, gross: p.salary, tax, net: p.salary - tax };
  });
  return { id, period, group, runType, status, staff };
};

const initialRuns: PayrollRun[] = [
  buildRun("PR-2026-09", "September 2026", "All Staff", "Regular Run", "Processing"),
  buildRun("PR-2026-08", "August 2026", "All Staff", "Regular Run", "Paid"),
  buildRun("PR-2026-07", "July 2026", "Academic Staff", "Regular Run", "Paid"),
  buildRun("PR-2026-06", "June 2026", "Non-Academic Staff", "Regular Run", "Pending"),
];

const statusBadge = (s: RunStatus) =>
  s === "Paid"
    ? { text: "Paid", variant: "green" as const }
    : s === "Pending"
      ? { text: "Pending", variant: "orange" as const }
      : { text: "Processing", variant: "purple" as const };

const columns = [
  { key: "period", label: "PERIOD" },
  { key: "staff", label: "STAFF" },
  { key: "gross", label: "GROSS" },
  { key: "status", label: "STATUS" },
];

export default function HrOfficerPayrollPage() {
  const [runs, setRuns] = useState<PayrollRun[]>(initialRuns);
  const [runOpen, setRunOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<PayrollRun | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [newPeriod, setNewPeriod] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newType, setNewType] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const sumGross = (lines: PayLine[]) => lines.reduce((acc, l) => acc + l.gross, 0);
  const sumNet = (lines: PayLine[]) => lines.reduce((acc, l) => acc + l.net, 0);

  const totalGross = runs.reduce((acc, r) => acc + sumGross(r.staff), 0);
  const paidGross = runs
    .filter((r) => r.status === "Paid")
    .reduce((acc, r) => acc + sumGross(r.staff), 0);
  const awaitingGross = runs
    .filter((r) => r.status === "Pending" || r.status === "Processing")
    .reduce((acc, r) => acc + sumGross(r.staff), 0);

  const rows: TableRow[] = runs.map((r) => ({
    period: (
      <div>
        <p className="text-sm font-medium text-text-dark">{r.period}</p>
        <p className="text-xs text-text-muted">{r.runType} · {r.group}</p>
      </div>
    ),
    staff: String(r.staff.length),
    gross: naira(sumGross(r.staff)),
    status: statusBadge(r.status),
  }));

  const openDetail = (row: TableRow, i: number) => {
    setSelected(runs[i]);
    setDetailOpen(true);
  };

  const addRun = () => {
    if (!newPeriod || !newGroup) return;
    const id = `PR-${String(runs.length + 1).padStart(3, "0")}`;
    const run = buildRun(id, newPeriod, newGroup, newType || "Regular Run", "Processing");
    setRuns((prev) => [run, ...prev]);
    setNewPeriod("");
    setNewGroup("");
    setNewType("");
    setRunOpen(false);
    showToast(`Payroll run created for ${run.period}`);
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Payroll"
        subtitle="Run and manage staff payroll"
        actions={
          <Button onClick={() => setRunOpen(true)}>
            <Wallet className="w-4 h-4" /> Run Payroll
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Payroll" value={naira(totalGross)} detail={`${runs.length} runs listed`} detailColor="blue" />
        <StatCard label="Paid" value={naira(paidGross)} detail="completed runs" detailColor="green" />
        <StatCard label="Awaiting" value={naira(awaitingGross)} detail="pending & processing" detailColor="orange" />
      </div>

      <DataTable columns={columns} data={rows} onRowClick={openDetail} />

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.period ?? ""}
        subtitle={selected ? `${selected.id} · ${selected.runType} · ${selected.group}` : undefined}
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border-light divide-y divide-border-light">
              {selected.staff.map((line) => (
                <div key={line.name} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-dark">{line.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{line.role}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-medium text-text-dark">{naira(line.net)}</p>
                    <p className="text-xs text-text-muted">tax {naira(line.tax)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-surface p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Gross Pay</p>
                <p className="text-sm font-semibold text-text-dark">{naira(sumGross(selected.staff))}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted">Net Pay ({selected.staff.length} staff)</p>
                <p className="text-sm font-semibold text-text-dark">{naira(sumNet(selected.staff))}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={statusBadge(selected.status).variant}>{selected.status}</Badge>
              <span className="text-xs text-text-muted">{selected.period}</span>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={runOpen}
        onClose={() => setRunOpen(false)}
        title="Run Payroll"
        subtitle="Start a new payroll run"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRunOpen(false)}>Cancel</Button>
            <Button onClick={addRun}>Start Run</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Pay Period"
            required
            placeholder="Select period"
            options={["September 2026", "October 2026", "November 2026", "December 2026", "January 2027"]}
            value={newPeriod}
            onChange={(e) => setNewPeriod(e.target.value)}
          />
          <SelectField
            label="Include Group"
            required
            placeholder="Select group"
            options={["All Staff", "Academic Staff", "Non-Academic Staff"]}
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
          />
          <SelectField
            label="Run Type"
            placeholder="Select type"
            options={["Regular Run", "Supplemental Run", "Part-payment", "Bonus Run"]}
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          />
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
