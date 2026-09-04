"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { useState } from "react";

const kpis = [
  { label: "Stock Items", value: "1,204", detail: "", detailColor: "muted" as const },
  { label: "Purchases (This Month)", value: "$18,400", detail: "", detailColor: "muted" as const },
  { label: "Pending Payment", value: "$4,200", detail: "", detailColor: "orange" as const },
  { label: "Processed Payments", value: "28", detail: "", detailColor: "green" as const },
];

const visitors = [
  { name: "Mr. Eze", purpose: "Pickup — Chidi Eze", time: "2:30 PM", status: { text: "On-site", variant: "green" as const } },
  { name: "Delivery Co.", purpose: "Lab supplies delivery", time: "1:05 PM", status: { text: "Completed", variant: "muted" as const } },
  { name: "Agent K. Obi", purpose: "Contractor — repairs", time: "4:00 PM", status: { text: "Flagged", variant: "red" as const } },
];

const clinic = [
  { name: "Amara Okafor", complaint: "Fever / headache", visited: "9:20 AM", status: { text: "Treated", variant: "green" as const } },
  { name: "Tom Wallace", complaint: "Sprained ankle", visited: "11:10 AM", status: { text: "Referral", variant: "orange" as const } },
  { name: "Grace Lim", complaint: "Allergic reaction", visited: "12:40 PM", status: { text: "Parent Notified", variant: "red" as const } },
];

const library = [
  { item: "Things Fall Apart", student: "Chidi Eze", due: "Aug 4", status: { text: "On Loan", variant: "blue" as const } },
  { item: "Physics Textbook 12", student: "Amara Okafor", due: "Jul 26", status: { text: "Overdue", variant: "red" as const } },
  { item: "Algebra Workbook", student: "Tom Wallace", due: "Aug 8", status: { text: "On Loan", variant: "blue" as const } },
];

const transport = [
  { route: "Route A — North", vehicle: "Bus 1 (45 seats)", driver: "Mr. Kalu", status: { text: "Active", variant: "green" as const } },
  { route: "Route B — East", vehicle: "Bus 2 (30 seats)", driver: "Mr. Musa", status: { text: "Delayed", variant: "orange" as const } },
  { route: "Route C — West", vehicle: "Bus 3 (45 seats)", driver: "Mr. Yusuf", status: { text: "Maintenance", variant: "red" as const } },
];

const hostel = [
  { name: "Red House — Boys", capacity: "150", occupancy: "94%", warden: "Mr. Okoye", color: "blue" as const },
  { name: "Blue House — Boys", capacity: "120", occupancy: "88%", warden: "Mr. Ba", color: "green" as const },
  { name: "Green House — Girls", capacity: "180", occupancy: "97%", warden: "Mrs. Obi", color: "orange" as const },
];

const inventory = [
  { name: "Microscope", location: "Science Lab 1", qty: "30", status: { text: "In Stock", variant: "green" as const } },
  { name: "Exercise Books (A5)", location: "Store Room", qty: "1,500", status: { text: "Low Stock", variant: "orange" as const } },
  { name: "Football — Standard", location: "PE Store", qty: "12", status: { text: "In Stock", variant: "green" as const } },
];

const purchases = [
  { item: "Lab microscopes ×4", supplier: "SciLab Supplies", amount: "$2,400", account: "Procurement Acct", status: { text: "Paid", variant: "green" as const }, date: "Jul 28, 2026", action: "Receipt" },
  { item: "Exercise books — 500 pcs", supplier: "PaperCo", amount: "$850", account: "Procurement Acct", status: { text: "Paid", variant: "green" as const }, date: "Jul 25, 2026", action: "Receipt" },
  { item: "Chemistry reagents", supplier: "ChemWorld", amount: "$1,400", account: "Procurement Acct", status: { text: "Pending Payment", variant: "orange" as const }, date: "Jul 29, 2026", action: "Process" },
  { item: "Football sets ×6", supplier: "SportGo", amount: "$360", account: "Procurement Acct", status: { text: "Pending Payment", variant: "orange" as const }, date: "Jul 30, 2026", action: "Process" },
];

const payouts = [
  { ref: "PO-1081", item: "Lab microscopes ×4", amount: "$2,400", account: "Procurement Acct", method: { text: "Bank Transfer", variant: "green" as const }, date: "Jul 28, 2026" },
  { ref: "PO-1074", item: "Exercise books — 500 pcs", amount: "$850", account: "Procurement Acct", method: { text: "Bank Transfer", variant: "green" as const }, date: "Jul 25, 2026" },
  { ref: "PO-1090", item: "Chemicals restock", amount: "$1,120", account: "Procurement Acct", method: { text: "Card", variant: "green" as const }, date: "Jul 22, 2026" },
];

function StatusBadge({ status }: { status: { text: string; variant: "green" | "red" | "orange" | "muted" | "blue" } }) {
  return <Badge variant={status.variant}>{status.text}</Badge>;
}

function GenericList({ rows, actionLabel }: { rows: { title: string; sub: string; status?: { text: string; variant: "green" | "red" | "orange" | "muted" | "blue" } }[]; actionLabel: string }) {
  return (
    <Card className="divide-y divide-border-light">
      {rows.map((r) => (
        <div key={r.title} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-text-dark">{r.title}</p>
            <p className="text-xs text-text-muted mt-0.5">{r.sub}</p>
          </div>
          <div className="flex items-center gap-3">
            {r.status && <StatusBadge status={r.status} />}
            <Button variant="ghost" size="sm">{actionLabel || "Open"}</Button>
          </div>
        </div>
      ))}
    </Card>
  );
}

const purchaseColumns = [
  { key: "item", label: "ITEM", width: "200px" },
  { key: "supplier", label: "SUPPLIER", width: "140px" },
  { key: "amount", label: "AMOUNT", width: "90px" },
  { key: "account", label: "ACCOUNT", width: "150px" },
  { key: "status", label: "STATUS", width: "130px" },
  { key: "date", label: "DATE", width: "110px" },
  { key: "action", label: "", width: "80px", align: "right" as const },
];

const payoutColumns = [
  { key: "ref", label: "REF", width: "90px" },
  { key: "item", label: "ITEM", width: "200px" },
  { key: "amount", label: "AMOUNT", width: "90px" },
  { key: "account", label: "ACCOUNT", width: "150px" },
  { key: "method", label: "METHOD", width: "120px" },
  { key: "date", label: "DATE", width: "110px" },
];

export default function OperationsPage() {
  const [recordOpen, setRecordOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentItem, setPaymentItem] = useState<string | null>(null);

  const purchasesRows = purchases.map((p) => ({
    ...p,
    action:
      p.status.text === "Pending Payment" ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setPaymentItem(p.item);
            setPaymentOpen(true);
          }}
        >
          Process
        </Button>
      ) : (
        <Button variant="ghost" size="sm">
          Receipt
        </Button>
      ),
  }));

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Operations"
        subtitle="Manage day-to-day institution operations and procurement"
        actions={
          <>
            <Button variant="secondary" onClick={() => setPurchaseOpen(true)}>+ Record Purchase</Button>
            <Button onClick={() => setRecordOpen(true)}>+ Add Record</Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Tabs
        tabs={[
          { id: "visitors", label: "Visitors", content: <GenericList actionLabel="View" rows={visitors.map((v) => ({ title: v.name, sub: `${v.purpose} · Check-in ${v.time}`, status: v.status }))} /> },
          { id: "clinic", label: "Clinic", content: <GenericList actionLabel="View" rows={clinic.map((c) => ({ title: c.name, sub: `${c.complaint} · Visited ${c.visited}`, status: c.status }))} /> },
          { id: "library", label: "Library", content: <GenericList actionLabel="View" rows={library.map((l) => ({ title: l.item, sub: `${l.student} · Due ${l.due}`, status: l.status }))} /> },
          { id: "transport", label: "Transport", content: <GenericList actionLabel="View" rows={transport.map((t) => ({ title: t.route, sub: `${t.vehicle} · ${t.driver}`, status: t.status }))} /> },
          { id: "hostel", label: "Hostel", content: <GenericList actionLabel="View" rows={hostel.map((h) => ({ title: h.name, sub: `${h.capacity} capacity · Warden: ${h.warden} · ${h.occupancy} full`, status: { text: h.occupancy, variant: h.color as "blue" } }))} /> },
          { id: "inventory", label: "Inventory", content: <GenericList actionLabel="View" rows={inventory.map((i) => ({ title: i.name, sub: `${i.location} · Qty: ${i.qty}`, status: i.status }))} /> },
          {
            id: "purchases",
            label: "Purchases & Payments",
            content: (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-text-dark mb-2">Purchase Requests</h3>
                  <p className="text-xs text-text-muted mb-3">Record items bought with their amounts. Process the payment to an account and keep it on record.</p>
                  <DataTable columns={purchaseColumns} data={purchasesRows} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-dark mb-2">Payment History</h3>
                  <DataTable columns={payoutColumns} data={payouts} />
                </div>
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        title="Add Record"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRecordOpen(false)}>Cancel</Button>
            <Button onClick={() => setRecordOpen(false)}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Type" required placeholder="Select record type" options={["Visitor", "Clinic Visit", "Library Book", "Route", "Hostel Bed", "Inventory Item"]} />
          <Field label="Title / Name" required>
            <TextInput placeholder="Enter title or name" />
          </Field>
          <Field label="Details">
            <TextArea rows={3} placeholder="Enter details..." />
          </Field>
          <Field label="Date">
            <TextInput type="date" />
          </Field>
        </div>
      </Modal>

      <Modal
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        title="Record Purchase"
        subtitle="Record a purchased item and its amount"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPurchaseOpen(false)}>Cancel</Button>
            <Button onClick={() => setPurchaseOpen(false)}>Save Purchase</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Item / Description" required>
            <TextInput placeholder="e.g. Lab microscopes ×4" />
          </Field>
          <Field label="Supplier" required>
            <TextInput placeholder="Supplier name" />
          </Field>
          <Field label="Amount" required>
            <TextInput type="number" placeholder="0.00" />
          </Field>
          <Field label="Purchase Date" required>
            <TextInput type="date" />
          </Field>
          <Field label="Notes">
            <TextArea rows={2} placeholder="Optional notes" />
          </Field>
        </div>
      </Modal>

      <Modal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Process Payment"
        subtitle={paymentItem ? `Release payment for: ${paymentItem}` : "Release payment to the supplier's / vendor's account"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPaymentOpen(false)}>Cancel</Button>
            <Button onClick={() => setPaymentOpen(false)}>Process Payment</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Purchase" required placeholder={paymentItem || "Select purchase"} options={["Chemistry reagents — $1,400", "Football sets ×6 — $360"]} />
          <Field label="Amount" required>
            <TextInput type="number" placeholder="0.00" />
          </Field>
          <SelectField label="Transfer From Account" required placeholder="Select account" options={["Procurement Account", "General Account"]} />
          <SelectField label="Payment Method" required placeholder="Select method" options={["Bank Transfer", "Card", "Cheque"]} />
          <Field label="Recipient / Beneficiary">
            <TextInput placeholder="Supplier account name" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
