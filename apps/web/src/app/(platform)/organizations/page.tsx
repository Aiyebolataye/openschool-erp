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
  { org: "Greenfield Academy", slug: "greenfield-academy", domain: "greenfield.edu", adminName: "Jane Doe", adminEmail: "admin@greenfield.edu", phone: "+1 (555) 100-2000", status: { text: "Active", variant: "green" as const }, institutions: "5", students: "12,450", plan: { text: "Enterprise", variant: "blue" as const }, created: "Jan 15, 2025", address: "123 Oak Street, Springfield, IL 62701" },
  { org: "Metropolitan Schools", slug: "metropolitan-schools", domain: "metropolitan-schools.edu", adminName: "Robert Chen", adminEmail: "admin@metropolitan-schools.edu", phone: "+1 (555) 200-3000", status: { text: "Active", variant: "green" as const }, institutions: "3", students: "8,230", plan: { text: "Pro", variant: "blue" as const }, created: "Mar 22, 2025", address: "456 Main Ave, Chicago, IL 60601" },
  { org: "Coastal Education Trust", slug: "coastal-ed-trust", domain: "coastaledtrust.edu", adminName: "Maria Santos", adminEmail: "admin@coastal-ed-trust.edu", phone: "+1 (555) 300-4000", status: { text: "Trial", variant: "orange" as const }, institutions: "2", students: "3,100", plan: { text: "Starter", variant: "muted" as const }, created: "Jun 8, 2025", address: "789 Beach Blvd, Miami, FL 33101" },
  { org: "Pinnacle Learning Center", slug: "pinnacle-learning", domain: "pinnaclelearning.edu", adminName: "David Park", adminEmail: "admin@pinnacle-learning.edu", phone: "+1 (555) 400-5000", status: { text: "Suspended", variant: "red" as const }, institutions: "1", students: "1,840", plan: { text: "Basic", variant: "muted" as const }, created: "Nov 3, 2024", address: "321 Summit Dr, Denver, CO 80201" },
  { org: "Sunrise International", slug: "sunrise-intl", domain: "sunriseintl.edu", adminName: "Aiko Tanaka", adminEmail: "admin@sunrise-intl.edu", phone: "+1 (555) 500-6000", status: { text: "Active", variant: "green" as const }, institutions: "8", students: "24,600", plan: { text: "Enterprise", variant: "blue" as const }, created: "Aug 19, 2025", address: "555 Global Way, San Francisco, CA 94102" },
];

type OrgRow = typeof initialData[number];

const columns = [
  { key: "org", label: "ORGANIZATION", width: "220px" },
  { key: "status", label: "STATUS", width: "100px" },
  { key: "institutions", label: "INSTITUTIONS", width: "100px" },
  { key: "students", label: "STUDENTS", width: "100px" },
  { key: "plan", label: "PLAN", width: "100px" },
  { key: "created", label: "CREATED", width: "120px" },
  { key: "actions", label: "ACTIONS", width: "80px", align: "right" as const },
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
  const [viewOrg, setViewOrg] = useState<OrgRow | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [formName, setFormName] = useState("");
  const [formDomain, setFormDomain] = useState("");
  const [formAdminName, setFormAdminName] = useState("");
  const [formPlan, setFormPlan] = useState("");
  const [formPhone, setFormPhone] = useState("");

  const adminEmail = useMemo(() => generateEmail(formName), [formName]);

  const filteredData = useMemo(() => {
    return initialData.filter((row) => {
      const matchesSearch =
        !search ||
        row.org.toLowerCase().includes(search.toLowerCase()) ||
        row.slug.toLowerCase().includes(search.toLowerCase()) ||
        row.adminEmail.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || row.status.text.toLowerCase() === statusFilter;
      const matchesPlan = planFilter === "all" || row.plan.text.toLowerCase() === planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [search, statusFilter, planFilter]);

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

  const detailModal = viewOrg && (
    <Modal open={!!viewOrg} onClose={() => setViewOrg(null)} title={viewOrg.org} subtitle={viewOrg.domain}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-medium text-text-muted">Status</span>
            <div className="mt-1"><Badge variant={viewOrg.status.variant}>{viewOrg.status.text}</Badge></div>
          </div>
          <div>
            <span className="text-xs font-medium text-text-muted">Plan</span>
            <div className="mt-1"><Badge variant={viewOrg.plan.variant}>{viewOrg.plan.text}</Badge></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-medium text-text-muted">Institutions</span>
            <p className="text-sm text-text-dark mt-1">{viewOrg.institutions}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-text-muted">Students</span>
            <p className="text-sm text-text-dark mt-1">{viewOrg.students}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-medium text-text-muted">Admin Name</span>
            <p className="text-sm text-text-dark mt-1">{viewOrg.adminName}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-text-muted">Admin Email</span>
            <p className="text-sm text-text-dark mt-1">{viewOrg.adminEmail}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-medium text-text-muted">Phone</span>
            <p className="text-sm text-text-dark mt-1">{viewOrg.phone}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-text-muted">Created</span>
            <p className="text-sm text-text-dark mt-1">{viewOrg.created}</p>
          </div>
        </div>
        <div>
          <span className="text-xs font-medium text-text-muted">Address</span>
          <p className="text-sm text-text-dark mt-1">{viewOrg.address}</p>
        </div>
        <div className="flex gap-2 pt-2">
          <Button size="sm" onClick={() => setViewOrg(null)}>Close</Button>
        </div>
      </div>
    </Modal>
  );

  const tableData = filteredData.map((row) => ({
    ...row,
    actions: (
      <button
        onClick={() => setViewOrg(row)}
        className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-primary-light text-primary text-xs font-medium hover:bg-primary hover:text-white transition-colors"
      >
        View
      </button>
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
          <Select
            options={[
              { label: "All Plans", value: "all" },
              { label: "Enterprise", value: "enterprise" },
              { label: "Pro", value: "pro" },
              { label: "Starter", value: "starter" },
              { label: "Basic", value: "basic" },
            ]}
            value={planFilter}
            onChange={setPlanFilter}
            placeholder="All Plans"
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
              <TextInput placeholder="e.g. Greenfield Academy" value={formName} onChange={(e) => { setFormName(e.target.value); if (!formDomain || formDomain === generateDomain(formName)) setFormDomain(generateDomain(e.target.value)); }} />
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
            <SelectField label="Plan" required options={["Starter", "Growth", "Enterprise"]} placeholder="Select plan" value={formPlan} onChange={(e) => setFormPlan(e.target.value)} />
            <Field label="Phone">
              <TextInput type="tel" placeholder="e.g. +1 (555) 123-4567" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
            </Field>
          </div>
        )}
      </Modal>

      {detailModal}
    </div>
  );
}
