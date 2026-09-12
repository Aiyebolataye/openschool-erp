"use client";

import { useState, useMemo } from "react";
import { KpiCard } from "@/components/ui/kpi-card";
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
  { label: "TOTAL INSTITUTIONS", value: "384", detail: "", detailColor: "muted" as const },
  { label: "ACTIVE", value: "312", detail: "81.3%", detailColor: "green" as const },
  { label: "STUDENTS", value: "89.2K", detail: "", detailColor: "muted" as const },
  { label: "STAFF", value: "12.5K", detail: "", detailColor: "muted" as const },
  { label: "CAMPUSES", value: "547", detail: "", detailColor: "muted" as const },
];

const initialData = [
  { institution: "Greenfield Primary", slug: "greenfield-primary", organization: "Greenfield Academy", type: "Primary", status: { text: "Active", variant: "green" as const }, students: "2,450", staff: "186", plan: { text: "Pro", variant: "blue" as const }, created: "Jan 15, 2025", address: "123 Green St, Lagos", phone: "+234 801 234 5678", email: "admin@greenfield-primary.edu" },
  { institution: "Metropolitan High", slug: "metro-high", organization: "Metropolitan Schools", type: "Secondary", status: { text: "Active", variant: "green" as const }, students: "3,120", staff: "245", plan: { text: "Enterprise", variant: "blue" as const }, created: "Mar 22, 2025", address: "45 Metro Ave, Abuja", phone: "+234 802 345 6789", email: "admin@metro-high.edu" },
  { institution: "Coastal Elementary", slug: "coastal-elem", organization: "Standalone", type: "Primary", status: { text: "Trial", variant: "orange" as const }, students: "890", staff: "72", plan: { text: "Starter", variant: "muted" as const }, created: "Jun 8, 2025", address: "78 Ocean Rd, Port Harcourt", phone: "+234 803 456 7890", email: "admin@coastal-elem.edu" },
  { institution: "Pinnacle Academy", slug: "pinnacle-academy", organization: "Pinnacle Learning Center", type: "Mixed", status: { text: "Suspended", variant: "red" as const }, students: "1,840", staff: "134", plan: { text: "Basic", variant: "muted" as const }, created: "Nov 3, 2024", address: "90 Hill Crest, Ibadan", phone: "+234 804 567 8901", email: "admin@pinnacle-academy.edu" },
  { institution: "Sunrise International School", slug: "sunrise-intl", organization: "Standalone", type: "Primary", status: { text: "Active", variant: "green" as const }, students: "4,210", staff: "312", plan: { text: "Enterprise", variant: "blue" as const }, created: "Aug 19, 2025", address: "22 Sunrise Blvd, Enugu", phone: "+234 805 678 9012", email: "admin@sunrise-intl.edu" },
];

type InstRow = {
  institution: string;
  slug: string;
  organization: string;
  type: string;
  status: { text: string; variant: "green" | "red" | "orange" };
  students: string;
  staff: string;
  plan: { text: string; variant: "blue" | "muted" };
  created: string;
  address: string;
  phone: string;
  email: string;
};

const columns = [
  { key: "institution", label: "INSTITUTION", width: "200px" },
  { key: "organization", label: "ORGANIZATION", width: "180px" },
  { key: "status", label: "STATUS", width: "100px" },
  { key: "students", label: "STUDENTS", width: "90px" },
  { key: "staff", label: "STAFF", width: "80px" },
  { key: "plan", label: "PLAN", width: "100px" },
  { key: "created", label: "CREATED", width: "120px" },
  { key: "actions", label: "ACTIONS", width: "180px", align: "right" as const },
];

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 12; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<InstRow[]>(initialData);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewItem, setViewItem] = useState<InstRow | null>(null);
  const [confirmItem, setConfirmItem] = useState<{ name: string; email: string; password: string } | null>(null);
  const [confirmSuspend, setConfirmSuspend] = useState<InstRow | null>(null);
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [formName, setFormName] = useState("");
  const [formOrg, setFormOrg] = useState("");
  const [formType, setFormType] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");

  const generatedEmail = useMemo(() => {
    if (!formName.trim()) return "";
    const slug = slugify(formName.trim());
    return slug ? `admin@${slug}.edu` : "";
  }, [formName]);

  const displayEmail = formEmail || generatedEmail;

  const filteredData = useMemo(() => {
    return institutions.filter((row) => {
      if (search && !row.institution.toLowerCase().includes(search.toLowerCase())) return false;
      if (orgFilter !== "all" && row.organization !== orgFilter) return false;
      if (statusFilter !== "all" && row.status.text.toLowerCase() !== statusFilter) return false;
      return true;
    });
  }, [institutions, search, orgFilter, statusFilter]);

  const tableData = useMemo(() => {
    return filteredData.map((row) => ({
      ...row,
      actions: (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setViewItem(row)}>View</Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmSuspend(row)}>
            {row.status.text === "Suspended" ? "Activate" : "Suspend"}
          </Button>
        </div>
      ),
    }));
  }, [filteredData]);

  function toggleSuspension() {
    if (!confirmSuspend) return;
    const suspended = confirmSuspend.status.text === "Suspended";
    setInstitutions((prev) =>
      prev.map((i) =>
        i.slug === confirmSuspend.slug
          ? { ...i, status: suspended ? { text: "Active", variant: "green" } : { text: "Suspended", variant: "red" } }
          : i
      )
    );
    setConfirmSuspend(null);
  }

  function resetForm() {
    setFormName("");
    setFormOrg("");
    setFormType("");
    setFormAddress("");
    setFormEmail("");
    setFormPhone("");
  }

  function handleCreate() {
    const email = displayEmail;
    const password = generateTempPassword();
    setConfirmItem({ name: formName, email, password });
    setCreateOpen(false);
    resetForm();
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Institutions"
        subtitle="Platform Admin / Institutions"
        actions={<Button onClick={() => setCreateOpen(true)}>+ Add Institution</Button>}
      />

      <div className="grid grid-cols-5 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select
            options={[{ label: "All Organizations", value: "all" }, { label: "Standalone", value: "Standalone" }, { label: "Greenfield Academy", value: "Greenfield Academy" }, { label: "Metropolitan Schools", value: "Metropolitan Schools" }, { label: "Pinnacle Learning Center", value: "Pinnacle Learning Center" }]}
            placeholder="All Organizations"
            value={orgFilter}
            onChange={(val) => setOrgFilter(val)}
          />
          <Select
            options={[{ label: "All Statuses", value: "all" }, { label: "Active", value: "active" }, { label: "Trial", value: "trial" }, { label: "Suspended", value: "suspended" }]}
            placeholder="All Statuses"
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
          />
          <SearchInput placeholder="Search institutions..." className="flex-1" value={search} onChange={(val) => setSearch(val)} />
        </div>
      </Card>

      <DataTable columns={columns} data={tableData} />
      <Pagination currentPage={currentPage} totalPages={77} onPageChange={setCurrentPage} />

      <Modal
        open={createOpen}
        onClose={() => { setCreateOpen(false); resetForm(); }}
        title="Add Institution"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setCreateOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleCreate}>Create Institution</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Institution Name" required>
            <TextInput placeholder="e.g. Greenfield Primary" value={formName} onChange={(e) => setFormName(e.target.value)} />
          </Field>
          <SelectField label="Organization" required options={["NONE / Standalone", "Greenfield Academy", "Metropolitan Schools", "Coastal Education", "Pinnacle Learning", "Sunrise International"]} placeholder="Select organization" value={formOrg} onChange={(e) => setFormOrg(e.target.value)} />
          <SelectField label="Type" required options={["Nursery", "Primary", "Secondary", "Mixed"]} placeholder="Select type" value={formType} onChange={(e) => setFormType(e.target.value)} />
          <Field label="Address">
            <TextInput placeholder="e.g. 123 Main St, City, State" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} />
          </Field>
          <Field label="Admin Email" required>
            <TextInput type="email" placeholder="e.g. admin@greenfield.edu" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
          </Field>
          {generatedEmail && (
            <div className="rounded-lg border border-primary/30 bg-primary-light/30 px-3 py-2">
              <span className="text-xs text-text-muted">Auto-generated email:</span>
              <p className="text-sm font-medium text-primary">{displayEmail}</p>
            </div>
          )}
          <Field label="Phone">
            <TextInput type="tel" placeholder="e.g. +1 (555) 123-4567" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title={viewItem?.institution ?? ""}
        subtitle={viewItem?.organization}
        footer={<Button variant="secondary" onClick={() => setViewItem(null)}>Close</Button>}
      >
        {viewItem && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-text-muted">Type</span>
                <p className="text-sm font-medium text-text-dark">{viewItem.type}</p>
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
                <span className="text-xs text-text-muted">Plan</span>
                <div className="mt-0.5"><Badge variant={viewItem.plan.variant}>{viewItem.plan.text}</Badge></div>
              </div>
              <div>
                <span className="text-xs text-text-muted">Created</span>
                <p className="text-sm font-medium text-text-dark">{viewItem.created}</p>
              </div>
            </div>
            <div className="border-t border-border-light pt-4">
              <span className="text-xs text-text-muted">Email</span>
              <p className="text-sm font-medium text-text-dark">{viewItem.email}</p>
            </div>
            <div>
              <span className="text-xs text-text-muted">Address</span>
              <p className="text-sm font-medium text-text-dark">{viewItem.address}</p>
            </div>
            <div>
              <span className="text-xs text-text-muted">Phone</span>
              <p className="text-sm font-medium text-text-dark">{viewItem.phone}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!confirmItem}
        onClose={() => setConfirmItem(null)}
        title="Institution Created"
        subtitle="Share these credentials with the institution admin"
        footer={<Button onClick={() => setConfirmItem(null)}>Done</Button>}
      >
        {confirmItem && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-green/30 bg-green-light/30 px-4 py-3">
              <span className="text-xs text-text-muted">Institution</span>
              <p className="text-sm font-semibold text-text-dark">{confirmItem.name}</p>
            </div>
            <div className="rounded-lg border border-border-light px-4 py-3">
              <span className="text-xs text-text-muted">Admin Email</span>
              <p className="text-sm font-medium text-primary">{confirmItem.email}</p>
            </div>
            <div className="rounded-lg border border-border-light px-4 py-3">
              <span className="text-xs text-text-muted">Temporary Password</span>
              <p className="text-sm font-mono font-medium text-text-dark">{confirmItem.password}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!confirmSuspend}
        onClose={() => setConfirmSuspend(null)}
        title={confirmSuspend?.status.text === "Suspended" ? "Activate Institution" : "Suspend Institution"}
        subtitle={confirmSuspend?.institution}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmSuspend(null)}>Cancel</Button>
            <Button variant={confirmSuspend?.status.text === "Suspended" ? "primary" : "danger"} onClick={toggleSuspension}>
              {confirmSuspend?.status.text === "Suspended" ? "Activate" : "Suspend"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-dark">
          Are you sure you want to {confirmSuspend?.status.text === "Suspended" ? "activate" : "suspend"} <span className="font-medium">{confirmSuspend?.institution}</span>? This action can be reversed at any time.
        </p>
      </Modal>
    </div>
  );
}
