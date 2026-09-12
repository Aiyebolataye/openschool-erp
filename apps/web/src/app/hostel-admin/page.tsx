"use client";

import { useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { UserPlus, AlertTriangle, CalendarOff, ChevronRight } from "lucide-react";

const kpis = [
  { label: "Total Boarders", value: "141", detail: "of 150 capacity", detailColor: "blue" as const },
  { label: "Rooms", value: "75", detail: "9 wings", detailColor: "muted" as const },
  { label: "Occupancy", value: "94%", detail: "+2% vs last week", detailColor: "green" as const },
  { label: "Pending Leave", value: "6", detail: "3 overdue", detailColor: "orange" as const },
  { label: "Incidents This Week", value: "3", detail: "1 resolved", detailColor: "red" as const },
  { label: "Bed Checks", value: "98.6%", detail: "attendance rate", detailColor: "green" as const },
];

const glance = [
  { id: "STU-21401", name: "Chidi Eze", room: "3-A · Bed 1", klass: "SS1 Science", status: { text: "In hostel", variant: "green" as const } },
  { id: "STU-21404", name: "Tom Wallace", room: "12-B · Bed 2", klass: "SS3 Art", status: { text: "In hostel", variant: "green" as const } },
  { id: "STU-21406", name: "Omar Farouk", room: "5-C · Bed 3", klass: "SS3 Art", status: { text: "On leave", variant: "orange" as const } },
  { id: "STU-21407", name: "David Okafor", room: "7-D · Bed 1", klass: "SS2 Science", status: { text: "In hostel", variant: "green" as const } },
  { id: "STU-21410", name: "Femi Adigun", room: "8-A · Bed 1", klass: "JSS2 B", status: { text: "Out", variant: "red" as const } },
];

const recentIncidents = [
  { id: "INC-1041", title: "Altercation in common room", boarder: "Chidi Eze", room: "3-A", severity: { text: "High", variant: "red" as const }, time: "2h ago" },
  { id: "INC-1040", title: "Missing school shoes", boarder: "Tunde Bakare", room: "6-A", severity: { text: "Medium", variant: "orange" as const }, time: "3h ago" },
  { id: "INC-1039", title: "Left hostel without permission", boarder: "Omar Farouk", room: "5-C", severity: { text: "Urgent", variant: "purple" as const }, time: "4h ago" },
];

type Glance = (typeof glance)[number];

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

export default function HostelAdminDashboardPage() {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [glanceOpen, setGlanceOpen] = useState(false);
  const [selectedGlance, setSelectedGlance] = useState<Glance | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [checkInBoarder, setCheckInBoarder] = useState("");
  const [checkInRoom, setCheckInRoom] = useState("");
  const [incBoarder, setIncBoarder] = useState("");
  const [incTitle, setIncTitle] = useState("");
  const [incSeverity, setIncSeverity] = useState("");
  const [incDesc, setIncDesc] = useState("");
  const [leaveBoarder, setLeaveBoarder] = useState("");
  const [leaveFrom, setLeaveFrom] = useState("");
  const [leaveReturn, setLeaveReturn] = useState("");
  const [leaveReason, setLeaveReason] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const saveCheckIn = () => {
    if (!checkInBoarder || !checkInRoom) return;
    setCheckInOpen(false);
    setCheckInBoarder("");
    setCheckInRoom("");
    showToast("Boarder checked in successfully");
  };

  const saveIncident = () => {
    if (!incBoarder || !incTitle || !incSeverity) return;
    setIncidentOpen(false);
    setIncBoarder("");
    setIncTitle("");
    setIncSeverity("");
    setIncDesc("");
    showToast("Incident logged");
  };

  const saveLeave = () => {
    if (!leaveBoarder || !leaveFrom || !leaveReturn) return;
    setLeaveOpen(false);
    setLeaveBoarder("");
    setLeaveFrom("");
    setLeaveReturn("");
    setLeaveReason("");
    showToast("Leave granted");
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Red House — Boys"
        subtitle="Hostel dashboard · Warden Mr. Okoye · 94% occupancy"
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="p-5 mb-6">
        <h3 className="text-sm font-semibold text-text-dark mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setCheckInOpen(true)}>
            <UserPlus className="w-4 h-4" /> Check-in Boarder
          </Button>
          <Button variant="secondary" onClick={() => setIncidentOpen(true)}>
            <AlertTriangle className="w-4 h-4" /> Log Incident
          </Button>
          <Button variant="secondary" onClick={() => setLeaveOpen(true)}>
            <CalendarOff className="w-4 h-4" /> Grant Leave
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-text-dark mb-2">Boarders at a glance</h3>
          <Card className="divide-y divide-border-light">
            {glance.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedGlance(b);
                  setGlanceOpen(true);
                }}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-surface/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-dark">{b.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {b.room} · {b.klass}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={b.status.variant}>{b.status.text}</Badge>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
              </button>
            ))}
            <Link
              href="/hostel-admin/boarders"
              className="block text-center text-xs font-medium text-primary hover:underline py-3"
            >
              View all boarders →
            </Link>
          </Card>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-dark mb-2">Recent Incidents</h3>
          <Card className="divide-y divide-border-light">
            {recentIncidents.map((inc) => (
              <div key={inc.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-dark truncate">{inc.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {inc.boarder} · Room {inc.room} · {inc.time}
                  </p>
                </div>
                <Badge variant={inc.severity.variant}>{inc.severity.text}</Badge>
              </div>
            ))}
            <Link
              href="/hostel-admin/incidents"
              className="block text-center text-xs font-medium text-primary hover:underline py-3"
            >
              View all incidents →
            </Link>
          </Card>
        </div>
      </div>

      <Modal
        open={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        title="Check-in Boarder"
        subtitle="Assign an arriving boarder to a room and bed"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCheckInOpen(false)}>Cancel</Button>
            <Button onClick={saveCheckIn}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Boarder"
            required
            placeholder="Select boarder"
            options={["Musa Suleiman", "Ikechukwu Obi", "Peter Ade", "Sodiq Yusuf"]}
            value={checkInBoarder}
            onChange={(e) => setCheckInBoarder(e.target.value)}
          />
          <SelectField
            label="Room · Bed"
            required
            placeholder="Select room and bed"
            options={["1-A · Bed 2", "2-C · Bed 1", "4-A · Bed 3", "8-B · Bed 2"]}
            value={checkInRoom}
            onChange={(e) => setCheckInRoom(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={incidentOpen}
        onClose={() => setIncidentOpen(false)}
        title="Log Incident"
        subtitle="Record a new incident at Red House"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIncidentOpen(false)}>Cancel</Button>
            <Button onClick={saveIncident}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Boarder"
            required
            placeholder="Select boarder"
            options={boarderNames}
            value={incBoarder}
            onChange={(e) => setIncBoarder(e.target.value)}
          />
          <Field label="Title" required>
            <TextInput
              placeholder="Incident title"
              value={incTitle}
              onChange={(e) => setIncTitle(e.target.value)}
            />
          </Field>
          <SelectField
            label="Severity"
            required
            placeholder="Select severity"
            options={["Low", "Medium", "High", "Urgent"]}
            value={incSeverity}
            onChange={(e) => setIncSeverity(e.target.value)}
          />
          <Field label="Description" required>
            <TextArea
              rows={3}
              placeholder="Describe what happened"
              value={incDesc}
              onChange={(e) => setIncDesc(e.target.value)}
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        title="Grant Leave"
        subtitle="Approve hostel leave for a boarder"
        footer={
          <>
            <Button variant="secondary" onClick={() => setLeaveOpen(false)}>Cancel</Button>
            <Button onClick={saveLeave}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Boarder"
            required
            placeholder="Select boarder"
            options={boarderNames}
            value={leaveBoarder}
            onChange={(e) => setLeaveBoarder(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Leave From" required>
              <TextInput type="date" value={leaveFrom} onChange={(e) => setLeaveFrom(e.target.value)} />
            </Field>
            <Field label="Return By" required>
              <TextInput type="date" value={leaveReturn} onChange={(e) => setLeaveReturn(e.target.value)} />
            </Field>
          </div>
          <Field label="Reason">
            <TextInput
              placeholder="Reason for leave"
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={glanceOpen}
        onClose={() => setGlanceOpen(false)}
        title={selectedGlance?.name ?? ""}
        subtitle={selectedGlance ? `${selectedGlance.id} · ${selectedGlance.klass}` : undefined}
        footer={
          <Link href="/hostel-admin/boarders">
            <Button onClick={() => setGlanceOpen(false)}>Open Boarders</Button>
          </Link>
        }
      >
        {selectedGlance && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border-light p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Room · Bed</p>
                <p className="text-sm font-medium text-text-dark">{selectedGlance.room}</p>
              </div>
              <Badge variant={selectedGlance.status.variant}>{selectedGlance.status.text}</Badge>
            </div>
            <p className="text-sm text-text-dark">
              Boarder <span className="font-medium">{selectedGlance.name}</span> is currently{" "}
              <span className="font-medium">{selectedGlance.status.text.toLowerCase()}</span> at Red House — Boys.
            </p>
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