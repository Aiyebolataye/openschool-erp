"use client";

import { useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";

const kpis = [
  { label: "Total Institutions", value: "12", detail: "+2 this year", detailColor: "green" as const },
  { label: "Active", value: "10", detail: "", detailColor: "muted" as const },
  { label: "Trial", value: "1", detail: "", detailColor: "orange" as const },
  { label: "Suspended", value: "1", detail: "", detailColor: "red" as const },
];

type InstRow = {
  name: string;
  slug: string;
  type: { text: string; variant: "muted" };
  status: { text: string; variant: "green" | "red" | "orange" };
  students: string;
  staff: string;
  subscription: { text: string; variant: "blue" | "muted" };
  health: { text: string; variant: "green" | "red" | "orange" };
  adminName: string;
  adminEmail: string;
  phone: string;
};

const initialData: InstRow[] = [
  { name: "Greenfield Academy", slug: "greenfield-academy", type: { text: "Secondary", variant: "muted" }, status: { text: "Active", variant: "green" }, students: "12,450", staff: "620", subscription: { text: "Enterprise", variant: "blue" }, health: { text: "Healthy", variant: "green" }, adminName: "Jane Doe", adminEmail: "jane@greenfield.edu", phone: "+234 801 234 5678" },
  { name: "Metropolitan Schools", slug: "metropolitan-schools", type: { text: "Mixed", variant: "muted" }, status: { text: "Active", variant: "green" }, students: "8,230", staff: "410", subscription: { text: "Pro", variant: "blue" }, health: { text: "Healthy", variant: "green" }, adminName: "John Smith", adminEmail: "john@metropolitan.edu", phone: "+234 802 345 6789" },
  { name: "Coastal Education Trust", slug: "coastal-ed-trust", type: { text: "Primary", variant: "muted" }, status: { text: "Trial", variant: "orange" }, students: "3,100", staff: "155", subscription: { text: "Starter", variant: "muted" }, health: { text: "Monitoring", variant: "orange" }, adminName: "Mary Johnson", adminEmail: "mary@coastaled.edu", phone: "+234 803 456 7890" },
  { name: "Pinnacle Learning", slug: "pinnacle-learning", type: { text: "Secondary", variant: "muted" }, status: { text: "Suspended", variant: "red" }, students: "1,840", staff: "95", subscription: { text: "Basic", variant: "muted" }, health: { text: "Critical", variant: "red" }, adminName: "Peter Obi", adminEmail: "peter@pinnacle.edu", phone: "+234 804 567 8901" },
  { name: "Sunrise International", slug: "sunrise-intl", type: { text: "Secondary", variant: "muted" }, status: { text: "Active", variant: "green" }, students: "4,210", staff: "210", subscription: { text: "Enterprise", variant: "blue" }, health: { text: "Healthy", variant: "green" }, adminName: "Grace Lim", adminEmail: "grace@sunrise-intl.edu", phone: "+234 805 678 9012" },
];

const columns = [
  { key: "name", label: "INSTITUTION", width: "160px" },
  { key: "type", label: "TYPE", width: "80px" },
  { key: "status", label: "STATUS", width: "90px" },
  { key: "students", label: "STUDENTS", width: "80px" },
  { key: "staff", label: "STAFF", width: "70px" },
  { key: "subscription", label: "SUBSCRIPTION", width: "100px" },
  { key: "health", label: "HEALTH", width: "100px" },
  { key: "actions", label: "ACTIONS", width: "80px", align: "right" as const },
];

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export default function OrgAdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState<InstRow[]>(initialData);
  const [addOpen, setAddOpen] = useState(false);
  const [viewItem, setViewItem] = useState<InstRow | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subFilter, setSubFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formAdminName, setFormAdminName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const q = search.trim().toLowerCase();
  const filtered = institutions.filter((row) => {
    const matchesSearch =
      !q ||
      row.name.toLowerCase().includes(q) ||
      row.slug.toLowerCase().includes(q) ||
      row.type.text.toLowerCase().includes(q) ||
      row.status.text.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || row.status.text.toLowerCase() === statusFilter;
    const matchesSub = subFilter === "all" || row.subscription.text === subFilter;
    return matchesSearch && matchesStatus && matchesSub;
  });

  const tableData = filtered.map((row) => ({
    ...row,
    actions: (
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => setViewItem(row)}>View</Button>
      </div>
    ),
  }));

  function resetForm() {
    setFormName("");
    setFormType("");
    setFormAddress("");
    setFormAdminName("");
    setFormEmail("");
    setFormPhone("");
  }

  function handleAddInstitution() {
    if (!formName.trim()) return;
    const newRow: InstRow = {
      name: formName.trim(),
      slug: slugify(formName.trim()),
      type: { text: formType || "Secondary", variant: "muted" },
      status: { text: "Active", variant: "green" },
      students: "0",
      staff: "0",
      subscription: { text: "Starter", variant: "muted" },
      health: { text: "Healthy", variant: "green" },
      adminName: formAdminName || "—",
      adminEmail: formEmail || "—",
      phone: formPhone || "—",
    };
    setInstitutions((prev) => [newRow, ...prev]);
    setAddOpen(false);
    resetForm();
    showToast("Institution added successfully");
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Institutions"
        subtitle="Manage institutions under your organization"
        actions={
          <>
            <Button variant="secondary" onClick={() => showToast("Link request sent to Platform Admin")}>Link Existing</Button>
            <Button onClick={() => setAddOpen(true)}>+ Add Institution</Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select
            options={[{ label: "All Statuses", value: "all" }, { label: "Active", value: "active" }, { label: "Trial", value: "trial" }, { label: "Suspended", value: "suspended" }]}
            placeholder="All Statuses"
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
          />
          <Select
            options={[{ label: "All Subscriptions", value: "all" }, { label: "Enterprise", value: "Enterprise" }, { label: "Pro", value: "Pro" }, { label: "Starter", value: "Starter" }, { label: "Basic", value: "Basic" }]}
            placeholder="All Subscriptions"
            value={subFilter}
            onChange={(val) => setSubFilter(val)}
          />
          <SearchInput placeholder="Search institutions..." className="flex-1" value={search} onChange={(val) => setSearch(val)} />
        </div>
      </Card>

      <DataTable columns={columns} data={tableData} />
      <Pagination currentPage={currentPage} totalPages={3} onPageChange={setCurrentPage} />

      <Modal
        open={addOpen}
        onClose={() => { setAddOpen(false); resetForm(); }}
        title="Add Institution"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setAddOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleAddInstitution}>Add Institution</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Institution Name" required>
            <TextInput placeholder="e.g. Greenfield Academy" value={formName} onChange={(e) => setFormName(e.target.value)} />
          </Field>
          <SelectField label="Type" required placeholder="Select type" options={["Primary", "Secondary", "Mixed"]} value={formType} onChange={(e) => setFormType(e.target.value)} />
          <Field label="Address">
            <TextInput placeholder="Street, City, State" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} />
          </Field>
          <Field label="Admin Name" required>
            <TextInput placeholder="e.g. Jane Doe" value={formAdminName} onChange={(e) => setFormAdminName(e.target.value)} />
          </Field>
          <Field label="Admin Email" required>
            <TextInput type="email" placeholder="admin@example.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
          </Field>
          <Field label="Phone">
            <TextInput placeholder="(555) 123-4567" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title={viewItem?.name ?? ""}
        subtitle={viewItem?.slug}
        footer={<Button variant="secondary" onClick={() => setViewItem(null)}>Close</Button>}
      >
        {viewItem && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-text-muted">Type</span>
                <p className="text-sm font-medium text-text-dark">{viewItem.type.text}</p>
              </div>
              <div>
                <span className="text-xs text-text-muted">Status</span>
                <div className="mt-0.5"><Badge variant={viewItem.status.variant}>{viewItem.status.text}</Badge></div>
              </div>
              <div>
                <span className="text-xs text-text-muted">Students</span>
                <p className="text-sm font-medium text-text-dark">{viewItem.students}</p>
              </div>
              <div>
                <span className="text-xs text-text-muted">Staff</span>
                <p className="text-sm font-medium text-text-dark">{viewItem.staff}</p>
              </div>
              <div>
                <span className="text-xs text-text-muted">Subscription</span>
                <div className="mt-0.5"><Badge variant={viewItem.subscription.variant}>{viewItem.subscription.text}</Badge></div>
              </div>
              <div>
                <span className="text-xs text-text-muted">Health</span>
                <div className="mt-0.5"><Badge variant={viewItem.health.variant}>{viewItem.health.text}</Badge></div>
              </div>
            </div>
            <div className="border-t border-border-light pt-4">
              <span className="text-xs text-text-muted">Admin Name</span>
              <p className="text-sm font-medium text-text-dark">{viewItem.adminName}</p>
            </div>
            <div>
              <span className="text-xs text-text-muted">Admin Email</span>
              <p className="text-sm font-medium text-text-dark">{viewItem.adminEmail}</p>
            </div>
            <div>
              <span className="text-xs text-text-muted">Phone</span>
              <p className="text-sm font-medium text-text-dark">{viewItem.phone}</p>
            </div>
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