"use client";

import { useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { CheckCircle, PhoneCall, ChevronRight } from "lucide-react";

interface Incident {
  id: string;
  title: string;
  boarder: string;
  room: string;
  severity: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "Resolved";
  time: string;
  desc: string;
}

const initialIncidents: Incident[] = [
  {
    id: "INC-1041",
    title: "Altercation in common room",
    boarder: "Chidi Eze",
    room: "3-A",
    severity: "High",
    status: "Open",
    time: "2h ago",
    desc: "Two boarders argued over the TV remote during evening recreation. Separated by the duty warden; both calm now.",
  },
  {
    id: "INC-1040",
    title: "Missing school shoes",
    boarder: "Tunde Bakare",
    room: "6-A",
    severity: "Medium",
    status: "Open",
    time: "3h ago",
    desc: "Boarder reported a pair of school shoes missing from the shoe rack after prep. Room search underway.",
  },
  {
    id: "INC-1039",
    title: "Left hostel without permission",
    boarder: "Omar Farouk",
    room: "5-C",
    severity: "Urgent",
    status: "Open",
    time: "4h ago",
    desc: "Boarder exited the hostel grounds after lights-out without a signed leave slip. Guardian and gate log notified.",
  },
  {
    id: "INC-1038",
    title: "Broken bed frame",
    boarder: "Emeka Nwosu",
    room: "3-B",
    severity: "Low",
    status: "Resolved",
    time: "1d ago",
    desc: "Lower bunk frame bracket came loose. Boarder moved to Bed 4 while maintenance replaced the bracket.",
  },
];

const boarderNames = [
  "Chidi Eze",
  "Tom Wallace",
  "Omar Farouk",
  "David Okafor",
  "Emeka Nwosu",
  "Tunde Bakare",
  "Femi Adigun",
  "Kayode Eze",
  "Yusuf Bello",
  "Bayo Adeleke",
  "Ibrahim Musa",
  "Kingsley Okoli",
];

const severityBadge = (s: Incident["severity"]) =>
  s === "Low"
    ? { text: "Low", variant: "muted" as const }
    : s === "Medium"
      ? { text: "Medium", variant: "orange" as const }
      : s === "High"
        ? { text: "High", variant: "red" as const }
        : { text: "Urgent", variant: "purple" as const };

const statusBadge = (s: Incident["status"]) =>
  s === "Open"
    ? { text: "Open", variant: "orange" as const }
    : { text: "Resolved", variant: "green" as const };

export default function HostelAdminIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [newBoarder, setNewBoarder] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newSeverity, setNewSeverity] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const openCount = incidents.filter((i) => i.status === "Open").length;
  const resolvedCount = incidents.filter((i) => i.status === "Resolved").length;

  const markResolved = () => {
    if (!selected) return;
    setIncidents((prev) => prev.map((i) => (i.id === selected.id ? { ...i, status: "Resolved" } : i)));
    setSelected({ ...selected, status: "Resolved" });
    showToast("Incident marked as resolved");
  };

  const notifyGuardian = () => {
    if (!selected) return;
    showToast(`Guardian of ${selected.boarder} notified via SMS`);
  };

  const addIncident = () => {
    if (!newBoarder || !newTitle || !newSeverity) return;
    const maxNum = Math.max(...incidents.map((i) => parseInt(i.id.slice(4), 10)));
    setIncidents((prev) => [
      ...prev,
      {
        id: `INC-${maxNum + 1}`,
        title: newTitle.trim(),
        boarder: newBoarder,
        room: "—",
        severity: newSeverity as Incident["severity"],
        status: "Open",
        time: "Just now",
        desc: newDesc.trim() || "No additional details provided.",
      },
    ]);
    setNewBoarder("");
    setNewTitle("");
    setNewSeverity("");
    setNewDesc("");
    setAddOpen(false);
    showToast("Incident logged");
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Incidents"
        subtitle="Log and manage hostel incidents"
        actions={<Button onClick={() => setAddOpen(true)}>+ Log Incident</Button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Open" value={String(openCount)} detail="awaiting action" detailColor="orange" />
        <StatCard label="Resolved" value={String(resolvedCount)} detail="closed this week" detailColor="green" />
        <StatCard label="This Week" value={String(incidents.length)} detail="total logged" detailColor="blue" />
      </div>

      <Card className="divide-y divide-border-light overflow-hidden">
        {incidents.map((inc) => (
          <button
            key={inc.id}
            onClick={() => {
              setSelected(inc);
              setDetailOpen(true);
            }}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface/60 transition-colors"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-text-dark truncate">{inc.title}</p>
                <Badge variant={statusBadge(inc.status).variant}>{inc.status}</Badge>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {inc.boarder} · Room {inc.room} · {inc.time}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Badge variant={severityBadge(inc.severity).variant}>{inc.severity}</Badge>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </div>
          </button>
        ))}
      </Card>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.title ?? ""}
        subtitle={selected ? `${selected.id} · reported ${selected.time}` : undefined}
        footer={
          selected && (
            <>
              <Button variant="secondary" onClick={notifyGuardian}>
                <PhoneCall className="w-4 h-4" /> Notify Guardian
              </Button>
              {selected.status === "Open" && (
                <Button onClick={markResolved}>
                  <CheckCircle className="w-4 h-4" /> Mark Resolved
                </Button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Badge variant={severityBadge(selected.severity).variant}>{selected.severity}</Badge>
              <Badge variant={statusBadge(selected.status).variant}>{selected.status}</Badge>
            </div>
            <div className="rounded-lg border border-border-light p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Boarder</p>
                <p className="text-sm font-medium text-text-dark">{selected.boarder}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted">Room</p>
                <p className="text-sm font-medium text-text-dark">{selected.room}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1.5">Description</p>
              <p className="text-sm text-text-dark leading-relaxed">{selected.desc}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Log Incident"
        subtitle="Record a new incident at Red House"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addIncident}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Boarder"
            required
            placeholder="Select boarder"
            options={boarderNames}
            value={newBoarder}
            onChange={(e) => setNewBoarder(e.target.value)}
          />
          <Field label="Title" required>
            <TextInput
              placeholder="Incident title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </Field>
          <SelectField
            label="Severity"
            required
            placeholder="Select severity"
            options={["Low", "Medium", "High", "Urgent"]}
            value={newSeverity}
            onChange={(e) => setNewSeverity(e.target.value)}
          />
          <Field label="Description" required>
            <TextArea
              rows={4}
              placeholder="Describe what happened"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </Field>
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