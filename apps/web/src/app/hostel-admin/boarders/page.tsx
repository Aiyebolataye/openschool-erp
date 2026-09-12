"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { Chatbox } from "@/components/ui/chatbox";
import type { TableRow } from "@/types";
import { Copy, Check, MessageCircle, LogOut, LogIn, Phone } from "lucide-react";

type Status = "In hostel" | "On leave" | "Out" | "Removal requested";

interface Boarder {
  id: string;
  name: string;
  room: string;
  bed: string;
  klass: string;
  guardian: string;
  guardianPhone: string;
  status: Status;
}

const initialBoarders: Boarder[] = [
  { id: "STU-21401", name: "Chidi Eze", room: "3-A", bed: "Bed 1", klass: "SS1 Science", guardian: "Mr. Eze", guardianPhone: "+234 810 555 1001", status: "In hostel" },
  { id: "STU-21404", name: "Tom Wallace", room: "12-B", bed: "Bed 2", klass: "SS3 Art", guardian: "Mr. Wallace", guardianPhone: "+234 810 555 1002", status: "In hostel" },
  { id: "STU-21406", name: "Omar Farouk", room: "5-C", bed: "Bed 3", klass: "SS3 Art", guardian: "Mrs. Farouk", guardianPhone: "+234 810 555 1003", status: "On leave" },
  { id: "STU-21407", name: "David Okafor", room: "7-D", bed: "Bed 1", klass: "SS2 Science", guardian: "Mrs. Okafor", guardianPhone: "+234 810 555 1004", status: "In hostel" },
  { id: "STU-21408", name: "Emeka Nwosu", room: "3-B", bed: "Bed 2", klass: "SS2 Science", guardian: "Mr. Nwosu", guardianPhone: "+234 810 555 1005", status: "In hostel" },
  { id: "STU-21409", name: "Tunde Bakare", room: "6-A", bed: "Bed 4", klass: "JSS3 A", guardian: "Mr. Bakare", guardianPhone: "+234 810 555 1006", status: "In hostel" },
  { id: "STU-21410", name: "Femi Adigun", room: "8-A", bed: "Bed 1", klass: "JSS2 B", guardian: "Mrs. Adigun", guardianPhone: "+234 810 555 1007", status: "Out" },
  { id: "STU-21411", name: "Kayode Eze", room: "2-C", bed: "Bed 2", klass: "SS1 Science", guardian: "Mr. Eze", guardianPhone: "+234 810 555 1001", status: "In hostel" },
  { id: "STU-21412", name: "Yusuf Bello", room: "3-A", bed: "Bed 3", klass: "SS3 Art", guardian: "Mr. Bello", guardianPhone: "+234 810 555 1008", status: "In hostel" },
  { id: "STU-21413", name: "Bayo Adeleke", room: "3-A", bed: "Bed 4", klass: "SS3 Art", guardian: "Mrs. Adeleke", guardianPhone: "+234 810 555 1009", status: "In hostel" },
  { id: "STU-21414", name: "Ibrahim Musa", room: "12-B", bed: "Bed 1", klass: "SS2 Science", guardian: "Mr. Musa", guardianPhone: "+234 810 555 1010", status: "On leave" },
  { id: "STU-21415", name: "Kingsley Okoli", room: "3-A", bed: "Bed 2", klass: "SS2 Science", guardian: "Mr. Okoli", guardianPhone: "+234 810 555 1011", status: "In hostel" },
];

const statusBadge = (s: Status) =>
  s === "In hostel"
    ? { text: "In hostel", variant: "green" as const }
    : s === "On leave"
      ? { text: "On leave", variant: "orange" as const }
      : s === "Out"
        ? { text: "Out", variant: "red" as const }
        : { text: "Removal requested", variant: "purple" as const };

const columns = [
  { key: "student", label: "STUDENT" },
  { key: "room", label: "ROOM / BED" },
  { key: "klass", label: "CLASS" },
  { key: "guardian", label: "GUARDIAN" },
  { key: "status", label: "STATUS" },
];

export default function HostelAdminBoardersPage() {
  const [boarders, setBoarders] = useState<Boarder[]>(initialBoarders);
  const [search, setSearch] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Boarder | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [removalOpen, setRemovalOpen] = useState(false);
  const [removalReason, setRemovalReason] = useState("");
  const [removalDate, setRemovalDate] = useState("");
  const [removalNote, setRemovalNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newGuardian, setNewGuardian] = useState("");
  const [newGuardianPhone, setNewGuardianPhone] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const q = search.trim().toLowerCase();
  const filtered = boarders.filter(
    (b) =>
      !q ||
      b.name.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.klass.toLowerCase().includes(q) ||
      b.guardian.toLowerCase().includes(q) ||
      b.room.toLowerCase().includes(q)
  );

  const rows: TableRow[] = filtered.map((b) => ({
    student: (
      <div>
        <p className="text-sm font-medium text-text-dark">{b.name}</p>
        <p className="text-xs text-text-muted">{b.id}</p>
      </div>
    ),
    room: `${b.room} · ${b.bed}`,
    klass: b.klass,
    guardian: b.guardian,
    status: statusBadge(b.status),
  }));

  const openDetail = (row: TableRow, i: number) => {
    setSelected(filtered[i]);
    setDetailOpen(true);
  };

  const copyPhone = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.guardianPhone);
    setCopied(true);
    showToast("Phone number copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleStatus = () => {
    if (!selected) return;
    if (selected.status === "Removal requested") {
      setBoarders((prev) => prev.map((b) => (b.id === selected.id ? { ...b, status: "In hostel" } : b)));
      setSelected({ ...selected, status: "In hostel" });
      showToast(`Removal application withdrawn for ${selected.name}`);
      return;
    }
    const next: Status = selected.status === "In hostel" ? "On leave" : "In hostel";
    setBoarders((prev) => prev.map((b) => (b.id === selected.id ? { ...b, status: next } : b)));
    setSelected({ ...selected, status: next });
    showToast(next === "On leave" ? `${selected.name} granted leave` : `${selected.name} checked in`);
  };

  const openRemoval = () => {
    setRemovalReason("");
    setRemovalDate("");
    setRemovalNote("");
    setRemovalOpen(true);
  };

  const submitRemoval = () => {
    if (!selected || !removalReason) return;
    setBoarders((prev) => prev.map((b) => (b.id === selected.id ? { ...b, status: "Removal requested" } : b)));
    setSelected({ ...selected, status: "Removal requested" });
    setRemovalOpen(false);
    showToast(`Removal application submitted for ${selected.name} — pending hostel manager approval`);
  };

  const addBoarder = () => {
    if (!newName || !newRoom || !newGuardian) return;
    const maxId = Math.max(...boarders.map((b) => parseInt(b.id.slice(4), 10)));
    const [room, bed] = newRoom.split(" · ");
    setBoarders((prev) => [
      ...prev,
      {
        id: `STU-${maxId + 1}`,
        name: newName,
        room,
        bed: bed ?? "Bed 1",
        klass: "SS1 Science",
        guardian: newGuardian,
        guardianPhone: newGuardianPhone || "+234 810 555 0000",
        status: "In hostel",
      },
    ]);
    setNewName("");
    setNewRoom("");
    setNewGuardian("");
    setNewGuardianPhone("");
    setAddOpen(false);
    showToast(`${newName} added to Red House`);
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Boarders"
        subtitle="Students residing in Red House — Boys"
        actions={<Button onClick={() => setAddOpen(true)}>+ Add Boarder</Button>}
      />

      <Card className="p-4 mb-6">
        <SearchInput
          placeholder="Search by name, ID, class, room or guardian..."
          value={search}
          onChange={setSearch}
          className="max-w-md"
        />
      </Card>

      {boarders.filter((b) => b.status === "Removal requested").length > 0 && (
        <div className="mb-4 rounded-lg bg-purple-light/40 border border-purple/30 px-4 py-3 text-xs text-text-dark flex items-center justify-between">
          <span>
            {boarders.filter((b) => b.status === "Removal requested").length} removal application(s) awaiting
            hostel manager approval. Approve in the hostel manager dashboard to release the beds.
          </span>
          <span className="inline-flex items-center gap-1.5 text-purple font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-purple" /> Pending approval
          </span>
        </div>
      )}

      <DataTable columns={columns} data={rows} onRowClick={openDetail} />

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.name ?? ""}
        subtitle={selected ? `${selected.id} · ${selected.klass}` : undefined}
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border border-border-light p-4">
              <div>
                <p className="text-xs text-text-muted">Room · Bed</p>
                <p className="text-sm font-medium text-text-dark">
                  {selected.room} · {selected.bed}
                </p>
              </div>
              <Badge variant={statusBadge(selected.status).variant}>{selected.status}</Badge>
            </div>

            <div className="rounded-lg border border-border-light p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-text-muted">Guardian</p>
                  <p className="text-sm font-medium text-text-dark">{selected.guardian}</p>
                  <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {selected.guardianPhone}
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={copyPhone}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setChatOpen(true)}>
                <MessageCircle className="w-4 h-4" /> Message Guardian
              </Button>
            </div>

            <Button onClick={toggleStatus}>
              {selected.status === "In hostel" ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {selected.status === "In hostel" ? "Grant Leave" : selected.status === "Removal requested" ? "Withdraw Removal Application" : "Check In"}
            </Button>

            {selected.status !== "Removal requested" ? (
              <Button variant="secondary" onClick={openRemoval}>
                Apply to Remove from Hostel
              </Button>
            ) : (
              <div className="rounded-lg bg-purple-light/40 border border-purple/30 px-3 py-2 text-xs text-text-dark">
                A removal application is pending hostel manager approval. The guardian will be notified once approved.
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title="Message Guardian"
        subtitle={selected ? `${selected.guardian} · Guardian of ${selected.name}` : undefined}
      >
        <Chatbox
          title={selected?.guardian ?? ""}
          subtitle={`Guardian of ${selected?.name ?? ""}`}
          initial={[
            { from: "them", text: `Hello, how is ${selected?.name ?? "my ward"} doing at the hostel?`, time: "1h ago" },
          ]}
        />
      </Modal>

      <Modal
        open={removalOpen}
        onClose={() => setRemovalOpen(false)}
        title="Apply to Remove from Hostel"
        subtitle={selected ? `${selected.name} · ${selected.id} · ${selected.room}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemovalOpen(false)}>Cancel</Button>
            <Button onClick={submitRemoval}>Submit Application</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Reason for Removal" required>
            <SelectField
              label=""
              placeholder="Select reason"
              options={["Guardian request", "Disciplinary", "Fee non-payment", "Relocation", "Completing schooling", "Other"]}
              value={removalReason}
              onChange={(e) => setRemovalReason(e.target.value)}
            />
          </Field>
          <Field label="Effective Date" required>
            <TextInput type="date" value={removalDate} onChange={(e) => setRemovalDate(e.target.value)} />
          </Field>
          <Field label="Additional Notes">
            <TextArea rows={3} placeholder="Optional details for the hostel manager's review..." value={removalNote} onChange={(e) => setRemovalNote(e.target.value)} />
          </Field>
          <p className="text-xs text-text-muted leading-relaxed">
            The application is sent to the hostel manager / school administration for approval. The guardian is notified
            once the removal is approved and the bed becomes available.
          </p>
        </div>
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Boarder"
        subtitle="Enroll a new boarder into Red House — Boys"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addBoarder}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Student"
            required
            placeholder="Select student"
            options={["Musa Suleiman", "Ikechukwu Obi", "Peter Ade", "Sodiq Yusuf", "Ahmed Bello"]}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <SelectField
            label="Room · Bed"
            required
            placeholder="Select room and bed"
            options={["1-A · Bed 1", "1-A · Bed 2", "4-A · Bed 3", "8-B · Bed 2", "9-C · Bed 4"]}
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
          />
          <Field label="Guardian Name" required>
            <TextInput
              placeholder="Enter guardian name"
              value={newGuardian}
              onChange={(e) => setNewGuardian(e.target.value)}
            />
          </Field>
          <Field label="Guardian Phone">
            <TextInput
              type="tel"
              placeholder="+234 xxx xxx xxxx"
              value={newGuardianPhone}
              onChange={(e) => setNewGuardianPhone(e.target.value)}
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