"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Field, TextArea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import type { TableColumn, TableRow } from "@/types";

type Status = "Not submitted" | "Submitted" | "Graded";

interface Assignment {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  due: string;
  status: Status;
  grade?: string;
}

const initialAssignments: Assignment[] = [
  { id: "ASN-3041", title: "Draw and label the mammalian heart", subject: "Biology", teacher: "Mrs. F. Ajayi", due: "Thu, Jul 30", status: "Not submitted" },
  { id: "ASN-3042", title: "Balancing chemical equations worksheet", subject: "Chemistry", teacher: "Mr. A. Adeyemi", due: "Fri, Jul 31", status: "Not submitted" },
  { id: "ASN-3039", title: "Critical appreciation of “The Gods Are Not to Blame”", subject: "Literature", teacher: "Miss C. Nnamdi", due: "Mon, Aug 3", status: "Not submitted" },
  { id: "ASN-3038", title: "Essay: The Role of a Mother in Society", subject: "English", teacher: "Mrs. Y. Balogun", due: "Fri, Jul 24", status: "Graded", grade: "18/20 · A" },
  { id: "ASN-3040", title: "Vector addition — questions 1 to 10", subject: "Physics", teacher: "Dr. N. Obi", due: "Mon, Jul 27", status: "Graded", grade: "15/20 · B" },
  { id: "ASN-3037", title: "Quadratic equations — Exercise 6.2", subject: "Mathematics", teacher: "Mr. S. Adekunle", due: "Wed, Jul 22", status: "Submitted" },
];

const columns: TableColumn[] = [
  { key: "subject", label: "SUBJECT", width: "130px" },
  { key: "assignment", label: "ASSIGNMENT" },
  { key: "due", label: "DUE DATE", width: "130px" },
  { key: "status", label: "STATUS", width: "140px" },
  { key: "grade", label: "GRADE", width: "120px" },
  { key: "actions", label: "", width: "120px", align: "right" },
];

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [search, setSearch] = useState("");
  const [submitOpen, setSubmitOpen] = useState(false);
  const [active, setActive] = useState<Assignment | null>(null);
  const [answer, setAnswer] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const q = search.trim().toLowerCase();
  const filtered = assignments.filter(
    (a) =>
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.subject.toLowerCase().includes(q) ||
      a.teacher.toLowerCase().includes(q)
  );

  const openSubmit = (a: Assignment) => {
    setActive(a);
    setAnswer("");
    setSubmitOpen(true);
  };

  const submitAssignment = () => {
    if (!active) return;
    setAssignments((prev) =>
      prev.map((a) => (a.id === active.id ? { ...a, status: "Submitted" } : a))
    );
    setSubmitOpen(false);
    setActive(null);
    showToast(`${active.subject} assignment submitted`);
  };

  const rows: TableRow[] = filtered.map((a) => ({
    subject: (
      <span className="text-sm font-medium text-text-dark">{a.subject}</span>
    ),
    assignment: (
      <div>
        <p className="text-sm font-medium text-text-dark truncate max-w-[320px]">{a.title}</p>
        <p className="text-xs text-text-muted">{a.teacher}</p>
      </div>
    ),
    due: a.due,
    status:
      a.status === "Not submitted"
        ? { text: "Not submitted", variant: "orange" }
        : a.status === "Submitted"
          ? { text: "Submitted", variant: "blue" }
          : { text: "Graded", variant: "green" },
    grade:
      a.status === "Graded" ? (
        <Badge variant="green">{a.grade}</Badge>
      ) : (
        <span className="text-sm text-text-muted">—</span>
      ),
    actions:
      a.status === "Not submitted" ? (
        <Button size="sm" variant="secondary" onClick={() => openSubmit(a)}>
          + Submit
        </Button>
      ) : a.status === "Submitted" ? (
        <span className="text-xs text-text-muted whitespace-nowrap">Awaiting grading</span>
      ) : (
        <span className="text-xs text-text-muted">—</span>
      ),
  }));

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Assignments"
        subtitle="Homework and class assignments for SS1 Science"
      />

      <Card className="p-4 mb-6">
        <SearchInput
          placeholder="Search by title, subject or teacher..."
          value={search}
          onChange={setSearch}
          className="max-w-md"
        />
      </Card>

      <DataTable columns={columns} data={rows} />

      <Modal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        title={active?.title ?? ""}
        subtitle={active ? `${active.subject} · due ${active.due}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSubmitOpen(false)}>Cancel</Button>
            <Button onClick={submitAssignment}>Submit</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Your Answer (optional)">
            <TextArea
              rows={6}
              placeholder="Type your answer or attach a note for the teacher..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </Field>
          <p className="text-xs text-text-muted leading-relaxed">
            Your submission will be sent to {active?.teacher ?? "your teacher"} for grading. You can
            still edit it before the due date.
          </p>
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
