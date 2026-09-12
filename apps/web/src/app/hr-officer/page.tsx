"use client";

import { useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import { UserPlus, Wallet, ChevronRight } from "lucide-react";

const kpis = [
  { label: "Total Staff", value: "126", detail: "across all departments", detailColor: "blue" as const },
  { label: "Monthly Payroll", value: "₦28.94M", detail: "September run in progress", detailColor: "green" as const },
  { label: "On Leave", value: "4", detail: "2 returning this week", detailColor: "orange" as const },
  { label: "Open Recruitments", value: "3", detail: "45 applicants in pipeline", detailColor: "purple" as const },
  { label: "Pending Approvals", value: "6", detail: "4 leave · 2 payroll", detailColor: "red" as const },
  { label: "Attendance Rate", value: "96.8%", detail: "+0.3% vs last month", detailColor: "green" as const },
];

type LeaveStatus = "Pending" | "Approved" | "Denied";

interface LeaveReq {
  id: string;
  staff: string;
  type: string;
  period: string;
  days: number;
  status: LeaveStatus;
  reason: string;
}

const initialLeave: LeaveReq[] = [
  { id: "LV-214", staff: "Mrs. Adaeze Okafor", type: "Annual Leave", period: "14 – 28 Sep 2026", days: 15, status: "Pending", reason: "Family travel to Enugu for a burial." },
  { id: "LV-213", staff: "Mr. Dipo Salako", type: "Sick Leave", period: "7 – 11 Sep 2026", days: 5, status: "Pending", reason: "Malaria treatment and bed rest." },
  { id: "LV-212", staff: "Miss Funke Adeyemi", type: "Study Leave", period: "1 – 30 Oct 2026", days: 30, status: "Approved", reason: "TRCN professional certification course." },
  { id: "LV-211", staff: "Mr. Segun Oyelaran", type: "Annual Leave", period: "21 – 25 Sep 2026", days: 5, status: "Denied", reason: "Denied — timetable coverage unavailable." },
];

const recentRuns = [
  { id: "PR-2026-09", period: "September 2026", gross: "₦28,940,000", status: { text: "Processing", variant: "orange" as const } },
  { id: "PR-2026-08", period: "August 2026", gross: "₦28,450,000", status: { text: "Paid", variant: "green" as const } },
  { id: "PR-2026-07", period: "July 2026", gross: "₦27,960,000", status: { text: "Paid", variant: "green" as const } },
];

const leaveBadge = (s: LeaveStatus) =>
  s === "Approved"
    ? { text: "Approved", variant: "green" as const }
    : s === "Denied"
      ? { text: "Denied", variant: "red" as const }
      : { text: "Pending", variant: "orange" as const };

export default function HrOfficerDashboardPage() {
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [runOpen, setRunOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveReq | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [leaveReqs, setLeaveReqs] = useState<LeaveReq[]>(initialLeave);

  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDept, setNewDept] = useState("");
  const [runPeriod, setRunPeriod] = useState("");
  const [runGroup, setRunGroup] = useState("");
  const [runType, setRunType] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const saveAddStaff = () => {
    if (!newName.trim() || !newRole.trim() || !newDept) return;
    setAddStaffOpen(false);
    setNewName("");
    setNewRole("");
    setNewDept("");
    showToast(`Staff record created for ${newName.trim()}`);
  };

  const saveRun = () => {
    if (!runPeriod || !runGroup) return;
    setRunOpen(false);
    setRunPeriod("");
    setRunGroup("");
    setRunType("");
    showToast(`Payroll run queued for ${runPeriod}`);
  };

  const decideLeave = (status: LeaveStatus) => {
    if (!selectedLeave) return;
    setLeaveReqs((prev) => prev.map((l) => (l.id === selectedLeave.id ? { ...l, status } : l)));
    setSelectedLeave({ ...selectedLeave, status });
    showToast(
      status === "Approved"
        ? `Leave approved for ${selectedLeave.staff}`
        : `Leave request denied for ${selectedLeave.staff}`
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="HR & Payroll Overview"
        subtitle="Staff, payroll and leave dashboard · Greenfield Academy"
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="p-5 mb-6">
        <h3 className="text-sm font-semibold text-text-dark mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setAddStaffOpen(true)}>
            <UserPlus className="w-4 h-4" /> Add Staff
          </Button>
          <Button variant="secondary" onClick={() => setRunOpen(true)}>
            <Wallet className="w-4 h-4" /> Run Payroll
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-text-dark mb-2">Recent Payroll Runs</h3>
          <Card className="divide-y divide-border-light">
            {recentRuns.map((r) => (
              <Link
                key={r.id}
                href="/hr-officer/payroll"
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-surface/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-dark">{r.period}</p>
                  <p className="text-xs text-text-muted mt-0.5">{r.id} · {r.gross}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={r.status.variant}>{r.status.text}</Badge>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
              </Link>
            ))}
            <Link
              href="/hr-officer/payroll"
              className="block text-center text-xs font-medium text-primary hover:underline py-3"
            >
              View all payroll runs →
            </Link>
          </Card>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-dark mb-2">Leave Requests</h3>
          <Card className="divide-y divide-border-light">
            {leaveReqs.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  setSelectedLeave(l);
                  setLeaveOpen(true);
                }}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-surface/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-dark">{l.staff}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {l.type} · {l.period} · {l.days} days
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={leaveBadge(l.status).variant}>{l.status}</Badge>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
              </button>
            ))}
            <Link
              href="/hr-officer/leave"
              className="block text-center text-xs font-medium text-primary hover:underline py-3"
            >
              View all leave requests →
            </Link>
          </Card>
        </div>
      </div>

      <Modal
        open={addStaffOpen}
        onClose={() => setAddStaffOpen(false)}
        title="Add Staff"
        subtitle="Create a new staff record"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddStaffOpen(false)}>Cancel</Button>
            <Button onClick={saveAddStaff}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Full Name" required>
            <TextInput
              placeholder="Enter staff full name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </Field>
          <Field label="Role" required>
            <TextInput
              placeholder="e.g. Chemistry Teacher"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            />
          </Field>
          <SelectField
            label="Department"
            required
            placeholder="Select department"
            options={["Admin & Management", "Sciences", "Languages", "Finance", "Operations"]}
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={runOpen}
        onClose={() => setRunOpen(false)}
        title="Run Payroll"
        subtitle="Start a new payroll run"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRunOpen(false)}>Cancel</Button>
            <Button onClick={saveRun}>Start Run</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Pay Period"
            required
            placeholder="Select period"
            options={["September 2026", "October 2026", "November 2026", "December 2026"]}
            value={runPeriod}
            onChange={(e) => setRunPeriod(e.target.value)}
          />
          <SelectField
            label="Include Group"
            required
            placeholder="Select group"
            options={["All Staff", "Academic Staff", "Non-Academic Staff"]}
            value={runGroup}
            onChange={(e) => setRunGroup(e.target.value)}
          />
          <SelectField
            label="Run Type"
            placeholder="Select type"
            options={["Regular Run", "Supplemental Run", "Part-payment", "Bonus Run"]}
            value={runType}
            onChange={(e) => setRunType(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        title={selectedLeave?.staff ?? ""}
        subtitle={selectedLeave ? `${selectedLeave.id} · ${selectedLeave.type}` : undefined}
        footer={
          selectedLeave && (
            <>
              <Button variant="danger" onClick={() => decideLeave("Denied")}>
                Deny
              </Button>
              <Button onClick={() => decideLeave("Approved")}>Approve</Button>
            </>
          )
        }
      >
        {selectedLeave && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border-light p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Period</p>
                <p className="text-sm font-medium text-text-dark">{selectedLeave.period}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted">Days</p>
                <p className="text-sm font-medium text-text-dark">{selectedLeave.days}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={leaveBadge(selectedLeave.status).variant}>{selectedLeave.status}</Badge>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1.5">Reason</p>
              <p className="text-sm text-text-dark leading-relaxed">{selectedLeave.reason}</p>
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
