"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import type { TableRow } from "@/types";
import { BedDouble, Plus, LogOut } from "lucide-react";

interface Room {
  id: string;
  no: string;
  capacity: number;
}

interface RoomBoarder {
  id: string;
  name: string;
  room: string;
  bed: string;
}

const initialRooms: Room[] = [
  { id: "r1", no: "1-A", capacity: 4 },
  { id: "r2", no: "2-C", capacity: 4 },
  { id: "r3", no: "3-A", capacity: 4 },
  { id: "r4", no: "3-B", capacity: 4 },
  { id: "r5", no: "5-C", capacity: 4 },
  { id: "r6", no: "6-A", capacity: 4 },
  { id: "r7", no: "7-D", capacity: 4 },
  { id: "r8", no: "8-A", capacity: 4 },
  { id: "r9", no: "12-B", capacity: 4 },
];

const initialRoomBoarders: RoomBoarder[] = [
  { id: "b1", name: "Chidi Eze", room: "3-A", bed: "Bed 1" },
  { id: "b2", name: "Tom Wallace", room: "12-B", bed: "Bed 2" },
  { id: "b3", name: "Omar Farouk", room: "5-C", bed: "Bed 3" },
  { id: "b4", name: "David Okafor", room: "7-D", bed: "Bed 1" },
  { id: "b5", name: "Emeka Nwosu", room: "3-B", bed: "Bed 2" },
  { id: "b6", name: "Tunde Bakare", room: "6-A", bed: "Bed 4" },
  { id: "b7", name: "Femi Adigun", room: "8-A", bed: "Bed 1" },
  { id: "b8", name: "Kayode Eze", room: "2-C", bed: "Bed 2" },
  { id: "b9", name: "Yusuf Bello", room: "3-A", bed: "Bed 3" },
  { id: "b10", name: "Bayo Adeleke", room: "3-A", bed: "Bed 4" },
  { id: "b11", name: "Ibrahim Musa", room: "12-B", bed: "Bed 1" },
  { id: "b12", name: "Kingsley Okoli", room: "3-A", bed: "Bed 2" },
];

const columns = [
  { key: "no", label: "ROOM NO" },
  { key: "capacity", label: "CAPACITY" },
  { key: "occupied", label: "OCCUPIED" },
  { key: "status", label: "STATUS" },
];

export default function HostelAdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [boarders, setBoarders] = useState<RoomBoarder[]>(initialRoomBoarders);
  const [roomOpen, setRoomOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [assignBoarder, setAssignBoarder] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newRoomNo, setNewRoomNo] = useState("");
  const [newCapacity, setNewCapacity] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const rows: TableRow[] = rooms.map((r) => {
    const occupied = boarders.filter((b) => b.room === r.no).length;
    const status =
      occupied === 0
        ? { text: "Available", variant: "green" as const }
        : occupied >= r.capacity
          ? { text: "Full", variant: "red" as const }
          : { text: "Partial", variant: "orange" as const };
    return {
      no: r.no,
      capacity: String(r.capacity),
      occupied: String(occupied),
      status,
    };
  });

  const openRoom = (row: TableRow, i: number) => {
    setSelectedRoom(rooms[i]);
    setAssignBoarder("");
    setRoomOpen(true);
  };

  const unassignedOptions = selectedRoom
    ? boarders.filter((b) => b.room !== selectedRoom.no).map((b) => b.name)
    : [];

  const assignBed = () => {
    if (!selectedRoom || !assignBoarder) return;
    const vacant = Array.from({ length: selectedRoom.capacity }, (_, i) => `Bed ${i + 1}`).find(
      (bed) => !boarders.some((b) => b.room === selectedRoom.no && b.bed === bed)
    );
    if (!vacant) {
      showToast(`${selectedRoom.no} is full`);
      return;
    }
    setBoarders((prev) =>
      prev.map((b) => (b.name === assignBoarder ? { ...b, room: selectedRoom.no, bed: vacant } : b))
    );
    showToast(`${assignBoarder} assigned to ${selectedRoom.no} · ${vacant}`);
    setAssignBoarder("");
  };

  const vacateBed = (name: string, roomNo: string, bed: string) => {
    setBoarders((prev) => prev.map((b) => (b.name === name ? { ...b, room: "", bed: "" } : b)));
    showToast(`${name} vacated ${roomNo} · ${bed}`);
  };

  const addRoom = () => {
    const cap = Number(newCapacity);
    if (!newRoomNo.trim() || !cap) return;
    setRooms((prev) => [...prev, { id: `r${prev.length + 1}`, no: newRoomNo.trim(), capacity: cap }]);
    setNewRoomNo("");
    setNewCapacity("");
    setAddOpen(false);
    showToast(`Room ${newRoomNo.trim()} added`);
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Rooms & Beds"
        subtitle="Manage rooms and bed allocation"
        actions={<Button onClick={() => setAddOpen(true)}>+ Add Room</Button>}
      />

      <DataTable columns={columns} data={rows} onRowClick={openRoom} />

      <Modal
        open={roomOpen}
        onClose={() => setRoomOpen(false)}
        title={`Room ${selectedRoom?.no ?? ""}`}
        subtitle={selectedRoom ? `Capacity ${selectedRoom.capacity} · 4-bed dormitory` : undefined}
      >
        {selectedRoom && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border-light divide-y divide-border-light">
              {Array.from({ length: selectedRoom.capacity }, (_, i) => {
                const n = i + 1;
                const occupant = boarders.find((b) => b.room === selectedRoom.no && b.bed === `Bed ${n}`);
                return (
                  <div key={n} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <BedDouble className="w-4 h-4 text-text-muted" />
                      <div>
                        <p className="text-sm font-medium text-text-dark">Bed {n}</p>
                        {occupant ? (
                          <p className="text-xs text-text-muted">{occupant.name}</p>
                        ) : (
                          <p className="text-xs text-text-muted">Vacant</p>
                        )}
                      </div>
                    </div>
                    {occupant ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => vacateBed(occupant.name, selectedRoom.no, occupant.bed)}
                      >
                        <LogOut className="w-3.5 h-3.5" /> Vacate
                      </Button>
                    ) : (
                      <Badge variant="green">Available</Badge>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg border border-border-light p-4">
              <p className="text-sm font-semibold text-text-dark mb-3">Assign Boarder</p>
              <div className="flex gap-2">
                <SelectField
                  label="Boarder"
                  placeholder="Select boarder"
                  options={unassignedOptions}
                  value={assignBoarder}
                  onChange={(e) => setAssignBoarder(e.target.value)}
                />
                <div className="flex items-end pb-0.5">
                  <Button size="sm" onClick={assignBed}>
                    <Plus className="w-4 h-4" /> Assign
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Room"
        subtitle="Create a new dormitory room"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addRoom}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Room No" required>
            <TextInput
              placeholder="e.g. 9-B"
              value={newRoomNo}
              onChange={(e) => setNewRoomNo(e.target.value)}
            />
          </Field>
          <Field label="Capacity" required>
            <TextInput
              type="number"
              min={1}
              placeholder="e.g. 4"
              value={newCapacity}
              onChange={(e) => setNewCapacity(e.target.value)}
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