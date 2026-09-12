"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { SelectField } from "@/components/ui/form";
import type { TableRow } from "@/types";
import { Bus, Users, CheckCircle, ClipboardList } from "lucide-react";

type TripStatus = "On time" | "Delayed" | "Completed";

interface Trip {
  id: string;
  route: string;
  bus: string;
  driver: string;
  departure: string;
  status: TripStatus;
}

const initialTrips: Trip[] = [
  { id: "TP-301", route: "Gwarinpa Line", bus: "Greenfield 1", driver: "Mr. Chinedu Kalu", departure: "6:45 AM", status: "On time" },
  { id: "TP-302", route: "Kubwa Line", bus: "Greenfield 2", driver: "Mallam Usman Abdullahi", departure: "6:55 AM", status: "Delayed" },
  { id: "TP-303", route: "Wuse II / Maitama Line", bus: "Greenfield 3", driver: "Mr. Emeka Obi", departure: "7:05 AM", status: "On time" },
  { id: "TP-304", route: "Nyanya / Karu Line", bus: "Greenfield 4", driver: "Mr. Suleiman Musa", departure: "7:15 AM", status: "On time" },
  { id: "TP-305", route: "Bwari / Dutse Line", bus: "Greenfield 5", driver: "Mr. Joseph Adeyemi", departure: "7:20 AM", status: "Completed" },
  { id: "TP-306", route: "Gwarinpa Line", bus: "Greenfield 1", driver: "Mr. Chinedu Kalu", departure: "2:30 PM", status: "On time" },
  { id: "TP-307", route: "Kubwa Line", bus: "Greenfield 2", driver: "Mallam Usman Abdullahi", departure: "3:00 PM", status: "Completed" },
];

const routeOptions = ["Gwarinpa Line", "Kubwa Line", "Wuse II / Maitama Line", "Nyanya / Karu Line", "Bwari / Dutse Line"];
const busOptions = ["Greenfield 1", "Greenfield 2", "Greenfield 3", "Greenfield 4", "Greenfield 5"];
const driverOptions = ["Mr. Chinedu Kalu", "Mallam Usman Abdullahi", "Mr. Emeka Obi", "Mr. Suleiman Musa", "Mr. Joseph Adeyemi"];
const departureTimes = ["6:30 AM", "6:45 AM", "7:00 AM", "7:15 AM", "7:30 AM", "2:30 PM", "3:00 PM"];

const tripStatusBadge = (s: TripStatus) =>
  s === "On time"
    ? { text: "On time", variant: "green" as const }
    : s === "Delayed"
      ? { text: "Delayed", variant: "orange" as const }
      : { text: "Completed", variant: "muted" as const };

const columns = [
  { key: "route", label: "ROUTE" },
  { key: "bus", label: "BUS" },
  { key: "driver", label: "DRIVER" },
  { key: "departure", label: "DEPARTURE" },
  { key: "status", label: "STATUS" },
];

export default function TransportManagerTripsPage() {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Trip | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [newRoute, setNewRoute] = useState("");
  const [newBus, setNewBus] = useState("");
  const [newDriver, setNewDriver] = useState("");
  const [newDeparture, setNewDeparture] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const rows: TableRow[] = trips.map((t) => ({
    route: (
      <div>
        <p className="text-sm font-medium text-text-dark">{t.route}</p>
        <p className="text-xs text-text-muted">{t.id}</p>
      </div>
    ),
    bus: t.bus,
    driver: t.driver,
    departure: t.departure,
    status: tripStatusBadge(t.status),
  }));

  const openDetail = (row: TableRow, i: number) => {
    setSelected(trips[i]);
    setDetailOpen(true);
  };

  const addTrip = () => {
    if (!newRoute || !newBus || !newDriver || !newDeparture) return;
    const maxNum = Math.max(...trips.map((t) => parseInt(t.id.slice(3), 10)));
    setTrips((prev) => [
      ...prev,
      {
        id: `TP-${maxNum + 1}`,
        route: newRoute,
        bus: newBus,
        driver: newDriver,
        departure: newDeparture,
        status: "On time",
      },
    ]);
    setNewRoute("");
    setNewBus("");
    setNewDriver("");
    setNewDeparture("");
    setAddOpen(false);
    showToast("Trip logged");
  };

  const markComplete = () => {
    if (!selected) return;
    setTrips((prev) => prev.map((t) => (t.id === selected.id ? { ...t, status: "Completed" } : t)));
    setSelected({ ...selected, status: "Completed" });
    showToast(`Trip ${selected.id} marked as completed`);
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Trips"
        subtitle="Track daily route runs, departures and trip status"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <ClipboardList className="w-4 h-4" /> Log Trip
          </Button>
        }
      />

      <Card className="p-4 mb-6 flex items-center gap-3">
        <Bus className="w-4 h-4 text-text-muted" />
        <p className="text-xs text-text-muted">
          {trips.filter((t) => t.status === "On time").length} on time · {trips.filter((t) => t.status === "Delayed").length} delayed · {trips.filter((t) => t.status === "Completed").length} completed
        </p>
      </Card>

      <DataTable columns={columns} data={rows} onRowClick={openDetail} />

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected ? `${selected.route} · ${selected.id}` : ""}
        subtitle={selected ? `Departs ${selected.departure}` : undefined}
        footer={
          selected &&
          selected.status !== "Completed" && (
            <Button onClick={markComplete}>
              <CheckCircle className="w-4 h-4" /> Mark Completed
            </Button>
          )
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border border-border-light p-4">
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Bus</p>
                  <p className="text-sm font-medium text-text-dark">{selected.bus}</p>
                </div>
              </div>
              <Badge variant={tripStatusBadge(selected.status).variant}>{selected.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border-light p-4">
                <p className="text-xs text-text-muted flex items-center gap-1">
                  <Users className="w-3 h-3" /> Driver
                </p>
                <p className="text-sm font-medium text-text-dark mt-1">{selected.driver}</p>
              </div>
              <div className="rounded-lg border border-border-light p-4">
                <p className="text-xs text-text-muted">Departure</p>
                <p className="text-sm font-medium text-text-dark mt-1">{selected.departure}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Log Trip"
        subtitle="Record a new trip run"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addTrip}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Route"
            required
            placeholder="Select route"
            options={routeOptions}
            value={newRoute}
            onChange={(e) => setNewRoute(e.target.value)}
          />
          <SelectField
            label="Bus"
            required
            placeholder="Select bus"
            options={busOptions}
            value={newBus}
            onChange={(e) => setNewBus(e.target.value)}
          />
          <SelectField
            label="Driver"
            required
            placeholder="Select driver"
            options={driverOptions}
            value={newDriver}
            onChange={(e) => setNewDriver(e.target.value)}
          />
          <SelectField
            label="Departure Time"
            required
            placeholder="Select departure time"
            options={departureTimes}
            value={newDeparture}
            onChange={(e) => setNewDeparture(e.target.value)}
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