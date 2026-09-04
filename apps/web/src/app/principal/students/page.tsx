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
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import { useState } from "react";
import Link from "next/link";

const kpis = [
  { label: "Total Students", value: "12,450", detail: "", detailColor: "muted" as const },
  { label: "Enrolled This Term", value: "45", detail: "", detailColor: "green" as const },
  { label: "Achievement Distinction", value: "1,120", detail: "", detailColor: "muted" as const },
  { label: "Credit Recovery", value: "34", detail: "", detailColor: "orange" as const },
];

const data = [
  { student: { text: "Chidi Eze", variant: "muted" as const }, id: "STU-21401", class: "SS1 Science", guardian: "Mr. Eze", status: { text: "Active", variant: "green" as const }, actions: <Link href="/teacher/students/STU-21401" className="text-sm font-medium text-primary hover:underline">View</Link> },
  { student: { text: "Amara Okafor", variant: "muted" as const }, id: "STU-21402", class: "JSS2 B", guardian: "Mrs. Okafor", status: { text: "Active", variant: "green" as const }, actions: <Link href="/teacher/students/STU-21402" className="text-sm font-medium text-primary hover:underline">View</Link> },
  { student: { text: "Tom Wallace", variant: "muted" as const }, id: "STU-21403", class: "SS3 Art", guardian: "Mr. Wallace", status: { text: "Active", variant: "green" as const }, actions: <Link href="/teacher/students/STU-21403" className="text-sm font-medium text-primary hover:underline">View</Link> },
  { student: { text: "Grace Lim", variant: "muted" as const }, id: "STU-21404", class: "SS2 Science", guardian: "Mrs. Lim", status: { text: "Suspended", variant: "red" as const }, actions: <Link href="/teacher/students/STU-21404" className="text-sm font-medium text-primary hover:underline">View</Link> },
  { student: { text: "Daniel Smith", variant: "muted" as const }, id: "STU-21405", class: "JSS1 A", guardian: "Mrs. Smith", status: { text: "Active", variant: "green" as const }, actions: <Link href="/teacher/students/STU-21405" className="text-sm font-medium text-primary hover:underline">View</Link> },
];

const columns = [
  { key: "student", label: "STUDENT", width: "140px" },
  { key: "id", label: "ID", width: "110px" },
  { key: "class", label: "CLASS", width: "110px" },
  { key: "guardian", label: "GUARDIAN", width: "120px" },
  { key: "status", label: "STATUS", width: "90px" },
  { key: "actions", label: "ACTIONS", width: "70px", align: "right" as const },
];

export default function PrincipalStudentsPage() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Students"
        subtitle="Full student directory and academic records"
        actions={<Button onClick={() => setSearchOpen(true)}>+ Add Student</Button>}
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
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Add Student"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSearchOpen(false)}>Cancel</Button>
            <Button onClick={() => setSearchOpen(false)}>Save</Button>
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
          <SelectField label="Class" required placeholder="Select class" options={["JSS1 A", "JSS1 B", "SS1 Science", "SS2 Art", "SS1 Business"]} />
          <Field label="Guardian Name" required>
            <TextInput placeholder="Enter guardian name" />
          </Field>
          <Field label="Guardian Email">
            <TextInput type="email" placeholder="guardian@example.com" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
