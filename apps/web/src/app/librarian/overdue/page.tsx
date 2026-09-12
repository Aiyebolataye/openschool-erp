"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Mail, RotateCcw } from "lucide-react";

interface OverdueLoan {
  id: string;
  book: string;
  student: string;
  klass: string;
  dueDate: string;
  daysOverdue: number;
  fine: number;
  reminded: boolean;
  returned: boolean;
}

const initialOverdue: OverdueLoan[] = [
  { id: "LN-1021", book: "Ake: The Years of Childhood", student: "Musa Bello", klass: "SS2 Science", dueDate: "03 Sep 2026", daysOverdue: 4, fine: 1200, reminded: false, returned: false },
  { id: "LN-1018", book: "Americanah", student: "Yetunde Balogun", klass: "SS3 Art", dueDate: "30 Aug 2026", daysOverdue: 8, fine: 2000, reminded: false, returned: false },
  { id: "LN-1015", book: "The Fishermen", student: "Emeka Nwosu", klass: "SS2 Science", dueDate: "26 Aug 2026", daysOverdue: 12, fine: 3000, reminded: true, returned: false },
  { id: "LN-1012", book: "Half of a Yellow Sun", student: "Tobi Adeyemi", klass: "SS3 Art", dueDate: "22 Aug 2026", daysOverdue: 16, fine: 4000, reminded: true, returned: false },
];

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export default function LibrarianOverduePage() {
  const [overdue, setOverdue] = useState<OverdueLoan[]>(initialOverdue);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const sendReminder = (id: string) => {
    const loan = overdue.find((o) => o.id === id);
    setOverdue((prev) => prev.map((o) => (o.id === id ? { ...o, reminded: true } : o)));
    if (loan) showToast(`Reminder sent to ${loan.student} for ${loan.book}`);
  };

  const markReturned = (id: string) => {
    const loan = overdue.find((o) => o.id === id);
    setOverdue((prev) => prev.map((o) => (o.id === id ? { ...o, returned: true } : o)));
    if (loan) showToast(`${loan.book} marked as returned — fine waived`);
  };

  const visible = overdue.filter((o) => !o.returned);
  const totalFine = visible.reduce((sum, o) => sum + o.fine, 0);

  return (
    <div className="max-w-[1000px] mx-auto">
      <PageHeader
        title="Overdue Loans"
        subtitle={`${visible.length} overdue loans · ${naira(totalFine)} in outstanding fines`}
      />

      <Card className="divide-y divide-border-light">
        {visible.map((o) => (
          <div key={o.id} className="px-5 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-dark truncate">{o.book}</p>
              <p className="text-xs text-text-muted mt-0.5">
                {o.student} · {o.klass} · Due {o.dueDate}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <Badge variant="red">{o.daysOverdue} days overdue</Badge>
                <p className="text-xs text-red font-medium mt-1">{naira(o.fine)}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => sendReminder(o.id)}>
                <Mail className="w-3.5 h-3.5" /> {o.reminded ? "Reminder Sent" : "Send Reminder"}
              </Button>
              <Button size="sm" onClick={() => markReturned(o.id)}>
                <RotateCcw className="w-3.5 h-3.5" /> Mark Returned
              </Button>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="text-sm text-text-muted px-5 py-6 text-center">
            No overdue loans. Great job keeping the shelves flowing.
          </p>
        )}
      </Card>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}
