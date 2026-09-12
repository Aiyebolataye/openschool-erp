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
import { Bus, Wrench, Users } from "lucide-react";

type VehicleStatus = "Operational" | "Maintenance" | "Out of service";

interface Vehicle {
  id: string;
  name: string;
  plate: string;
  capacity: number;
  status: VehicleStatus;
  nextService: string;
  odometer: string;
}

const initialVehicles: Vehicle[] = [
  { id: "VH-01", name: "Greenfield 1", plate: "BWR 118 QA", capacity: 18, status: "Operational", nextService: "12 Oct 2026", odometer: "84,200 km" },
  { id: "VH-02", name: "Greenfield 2", plate: "BWR 121 QB", capacity: 24, status: "Maintenance", nextService: "09 Sep 2026", odometer: "121,900 km" },
  { id: "VH-03", name: "Greenfield 3", plate: "BWR 133 QC", capacity: 24, status: "Operational", nextService: "26 Oct 2026", odometer: "96,400 km" },
  { id: "VH-04", name: "Greenfield 4", plate: "BWR 147 QD", capacity: 15, status: "Operational", nextService: "05 Nov 2026", odometer: "63,100 km" },
  { id: "VH-05", name: "Greenfield 5", plate: "BWR 150 QE", capacity: 16, status: "Out of service", nextService: "02 Oct 2026", odometer: "142,600 km" },
];

const statusOptions = ["Operational", "Maintenance", "Out of service"];

const vehicleStatusBadge = (s: VehicleStatus) =>
  s === "Operational"
    ? { text: "Operational", variant: "green" as const }
    : s === "Maintenance"
      ? { text: "Maintenance", variant: "orange" as const }
      : { text: "Out of service", variant: "red" as const };

const columns = [
  { key: "bus", label: "BUS / PLATE" },
  { key: "capacity", label: "CAPACITY" },
  { key: "status", label: "STATUS" },
  { key: "nextService", label: "NEXT SERVICE" },
];

export default function TransportManagerVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newPlate, setNewPlate] = useState("");
  const [newCapacity, setNewCapacity] = useState("");
  const [newStatus, setNewStatus] = useState("Operational");
  const [newNextService, setNewNextService] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const rows: TableRow[] = vehicles.map((v) => ({
    bus: (
      <div>
        <p className="text-sm font-medium text-text-dark">{v.name}</p>
        <p className="text-xs text-text-muted">{v.plate}</p>
      </div>
    ),
    capacity: `${v.capacity} seats`,
    status: vehicleStatusBadge(v.status),
    nextService: v.nextService,
  }));

  const openDetail = (row: TableRow, i: number) => {
    setSelected(vehicles[i]);
    setDetailOpen(true);
  };

  const addVehicle = () => {
    const cap = Number(newCapacity);
    if (!newName.trim() || !newPlate.trim() || !cap) return;
    const maxNum = Math.max(...vehicles.map((v) => parseInt(v.id.slice(3), 10)));
    setVehicles((prev) => [
      ...prev,
      {
        id: `VH-${String(maxNum + 1).padStart(2, "0")}`,
        name: newName.trim(),
        plate: newPlate.trim().toUpperCase(),
        capacity: cap,
        status: newStatus as VehicleStatus,
        nextService: newNextService || "Not scheduled",
        odometer: "0 km",
      },
    ]);
    setNewName("");
    setNewPlate("");
    setNewCapacity("");
    setNewStatus("Operational");
    setNewNextService("");
    setAddOpen(false);
    showToast(`${newName.trim()} added to fleet`);
  };

  const logMaintenance = () => {
    if (!selected) return;
    if (selected.status === "Operational") {
      setVehicles((prev) => prev.map((v) => (v.id === selected.id ? { ...v, status: "Maintenance" } : v)));
      setSelected({ ...selected, status: "Maintenance" });
    }
    showToast(`Maintenance logged for ${selected.name} — garage notified`);
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Vehicles"
        subtitle="Manage the transport fleet, service schedules and roadworthiness"
        actions={<Button onClick={() => setAddOpen(true)}>+ Add Vehicle</Button>}
      />

      <Card className="p-4 mb-6 flex items-center gap-3">
        <Bus className="w-4 h-4 text-text-muted" />
        <p className="text-xs text-text-muted">
          {vehicles.filter((v) => v.status === "Operational").length} operational · {vehicles.filter((v) => v.status === "Maintenance").length} in maintenance · {vehicles.filter((v) => v.status === "Out of service").length} out of service
        </p>
      </Card>

      <DataTable columns={columns} data={rows} onRowClick={openDetail} />

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.name ?? ""}
        subtitle={selected ? `${selected.plate} · ${selected.id}` : undefined}
        footer={
          selected &&
          selected.status !== "Out of service" && (
            <Button variant="secondary" onClick={logMaintenance}>
              <Wrench className="w-4 h-4" /> Log Maintenance
            </Button>
          )
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border border-border-light p-4">
              <div>
                <p className="text-xs text-text-muted">Vehicle</p>
                <p className="text-sm font-medium text-text-dark">
                  {selected.name} · {selected.plate}
                </p>
              </div>
              <Badge variant={vehicleStatusBadge(selected.status).variant}>{selected.status}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted flex items-center gap-1">
                  <Users className="w-3 h-3" /> Capacity
                </p>
                <p className="text-sm font-semibold text-text-dark mt-1">{selected.capacity} seats</p>
              </div>
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted">Odometer</p>
                <p className="text-sm font-semibold text-text-dark mt-1">{selected.odometer}</p>
              </div>
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted">Next Service</p>
                <p className="text-sm font-semibold text-text-dark mt-1">{selected.nextService}</p>
              </div>
            </div>
            {selected.status === "Maintenance" && (
              <div className="rounded-lg bg-orange-light/40 border border-orange/30 px-3 py-2 text-xs text-text-dark">
                This bus is in the workshop. Trips on its assigned route are running on a reduced schedule.
              </div>
            )}
            {selected.status === "Out of service" && (
              <div className="rounded-lg bg-red-light/40 border border-red/30 px-3 py-2 text-xs text-text-dark">
                This bus is out of service pending repairs and inspection. Contact the garage for an update.
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Vehicle"
        subtitle="Register a new bus in the transport fleet"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addVehicle}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Bus Name" required>
            <TextInput
              placeholder="e.g. Greenfield 6"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </Field>
          <Field label="Plate Number" required>
            <TextInput
              placeholder="e.g. BWR 162 QF"
              value={newPlate}
              onChange={(e) => setNewPlate(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Capacity" required>
              <TextInput
                type="number"
                min={1}
                placeholder="e.g. 18"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
              />
            </Field>
            <Field label="Next Service">
              <TextInput
                type="date"
                value={newNextService}
                onChange={(e) => setNewNextService(e.target.value)}
              />
            </Field>
          </div>
          <SelectField
            label="Status"
            required
            placeholder="Select status"
            options={statusOptions}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
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
