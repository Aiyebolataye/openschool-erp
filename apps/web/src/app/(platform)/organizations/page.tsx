"use client";

import { useState, useMemo } from "react";
import { CheckCircle, ExternalLink, Copy } from "lucide-react";
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
  { label: "TOTAL ORGANIZATIONS", value: "127", detail: "+12 this month", detailColor: "green" as const },
  { label: "ACTIVE", value: "98", detail: "77.2%", detailColor: "green" as const },
  { label: "SUSPENDED", value: "18", detail: "14.2%", detailColor: "red" as const },
  { label: "TRIAL", value: "11", detail: "8.7%", detailColor: "orange" as const },
];

const initialData = [
  { org: "Demo Academy", slug: "greenfield-academy", domain: "greenfield.edu", adminName: "Jane Doe", adminEmail: "admin@greenfield.edu", phone: "+1 (555) 100-2000", status: { text: "Active", variant: "green" as const }, institutions: "5", students: "12,450", created: "Jan 15, 2025", address: "123 Oak Street, Springfield, IL 62701" },
  { org: "Metropolitan Schools", slug: "metropolitan-schools", domain: "metropolitan-schools.edu", adminName: "Robert Chen", adminEmail: "admin@metropolitan-schools.edu", phone: "+1 (555) 200-3000", status: { text: "Active", variant: "green" as const }, institutions: "3", students: "8,230", created: "Mar 22, 2025", address: "456 Main Ave, Chicago, IL 60601" },
  { org: "Coastal Education Trust", slug: "coastal-ed-trust", domain: "coastaledtrust.edu", adminName: "Maria Santos", adminEmail: "admin@coastal-ed-trust.edu", phone: "+1 (555) 300-4000", status: { text: "Trial", variant: "orange" as const }, institutions: "2", students: "3,100", created: "Jun 8, 2025", address: "789 Beach Blvd, Miami, FL 33101" },
  { org: "Pinnacle Learning Center", slug: "pinnacle-learning", domain: "pinnaclelearning.edu", adminName: "David Park", adminEmail: "admin@pinnacle-learning.edu", phone: "+1 (555) 400-5000", status: { text: "Suspended", variant: "red" as const }, institutions: "1", students: "1,840", created: "Nov 3, 2024", address: "321 Summit Dr, Denver, CO 80201" },
  { org: "Sunrise International", slug: "sunrise-intl", domain: "sunriseintl.edu", adminName: "Aiko Tanaka", adminEmail: "admin@sunrise-intl.edu", phone: "+1 (555) 500-6000", status: { text: "Active", variant: "green" as const }, institutions: "8", students: "24,600", created: "Aug 19, 2025", address: "555 Global Way, San Francisco, CA 94102" },
];

type OrgRow = {
  org: string;
  slug: string;
  domain: string;
  adminName: string;
  adminEmail: string;
  phone: string;
  status: { text: string; variant: "green" | "red" | "orange" };
  institutions: string;
  students: string;
  created: string;
  address: string;
};

const columns = [
  { key: "org", label: "ORGANIZATION", width: "220px" },
  { key: "status", label: "STATUS", width: "100px" },
  { key: "institutions", label: "INSTITUTIONS", width: "100px" },
  { key: "students", label: "STUDENTS", width: "100px" },
  { key: "created", label: "CREATED", width: "120px" },
  { key: "actions", label: "ACTIONS", width: "100px", align: "right" as const },
];

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateEmail(name: string) {
  const slug = toSlug(name);
  return slug ? `admin@${slug}.edu` : "";
}

function generateDomain(name: string) {
  const slug = toSlug(name);
  return slug ? `${slug}.edu` : "";
}

export default function OrganizationsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [created, setCreated] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [orgs, setOrgs] = useState<OrgRow[]>(initialData);
  const [confirmOrg, setConfirmOrg] = useState<OrgRow | null>(null);

  const [formName, setFormName] = useState("");
  const [formDomain, setFormDomain] = useState("");
  const [formAdminName, setFormAdminName] = useState("");
  const [formPlan, setFormPlan] = useState("");
  const [formPhone, setFormPhone] = useState("");

  const adminEmail = useMemo(() => generateEmail(formName), [formName]);

  const filteredData = useMemo(() => {
    return orgs.filter((row) => {
      const matchesSearch =
        !search ||
        row.org.toLowerCase().includes(search.toLowerCase()) ||
        row.slug.toLowerCase().includes(search.toLowerCase()) ||
        row.adminEmail.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || row.status.text.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orgs, search, statusFilter]);

  function resetForm() {
    setFormName("");
    setFormDomain("");
    setFormAdminName("");
    setFormPlan("");
    setFormPhone("");
    setCreated(false);
  }

  function handleCreate() {
    setCreated(true);
  }

  function handleDone() {
    resetForm();
    setModalOpen(false);
  }

  function toggleSuspension() {
    if (!confirmOrg) return;
    const suspended = confirmOrg.status.text === "Suspended";
    setOrgs((prev) =>
      prev.map((o) =>
        o.slug === confirmOrg.slug
          ? { ...o, status: suspended ? { text: "Active", variant: "green" } : { text: "Suspended", variant: "red" } }
          : o
      )
    );
    setConfirmOrg(null);
  }

  const tableData = filteredData.map((row) => ({
    ...row,
    actions: (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirmOrg(row)}
      >
        {row.status.text === "Suspended" ? "Activate" : "Suspend"}
      </Button>
    ),
  }));

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Organizations"
        subtitle="Platform Admin / Organizations"
        actions={<Button onClick={() => setModalOpen(true)}>+ Add Organization</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select
            options={[
              { label: "All Statuses", value: "all" },
              { label: "Active", value: "active" },
              { label: "Suspended", value: "suspended" },
              { label: "Trial", value: "trial" },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="All Statuses"
          />
          <SearchInput placeholder="Search by name, slug, or email..." className="flex-1" value={search} onChange={setSearch} />
        </div>
      </Card>

      <DataTable columns={columns} data={tableData} />
      <Pagination currentPage={page} totalPages={26} onPageChange={setPage} />

      <Modal
        open={modalOpen}
        onClose={() => { resetForm(); setModalOpen(false); }}
        title={created ? "Organization Created" : "Add Organization"}
        subtitle={created ? undefined : "Fill in the details to create a new organization"}
        footer={
          created ? (
            <Button onClick={handleDone}>Done</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => { resetForm(); setModalOpen(false); }}>Cancel</Button>
              <Button onClick={handleCreate}>Create Organization</Button>
            </>
          )
        }
      >
        {created ? (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 text-green">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Organization created successfully</span>
            </div>

            <Card className="p-4">
              <div className="flex flex-col gap-3">
                <div>
                  <span className="text-xs font-medium text-text-muted">Admin Login Email</span>
                  <p className="text-sm text-text-dark mt-1 font-medium">{adminEmail}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-text-muted">Temporary Password</span>
                  <p className="text-sm text-text-dark mt-1 font-mono font-medium">OrgTemp@2026</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-text-muted">Dashboard Link</span>
                  <a
                    href="https://platform.openschool.com/org-admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary mt-1 inline-flex items-center gap-1 hover:underline font-medium"
                  >
                    https://platform.openschool.com/org-admin
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </Card>

            <div className="rounded-lg bg-orange-light/40 border border-orange/20 px-4 py-3">
              <p className="text-xs text-orange leading-relaxed">
                The admin will receive an email with these credentials. They must set up their password and upload their license on first login.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Field label="Organization Name" required>
              <TextInput placeholder="e.g. Demo Academy" value={formName} onChange={(e) => { setFormName(e.target.value); if (!formDomain || formDomain === generateDomain(formName)) setFormDomain(generateDomain(e.target.value)); }} />
            </Field>
            <Field label="Domain" required>
              <TextInput placeholder="e.g. greenfield.edu" value={formDomain} onChange={(e) => setFormDomain(e.target.value)} />
            </Field>
            <Field label="Admin Name" required>
              <TextInput placeholder="e.g. John Smith" value={formAdminName} onChange={(e) => setFormAdminName(e.target.value)} />
            </Field>
            <Field label="Admin Email" required>
              <div className="relative">
                <TextInput type="email" value={adminEmail} readOnly />
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(adminEmail)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-text-muted hover:text-text-dark hover:bg-surface transition-colors"
                  title="Copy email"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </Field>
            <Field label="Phone">
              <TextInput type="tel" placeholder="e.g. +1 (555) 123-4567" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
            </Field>
          </div>
        )}
      </Modal>

      <Modal
        open={!!confirmOrg}
        onClose={() => setConfirmOrg(null)}
        title={confirmOrg?.status.text === "Suspended" ? "Activate Organization" : "Suspend Organization"}
        subtitle={confirmOrg?.org}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOrg(null)}>Cancel</Button>
            <Button variant={confirmOrg?.status.text === "Suspended" ? "primary" : "danger"} onClick={toggleSuspension}>
              {confirmOrg?.status.text === "Suspended" ? "Activate" : "Suspend"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-dark">
          Are you sure you want to {confirmOrg?.status.text === "Suspended" ? "activate" : "suspend"} <span className="font-medium">{confirmOrg?.org}</span>? This action can be reversed at any time.
        </p>
      </Modal>
    </div>
  );
}
