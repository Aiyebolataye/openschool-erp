"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import type { TableRow } from "@/types";
import { BookOpen } from "lucide-react";

type LoanStatus = "Active" | "Returned" | "Overdue";

interface Loan {
  id: string;
  book: string;
  student: string;
  klass: string;
  issueDate: string;
  dueDate: string;
  status: LoanStatus;
}

const bookTitles = [
  "Things Fall Apart",
  "Purple Hibiscus",
  "Half of a Yellow Sun",
  "The Concubine",
  "Americanah",
  "Ake: The Years of Childhood",
  "The Fishermen",
  "Stay With Me",
];

const students = [
  { name: "Amara Okafor", klass: "SS2 Science" },
  { name: "Tobi Adeyemi", klass: "SS3 Art" },
  { name: "Chinedu Obi", klass: "SS1 Science" },
  { name: "Ngozi Eze", klass: "JSS3 A" },
  { name: "Musa Bello", klass: "SS2 Science" },
  { name: "Yetunde Balogun", klass: "SS3 Art" },
  { name: "Emeka Nwosu", klass: "SS2 Science" },
  { name: "Ada Obi", klass: "JSS2 B" },
];

const initialLoans: Loan[] = [
  { id: "LN-1042", book: "Things Fall Apart", student: "Amara Okafor", klass: "SS2 Science", issueDate: "02 Sep 2026", dueDate: "16 Sep 2026", status: "Active" },
  { id: "LN-1041", book: "Purple Hibiscus", student: "Tobi Adeyemi", klass: "SS3 Art", issueDate: "03 Sep 2026", dueDate: "17 Sep 2026", status: "Active" },
  { id: "LN-1040", book: "Half of a Yellow Sun", student: "Chinedu Obi", klass: "SS1 Science", issueDate: "30 Aug 2026", dueDate: "13 Sep 2026", status: "Active" },
  { id: "LN-1039", book: "The Concubine", student: "Ngozi Eze", klass: "JSS3 A", issueDate: "28 Aug 2026", dueDate: "11 Sep 2026", status: "Active" },
  { id: "LN-1038", book: "Americanah", student: "Yetunde Balogun", klass: "SS3 Art", issueDate: "25 Aug 2026", dueDate: "08 Sep 2026", status: "Active" },
  { id: "LN-1035", book: "The Fishermen", student: "Emeka Nwosu", klass: "SS2 Science", issueDate: "22 Aug 2026", dueDate: "05 Sep 2026", status: "Overdue" },
  { id: "LN-1032", book: "Ake: The Years of Childhood", student: "Musa Bello", klass: "SS2 Science", issueDate: "20 Aug 2026", dueDate: "03 Sep 2026", status: "Overdue" },
  { id: "LN-1029", book: "Stay With Me", student: "Ada Obi", klass: "JSS2 B", issueDate: "18 Aug 2026", dueDate: "01 Sep 2026", status: "Returned" },
];

const statusBadge = (s: LoanStatus) =>
  s === "Active"
    ? { text: "Active", variant: "green" as const }
    : s === "Overdue"
      ? { text: "Overdue", variant: "red" as const }
      : { text: "Returned", variant: "muted" as const };

const columns = [
  { key: "book", label: "BOOK" },
  { key: "student", label: "BORROWER / STUDENT" },
  { key: "klass", label: "CLASS" },
  { key: "issueDate", label: "ISSUE DATE" },
  { key: "dueDate", label: "DUE DATE" },
  { key: "status", label: "STATUS" },
];

export default function LibrarianLoansPage() {
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [loanedCopies, setLoanedCopies] = useState<Record<string, number>>({
    "Things Fall Apart": 2,
    "Purple Hibiscus": 2,
    "Half of a Yellow Sun": 3,
    "The Concubine": 1,
    "Americanah": 0,
    "Ake: The Years of Childhood": 1,
    "The Fishermen": 1,
    "Stay With Me": 2,
  });

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Loan | null>(null);
  const [issueOpen, setIssueOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [issueBook, setIssueBook] = useState("");
  const [issueStudent, setIssueStudent] = useState("");
  const [issueDue, setIssueDue] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const rows: TableRow[] = loans.map((l) => ({
    book: (
      <div>
        <p className="text-sm font-medium text-text-dark">{l.book}</p>
        <p className="text-xs text-text-muted">{l.id}</p>
      </div>
    ),
    student: l.student,
    klass: l.klass,
    issueDate: l.issueDate,
    dueDate: l.dueDate,
    status: statusBadge(l.status),
  }));

  const openDetail = (row: TableRow, i: number) => {
    setSelected(loans[i]);
    setDetailOpen(true);
  };

  const saveIssue = () => {
    if (!issueBook || !issueStudent || !issueDue) return;
    const student = students.find((s) => s.name === issueStudent);
    const maxId = Math.max(...loans.map((l) => parseInt(l.id.slice(3), 10)));
    setLoans((prev) => [
      ...prev,
      {
        id: `LN-${maxId + 1}`,
        book: issueBook,
        student: issueStudent,
        klass: student?.klass ?? "SS1 Science",
        issueDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        dueDate: issueDue,
        status: "Active",
      },
    ]);
    setLoanedCopies((prev) => ({ ...prev, [issueBook]: (prev[issueBook] || 0) + 1 }));
    setIssueOpen(false);
    setIssueBook("");
    setIssueStudent("");
    setIssueDue("");
    showToast(`${issueBook} issued to ${issueStudent}`);
  };

  const markReturned = () => {
    if (!selected) return;
    setLoans((prev) => prev.map((l) => (l.id === selected.id ? { ...l, status: "Returned" } : l)));
    setSelected({ ...selected, status: "Returned" });
    setLoanedCopies((prev) => ({ ...prev, [selected.book]: Math.max(0, (prev[selected.book] || 1) - 1) }));
    showToast(`${selected.book} marked as returned — copy freed up`);
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Loans"
        subtitle="Books currently issued to students and staff"
        actions={
          <Button onClick={() => setIssueOpen(true)}>
            <BookOpen className="w-4 h-4" /> Issue Book
          </Button>
        }
      />

      <DataTable columns={columns} data={rows} onRowClick={openDetail} />

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.book ?? ""}
        subtitle={selected ? `${selected.id} · ${selected.student} · ${selected.klass}` : undefined}
        footer={
          selected?.status !== "Returned" ? (
            <>
              <Button variant="secondary" onClick={() => setDetailOpen(false)}>Close</Button>
              <Button onClick={markReturned}>Mark Returned</Button>
            </>
          ) : undefined
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border border-border-light p-4">
              <div>
                <p className="text-xs text-text-muted">Borrower</p>
                <p className="text-sm font-medium text-text-dark">{selected.student}</p>
                <p className="text-xs text-text-muted mt-0.5">{selected.klass}</p>
              </div>
              <Badge variant={statusBadge(selected.status).variant}>{selected.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted">Issue Date</p>
                <p className="text-sm font-semibold text-text-dark mt-1">{selected.issueDate}</p>
              </div>
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted">Due Date</p>
                <p className="text-sm font-semibold text-text-dark mt-1">{selected.dueDate}</p>
              </div>
            </div>
            {selected.status === "Returned" && (
              <div className="rounded-lg bg-surface px-3 py-2 text-xs text-text-muted">
                This book has already been returned and its copy released back to the catalogue.
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        title="Issue Book"
        subtitle="Lend a book and register the loan"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIssueOpen(false)}>Cancel</Button>
            <Button onClick={saveIssue}>Issue Book</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Book"
            required
            placeholder="Select book"
            options={bookTitles}
            value={issueBook}
            onChange={(e) => setIssueBook(e.target.value)}
          />
          <SelectField
            label="Student"
            required
            placeholder="Select student"
            options={students.map((s) => s.name)}
            value={issueStudent}
            onChange={(e) => setIssueStudent(e.target.value)}
          />
          <Field label="Due Date" required>
            <TextInput type="date" value={issueDue} onChange={(e) => setIssueDue(e.target.value)} />
          </Field>
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
