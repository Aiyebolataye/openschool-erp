"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { CheckCircle, Bell, ChevronRight } from "lucide-react";

type ReviewStatus = "Pending" | "Approved" | "Needs update";

interface Review {
  id: string;
  student: string;
  klass: string;
  reviewer: string;
  status: ReviewStatus;
  submitted: string;
  notes: string;
}

const initialReviews: Review[] = [
  { id: "REV-118", student: "Ngozi Okonkwo", klass: "SS3 Art", reviewer: "Mrs. Adaeze Chukwu", status: "Pending", submitted: "submitted 1d ago", notes: "Portfolio complete with WAEC certificate. Verify academic records before approval." },
  { id: "REV-117", student: "Ibrahim Lawal", klass: "SS2 Science", reviewer: "Mr. Chinedu Obi", status: "Pending", submitted: "submitted 2d ago", notes: "Academic records uploaded but certificates and achievements section is sparse." },
  { id: "REV-116", student: "Adaobi Nwachukwu", klass: "SS2 Art", reviewer: "Mrs. Funke Adeyemi", status: "Needs update", submitted: "submitted 3d ago", notes: "Missing last term report card. Requested parent to upload the missing document." },
  { id: "REV-115", student: "Femi Balogun", klass: "SS3 Science", reviewer: "Mrs. Adaeze Chukwu", status: "Approved", submitted: "submitted 5d ago", notes: "All sections complete. Approved for graduation portfolio." },
  { id: "REV-114", student: "Blessing Eze", klass: "JSS2 A", reviewer: "Mr. Adebayo Ojo", status: "Approved", submitted: "submitted 1w ago", notes: "Achievements and certificates verified. Approved." },
  { id: "REV-113", student: "Yemi Osho", klass: "JSS3 A", reviewer: "Mrs. Funke Adeyemi", status: "Needs update", submitted: "submitted 1w ago", notes: "Portfolio mostly empty. Student needs a follow-up to begin adding records." },
];

const statusBadge = (s: ReviewStatus) =>
  s === "Pending"
    ? { text: "Pending", variant: "orange" as const }
    : s === "Approved"
      ? { text: "Approved", variant: "green" as const }
      : { text: "Needs update", variant: "red" as const };

export default function PortfolioOfficerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Review | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const markReviewed = () => {
    if (!selected) return;
    setReviews((prev) =>
      prev.map((r) => (r.id === selected.id ? { ...r, status: "Approved" as ReviewStatus } : r))
    );
    setSelected({ ...selected, status: "Approved" });
    showToast(`${selected.student}'s portfolio marked as reviewed`);
  };

  const notifyParent = () => {
    if (!selected) return;
    showToast(`Parent of ${selected.student} notified`);
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="Portfolio Review"
        subtitle="Review and approve student portfolios"
      />

      <Card className="divide-y divide-border-light overflow-hidden">
        {reviews.map((r) => (
          <button
            key={r.id}
            onClick={() => {
              setSelected(r);
              setDetailOpen(true);
            }}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface/60 transition-colors"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-text-dark">{r.student}</p>
                <Badge variant={statusBadge(r.status).variant}>{r.status}</Badge>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {r.id} · {r.klass} · {r.submitted}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-text-muted">Reviewed by {r.reviewer}</span>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </div>
          </button>
        ))}
      </Card>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.student ?? ""}
        subtitle={selected ? `${selected.id} · ${selected.klass} · ${selected.submitted}` : undefined}
        footer={
          selected && (
            <>
              <Button variant="secondary" onClick={notifyParent}>
                <Bell className="w-4 h-4" /> Notify Student's Parent
              </Button>
              {selected.status !== "Approved" && (
                <Button onClick={markReviewed}>
                  <CheckCircle className="w-4 h-4" /> Mark Reviewed
                </Button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border-light p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Reviewer</p>
                <p className="text-sm font-medium text-text-dark">{selected.reviewer}</p>
              </div>
              <Badge variant={statusBadge(selected.status).variant}>{selected.status}</Badge>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1.5">Review Notes</p>
              <p className="text-sm text-text-dark leading-relaxed">{selected.notes}</p>
            </div>
            {selected.status === "Needs update" && (
              <p className="text-sm text-text-dark leading-relaxed">
                The parent has been asked to update this portfolio. Once the requested documents are added, you can
                mark the portfolio as reviewed.
              </p>
            )}
          </div>
        )}
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}