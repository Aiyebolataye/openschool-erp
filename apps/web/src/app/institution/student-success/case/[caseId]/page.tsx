"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Chatbox } from "@/components/ui/chatbox";
import { useDiscCases } from "@/lib/app-store";
import { ArrowLeft, MessageSquare, Copy, Check } from "lucide-react";

const CASE_LOOKUP: Record<string, { guardian: string; phone: string; dob: string; arm: string; details: string; createdBy: string; escalatedBy: string; chain: string }> = {
  "STU-21401": { guardian: "Mr. Eze", phone: "+234 801 234 5678", dob: "2010-03-12", arm: "Science", details: "Repeated tardiness and disruptive behaviour in class reported by the subject teacher over two weeks. The guardian was notified twice before the case was escalated for review.", createdBy: "Dr. Okon (Form Teacher)", escalatedBy: "Principal", chain: "Created by teacher, escalated to principal" },
  "STU-21402": { guardian: "Mrs. Okafor", phone: "+234 802 333 4455", dob: "2009-07-25", arm: "Science", details: "Ongoing absenteeism flagged during the welfare review. The principal opened the case directly following a pattern of missed classes and unresolved attendance warnings.", createdBy: "Principal", escalatedBy: "Principal", chain: "Created and escalated by principal" },
  "STU-21403": { guardian: "Mrs. Adeyemi", phone: "+234 803 111 2299", dob: "2010-11-02", arm: "Science", details: "Reported by the form teacher for repeated missed homework submissions and low engagement. The case was escalated once the pattern continued after a parent meeting.", createdBy: "Dr. Okon (Form Teacher)", escalatedBy: "Principal", chain: "Created by teacher, escalated to principal" },
  "STU-21404": { guardian: "Mr. Wallace", phone: "+234 804 555 6677", dob: "2008-01-19", arm: "Science", details: "Academic misconduct suspected during a terminal examination. The principal logged the case directly and the guardian has been invited for a disciplinary hearing.", createdBy: "Principal", escalatedBy: "Principal", chain: "Created and escalated by principal" },
  "STU-21405": { guardian: "Mrs. Lim", phone: "+234 805 777 8899", dob: "2009-05-30", arm: "Science", details: "Disruptive behaviour during lessons reported by the subject teacher. The teacher issued a verbal warning and documented the incident before escalation.", createdBy: "Dr. Okon (Form Teacher)", escalatedBy: "Principal", chain: "Created by teacher, escalated to principal" },
  "STU-21406": { guardian: "Mr. Farouk", phone: "+234 806 999 1122", dob: "2008-08-14", arm: "Art", details: "Unauthorized absence from campus reported by house staff. The principal opened the case directly after the student returned without a valid clearance.", createdBy: "Principal", escalatedBy: "Principal", chain: "Created and escalated by principal" },
};

const CASE_FALLBACK = { guardian: "Guardian", phone: "—", dob: "—", arm: "—", details: "Full details for this case are not on record.", createdBy: "School", escalatedBy: "Principal", chain: "Case logged and escalated to the principal." };

export default function DisciplineCasePage() {
  const { caseId } = useParams<{ caseId: string }>();
  const [cases, setCases] = useDiscCases();
  const [chatOpen, setChatOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const discCase = cases.find((c) => c.id === caseId);
  const meta = discCase ? CASE_LOOKUP[discCase.studentId] ?? CASE_FALLBACK : null;

  const copyPhone = () => {
    if (!meta) return;
    navigator.clipboard.writeText(meta.phone).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const markResolved = () => {
    if (!discCase) return;
    setCases((prev) => prev.map((c) => (c.id === discCase.id ? { ...c, status: "resolved", resolvedBy: "School Admin" } : c)));
  };

  if (!discCase || !meta) {
    return (
      <div className="max-w-[900px] mx-auto">
        <PageHeader
          title="Case Not Found"
          subtitle="This disciplinary case could not be found."
          actions={
            <Link href="/institution/student-success">
              <Button variant="secondary"><ArrowLeft className="w-4 h-4" /> Back to Student Welfare</Button>
            </Link>
          }
        />
        <Card className="p-8 text-center">
          <p className="text-sm text-text-muted">The case may have been cleared or the link is invalid.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto">
      <PageHeader
        title="Discipline Case"
        subtitle={`${discCase.studentName} · ${discCase.className}`}
        actions={
          <div className="flex items-center gap-3">
            <Link href="/institution/student-success">
              <Button variant="secondary"><ArrowLeft className="w-4 h-4" /> Back</Button>
            </Link>
            {discCase.status === "open" && <Button onClick={markResolved}>Mark Resolved</Button>}
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="flex items-center gap-3 rounded-xl border border-border-light bg-card p-4 col-span-2">
          <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
            <span className="text-primary text-lg font-bold">{discCase.studentName[0]}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-dark">{discCase.studentName}</p>
            <p className="text-xs text-text-muted">{discCase.className} · {meta.arm} arm</p>
          </div>
        </div>
        <Card className="p-4">
          <p className="text-[11px] text-text-muted mb-1">Guardian</p>
          <p className="text-sm font-semibold text-text-dark">{meta.guardian}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-text-muted">{meta.phone}</p>
            <button onClick={copyPhone} className="text-text-muted hover:text-primary" title="Copy phone number">
              {copied ? <Check className="w-3.5 h-3.5 text-green" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setChatOpen(true)}>
            <MessageSquare className="w-3.5 h-3.5" /> Message Guardian
          </Button>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] text-text-muted mb-1">Date of Birth</p>
          <p className="text-sm font-semibold text-text-dark">{meta.dob}</p>
          <div className="mt-2">
            <Badge variant={discCase.status === "open" ? "orange" : "green"}>{discCase.status === "open" ? "Open Case" : "Resolved"}</Badge>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-5 col-span-2">
          <h3 className="text-sm font-semibold text-text-dark mb-1">{discCase.reason}</h3>
          <p className="text-xs text-text-muted mb-4">Opened {discCase.date} · Student ID {discCase.studentId}</p>
          <p className="text-sm text-text-dark">{meta.details}</p>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-text-dark mb-3">Escalation</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-text-muted">Created by</span><span className="font-medium text-text-dark">{meta.createdBy}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Escalated by</span><span className="font-medium text-text-dark">{meta.escalatedBy}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Created</span><span className="font-medium text-text-dark">{discCase.date}</span></div>
          </div>
          <div className="mt-4 rounded-lg bg-surface p-3">
            <p className="text-xs text-text-muted">{meta.chain}</p>
          </div>
        </Card>
      </div>

      <Modal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title={`Message ${meta.guardian}`}
        subtitle={`Guardian of ${discCase.studentName}`}
      >
        <Chatbox
          title={meta.guardian}
          subtitle={`Guardian of ${discCase.studentName} · ${discCase.className}`}
          initial={[
            { from: "them", text: `Good day, I'm ${meta.guardian}, ${discCase.studentName}'s guardian. What's the update?`, time: "9:15 AM" },
          ]}
        />
      </Modal>
    </div>
  );
}