"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import type { TableRow } from "@/types";
import { Copy, Check, PhoneCall, FileText, Route as RouteIcon, Phone } from "lucide-react";

type DriverStatus = "Active" | "Leave";

interface Driver {
  id: string;
  name: string;
  license: string;
  phone: string;
  route: string;
  status: DriverStatus;
}

const initialDrivers: Driver[] = [
  { id: "DR-01", name: "Mr. Chinedu Kalu", license: "GLN 20481", phone: "+234 803 555 0142", route: "Gwarinpa Line", status: "Active" },
  { id: "DR-02", name: "Mallam Usman Abdullahi", license: "GLN 20392", phone: "+234 805 555 0177", route: "Kubwa Line", status: "Active" },
  { id: "DR-03", name: "Mr. Emeka Obi", license: "GLN 20415", phone: "+234 802 555 0119", route: "Wuse II / Maitama Line", status: "Active" },
  { id: "DR-04", name: "Mr. Suleiman Musa", license: "GLN 20477", phone: "+234 809 555 0163", route: "Nyanya / Karu Line", status: "Active" },
  { id: "DR-05", name: "Mr. Joseph Adeyemi", license: "GLN 20119", phone: "+234 806 555 0138", route: "Bwari / Dutse Line", status: "Leave" },
];

const routeOptions = ["Gwarinpa Line", "Kubwa Line", "Wuse II / Maitama Line", "Nyanya / Karu Line", "Bwari / Dutse Line"];
const statusOptions = ["Active", "Leave"];

const driverStatusBadge = (s: DriverStatus) =>
  s === "Active"
    ? { text: "Active", variant: "green" as const }
    : { text: "Leave", variant: "orange" as const };

const columns = [
  { key: "name", label: "NAME" },
  { key: "license", label: "LICENSE NO" },
  { key: "phone", label: "PHONE" },
  { key: "route", label: "ASSIGNED ROUTE" },
  { key: "status", label: "STATUS" },
];

export default function TransportManagerDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [search, setSearch] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Driver | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newLicense, setNewLicense] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRoute, setNewRoute] = useState("");
  const [newStatus, setNewStatus] = useState("Active");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const q = search.trim().toLowerCase();
  const filtered = drivers.filter(
    (d) =>
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.license.toLowerCase().includes(q) ||
      d.route.toLowerCase().includes(q)
  );

  const rows: TableRow[] = filtered.map((d) => ({
    name: (
      <div>
        <p className="text-sm font-medium text-text-dark">{d.name}</p>
        <p className="text-xs text-text-muted">{d.id}</p>
      </div>
    ),
    license: d.license,
    phone: d.phone,
    route: d.route,
    status: driverStatusBadge(d.status),
  }));

  const openDetail = (row: TableRow, i: number) => {
    setSelected(filtered[i]);
    setDetailOpen(true);
  };

  const copyPhone = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.phone);
    setCopied(true);
    showToast("Phone number copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const contactDriver = () => {
    if (!selected) return;
    showToast(`Calling ${selected.name}...`);
  };

  const addDriver = () => {
    if (!newName.trim() || !newLicense.trim() || !newPhone.trim() || !newRoute) return;
    const maxNum = Math.max(...drivers.map((d) => parseInt(d.id.slice(3), 10)));
    setDrivers((prev) => [
      ...prev,
      {
        id: `DR-${String(maxNum + 1).padStart(2, "0")}`,
        name: newName.trim(),
        license: newLicense.trim().toUpperCase(),
        phone: newPhone.trim(),
        route: newRoute,
        status: newStatus as DriverStatus,
      },
    ]);
    setNewName("");
    setNewLicense("");
    setNewPhone("");
    setNewRoute("");
    setNewStatus("Active");
    setAddOpen(false);
    showToast(`${newName.trim()} added as driver`);
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Drivers"
        subtitle="Manage drivers, licenses and route assignments"
        actions={<Button onClick={() => setAddOpen(true)}>+ Add Driver</Button>}
      />

      <Card className="p-4 mb-6">
        <SearchInput
          placeholder="Search by name, license or route..."
          value={search}
          onChange={setSearch}
          className="max-w-md"
        />
      </Card>

      <DataTable columns={columns} data={rows} onRowClick={openDetail} />

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.name ?? ""}
        subtitle={selected ? `${selected.id} · ${selected.route}` : undefined}
        footer={
          selected && (
            <Button onClick={contactDriver}>
              <PhoneCall className="w-4 h-4" /> Contact Driver
            </Button>
          )
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border border-border-light p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">License No</p>
                  <p className="text-sm font-medium text-text-dark">{selected.license}</p>
                </div>
              </div>
              <Badge variant={driverStatusBadge(selected.status).variant}>{selected.status}</Badge>
            </div>

            <div className="rounded-lg border border-border-light p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-text-muted flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone
                  </p>
                  <p className="text-sm font-medium text-text-dark mt-0.5">{selected.phone}</p>
                </div>
                <Button variant="secondary" size="sm" onClick={copyPhone}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <RouteIcon className="w-3.5 h-3.5" />
                Assigned to {selected.route}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Driver"
        subtitle="Register a new driver for the transport fleet"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addDriver}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Full Name" required>
            <TextInput
              placeholder="e.g. Mr. Abdul Ibrahim"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="License No" required>
              <TextInput
                placeholder="e.g. GLN 20520"
                value={newLicense}
                onChange={(e) => setNewLicense(e.target.value)}
              />
            </Field>
            <Field label="Phone" required>
              <TextInput
                type="tel"
                placeholder="+234 xxx xxx xxxx"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </Field>
          </div>
          <SelectField
            label="Assigned Route"
            required
            placeholder="Select route"
            options={routeOptions}
            value={newRoute}
            onChange={(e) => setNewRoute(e.target.value)}
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
