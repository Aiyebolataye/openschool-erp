"use client";

import { useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import { BookOpen, CheckCircle2, ChevronRight } from "lucide-react";

const kpis = [
  { label: "Total Books", value: "1,284", detail: "across 9 categories", detailColor: "blue" as const },
  { label: "On Loan", value: "46", detail: "22 due this week", detailColor: "orange" as const },
  { label: "Overdue", value: "7", detail: "₦8,500 in fines", detailColor: "red" as const },
  { label: "Reserved", value: "12", detail: "awaiting pickup", detailColor: "blue" as const },
  { label: "Available", value: "1,176", detail: "ready to borrow", detailColor: "green" as const },
  { label: "Members", value: "612", detail: "active readers", detailColor: "muted" as const },
];

const recentlyIssued = [
  { id: "LN-1042", book: "Things Fall Apart", student: "Amara Okafor", klass: "SS2 Science", time: "12m ago" },
  { id: "LN-1041", book: "Purple Hibiscus", student: "Tobi Adeyemi", klass: "SS3 Art", time: "48m ago" },
  { id: "LN-1040", book: "Half of a Yellow Sun", student: "Chinedu Obi", klass: "SS1 Science", time: "1h ago" },
  { id: "LN-1039", book: "The Concubine", student: "Ngozi Eze", klass: "JSS3 A", time: "2h ago" },
];

const overdueAlerts = [
  { id: "LN-1021", book: "Ake: The Years of Childhood", student: "Musa Bello", days: 12, fine: "₦1,200" },
  { id: "LN-1018", book: "Americanah", student: "Yetunde Balogun", days: 8, fine: "₦800" },
  { id: "LN-1015", book: "The Fishermen", student: "Emeka Nwosu", days: 5, fine: "₦500" },
];

const bookTitles = [
  "Things Fall Apart",
  "Purple Hibiscus",
  "Half of a Yellow Sun",
  "The Concubine",
  "Americanah",
  "Ake: The Years of Childhood",
  "The Fishermen",
  "Nervous Conditions",
];

const studentNames = [
  "Amara Okafor",
  "Tobi Adeyemi",
  "Chinedu Obi",
  "Ngozi Eze",
  "Musa Bello",
  "Yetunde Balogun",
  "Emeka Nwosu",
  "Ada Obi",
];

export default function LibrarianDashboardPage() {
  const [issueOpen, setIssueOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [issueBook, setIssueBook] = useState("");
  const [issueStudent, setIssueStudent] = useState("");
  const [issueDue, setIssueDue] = useState("");

  const [reserveBook, setReserveBook] = useState("");
  const [reserveStudent, setReserveStudent] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const saveIssue = () => {
    if (!issueBook || !issueStudent || !issueDue) return;
    setIssueOpen(false);
    setIssueBook("");
    setIssueStudent("");
    setIssueDue("");
    showToast(`${issueBook} issued to ${issueStudent}`);
  };

  const saveReserve = () => {
    if (!reserveBook || !reserveStudent) return;
    setReserveOpen(false);
    setReserveBook("");
    setReserveStudent("");
    showToast(`${reserveBook} reserved for ${reserveStudent}`);
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Library Overview"
        subtitle="Librarian dashboard · Funke Adebayo · Greenfield Academy Library"
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="p-5 mb-6">
        <h3 className="text-sm font-semibold text-text-dark mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setIssueOpen(true)}>
            <BookOpen className="w-4 h-4" /> Issue Book
          </Button>
          <Button variant="secondary" onClick={() => setReserveOpen(true)}>
            <CheckCircle2 className="w-4 h-4" /> Reserve Book
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-text-dark mb-2">Recently Issued</h3>
          <Card className="divide-y divide-border-light">
            {recentlyIssued.map((l) => (
              <button
                key={l.id}
                onClick={() => setIssueOpen(true)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-surface/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-dark truncate">{l.book}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {l.student} · {l.klass} · {l.time}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
              </button>
            ))}
            <Link
              href="/librarian/loans"
              className="block text-center text-xs font-medium text-primary hover:underline py-3"
            >
              View all loans →
            </Link>
          </Card>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-dark mb-2">Overdue Alerts</h3>
          <Card className="divide-y divide-border-light">
            {overdueAlerts.map((o) => (
              <button
                key={o.id}
                onClick={() => setIssueOpen(true)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-surface/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-dark truncate">{o.book}</p>
                  <p className="text-xs text-text-muted mt-0.5">{o.student} · Fine {o.fine}</p>
                </div>
                <Badge variant="red">{o.days} days overdue</Badge>
              </button>
            ))}
            <Link
              href="/librarian/overdue"
              className="block text-center text-xs font-medium text-primary hover:underline py-3"
            >
              View all overdue →
            </Link>
          </Card>
        </div>
      </div>

      <Modal
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        title="Issue Book"
        subtitle="Lend a book to a library member"
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
            options={studentNames}
            value={issueStudent}
            onChange={(e) => setIssueStudent(e.target.value)}
          />
          <Field label="Due Date" required>
            <TextInput type="date" value={issueDue} onChange={(e) => setIssueDue(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={reserveOpen}
        onClose={() => setReserveOpen(false)}
        title="Reserve Book"
        subtitle="Place a hold on a book for a member"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReserveOpen(false)}>Cancel</Button>
            <Button onClick={saveReserve}>Reserve Book</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Book"
            required
            placeholder="Select book"
            options={bookTitles}
            value={reserveBook}
            onChange={(e) => setReserveBook(e.target.value)}
          />
          <SelectField
            label="Student"
            required
            placeholder="Select student"
            options={studentNames}
            value={reserveStudent}
            onChange={(e) => setReserveStudent(e.target.value)}
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
