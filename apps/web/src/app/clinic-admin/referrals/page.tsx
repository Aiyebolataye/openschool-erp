"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Modal } from "@/components/ui/modal";
import { Field, TextArea, SelectField } from "@/components/ui/form";
import { ChevronRight, CheckCircle, SendHorizonal } from "lucide-react";

type Status = "Pending" | "Completed";

interface Referral {
  id: string;
  student: string;
  klass: string;
  reason: string;
  destination: string;
  status: Status;
  date: string;
  notes: string;
}

const initialReferrals: Referral[] = [
  {
    id: "REF-301",
    student: "Tunde Bakare",
    klass: "JSS3 A",
    reason: "Suspected ankle fracture after a fall during football practice.",
    destination: "University Teaching Hospital",
    status: "Pending",
    date: "Today",
    notes: "Accompanied by the PE teacher; X-ray requested.",
  },
  {
    id: "REF-300",
    student: "Zainab Adeyemi",
    klass: "SS3 Science",
    reason: "Recurrent asthma attacks despite ongoing medication.",
    destination: "St. Mary&apos;s Hospital",
    status: "Completed",
    date: "2 days ago",
    notes: "Seen by a respiratory specialist; inhaler plan updated.",
  },
  {
    id: "REF-299",
    student: "Chinedu Eze",
    klass: "SS2 Art",
    reason: "Persistent skin rash for follow-up dermatology review.",
    destination: "Greenfield Clinic",
    status: "Pending",
    date: "3 days ago",
    notes: "Awaiting dermatologist appointment slot.",
  },
  {
    id: "REF-298",
    student: "Fatima Bello",
    klass: "SS1 Science",
    reason: "Severe migraine episodes affecting concentration in class.",
    destination: "Local Health Center",
    status: "Completed",
    date: "1 week ago",
    notes: "Neurology consult done; medication adjusted.",
  },
  {
    id: "REF-297",
    student: "Musa Suleiman",
    klass: "SS3 Art",
    reason: "Eye strain and vision difficulty during lessons.",
    destination: "St. Mary&apos;s Hospital",
    status: "Pending",
    date: "1 week ago",
    notes: "Referral letter handed to guardian; glasses fitting scheduled.",
  },
];

const studentNames = [
  "Tunde Bakare",
  "Zainab Adeyemi",
  "Chinedu Eze",
  "Fatima Bello",
  "Musa Suleiman",
  "Adaeze Nwosu",
  "Ifeoma Okafor",
  "Seyi Balogun",
];

const destinationOptions = [
  "Greenfield Clinic",
  "St. Mary&apos;s Hospital",
  "University Teaching Hospital",
  "Local Health Center",
];

const statusBadge = (s: Status) =>
  s === "Pending"
    ? { text: "Pending", variant: "orange" as const }
    : { text: "Completed", variant: "green" as const };

export default function ClinicReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>(initialReferrals);
  const [search, setSearch] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Referral | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [newStudent, setNewStudent] = useState("");
  const [newReason, setNewReason] = useState("");
  const [newDestination, setNewDestination] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const q = search.trim().toLowerCase();
  const filtered = referrals.filter(
    (r) =>
      !q ||
      r.student.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q) ||
      r.destination.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
  );

  const markCompleted = () => {
    if (!selected) return;
    setReferrals((prev) => prev.map((r) => (r.id === selected.id ? { ...r, status: "Completed" } : r)));
    setSelected({ ...selected, status: "Completed" });
    showToast("Referral marked as completed");
  };

  const addReferral = () => {
    if (!newStudent || !newReason || !newDestination) return;
    const maxNum = Math.max(...referrals.map((r) => parseInt(r.id.slice(4), 10)));
    setReferrals((prev) => [
      ...prev,
      {
        id: `REF-${maxNum + 1}`,
        student: newStudent,
        klass: "SS1 Science",
        reason: newReason.trim(),
        destination: newDestination,
        status: "Pending",
        date: "Today",
        notes: newNotes.trim() || "Awaiting visit.",
      },
    ]);
    setNewStudent("");
    setNewReason("");
    setNewDestination("");
    setNewNotes("");
    setAddOpen(false);
    showToast("Referral submitted");
  };

  return (
    <div className="max-w-[900px] mx-auto">
      <PageHeader
        title="Referrals"
        subtitle="Referrals to external clinics and hospitals"
        actions={<Button onClick={() => setAddOpen(true)}>+ New Referral</Button>}
      />

      <Card className="p-4 mb-6">
        <SearchInput
          placeholder="Search by student, ID, reason, destination or status..."
          value={search}
          onChange={setSearch}
          className="max-w-md"
        />
      </Card>

      <Card className="divide-y divide-border-light overflow-hidden">
        {filtered.map((r) => (
          <button
            key={r.id}
            onClick={() => {
              setSelected(r);
              setDetailOpen(true);
            }}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface/60 transition-colors"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-text-dark truncate">{r.student}</p>
                <Badge variant={statusBadge(r.status).variant}>{r.status}</Badge>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {r.id} · {r.klass} · Referred to {r.destination}
              </p>
              <p className="text-xs text-text-muted/70 mt-0.5">{r.reason}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-text-muted">{r.date}</span>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="px-5 py-8 text-sm text-text-muted text-center">No referrals match your search.</p>
        )}
      </Card>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.student ?? ""}
        subtitle={selected ? `${selected.id} · Referred ${selected.date}` : undefined}
        footer={
          selected && (
            <>
              {selected.status === "Pending" && (
                <Button onClick={markCompleted}>
                  <CheckCircle className="w-4 h-4" /> Mark Completed
                </Button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border border-border-light p-4">
              <div>
                <p className="text-xs text-text-muted">Referred To</p>
                <p className="text-sm font-medium text-text-dark">{selected.destination}</p>
              </div>
              <Badge variant={statusBadge(selected.status).variant}>{selected.status}</Badge>
            </div>
            <div className="rounded-lg border border-border-light p-4">
              <p className="text-xs text-text-muted mb-1.5">Reason</p>
              <p className="text-sm text-text-dark leading-relaxed">{selected.reason}</p>
            </div>
            <div className="rounded-lg border border-border-light p-4">
              <p className="text-xs text-text-muted mb-1.5">Notes</p>
              <p className="text-sm text-text-dark leading-relaxed">{selected.notes}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="New Referral"
        subtitle="Refer a student to a clinic or hospital"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addReferral}>
              <SendHorizonal className="w-4 h-4" /> Submit Referral
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Student"
            required
            placeholder="Select student"
            options={studentNames}
            value={newStudent}
            onChange={(e) => setNewStudent(e.target.value)}
          />
          <SelectField
            label="Refer To"
            required
            placeholder="Select destination"
            options={destinationOptions}
            value={newDestination}
            onChange={(e) => setNewDestination(e.target.value)}
          />
          <Field label="Reason" required>
            <TextArea
              rows={3}
              placeholder="Reason for referral"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
            />
          </Field>
          <Field label="Notes">
            <TextArea
              rows={3}
              placeholder="Additional notes"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
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