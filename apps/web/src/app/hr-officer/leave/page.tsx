"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import type { TableRow } from "@/types";
import { Check, X } from "lucide-react";

type LeaveStatus = "Pending" | "Approved" | "Denied";

interface LeaveRequest {
  id: string;
  staff: string;
  staffId: string;
  type: string;
  from: string;
  to: string;
  days: number;
  status: LeaveStatus;
  reason: string;
}

const initialLeave: LeaveRequest[] = [
  { id: "LV-214", staff: "Mrs. Adaeze Okafor", staffId: "EMP-1005", type: "Annual Leave", from: "2026-09-14", to: "2026-09-28", days: 15, status: "Pending", reason: "Family travel to Enugu for a burial." },
  { id: "LV-213", staff: "Mr. Dipo Salako", staffId: "EMP-1012", type: "Sick Leave", from: "2026-09-07", to: "2026-09-11", days: 5, status: "Pending", reason: "Malaria treatment and bed rest as recommended by the school clinic." },
  { id: "LV-212", staff: "Miss Funke Adeyemi", staffId: "EMP-1007", type: "Study Leave", from: "2026-10-01", to: "2026-10-30", days: 30, status: "Approved", reason: "TRCN professional certification course in Ibadan." },
  { id: "LV-211", staff: "Mr. Segun Oyelaran", staffId: "EMP-1008", type: "Annual Leave", from: "2026-09-21", to: "2026-09-25", days: 5, status: "Denied", reason: "Timetable coverage unavailable during continuous assessment week." },
  { id: "LV-210", staff: "Miss Blessing Eze", staffId: "EMP-1011", type: "Casual Leave", from: "2026-09-10", to: "2026-09-12", days: 3, status: "Pending", reason: "Personal errand — accommodation arrangements." },
  { id: "LV-209", staff: "Mr. Emeka Nwosu", staffId: "EMP-1006", type: "Annual Leave", from: "2026-08-03", to: "2026-08-21", days: 19, status: "Approved", reason: "End-of-term holiday travel to Delta State." },
];

const leaveBadge = (s: LeaveStatus) =>
  s === "Approved"
    ? { text: "Approved", variant: "green" as const }
    : s === "Denied"
      ? { text: "Denied", variant: "red" as const }
      : { text: "Pending", variant: "orange" as const };

const columns = [
  { key: "staff", label: "STAFF" },
  { key: "type", label: "TYPE" },
  { key: "period", label: "FROM – TO" },
  { key: "days", label: "DAYS" },
  { key: "status", label: "STATUS" },
];

export default function HrOfficerLeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>(initialLeave);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<LeaveRequest | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const rows: TableRow[] = requests.map((l) => ({
    staff: (
      <div>
        <p className="text-sm font-medium text-text-dark">{l.staff}</p>
        <p className="text-xs text-text-muted">{l.staffId}</p>
      </div>
    ),
    type: l.type,
    period: `${l.from} → ${l.to}`,
    days: String(l.days),
    status: leaveBadge(l.status),
  }));

  const openDetail = (row: TableRow, i: number) => {
    setSelected(requests[i]);
    setDetailOpen(true);
  };

  const decide = (status: LeaveStatus) => {
    if (!selected) return;
    setRequests((prev) => prev.map((l) => (l.id === selected.id ? { ...l, status } : l)));
    setSelected({ ...selected, status });
    showToast(
      status === "Approved"
        ? `Leave approved for ${selected.staff}`
        : status === "Denied"
          ? `Leave request denied for ${selected.staff}`
          : `Leave request reopened for ${selected.staff}`
    );
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Leave Requests"
        subtitle="Review and decide staff leave applications"
      />

      <Card className="p-4 mb-6">
        <p className="text-xs text-text-dark leading-relaxed">
          <span className="font-semibold text-text-dark">
            {requests.filter((l) => l.status === "Pending").length} request(s)
          </span>{" "}
          awaiting your decision. Approving here notifies the staff member and updates their leave balance.
        </p>
      </Card>

      <DataTable columns={columns} data={rows} onRowClick={openDetail} />

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.staff ?? ""}
        subtitle={selected ? `${selected.id} · ${selected.staffId} · ${selected.type}` : undefined}
        footer={
          selected && (
            <>
              <Button variant="secondary" onClick={() => setDetailOpen(false)}>Close</Button>
              {selected.status !== "Denied" && (
                <Button variant="danger" onClick={() => decide("Denied")}>
                  <X className="w-4 h-4" /> Deny
                </Button>
              )}
              {selected.status !== "Approved" && (
                <Button onClick={() => decide("Approved")}>
                  <Check className="w-4 h-4" /> Approve
                </Button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted">From</p>
                <p className="text-sm font-medium text-text-dark mt-0.5">{selected.from}</p>
              </div>
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted">To</p>
                <p className="text-sm font-medium text-text-dark mt-0.5">{selected.to}</p>
              </div>
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted">Days</p>
                <p className="text-sm font-medium text-text-dark mt-0.5">{selected.days}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={leaveBadge(selected.status).variant}>{selected.status}</Badge>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1.5">Reason</p>
              <p className="text-sm text-text-dark leading-relaxed">{selected.reason}</p>
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
