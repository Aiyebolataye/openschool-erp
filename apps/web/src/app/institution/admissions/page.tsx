"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import Link from "next/link";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";

const kpis = [
  { label: "Active Applicants", value: "214", detail: "", detailColor: "muted" as const },
  { label: "New This Week", value: "38", detail: "", detailColor: "green" as const },
  { label: "Pending Review", value: "41", detail: "", detailColor: "orange" as const },
  { label: "Offer Sent", value: "120", detail: "", detailColor: "blue" as const },
];

const initialApplicants = [
  { id: "STU-21403", applicant: { text: "Ngozi Adeyemi", variant: "muted" as const }, stage: { text: "Review", variant: "orange" as const }, program: "SS1 Science", applied: "Jul 26, 2026", priority: { text: "NORMAL", variant: "muted" as const } },
  { id: "STU-21407", applicant: { text: "Kenji Sato", variant: "muted" as const }, stage: { text: "Assessment", variant: "blue" as const }, program: "JSS1 A", applied: "Jul 25, 2026", priority: { text: "URGENT", variant: "red" as const } },
  { id: "STU-21408", applicant: { text: "Mary Jones", variant: "muted" as const }, stage: { text: "Offer Sent", variant: "green" as const }, program: "SS2 Art", applied: "Jul 24, 2026", priority: { text: "NORMAL", variant: "muted" as const } },
  { id: "STU-21406", applicant: { text: "Omar Farouk", variant: "muted" as const }, stage: { text: "Enrolled", variant: "green" as const }, program: "SS1 Business", applied: "Jul 22, 2026", priority: { text: "NORMAL", variant: "muted" as const } },
];

const columns = [
  { key: "applicant", label: "APPLICANT", width: "150px" },
  { key: "stage", label: "STAGE", width: "110px" },
  { key: "program", label: "PROGRAM", width: "120px" },
  { key: "applied", label: "APPLIED", width: "110px" },
  { key: "priority", label: "PRIORITY", width: "90px" },
  { key: "actions", label: "ACTIONS", width: "80px", align: "right" as const },
];

export default function AdmissionsPage() {
  const [appOpen, setAppOpen] = useState(false);
  const [applicants] = useState(initialApplicants);
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const visibleApplicants = q
    ? applicants.filter(
        (a) =>
          a.applicant.text.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.program.toLowerCase().includes(q) ||
          a.stage.text.toLowerCase().includes(q)
      )
    : applicants;

  const rows = visibleApplicants.map((a) => ({
    applicant: a.applicant,
    stage: a.stage,
    program: a.program,
    applied: a.applied,
    priority: a.priority,
    actions: (
      <Link href={`/teacher/students/${a.id}`}>
        <Button variant="ghost" size="sm">View</Button>
      </Link>
    ),
  }));

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Admissions"
        subtitle="Manage applicants through the admissions pipeline"
        actions={<Button onClick={() => setAppOpen(true)}>+ New Application</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select options={[{ label: "All Stages", value: "all" }]} placeholder="All Stages" />
          <Select options={[{ label: "All Programs", value: "all" }]} placeholder="All Programs" />
          <SearchInput placeholder="Search applicants..." className="flex-1" value={search} onChange={setSearch} />
        </div>
      </Card>

      <DataTable columns={columns} data={rows} />

      <Modal
        open={appOpen}
        onClose={() => setAppOpen(false)}
        title="New Application"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAppOpen(false)}>Cancel</Button>
            <Button onClick={() => setAppOpen(false)}>Submit</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Applicant Name" required>
            <TextInput placeholder="Enter applicant name" />
          </Field>
          <SelectField label="Program" required placeholder="Select program" options={["JSS1 A", "JSS1 B", "SS1 Science", "SS1 Art", "SS1 Business"]} />
          <SelectField label="Priority" required placeholder="Select priority" options={["NORMAL", "URGENT"]} />
          <Field label="Guardian Email">
            <TextInput type="email" placeholder="guardian@example.com" />
          </Field>
          <Field label="Notes">
            <TextArea rows={3} placeholder="Additional notes..." />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
