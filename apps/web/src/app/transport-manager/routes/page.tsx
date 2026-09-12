"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import type { TableRow } from "@/types";
import { MapPin, Bus, Pencil, Trash2, Map as MapIcon } from "lucide-react";

type RouteStatus = "Active" | "Delayed" | "Maintenance";

interface Route {
  id: string;
  name: string;
  stops: string[];
  bus: string;
  driver: string;
  status: RouteStatus;
}

const initialRoutes: Route[] = [
  {
    id: "RT-01",
    name: "Gwarinpa Line",
    stops: ["Gwarinpa Estate Gate", "Life Camp Junction", "Gaduwa", "Durumi", "Aminu Kano Crescent", "Greenfield Academy"],
    bus: "Greenfield 1",
    driver: "Mr. Chinedu Kalu",
    status: "Active",
  },
  {
    id: "RT-02",
    name: "Kubwa Line",
    stops: ["Kubwa Phase 3", "Kubwa Phase 2", "Bwari Junction", "Dei-Dei Market", "Greenfield Academy"],
    bus: "Greenfield 2",
    driver: "Mallam Usman Abdullahi",
    status: "Delayed",
  },
  {
    id: "RT-03",
    name: "Wuse II / Maitama Line",
    stops: ["Wuse Market", "Zone 1", "Wuse II Roundabout", "Maitama 2nd Gate", "Greenfield Academy"],
    bus: "Greenfield 3",
    driver: "Mr. Emeka Obi",
    status: "Active",
  },
  {
    id: "RT-04",
    name: "Nyanya / Karu Line",
    stops: ["Nyanya Motor Park", "Mararaba", "Karu Bridge", "Apo Junction", "Gudu", "Greenfield Academy"],
    bus: "Greenfield 4",
    driver: "Mr. Suleiman Musa",
    status: "Active",
  },
  {
    id: "RT-05",
    name: "Bwari / Dutse Line",
    stops: ["Bwari Town", "Dutse Junction", "Kubwa Expressway", "Greenfield Academy"],
    bus: "Greenfield 5",
    driver: "Mr. Joseph Adeyemi",
    status: "Maintenance",
  },
];

const busOptions = ["Greenfield 1", "Greenfield 2", "Greenfield 3", "Greenfield 4", "Greenfield 5"];
const driverOptions = ["Mr. Chinedu Kalu", "Mallam Usman Abdullahi", "Mr. Emeka Obi", "Mr. Suleiman Musa", "Mr. Joseph Adeyemi"];
const statusOptions = ["Active", "Delayed", "Maintenance"];

const routeStatusBadge = (s: RouteStatus) =>
  s === "Active"
    ? { text: "Active", variant: "green" as const }
    : s === "Delayed"
      ? { text: "Delayed", variant: "orange" as const }
      : { text: "Maintenance", variant: "red" as const };

const columns = [
  { key: "name", label: "ROUTE" },
  { key: "stops", label: "STOPS" },
  { key: "bus", label: "BUS ASSIGNED" },
  { key: "driver", label: "DRIVER" },
  { key: "status", label: "STATUS" },
];

export default function TransportManagerRoutesPage() {
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Route | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Route | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newStops, setNewStops] = useState("");
  const [newBus, setNewBus] = useState("");
  const [newDriver, setNewDriver] = useState("");
  const [newStatus, setNewStatus] = useState("Active");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const rows: TableRow[] = routes.map((r) => ({
    name: (
      <div>
        <p className="text-sm font-medium text-text-dark">{r.name}</p>
        <p className="text-xs text-text-muted">{r.id}</p>
      </div>
    ),
    stops: `${r.stops.length} stops`,
    bus: r.bus,
    driver: r.driver,
    status: routeStatusBadge(r.status),
  }));

  const openDetail = (row: TableRow, i: number) => {
    setSelected(routes[i]);
    setDetailOpen(true);
  };

  const openAdd = () => {
    setEditing(null);
    setNewName("");
    setNewStops("");
    setNewBus("");
    setNewDriver("");
    setNewStatus("Active");
    setFormOpen(true);
  };

  const openEdit = () => {
    if (!selected) return;
    setEditing(selected);
    setNewName(selected.name);
    setNewStops(selected.stops.join("\n"));
    setNewBus(selected.bus);
    setNewDriver(selected.driver);
    setNewStatus(selected.status);
    setDetailOpen(false);
    setFormOpen(true);
  };

  const saveRoute = () => {
    const stops = newStops.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!newName.trim() || stops.length === 0 || !newBus || !newDriver) return;
    if (editing) {
      setRoutes((prev) =>
        prev.map((r) =>
          r.id === editing.id
            ? { ...r, name: newName.trim(), stops, bus: newBus, driver: newDriver, status: newStatus as RouteStatus }
            : r
        )
      );
      showToast("Route updated");
    } else {
      const maxNum = Math.max(...routes.map((r) => parseInt(r.id.slice(3), 10)));
      setRoutes((prev) => [
        ...prev,
        {
          id: `RT-${String(maxNum + 1).padStart(2, "0")}`,
          name: newName.trim(),
          stops,
          bus: newBus,
          driver: newDriver,
          status: "Active",
        },
      ]);
      showToast("Route added");
    }
    setFormOpen(false);
  };

  const deleteRoute = () => {
    if (!selected) return;
    setRoutes((prev) => prev.filter((r) => r.id !== selected.id));
    setDetailOpen(false);
    setSelected(null);
    showToast("Route deleted");
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Routes"
        subtitle="Manage bus routes, assigned vehicles and drivers"
        actions={<Button onClick={openAdd}>+ Add Route</Button>}
      />

      <Card className="p-4 mb-6 flex items-center gap-3">
        <MapPin className="w-4 h-4 text-text-muted" />
        <p className="text-xs text-text-muted">
          {routes.filter((r) => r.status === "Active").length} active · {routes.filter((r) => r.status === "Delayed").length} delayed · {routes.filter((r) => r.status === "Maintenance").length} under maintenance
        </p>
      </Card>

      <DataTable columns={columns} data={rows} onRowClick={openDetail} />

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.name ?? ""}
        subtitle={selected ? `${selected.id} · ${selected.stops.length} stops` : undefined}
        footer={
          selected && (
            <>
              <Button variant="danger" onClick={deleteRoute}>
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
              <Button variant="secondary" onClick={openEdit}>
                <Pencil className="w-4 h-4" /> Edit
              </Button>
            </>
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
              <div className="text-right">
                <p className="text-xs text-text-muted">Driver</p>
                <p className="text-sm font-medium text-text-dark">{selected.driver}</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border-light p-4">
              <p className="text-xs text-text-muted">Route status</p>
              <Badge variant={routeStatusBadge(selected.status).variant}>{selected.status}</Badge>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-2 flex items-center gap-1">
                <MapIcon className="w-3 h-3" /> Stops ({selected.stops.length})
              </p>
              <div className="rounded-lg border border-border-light divide-y divide-border-light">
                {selected.stops.map((s, i) => (
                  <div key={s} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary-light text-primary text-[11px] font-semibold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm text-text-dark">{s}</p>
                    {i === selected.stops.length - 1 && <Badge variant="blue">School</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Route" : "Add Route"}
        subtitle={editing ? `${editing.id} · update route details` : "Create a new school bus route"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={saveRoute}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Route Name" required>
            <TextInput
              placeholder="e.g. Kubwa Line"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </Field>
          <Field label="Stops" required>
            <TextArea
              rows={4}
              placeholder="Enter one stop per line"
              value={newStops}
              onChange={(e) => setNewStops(e.target.value)}
            />
          </Field>
          <SelectField
            label="Assigned Bus"
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
