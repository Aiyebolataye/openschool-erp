"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { useState } from "react";

const kpis = [
  { label: "Today's Rate", value: "88.7%", detail: "-0.8% vs avg", detailColor: "red" as const },
  { label: "Present", value: "11,040", detail: "", detailColor: "green" as const },
  { label: "Absent", value: "1,410", detail: "", detailColor: "red" as const },
  { label: "Pending Corrections", value: "8", detail: "", detailColor: "orange" as const },
];

const data = [
  { class: { text: "SS1 Science", variant: "muted" as const }, rate: "92%", present: "38", absent: "4", trend: { text: "Good", variant: "green" as const }, actions: "View" },
  { class: { text: "JSS2 B", variant: "muted" as const }, rate: "85%", present: "38", absent: "7", trend: { text: "Monitor", variant: "orange" as const }, actions: "View" },
  { class: { text: "SS3 Art", variant: "muted" as const }, rate: "76%", present: "32", absent: "10", trend: { text: "Low", variant: "red" as const }, actions: "View" },
];

const columns = [
  { key: "class", label: "CLASS", width: "140px" },
  { key: "rate", label: "ATTENDANCE RATE", width: "130px" },
  { key: "present", label: "PRESENT", width: "90px" },
  { key: "absent", label: "ABSENT", width: "90px" },
  { key: "trend", label: "TREND", width: "90px" },
  { key: "actions", label: "ACTIONS", width: "70px", align: "right" as const },
];

export default function PrincipalAttendancePage() {
  const [markOpen, setMarkOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Attendance"
        subtitle="Monitor attendance compliance across the institution"
        actions={<Button onClick={() => setMarkOpen(true)}>Mark Attendance</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select options={[{ label: "All Classes", value: "all" }]} placeholder="All Classes" />
          <Select options={[{ label: "Today", value: "today" }]} placeholder="Today" />
          <SearchInput placeholder="Search class..." className="flex-1" />
        </div>
      </Card>

      <DataTable columns={columns} data={data} />

      <Modal
        open={markOpen}
        onClose={() => setMarkOpen(false)}
        title="Mark Attendance"
        footer={
          <>
            <Button variant="secondary" onClick={() => setMarkOpen(false)}>Cancel</Button>
            <Button onClick={() => setMarkOpen(false)}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Class" required placeholder="Select class" options={["SS1 Science", "JSS2 B", "SS3 Art", "JSS1 A"]} />
          <Field label="Date" required>
            <TextInput type="date" />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Present" required>
              <TextInput type="number" placeholder="0" />
            </Field>
            <Field label="Absent" required>
              <TextInput type="number" placeholder="0" />
            </Field>
            <Field label="Late" required>
              <TextInput type="number" placeholder="0" />
            </Field>
          </div>
          <Field label="Notes">
            <TextArea rows={3} placeholder="Optional notes" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
