"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import type { TableRow } from "@/types";
import { Briefcase } from "lucide-react";

type RecruitStatus = "Open" | "Interviewing" | "Closed";

interface Recruitment {
  id: string;
  position: string;
  dept: string;
  applicants: string[];
  status: RecruitStatus;
}

const initialRecruitments: Recruitment[] = [
  {
    id: "JOB-301",
    position: "Senior Physics Teacher",
    dept: "Sciences",
    status: "Open",
    applicants: [
      "Miss Adaeze Okafor",
      "Mr. Ayodele Ajayi",
      "Mrs. Ngozi Umeh",
      "Mr. Babatunde Lawal",
      "Miss Chinwe Eze",
      "Mr. Suleiman Garba",
    ],
  },
  {
    id: "JOB-302",
    position: "ICT / Computer Science Teacher",
    dept: "Technology",
    status: "Interviewing",
    applicants: [
      "Mr. Oluwaseun Fashola",
      "Miss Ifeoma Obi",
      "Mr. Kehinde Adegoke",
      "Mrs. Halima Sani",
    ],
  },
  {
    id: "JOB-303",
    position: "School Nurse",
    dept: "Health Services",
    status: "Open",
    applicants: ["Miss Chioma Nwachukwu", "Mrs. Bisi Ogundipe", "Mr. Jide Ogunleye"],
  },
  {
    id: "JOB-304",
    position: "Accounts Clerk",
    dept: "Finance",
    status: "Interviewing",
    applicants: ["Miss Ronke Adeleke", "Mr. Emeka Uzochukwu", "Mrs. Fatima Abdullahi"],
  },
  {
    id: "JOB-305",
    position: "Laboratory Technician",
    dept: "Sciences",
    status: "Closed",
    applicants: ["Mr. Tobi Akinyemi", "Miss Kemi Adesanya"],
  },
];

const statusBadge = (s: RecruitStatus) =>
  s === "Open"
    ? { text: "Open", variant: "green" as const }
    : s === "Interviewing"
      ? { text: "Interviewing", variant: "purple" as const }
      : { text: "Closed", variant: "muted" as const };

const columns = [
  { key: "position", label: "POSITION" },
  { key: "dept", label: "DEPARTMENT" },
  { key: "applicants", label: "APPLICANTS" },
  { key: "status", label: "STATUS" },
];

export default function HrOfficerRecruitmentsPage() {
  const [recruitments, setRecruitments] = useState<Recruitment[]>(initialRecruitments);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Recruitment | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [newPosition, setNewPosition] = useState("");
  const [newDept, setNewDept] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const rows: TableRow[] = recruitments.map((r) => ({
    position: (
      <div>
        <p className="text-sm font-medium text-text-dark">{r.position}</p>
        <p className="text-xs text-text-muted">{r.id}</p>
      </div>
    ),
    dept: r.dept,
    applicants: String(r.applicants.length),
    status: statusBadge(r.status),
  }));

  const openDetail = (row: TableRow, i: number) => {
    setSelected(recruitments[i]);
    setDetailOpen(true);
  };

  const closeJob = () => {
    if (!selected) return;
    setRecruitments((prev) => prev.map((r) => (r.id === selected.id ? { ...r, status: "Closed" } : r)));
    setSelected({ ...selected, status: "Closed" });
    showToast(`Recruitment closed for ${selected.position}`);
  };

  const reopenJob = () => {
    if (!selected) return;
    setRecruitments((prev) => prev.map((r) => (r.id === selected.id ? { ...r, status: "Open" } : r)));
    setSelected({ ...selected, status: "Open" });
    showToast(`${selected.position} reopened for applications`);
  };

  const addJob = () => {
    if (!newPosition.trim() || !newDept) return;
    setRecruitments((prev) => [
      ...prev,
      {
        id: `JOB-${300 + prev.length + 1}`,
        position: newPosition.trim(),
        dept: newDept,
        applicants: [],
        status: "Open",
      },
    ]);
    setNewPosition("");
    setNewDept("");
    setAddOpen(false);
    showToast(`Job opening added for ${newPosition.trim()}`);
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Recruitments"
        subtitle="Track job openings and applicants"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Briefcase className="w-4 h-4" /> + Add Job
          </Button>
        }
      />

      <DataTable columns={columns} data={rows} onRowClick={openDetail} />

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.position ?? ""}
        subtitle={selected ? `${selected.id} · ${selected.dept}` : undefined}
        footer={
          selected && (
            <>
              <Button variant="secondary" onClick={() => setDetailOpen(false)}>Close</Button>
              {selected.status === "Closed" ? (
                <Button onClick={reopenJob}>Reopen</Button>
              ) : (
                <Button variant="danger" onClick={closeJob}>Close Job</Button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border-light p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Applicants</p>
                <p className="text-sm font-medium text-text-dark">{selected.applicants.length}</p>
              </div>
              <Badge variant={statusBadge(selected.status).variant}>{selected.status}</Badge>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-2">Applicant List</p>
              {selected.applicants.length === 0 ? (
                <p className="text-sm text-text-muted">No applicants yet.</p>
              ) : (
                <div className="rounded-lg border border-border-light divide-y divide-border-light">
                  {selected.applicants.map((a) => (
                    <div key={a} className="flex items-center justify-between px-4 py-2.5">
                      <p className="text-sm text-text-dark">{a}</p>
                      <Badge variant="blue">New</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Job"
        subtitle="Create a new job opening"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addJob}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Position" required>
            <TextInput
              placeholder="e.g. Senior Physics Teacher"
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
            />
          </Field>
          <SelectField
            label="Department"
            required
            placeholder="Select department"
            options={["Sciences", "Languages", "Technology", "Finance", "Health Services", "Operations"]}
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
          />
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}
