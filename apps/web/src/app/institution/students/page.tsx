"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";

const kpis = [
  { label: "Total Students", value: "12,450", detail: "", detailColor: "muted" as const },
  { label: "Enrolled This Term", value: "45", detail: "", detailColor: "green" as const },
  { label: "Graduated This Year", value: "2,300", detail: "", detailColor: "muted" as const },
  { label: "Active", value: "12,180", detail: "", detailColor: "green" as const },
];

const data = [
  { student: { text: "Chidi Eze", variant: "muted" as const }, id: "STU-21401", class: "SS1 Science", guardian: "Mr. Eze", status: { text: "Active", variant: "green" as const }, actions: "View" },
  { student: { text: "Amara Okafor", variant: "muted" as const }, id: "STU-21402", class: "JSS2 B", guardian: "Mrs. Okafor", status: { text: "Active", variant: "green" as const }, actions: "View" },
  { student: { text: "Tom Wallace", variant: "muted" as const }, id: "STU-21403", class: "SS3 Art", guardian: "Mr. Wallace", status: { text: "Active", variant: "green" as const }, actions: "View" },
  { student: { text: "Grace Lim", variant: "muted" as const }, id: "STU-21404", class: "SS2 Science", guardian: "Mrs. Lim", status: { text: "Suspended", variant: "red" as const }, actions: "View" },
  { student: { text: "Daniel Smith", variant: "muted" as const }, id: "STU-21405", class: "JSS1 A", guardian: "Mrs. Smith", status: { text: "Active", variant: "green" as const }, actions: "View" },
];

const columns = [
  { key: "student", label: "STUDENT", width: "140px" },
  { key: "id", label: "ID", width: "110px" },
  { key: "class", label: "CLASS", width: "110px" },
  { key: "guardian", label: "GUARDIAN", width: "120px" },
  { key: "status", label: "STATUS", width: "90px" },
  { key: "actions", label: "ACTIONS", width: "70px", align: "right" as const },
];

export default function StudentsPage() {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(true);
  const [parentTitle, setParentTitle] = useState("");

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Students"
        subtitle="Manage the full student lifecycle"
        actions={
          <>
            <Button variant="secondary" onClick={() => setBulkOpen(true)}>Bulk Upload</Button>
            <Button onClick={() => setEnrollOpen(true)}>+ Enroll Student</Button>
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
          <Select options={[{ label: "All Classes", value: "all" }]} placeholder="All Classes" />
          <Select options={[{ label: "All Statuses", value: "all" }]} placeholder="All Statuses" />
          <SearchInput placeholder="Search by name or ID..." className="flex-1" />
        </div>
      </Card>

      <DataTable columns={columns} data={data} />
      <Pagination currentPage={1} totalPages={5} />

      <Modal
        open={enrollOpen}
        onClose={() => setEnrollOpen(false)}
        title="Enroll Student"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEnrollOpen(false)}>Cancel</Button>
            <Button onClick={() => setEnrollOpen(false)}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Student Name" required>
            <TextInput placeholder="Enter student name" />
          </Field>
          <Field label="Date of Birth" required>
            <TextInput type="date" />
          </Field>
          <SelectField label="Gender" required placeholder="Select gender" options={["Male", "Female"]} />
          <SelectField label="Class" required placeholder="Select class" options={["JSS1 A", "JSS1 B", "SS1 Science", "SS2 Art", "SS1 Business"]} />
          <SelectField label="Parent Title" required placeholder="Select title" options={["Mr", "Mrs", "Ms", "Dr", "Prof", "Chief", "Alhaji"]} />
          <Field label="Guardian Name" required>
            <TextInput placeholder="Enter guardian name" />
          </Field>
          <Field label="Guardian Email" required>
            <TextInput type="email" placeholder="guardian@example.com" />
          </Field>
          <Field label="Guardian Phone" required>
            <TextInput type="tel" placeholder="+234 xxx xxx xxxx" />
          </Field>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="notify-email" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} className="rounded border-border-light" />
            <label htmlFor="notify-email" className="text-sm text-text-dark">Send enrollment email to parent</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="notify-sms" checked={notifySms} onChange={(e) => setNotifySms(e.target.checked)} className="rounded border-border-light" />
            <label htmlFor="notify-sms" className="text-sm text-text-dark">Send enrollment SMS to parent</label>
          </div>
          <p className="text-xs text-text-muted">
            Parent will receive login credentials and the school portal link via {notifyEmail && notifySms ? "email and SMS" : notifyEmail ? "email" : notifySms ? "SMS" : "no channel"}.
          </p>
        </div>
      </Modal>

      <Modal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Bulk Upload Students"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBulkOpen(false)}>Cancel</Button>
            <Button onClick={() => setBulkOpen(false)}>Upload</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted">Upload a CSV/XLSX file with student records.</p>
          <div className="border-2 border-dashed border-border-light rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
            <p className="text-sm text-text-dark font-medium">Drag & drop or click to upload</p>
            <p className="text-xs text-text-muted mt-1">Supports CSV and XLSX files up to 10MB</p>
          </div>
          <div className="pt-2">
            <p className="text-xs font-medium text-text-dark mb-1">Downloads</p>
            <p className="text-xs text-primary cursor-pointer hover:underline">Download CSV Template</p>
            <p className="text-xs text-primary cursor-pointer hover:underline mt-1">Download XLSX Template</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
