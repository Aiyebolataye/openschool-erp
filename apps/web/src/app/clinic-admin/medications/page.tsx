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
import { PackagePlus, Package } from "lucide-react";

type Status = "In Stock" | "Low Stock" | "Out";

interface Medication {
  id: string;
  name: string;
  strength: string;
  stock: string;
  expiry: string;
  status: Status;
}

const initialMeds: Medication[] = [
  { id: "MED-101", name: "Paracetamol Tablets", strength: "500mg", stock: "120 tablets", expiry: "Nov 2026", status: "In Stock" },
  { id: "MED-102", name: "Paracetamol Syrup", strength: "120mg/5ml", stock: "4 bottles", expiry: "Aug 2026", status: "Low Stock" },
  { id: "MED-103", name: "Ibuprofen Tablets", strength: "200mg", stock: "2 strips", expiry: "Mar 2027", status: "Low Stock" },
  { id: "MED-104", name: "Oral Rehydration Salts", strength: "20.5g sachet", stock: "0 sachets", expiry: "Jan 2027", status: "Out" },
  { id: "MED-105", name: "Antimalarial Tablets", strength: "80mg", stock: "60 tablets", expiry: "Dec 2026", status: "In Stock" },
  { id: "MED-106", name: "Cough Syrup", strength: "100ml", stock: "10 bottles", expiry: "Sep 2026", status: "In Stock" },
  { id: "MED-107", name: "Antihistamine Syrup", strength: "5mg/5ml", stock: "6 bottles", expiry: "May 2027", status: "In Stock" },
  { id: "MED-108", name: "Saline Drops", strength: "10ml", stock: "1 bottle", expiry: "Jun 2026", status: "Low Stock" },
];

const statusBadge = (s: Status) =>
  s === "In Stock"
    ? { text: "In Stock", variant: "green" as const }
    : s === "Low Stock"
      ? { text: "Low Stock", variant: "orange" as const }
      : { text: "Out", variant: "red" as const };

const columns = [
  { key: "name", label: "MEDICATION" },
  { key: "strength", label: "STRENGTH" },
  { key: "stock", label: "STOCK" },
  { key: "expiry", label: "EXPIRY" },
  { key: "status", label: "STATUS" },
];

export default function ClinicMedicationsPage() {
  const [meds, setMeds] = useState<Medication[]>(initialMeds);
  const [search, setSearch] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Medication | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newStrength, setNewStrength] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const lowCount = meds.filter((m) => m.status !== "In Stock").length;

  const q = search.trim().toLowerCase();
  const filtered = meds.filter(
    (m) =>
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.strength.toLowerCase().includes(q) ||
      m.status.toLowerCase().includes(q)
  );

  const rows: TableRow[] = filtered.map((m) => ({
    name: (
      <div>
        <p className="text-sm font-medium text-text-dark">{m.name}</p>
        <p className="text-xs text-text-muted">{m.id}</p>
      </div>
    ),
    strength: m.strength,
    stock: m.stock,
    expiry: m.expiry,
    status: statusBadge(m.status),
  }));

  const openDetail = (row: TableRow, i: number) => {
    setSelected(filtered[i]);
    setDetailOpen(true);
  };

  const restock = () => {
    if (!selected) return;
    const next: Status = selected.status === "Out" ? "Low Stock" : "In Stock";
    setMeds((prev) => prev.map((m) => (m.id === selected.id ? { ...m, status: next } : m)));
    setSelected({ ...selected, status: next });
    showToast(`${selected.name} restocked`);
  };

  const addMed = () => {
    if (!newName || !newStrength || !newStock) return;
    const maxNum = Math.max(...meds.map((m) => parseInt(m.id.slice(4), 10)));
    setMeds((prev) => [
      ...prev,
      {
        id: `MED-${maxNum + 1}`,
        name: newName.trim(),
        strength: newStrength.trim(),
        stock: newStock.trim(),
        expiry: newExpiry || "—",
        status: (newStatus || "In Stock") as Status,
      },
    ]);
    setNewName("");
    setNewStrength("");
    setNewStock("");
    setNewExpiry("");
    setNewStatus("");
    setAddOpen(false);
    showToast("Medication added");
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Medications & Stock"
        subtitle="Manage clinic medication inventory"
        actions={<Button onClick={() => setAddOpen(true)}>+ Add Medication</Button>}
      />

      {lowCount > 0 && (
        <div className="mb-4 rounded-lg bg-orange-light/40 border border-orange/30 px-4 py-3 text-xs text-text-dark flex items-center justify-between">
          <span>
            {lowCount} medication(s) need attention — {meds.filter((m) => m.status === "Low Stock").length} low in
            stock and {meds.filter((m) => m.status === "Out").length} out of stock.
          </span>
          <span className="inline-flex items-center gap-1.5 text-orange font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-orange" /> Restock required
          </span>
        </div>
      )}

      <Card className="p-4 mb-6">
        <SearchInput
          placeholder="Search by name, ID, strength or status..."
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
        subtitle={selected ? `${selected.id} · ${selected.strength}` : undefined}
        footer={
          selected && (
            <Button onClick={restock}>
              <Package className="w-4 h-4" /> Restock
            </Button>
          )
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border border-border-light p-4">
              <div>
                <p className="text-xs text-text-muted">Stock Level</p>
                <p className="text-sm font-medium text-text-dark">{selected.stock}</p>
              </div>
              <Badge variant={statusBadge(selected.status).variant}>{selected.status}</Badge>
            </div>
            <div className="rounded-lg border border-border-light p-4">
              <p className="text-xs text-text-muted mb-1.5">Expiry Date</p>
              <p className="text-sm font-medium text-text-dark">{selected.expiry}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Medication"
        subtitle="Add a new medication to clinic stock"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addMed}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Medication Name" required>
            <TextInput
              placeholder="e.g. Paracetamol Tablets"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </Field>
          <Field label="Strength" required>
            <TextInput
              placeholder="e.g. 500mg"
              value={newStrength}
              onChange={(e) => setNewStrength(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Stock Level" required>
              <TextInput
                placeholder="e.g. 30 tablets"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
              />
            </Field>
            <Field label="Expiry">
              <TextInput type="date" value={newExpiry} onChange={(e) => setNewExpiry(e.target.value)} />
            </Field>
          </div>
          <SelectField
            label="Status"
            required
            placeholder="Select status"
            options={["In Stock", "Low Stock", "Out"]}
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
