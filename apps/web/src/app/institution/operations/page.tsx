"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { useState } from "react";
import Link from "next/link";

const kpis = [
  { label: "Stock Items", value: "1,204", detail: "", detailColor: "muted" as const },
  { label: "Purchases (This Month)", value: "₦18,400", detail: "", detailColor: "muted" as const },
  { label: "Pending Payment", value: "₦4,200", detail: "", detailColor: "orange" as const },
  { label: "Processed Payments", value: "28", detail: "", detailColor: "green" as const },
];

const initialVisitors = [
  { id: 1, name: "Mr. Eze", purpose: "Pickup — Chidi Eze", time: "2:30 PM", checkout: "3:05 PM", status: { text: "On-site", variant: "green" as const } },
  { id: 2, name: "Delivery Co.", purpose: "Lab supplies delivery", time: "1:05 PM", checkout: "1:40 PM", status: { text: "Completed", variant: "muted" as const } },
  { id: 3, name: "Agent K. Obi", purpose: "Contractor — repairs", time: "4:00 PM", checkout: "", status: { text: "Flagged", variant: "red" as const } },
];

const initialClinic = [
  { id: 1, name: "Amara Okafor", symptoms: "Fever / headache, mild dehydration", visited: "9:20 AM", notes: "Paracetamol administered, fluids. Rest advised.", status: { text: "Treated", variant: "green" as const } },
  { id: 2, name: "Tom Wallace", symptoms: "Sprained ankle, swelling", visited: "11:10 AM", notes: "Ice pack applied, referral to physio.", status: { text: "Referral", variant: "orange" as const } },
  { id: 3, name: "Grace Lim", symptoms: "Allergic reaction, skin rash", visited: "12:40 PM", notes: "Antihistamine given. Parent notified.", status: { text: "Parent Notified", variant: "red" as const } },
];

const initialLibrary = [
  { id: 1, item: "Things Fall Apart", student: "Chidi Eze", due: "Aug 4", status: { text: "On Loan", variant: "blue" as const } },
  { id: 2, item: "Physics Textbook 12", student: "Amara Okafor", due: "Jul 26", status: { text: "Overdue", variant: "red" as const } },
  { id: 3, item: "Algebra Workbook", student: "Tom Wallace", due: "Aug 8", status: { text: "On Loan", variant: "blue" as const } },
];

const initialTransport = [
  { id: 1, route: "Route A — North", vehicle: "Bus 1 (45 seats)", driver: "Mr. Kalu", status: { text: "Active", variant: "green" as const } },
  { id: 2, route: "Route B — East", vehicle: "Bus 2 (30 seats)", driver: "Mr. Musa", status: { text: "Delayed", variant: "orange" as const } },
  { id: 3, route: "Route C — West", vehicle: "Bus 3 (45 seats)", driver: "Mr. Yusuf", status: { text: "Maintenance", variant: "red" as const } },
];

const initialHostel = [
  { id: 1, name: "Red House — Boys", capacity: "150", occupancy: "94%", warden: "Mr. Okoye", color: "blue" as const },
  { id: 2, name: "Blue House — Boys", capacity: "120", occupancy: "88%", warden: "Mr. Ba", color: "green" as const },
  { id: 3, name: "Green House — Girls", capacity: "180", occupancy: "97%", warden: "Mrs. Obi", color: "orange" as const },
];

const initialInventory = [
  { id: 1, name: "Microscope", location: "Science Lab 1", qty: "30", status: { text: "In Stock", variant: "green" as const } },
  { id: 2, name: "Exercise Books (A5)", location: "Store Room", qty: "1,500", status: { text: "Low Stock", variant: "orange" as const } },
  { id: 3, name: "Football — Standard", location: "PE Store", qty: "12", status: { text: "In Stock", variant: "green" as const } },
];

const initialPurchases = [
  { id: 1, item: "Lab microscopes ×4", supplier: "SciLab Supplies", amount: "₦2,400", account: "Procurement Acct", status: { text: "Paid", variant: "green" as const }, date: "Jul 28, 2026", action: "Receipt" },
  { id: 2, item: "Exercise books — 500 pcs", supplier: "PaperCo", amount: "₦850", account: "Procurement Acct", status: { text: "Paid", variant: "green" as const }, date: "Jul 25, 2026", action: "Receipt" },
  { id: 3, item: "Chemistry reagents", supplier: "ChemWorld", amount: "₦1,400", account: "Procurement Acct", status: { text: "Pending Payment", variant: "orange" as const }, date: "Jul 29, 2026", action: "Process" },
  { id: 4, item: "Football sets ×6", supplier: "SportGo", amount: "₦360", account: "Procurement Acct", status: { text: "Pending Payment", variant: "orange" as const }, date: "Jul 30, 2026", action: "Process" },
];

const initialPayouts = [
  { id: 1, ref: "PO-1081", item: "Lab microscopes ×4", amount: "₦2,400", account: "Procurement Acct", method: { text: "Bank Transfer", variant: "green" as const }, date: "Jul 28, 2026" },
  { id: 2, ref: "PO-1074", item: "Exercise books — 500 pcs", amount: "₦850", account: "Procurement Acct", method: { text: "Bank Transfer", variant: "green" as const }, date: "Jul 25, 2026" },
  { id: 3, ref: "PO-1090", item: "Chemicals restock", amount: "₦1,120", account: "Procurement Acct", method: { text: "Card", variant: "green" as const }, date: "Jul 22, 2026" },
];

type StatusVariant = "green" | "red" | "orange" | "muted" | "blue";

type Visitor = typeof initialVisitors[number];
type ClinicRecord = typeof initialClinic[number];
type LibraryRecord = typeof initialLibrary[number];
type TransportRecord = typeof initialTransport[number];
type HostelRecord = typeof initialHostel[number];
type InventoryRecord = typeof initialInventory[number];
type Purchase = typeof initialPurchases[number];
type Payout = typeof initialPayouts[number];

type AnyRecord = Record<string, unknown>;

function StatusBadge({ status }: { status: { text: string; variant: StatusVariant } }) {
  return <Badge variant={status.variant}>{status.text}</Badge>;
}

function DetailModal({
  open,
  onClose,
  record,
  category,
  fieldDefs,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  record: AnyRecord | null;
  category: string;
  fieldDefs: { key: string; label: string; type?: string; options?: string[] }[];
  onSave: (updated: AnyRecord) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AnyRecord>({});

  const openForEdit = () => {
    setDraft({ ...record });
    setEditing(true);
  };

  const openForView = () => {
    setDraft({ ...record });
    setEditing(false);
  };

  if (record === null && open) return null;

  const handleSave = () => {
    onSave({ ...draft });
    setEditing(false);
    onClose();
  };

  const setField = (key: string, val: string) => {
    setDraft((d) => ({ ...d, [key]: val }));
  };

  return (
    <Modal
      open={open}
      onClose={() => { setEditing(false); onClose(); }}
      title={editing ? `Edit ${category}` : `View ${category}`}
      footer={
        <>
          {editing ? (
            <>
              <Button variant="secondary" onClick={() => { setEditing(false); onClose(); }}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => { setEditing(false); onClose(); }}>Close</Button>
              <Button onClick={openForEdit}>Edit</Button>
            </>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {fieldDefs.map((fd) => (
          <Field key={fd.key} label={fd.label}>
            {editing ? (
              fd.type === "textarea" ? (
                <TextArea
                  rows={2}
                  value={String(draft[fd.key] ?? "")}
                  onChange={(e) => setField(fd.key, e.target.value)}
                />
              ) : fd.options ? (
                <SelectField
                  label=""
                  options={fd.options}
                  value={String(draft[fd.key] ?? "")}
                  onChange={(e) => setField(fd.key, e.target.value)}
                />
              ) : (
                <TextInput
                  value={String(draft[fd.key] ?? "")}
                  onChange={(e) => setField(fd.key, e.target.value)}
                />
              )
            ) : (
              <p className="text-sm text-text-dark">{String(record?.[fd.key] ?? "—")}</p>
            )}
          </Field>
        ))}
      </div>
    </Modal>
  );
}

function CategoryTab({
  title,
  rows,
  fieldDefs,
  onAdd,
  onRowClick,
  category,
  addLabel,
}: {
  title: string;
  rows: AnyRecord[];
  fieldDefs: { key: string; label: string; type?: string; options?: string[] }[];
  onAdd?: () => void;
  onRowClick: (record: AnyRecord) => void;
  category: string;
  addLabel?: string;
}) {
  const renderTitle = (r: AnyRecord) => {
    if (category === "visitors") return String(r.name);
    if (category === "clinic") return String(r.name);
    if (category === "library") return String(r.item);
    if (category === "transport") return String(r.route);
    if (category === "hostel") return String(r.name);
    if (category === "inventory") return String(r.name);
    return String(r.name || r.title || "");
  };

  const renderSub = (r: AnyRecord) => {
    if (category === "visitors") return `${r.purpose} · Check-in ${r.time}${r.checkout ? ` · Check-out ${r.checkout}` : ""}`;
    if (category === "clinic") return `${r.symptoms} · Visited ${r.visited}`;
    if (category === "library") return `${r.student} · Due ${r.due}`;
    if (category === "transport") return `${r.vehicle} · ${r.driver}`;
    if (category === "hostel") return `${r.capacity} capacity · Warden: ${r.warden} · ${r.occupancy} full`;
    if (category === "inventory") return `${r.location} · Qty: ${r.qty}`;
    return "";
  };

  const renderStatus = (r: AnyRecord): { text: string; variant: StatusVariant } | undefined => {
    if (category === "visitors") return r.status as { text: string; variant: StatusVariant };
    if (category === "clinic") return r.status as { text: string; variant: StatusVariant };
    if (category === "library") return r.status as { text: string; variant: StatusVariant };
    if (category === "transport") return r.status as { text: string; variant: StatusVariant };
    if (category === "inventory") return r.status as { text: string; variant: StatusVariant };
    if (category === "hostel") return { text: String(r.occupancy), variant: (r.color as StatusVariant) || "blue" };
    return undefined;
  };

  return (
    <div className="space-y-3">
      {onAdd && (
        <div className="flex justify-end">
          <Button size="sm" onClick={onAdd}>{addLabel ? `+ ${addLabel}` : `+ Add ${title}`}</Button>
        </div>
      )}
      <Card className="divide-y divide-border-light">
        {rows.map((r, idx) => (
          <div
            key={String(r.id ?? idx)}
            className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface/50 transition-colors"
            onClick={() => onRowClick(r)}
          >
            <div>
              <p className="text-sm font-medium text-text-dark">{renderTitle(r)}</p>
              <p className="text-xs text-text-muted mt-0.5">{renderSub(r)}</p>
            </div>
            <div className="flex items-center gap-3">
              {renderStatus(r) && <StatusBadge status={renderStatus(r)!} />}
              <Button variant="ghost" size="sm">Open</Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

const visitorFields = [
  { key: "name", label: "Name" },
  { key: "purpose", label: "Purpose" },
  { key: "time", label: "Check-in Time" },
  { key: "checkout", label: "Check-out Time" },
  { key: "status", label: "Status", options: ["On-site", "Completed", "Flagged"] },
];

const clinicFields = [
  { key: "name", label: "Student" },
  { key: "symptoms", label: "Symptoms", type: "textarea" },
  { key: "visited", label: "Visit Time" },
  { key: "notes", label: "Treatment / Notes", type: "textarea" },
  { key: "status", label: "Status", options: ["Treated", "Referral", "Parent Notified"] },
];

const libraryFields = [
  { key: "item", label: "Book / Item" },
  { key: "student", label: "Student" },
  { key: "due", label: "Due Date" },
  { key: "status", label: "Status", options: ["On Loan", "Overdue", "Returned"] },
];

const transportFields = [
  { key: "route", label: "Route" },
  { key: "vehicle", label: "Vehicle" },
  { key: "driver", label: "Driver" },
  { key: "status", label: "Status", options: ["Active", "Delayed", "Maintenance"] },
];

const hostelFields = [
  { key: "name", label: "House Name" },
  { key: "capacity", label: "Capacity" },
  { key: "occupancy", label: "Occupancy" },
  { key: "warden", label: "Warden" },
  { key: "phone", label: "Contact Phone" },
  { key: "gender", label: "Gender" },
];

const inventoryFields = [
  { key: "name", label: "Item Name" },
  { key: "location", label: "Location" },
  { key: "qty", label: "Quantity" },
  { key: "status", label: "Status", options: ["In Stock", "Low Stock", "Out of Stock"] },
];

const categoryFieldDefs: Record<string, { key: string; label: string; type?: string; options?: string[] }[]> = {
  visitors: visitorFields,
  clinic: clinicFields,
  library: libraryFields,
  transport: transportFields,
  hostel: hostelFields,
  inventory: inventoryFields,
};

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

const categoryOptions = [
  { id: "visitors", label: "Visitors" },
  { id: "clinic", label: "Clinic" },
  { id: "library", label: "Library" },
  { id: "transport", label: "Transport" },
  { id: "hostel", label: "Hostel" },
  { id: "inventory", label: "Inventory" },
  { id: "purchases", label: "Purchases & Payments" },
];

function currentTime() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

let nextId = 100;

export default function OperationsPage() {
  const [visitors, setVisitors] = useState<AnyRecord[]>(initialVisitors);
  const [clinic, setClinic] = useState<AnyRecord[]>(initialClinic);
  const [library, setLibrary] = useState<AnyRecord[]>(initialLibrary);
  const [transport, setTransport] = useState<AnyRecord[]>(initialTransport);
  const [hostel, setHostel] = useState<AnyRecord[]>(initialHostel);
  const [inventory, setInventory] = useState<AnyRecord[]>(initialInventory);
  const [purchases, setPurchases] = useState(initialPurchases);
  const [payouts, setPayouts] = useState(initialPayouts);

  const [activeCategory, setActiveCategory] = useState("visitors");

  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentItem, setPaymentItem] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCategory, setDetailCategory] = useState("");
  const [detailRecord, setDetailRecord] = useState<AnyRecord | null>(null);

  const [hostelAddOpen, setHostelAddOpen] = useState(false);
  const [hostelAddForm, setHostelAddForm] = useState<Record<string, string>>({});

  const [visitorAddOpen, setVisitorAddOpen] = useState(false);
  const [visitorAddForm, setVisitorAddForm] = useState<Record<string, string>>({});

  const [clinicAddOpen, setClinicAddOpen] = useState(false);
  const [clinicAddForm, setClinicAddForm] = useState<Record<string, string>>({});

  const [transportAddOpen, setTransportAddOpen] = useState(false);
  const [transportAddForm, setTransportAddForm] = useState<Record<string, string>>({});

  const [inventoryAddOpen, setInventoryAddOpen] = useState(false);
  const [inventoryAddForm, setInventoryAddForm] = useState<Record<string, string>>({});

  const setHostelAddField = (key: string, val: string) => {
    setHostelAddForm((f) => ({ ...f, [key]: val }));
  };

  const openHostelAdd = () => {
    setHostelAddForm({});
    setHostelAddOpen(true);
  };

  const handleAddHostel = () => {
    nextId++;
    const gender = hostelAddForm.gender || "Boys";
    const newHostel: AnyRecord = {
      id: nextId,
      name: hostelAddForm.name || "",
      capacity: hostelAddForm.capacity || "",
      occupancy: "0%",
      warden: hostelAddForm.warden || "",
      phone: hostelAddForm.phone || "",
      gender,
      color: gender === "Girls" ? ("orange" as const) : ("blue" as const),
    };
    setHostel((prev) => [...prev, newHostel]);
    setHostelAddOpen(false);
    setHostelAddForm({});
  };

  const openVisitorAdd = () => {
    setVisitorAddForm({ time: currentTime() });
    setVisitorAddOpen(true);
  };

  const setVisitorAddField = (key: string, val: string) => {
    setVisitorAddForm((f) => ({ ...f, [key]: val }));
  };

  const handleAddVisitor = () => {
    nextId++;
    const newVisitor: AnyRecord = {
      id: nextId,
      name: visitorAddForm.name || "",
      purpose: visitorAddForm.purpose || "",
      time: visitorAddForm.time || currentTime(),
      checkout: visitorAddForm.checkout || "",
      status: { text: visitorAddForm.status || "On-site", variant: "green" },
    };
    setVisitors((prev) => [...prev, newVisitor]);
    setVisitorAddOpen(false);
    setVisitorAddForm({});
  };

  const openClinicAdd = () => {
    setClinicAddForm({ visited: currentTime() });
    setClinicAddOpen(true);
  };

  const setClinicAddField = (key: string, val: string) => {
    setClinicAddForm((f) => ({ ...f, [key]: val }));
  };

  const handleAddClinic = () => {
    nextId++;
    const newClinic: AnyRecord = {
      id: nextId,
      name: clinicAddForm.name || "",
      symptoms: clinicAddForm.symptoms || "",
      visited: clinicAddForm.visited || currentTime(),
      notes: clinicAddForm.notes || "",
      status: { text: clinicAddForm.status || "Treated", variant: "green" },
    };
    setClinic((prev) => [...prev, newClinic]);
    setClinicAddOpen(false);
    setClinicAddForm({});
  };

  const openTransportAdd = () => {
    setTransportAddForm({});
    setTransportAddOpen(true);
  };

  const setTransportAddField = (key: string, val: string) => {
    setTransportAddForm((f) => ({ ...f, [key]: val }));
  };

  const handleAddTransport = () => {
    nextId++;
    const newTransport: AnyRecord = {
      id: nextId,
      route: transportAddForm.route || "",
      vehicle: transportAddForm.vehicle || "",
      driver: transportAddForm.driver || "",
      status: { text: transportAddForm.status || "Active", variant: "green" },
    };
    setTransport((prev) => [...prev, newTransport]);
    setTransportAddOpen(false);
    setTransportAddForm({});
  };

  const openInventoryAdd = () => {
    setInventoryAddForm({});
    setInventoryAddOpen(true);
  };

  const setInventoryAddField = (key: string, val: string) => {
    setInventoryAddForm((f) => ({ ...f, [key]: val }));
  };

  const handleAddInventory = () => {
    nextId++;
    const newInventory: AnyRecord = {
      id: nextId,
      name: inventoryAddForm.name || "",
      location: inventoryAddForm.location || "",
      qty: inventoryAddForm.qty || "",
      status: { text: inventoryAddForm.status || "In Stock", variant: "green" },
    };
    setInventory((prev) => [...prev, newInventory]);
    setInventoryAddOpen(false);
    setInventoryAddForm({});
  };

  const handleSaveDetail = (updated: AnyRecord) => {
    const cat = detailCategory;
    if (cat === "visitors") {
      setVisitors((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    } else if (cat === "clinic") {
      setClinic((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    } else if (cat === "library") {
      setLibrary((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    } else if (cat === "transport") {
      setTransport((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    } else if (cat === "hostel") {
      setHostel((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    } else if (cat === "inventory") {
      setInventory((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    }
  };

  const openDetail = (category: string, record: AnyRecord) => {
    setDetailCategory(category);
    setDetailRecord({ ...record });
    setDetailOpen(true);
  };

  const categoryDisplayNames: Record<string, string> = {
    visitors: "Visitor",
    clinic: "Clinic Visit",
    library: "Library Record",
    transport: "Transport Route",
    hostel: "Hostel",
    inventory: "Inventory Item",
  };

  const purchasesRows = purchases.map((p) => ({
    ...p,
    action:
      p.status.text === "Pending Payment" ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
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

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case "visitors":
        return (
          <CategoryTab
            title="Visitor"
            rows={visitors}
            fieldDefs={visitorFields}
            category="visitors"
            addLabel="Log Visitor"
            onAdd={openVisitorAdd}
            onRowClick={(r) => openDetail("visitors", r)}
          />
        );
      case "clinic":
        return (
          <CategoryTab
            title="Sick Student"
            rows={clinic}
            fieldDefs={clinicFields}
            category="clinic"
            addLabel="Log Sick Student"
            onAdd={openClinicAdd}
            onRowClick={(r) => openDetail("clinic", r)}
          />
        );
      case "library":
        return (
          <div className="space-y-3">
            <p className="text-xs text-text-muted">Records are created by the librarian workflow.</p>
            <CategoryTab
              title="Library Book"
              rows={library}
              fieldDefs={libraryFields}
              category="library"
              onRowClick={(r) => openDetail("library", r)}
            />
          </div>
        );
      case "transport":
        return (
          <CategoryTab
            title="Route"
            rows={transport}
            fieldDefs={transportFields}
            category="transport"
            addLabel="Add Route"
            onAdd={openTransportAdd}
            onRowClick={(r) => openDetail("transport", r)}
          />
        );
      case "hostel":
        return (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Link href="/hostel-admin">
                <Button variant="secondary" size="sm">Open Hostel Admin Dashboard</Button>
              </Link>
            </div>
            <CategoryTab
              title="Hostel"
              rows={hostel}
              fieldDefs={hostelFields}
              category="hostel"
              addLabel="Add Hostel"
              onAdd={openHostelAdd}
              onRowClick={(r) => openDetail("hostel", r)}
            />
          </div>
        );
      case "inventory":
        return (
          <CategoryTab
            title="Item"
            rows={inventory}
            fieldDefs={inventoryFields}
            category="inventory"
            addLabel="Add Item"
            onAdd={openInventoryAdd}
            onRowClick={(r) => openDetail("inventory", r)}
          />
        );
      case "purchases":
        return (
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
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Operations"
        subtitle="Manage day-to-day institution operations and procurement"
        actions={
          <>
            <Button variant="secondary" onClick={() => setPurchaseOpen(true)}>+ Record Purchase</Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <div className="mb-5 max-w-xs">
        <SelectField
          label="Category"
          options={categoryOptions.map((c) => c.label)}
          value={categoryOptions.find((c) => c.id === activeCategory)?.label ?? ""}
          onChange={(e) => {
            const match = categoryOptions.find((c) => c.label === e.target.value);
            if (match) setActiveCategory(match.id);
          }}
        />
      </div>

      {renderCategoryContent()}

      <DetailModal
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setDetailRecord(null); }}
        record={detailRecord}
        category={categoryDisplayNames[detailCategory] || detailCategory}
        fieldDefs={categoryFieldDefs[detailCategory] || []}
        onSave={handleSaveDetail}
      />

      <Modal
        open={visitorAddOpen}
        onClose={() => { setVisitorAddOpen(false); setVisitorAddForm({}); }}
        title="Log Visitor"
        subtitle="Record a visitor and their check-in / check-out times"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setVisitorAddOpen(false); setVisitorAddForm({}); }}>Cancel</Button>
            <Button onClick={handleAddVisitor}>Log Visitor</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Name" required>
            <TextInput placeholder="Visitor name" value={visitorAddForm.name || ""} onChange={(e) => setVisitorAddField("name", e.target.value)} />
          </Field>
          <Field label="Purpose" required>
            <TextInput placeholder="e.g. Pickup — Chidi Eze" value={visitorAddForm.purpose || ""} onChange={(e) => setVisitorAddField("purpose", e.target.value)} />
          </Field>
          <Field label="Check-In Time" required>
            <TextInput placeholder="e.g. 2:30 PM" value={visitorAddForm.time || ""} onChange={(e) => setVisitorAddField("time", e.target.value)} />
          </Field>
          <Field label="Check-Out Time">
            <TextInput placeholder="Optional" value={visitorAddForm.checkout || ""} onChange={(e) => setVisitorAddField("checkout", e.target.value)} />
          </Field>
          <SelectField
            label="Status"
            options={["On-site", "Completed", "Flagged"]}
            value={visitorAddForm.status || "On-site"}
            onChange={(e) => setVisitorAddField("status", e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={clinicAddOpen}
        onClose={() => { setClinicAddOpen(false); setClinicAddForm({}); }}
        title="Log Sick Student"
        subtitle="Record a sick student and their symptoms"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setClinicAddOpen(false); setClinicAddForm({}); }}>Cancel</Button>
            <Button onClick={handleAddClinic}>Log Sick Student</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Student" required>
            <TextInput placeholder="Student name" value={clinicAddForm.name || ""} onChange={(e) => setClinicAddField("name", e.target.value)} />
          </Field>
          <Field label="Symptoms" required>
            <TextArea rows={2} placeholder="Describe symptoms" value={clinicAddForm.symptoms || ""} onChange={(e) => setClinicAddField("symptoms", e.target.value)} />
          </Field>
          <Field label="Visit Time" required>
            <TextInput placeholder="e.g. 9:20 AM" value={clinicAddForm.visited || ""} onChange={(e) => setClinicAddField("visited", e.target.value)} />
          </Field>
          <Field label="Treatment / Notes">
            <TextArea rows={2} placeholder="Treatment given, follow-up notes" value={clinicAddForm.notes || ""} onChange={(e) => setClinicAddField("notes", e.target.value)} />
          </Field>
          <SelectField
            label="Status"
            options={["Treated", "Referral", "Parent Notified"]}
            value={clinicAddForm.status || "Treated"}
            onChange={(e) => setClinicAddField("status", e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={transportAddOpen}
        onClose={() => { setTransportAddOpen(false); setTransportAddForm({}); }}
        title="Add Route"
        subtitle="Add a new transport route"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setTransportAddOpen(false); setTransportAddForm({}); }}>Cancel</Button>
            <Button onClick={handleAddTransport}>Add Route</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Route" required>
            <TextInput placeholder="e.g. Route D — South" value={transportAddForm.route || ""} onChange={(e) => setTransportAddField("route", e.target.value)} />
          </Field>
          <Field label="Vehicle" required>
            <TextInput placeholder="e.g. Bus 4 (45 seats)" value={transportAddForm.vehicle || ""} onChange={(e) => setTransportAddField("vehicle", e.target.value)} />
          </Field>
          <Field label="Driver" required>
            <TextInput placeholder="Driver name" value={transportAddForm.driver || ""} onChange={(e) => setTransportAddField("driver", e.target.value)} />
          </Field>
          <SelectField
            label="Status"
            options={["Active", "Delayed", "Maintenance"]}
            value={transportAddForm.status || "Active"}
            onChange={(e) => setTransportAddField("status", e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={hostelAddOpen}
        onClose={() => { setHostelAddOpen(false); setHostelAddForm({}); }}
        title="Add Hostel"
        subtitle="Create a new hostel house"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setHostelAddOpen(false); setHostelAddForm({}); }}>Cancel</Button>
            <Button onClick={handleAddHostel}>Save Hostel</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="House Name" required>
            <TextInput placeholder="e.g. Yellow House — Boys" value={hostelAddForm.name || ""} onChange={(e) => setHostelAddField("name", e.target.value)} />
          </Field>
          <Field label="Capacity" required>
            <TextInput type="number" placeholder="e.g. 120" value={hostelAddForm.capacity || ""} onChange={(e) => setHostelAddField("capacity", e.target.value)} />
          </Field>
          <Field label="Warden / Hostel Admin" required>
            <TextInput placeholder="e.g. Mr. Achebe" value={hostelAddForm.warden || ""} onChange={(e) => setHostelAddField("warden", e.target.value)} />
          </Field>
          <Field label="Contact Phone" required>
            <TextInput type="tel" placeholder="+234 xxx xxx xxxx" value={hostelAddForm.phone || ""} onChange={(e) => setHostelAddField("phone", e.target.value)} />
          </Field>
          <SelectField
            label="Gender"
            required
            placeholder="Select gender"
            options={["Boys", "Girls"]}
            value={hostelAddForm.gender || ""}
            onChange={(e) => setHostelAddField("gender", e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={inventoryAddOpen}
        onClose={() => { setInventoryAddOpen(false); setInventoryAddForm({}); }}
        title="Add Item"
        subtitle="Add an inventory item"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setInventoryAddOpen(false); setInventoryAddForm({}); }}>Cancel</Button>
            <Button onClick={handleAddInventory}>Add Item</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Item Name" required>
            <TextInput placeholder="e.g. Microscope" value={inventoryAddForm.name || ""} onChange={(e) => setInventoryAddField("name", e.target.value)} />
          </Field>
          <Field label="Location" required>
            <TextInput placeholder="e.g. Science Lab 1" value={inventoryAddForm.location || ""} onChange={(e) => setInventoryAddField("location", e.target.value)} />
          </Field>
          <Field label="Quantity" required>
            <TextInput placeholder="e.g. 30" value={inventoryAddForm.qty || ""} onChange={(e) => setInventoryAddField("qty", e.target.value)} />
          </Field>
          <SelectField
            label="Status"
            options={["In Stock", "Low Stock", "Out of Stock"]}
            value={inventoryAddForm.status || "In Stock"}
            onChange={(e) => setInventoryAddField("status", e.target.value)}
          />
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
          <SelectField label="Purchase" required placeholder={paymentItem || "Select purchase"} options={["Chemistry reagents — ₦1,400", "Football sets ×6 — ₦360"]} />
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
