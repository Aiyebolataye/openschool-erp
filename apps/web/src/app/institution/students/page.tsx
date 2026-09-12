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
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const kpis = [
  { label: "Total Students", value: "12,450", detail: "", detailColor: "muted" as const },
  { label: "Enrolled This Term", value: "45", detail: "", detailColor: "green" as const },
  { label: "Graduated This Year", value: "2,300", detail: "", detailColor: "muted" as const },
  { label: "Active", value: "12,180", detail: "", detailColor: "green" as const },
];

type Student = {
  student: { text: string; variant: "green" | "red" | "orange" | "muted" | "purple" | "blue" };
  id: string;
  class: string;
  guardian: string;
  status: { text: string; variant: "green" | "red" | "orange" | "muted" | "purple" | "blue" };
  boarding?: { hostel: string; warden: string; phone: string };
  hostelFeePaid?: boolean;
};

const initialStudents: Student[] = [
  { student: { text: "Chidi Eze", variant: "muted" }, id: "STU-21401", class: "SS1 Science", guardian: "Mr. Eze", status: { text: "Active", variant: "green" } },
  { student: { text: "Amara Okafor", variant: "muted" }, id: "STU-21402", class: "JSS2 B", guardian: "Mrs. Okafor", status: { text: "Active", variant: "green" } },
  { student: { text: "Tom Wallace", variant: "muted" }, id: "STU-21403", class: "SS3 Art", guardian: "Mr. Wallace", status: { text: "Active", variant: "green" }, boarding: { hostel: "Blue House — Boys", warden: "Mr. Ba", phone: "+234 810 222 3344" }, hostelFeePaid: true },
  { student: { text: "Grace Lim", variant: "muted" }, id: "STU-21404", class: "SS2 Science", guardian: "Mrs. Lim", status: { text: "Suspended", variant: "red" }, boarding: { hostel: "Green House — Girls", warden: "Mrs. Obi", phone: "+234 810 333 4455" }, hostelFeePaid: true },
  { student: { text: "Daniel Smith", variant: "muted" }, id: "STU-21405", class: "JSS1 A", guardian: "Mrs. Smith", status: { text: "Active", variant: "green" } },
  { student: { text: "Omar Farouk", variant: "muted" }, id: "STU-21406", class: "SS2 Science", guardian: "Mr. Farouk", status: { text: "Active", variant: "green" }, boarding: { hostel: "Red House — Boys", warden: "Mr. Okoye", phone: "" }, hostelFeePaid: false },
];

const hostelOptions = ["Blue House — Boys", "Green House — Girls", "Red House — Boys"];

const hostelDetails: Record<string, { warden: string; phone: string }> = {
  "Blue House — Boys": { warden: "Mr. Ba", phone: "+234 810 222 3344" },
  "Green House — Girls": { warden: "Mrs. Obi", phone: "+234 810 333 4455" },
  "Red House — Boys": { warden: "Mr. Okoye", phone: "" },
};

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
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [editingBoarding, setEditingBoarding] = useState(false);
  const [draftHostel, setDraftHostel] = useState("");

  const openStudentDetail = (s: Student) => {
    setDetailStudent(s);
    setDraftHostel(s.boarding?.hostel || "");
    setEditingBoarding(false);
    setDetailOpen(true);
  };

  const handleSaveBoarding = () => {
    if (!detailStudent) return;
    const boarding = draftHostel
      ? { hostel: draftHostel, warden: hostelDetails[draftHostel].warden, phone: hostelDetails[draftHostel].phone }
      : undefined;
    setStudents((prev) => prev.map((x) => (x.id === detailStudent.id ? { ...x, boarding } : x)));
    setDetailStudent((d) => (d && d.id === detailStudent.id ? { ...d, boarding } : d));
    setEditingBoarding(false);
  };

  const handleRecordHostelFee = () => {
    if (!detailStudent) return;
    setStudents((prev) => prev.map((x) => (x.id === detailStudent.id ? { ...x, hostelFeePaid: true } : x)));
    setDetailStudent((d) => (d && d.id === detailStudent.id ? { ...d, hostelFeePaid: true } : d));
    setEditingBoarding(true);
  };

  const q = search.trim().toLowerCase();
  const visibleStudents = q
    ? students.filter(
        (s) =>
          s.student.text.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.class.toLowerCase().includes(q) ||
          s.guardian.toLowerCase().includes(q)
      )
    : students;

  const rows = visibleStudents.map((s) => ({
    student: s.student,
    id: s.id,
    class: s.class,
    guardian: s.guardian,
    status: s.status,
    actions: (
      <Button variant="ghost" size="sm" onClick={() => openStudentDetail(s)}>
        View
      </Button>
    ),
  }));

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
          <SearchInput placeholder="Search by name or ID..." className="flex-1" value={search} onChange={setSearch} />
        </div>
      </Card>

      <DataTable columns={columns} data={rows} />
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

      <Modal
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setDetailStudent(null); }}
        title="Student Details"
        footer={
          <>
            {editingBoarding ? (
              <>
                <Button variant="secondary" onClick={() => { setEditingBoarding(false); setDraftHostel(detailStudent?.boarding?.hostel || ""); }}>Cancel</Button>
                <Button onClick={handleSaveBoarding}>Save</Button>
              </>
            ) : detailStudent?.hostelFeePaid ? (
              <Button variant="secondary" onClick={() => setEditingBoarding(true)}>Assign Hostel</Button>
            ) : detailStudent?.boarding ? (
              <Button variant="secondary" onClick={handleRecordHostelFee}>Record Hostel Fee Payment</Button>
            ) : null}
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm font-semibold text-text-dark">{detailStudent?.student.text}</p>
            <p className="text-xs text-text-muted mt-0.5">{detailStudent?.id}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-text-muted">Class</p>
              <p className="text-sm text-text-dark mt-0.5">{detailStudent?.class}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Guardian</p>
              <p className="text-sm text-text-dark mt-0.5">{detailStudent?.guardian}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Status</p>
              <div className="mt-1">
                {detailStudent && <Badge variant={detailStudent.status.variant}>{detailStudent.status.text}</Badge>}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-dark mb-2">Boarding / Hostel</h3>
            {editingBoarding ? (
              <div className="flex flex-col gap-4">
                <SelectField
                  label="Hostel"
                  placeholder="Not a boarding student"
                  options={hostelOptions}
                  value={draftHostel}
                  onChange={(e) => setDraftHostel(e.target.value)}
                />
                <Field label="Hostel Admin (Warden)">
                  <TextInput value={draftHostel ? hostelDetails[draftHostel].warden : ""} readOnly />
                </Field>
                <Field label="Admin Phone">
                  <TextInput value={draftHostel ? hostelDetails[draftHostel].phone : ""} readOnly />
                </Field>
              </div>
            ) : detailStudent?.boarding ? (
              detailStudent.hostelFeePaid ? (
                <div className="rounded-lg border border-border-light divide-y divide-border-light">
                  <div className="flex items-center justify-between px-4 py-3">
                    <p className="text-xs text-text-muted">Hostel</p>
                    <p className="text-sm font-medium text-text-dark">{detailStudent.boarding.hostel}</p>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <p className="text-xs text-text-muted">Hostel Admin (Warden)</p>
                    <p className="text-sm text-text-dark">{detailStudent.boarding.warden}</p>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <p className="text-xs text-text-muted">Admin Phone</p>
                    <p className="text-sm text-text-dark">{detailStudent.boarding.phone || "—"}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-orange-light bg-orange-light/40 p-4">
                  <p className="text-sm font-medium text-text-dark">Hostel assignment locked — hostel fee not yet paid</p>
                  <p className="text-xs text-text-muted mt-1">Pay the hostel fee for {detailStudent.student.text} to unlock the Assign Hostel control.</p>
                  <Button variant="secondary" size="sm" className="mt-3" onClick={handleRecordHostelFee}>Record Hostel Fee Payment</Button>
                </div>
              )
            ) : (
              <p className="text-xs text-text-muted">Not a boarding student</p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-dark mb-2">Portal Access</h3>
            <div className="rounded-lg border border-border-light p-4">
              <p className="text-xs text-text-muted mb-3">
                Open the login portal for this student and their guardian. Login credentials were shared at enrollment.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/student" target="_blank">
                  <Button variant="secondary" size="sm">
                    <ExternalLink className="w-3.5 h-3.5" /> Student Portal
                  </Button>
                </Link>
                <Link href="/parent" target="_blank">
                  <Button variant="secondary" size="sm">
                    <ExternalLink className="w-3.5 h-3.5" /> Parent Portal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
