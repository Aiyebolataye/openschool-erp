"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import type { TableRow } from "@/types";
import { Plus } from "lucide-react";

type FeeType = "Tuition" | "Boarding" | "Ad-hoc" | "PTA" | "Exam";

interface Fee {
  id: string;
  name: string;
  type: FeeType;
  appliesTo: string;
  amount: number;
  frequency: string;
}

const feeTypeBadge = (t: FeeType) =>
  t === "Tuition"
    ? { text: "Tuition", variant: "blue" as const }
    : t === "Boarding"
      ? { text: "Boarding", variant: "purple" as const }
      : t === "Exam"
        ? { text: "Exam", variant: "orange" as const }
        : t === "PTA"
          ? { text: "PTA", variant: "green" as const }
          : { text: "Ad-hoc", variant: "muted" as const };

const naira = (n: number) => `₦${n.toLocaleString()}`;

const initialFees: Fee[] = [
  { id: "FEE-101", name: "Tuition Fee", type: "Tuition", appliesTo: "All Students", amount: 420000, frequency: "Per term" },
  { id: "FEE-102", name: "Boarding Fee", type: "Boarding", appliesTo: "Boarders", amount: 250000, frequency: "Per term" },
  { id: "FEE-103", name: "PTA Levy", type: "PTA", appliesTo: "All Students", amount: 5000, frequency: "Per term" },
  { id: "FEE-104", name: "External Exam Fee", type: "Exam", appliesTo: "SS3 Students", amount: 35000, frequency: "Per term" },
  { id: "FEE-105", name: "Sports Levy", type: "Ad-hoc", appliesTo: "All Students", amount: 15000, frequency: "Per session" },
  { id: "FEE-106", name: "Development Levy", type: "Ad-hoc", appliesTo: "All Students", amount: 20000, frequency: "One-off" },
];

const columns = [
  { key: "name", label: "FEE" },
  { key: "type", label: "TYPE" },
  { key: "appliesTo", label: "APPLIES TO" },
  { key: "amount", label: "AMOUNT", align: "right" as const },
  { key: "frequency", label: "FREQUENCY" },
];

const classOptions = ["All Students", "Boarders", "JSS1–JSS3", "SS1–SS3", "SS3 Students"];

export default function BursarFeesPage() {
  const [fees, setFees] = useState<Fee[]>(initialFees);
  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Fee | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [feeName, setFeeName] = useState("");
  const [feeType, setFeeType] = useState("");
  const [feeAppliesTo, setFeeAppliesTo] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [feeFrequency, setFeeFrequency] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const rows: TableRow[] = fees.map((f) => ({
    name: (
      <div>
        <p className="text-sm font-medium text-text-dark">{f.name}</p>
        <p className="text-xs text-text-muted">{f.id}</p>
      </div>
    ),
    type: feeTypeBadge(f.type),
    appliesTo: f.appliesTo,
    amount: naira(f.amount),
    frequency: f.frequency,
  }));

  const openDetail = (row: TableRow, i: number) => {
    setSelected(fees[i]);
    setEditAmount(String(fees[i].amount));
    setDetailOpen(true);
  };

  const saveAddFee = () => {
    if (!feeName || !feeType || !feeAppliesTo || !feeAmount || !feeFrequency) return;
    setFees((prev) => [
      ...prev,
      {
        id: `FEE-${Math.max(...prev.map((f) => parseInt(f.id.slice(4), 10))) + 1}`,
        name: feeName,
        type: feeType as FeeType,
        appliesTo: feeAppliesTo,
        amount: parseInt(feeAmount, 10) || 0,
        frequency: feeFrequency,
      },
    ]);
    setAddOpen(false);
    setFeeName("");
    setFeeType("");
    setFeeAppliesTo("");
    setFeeAmount("");
    setFeeFrequency("");
    showToast("Fee added to structure");
  };

  const saveEditAmount = () => {
    if (!selected || !editAmount) return;
    const next = parseInt(editAmount, 10) || 0;
    setFees((prev) => prev.map((f) => (f.id === selected.id ? { ...f, amount: next } : f)));
    setSelected({ ...selected, amount: next });
    setDetailOpen(false);
    showToast("Fee amount updated");
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Fee Structure"
        subtitle="Tuition, boarding and levies charged per term"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" /> Add Fee
          </Button>
        }
      />

      <DataTable columns={columns} data={rows} onRowClick={openDetail} />

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Fee"
        subtitle="Add a new fee to the structure"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={saveAddFee}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Fee Name" required>
            <TextInput
              placeholder="e.g. Tuition Fee"
              value={feeName}
              onChange={(e) => setFeeName(e.target.value)}
            />
          </Field>
          <SelectField
            label="Type"
            required
            placeholder="Select fee type"
            options={["Tuition", "Boarding", "Ad-hoc", "PTA", "Exam"]}
            value={feeType}
            onChange={(e) => setFeeType(e.target.value)}
          />
          <SelectField
            label="Applies To"
            required
            placeholder="Select class or group"
            options={classOptions}
            value={feeAppliesTo}
            onChange={(e) => setFeeAppliesTo(e.target.value)}
          />
          <Field label="Amount" required>
            <TextInput
              placeholder="₦0.00"
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
            />
          </Field>
          <SelectField
            label="Frequency"
            required
            placeholder="Select frequency"
            options={["Per term", "Per session", "One-off"]}
            value={feeFrequency}
            onChange={(e) => setFeeFrequency(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.name ?? ""}
        subtitle={selected ? `${selected.id} · ${selected.frequency}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDetailOpen(false)}>Cancel</Button>
            <Button onClick={saveEditAmount}>Save</Button>
          </>
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border-light p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Applies to</p>
                <p className="text-sm font-medium text-text-dark">{selected.appliesTo}</p>
              </div>
              <Badge variant={feeTypeBadge(selected.type).variant}>{selected.type}</Badge>
            </div>
            <Field label="Amount (₦)" required>
              <TextInput
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
            </Field>
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