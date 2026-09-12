"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";

interface Child {
  name: string;
  id: string;
  className: string;
  admission: string;
  dob: string;
  status: string;
  attendance: string;
  hostel?: string;
  warden?: string;
  wardenPhone?: string;
  boarding: boolean;
  avatar: string;
  avatarColor: string;
  summary: string;
  average: string;
}

const children: Child[] = [
  {
    name: "Chidi Eze",
    id: "STU-21401",
    className: "SS1 Science",
    admission: "2024-09-01",
    dob: "2010-03-12",
    status: "Active",
    attendance: "94%",
    boarding: false,
    avatar: "CE",
    avatarColor: "primary",
    summary: "Solid academic term — best in Biology, needs attention in Literature.",
    average: "70.7%",
  },
  {
    name: "Kayode Eze",
    id: "STU-21411",
    className: "SS1 Science",
    admission: "2024-09-01",
    dob: "2010-06-25",
    status: "Active",
    attendance: "97%",
    hostel: "Red House — Boys",
    warden: "Mr. Okoye",
    wardenPhone: "+234 810 555 7788",
    boarding: true,
    avatar: "KE",
    avatarColor: "orange",
    summary: "Excellent in English and Literature but failed Mathematics — eligible for summer school.",
    average: "69.0%",
  },
];

export default function ParentChildrenPage() {
  const [selected, setSelected] = useState<Child | null>(null);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader title="My Children" subtitle="Details of the wards under your guardianship" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children.map((c) => (
          <Card
            key={c.id}
            className="p-5 cursor-pointer hover:bg-surface/50 transition-colors"
          >
            <div onClick={() => setSelected(c)}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${c.avatarColor === "orange" ? "bg-orange-light text-orange" : "bg-primary-light text-primary"}`}>
                  <span className="text-sm font-semibold">{c.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-dark">{c.name}</p>
                  <p className="text-xs text-text-muted">{c.id} · {c.className}</p>
                </div>
                <div className="ml-auto">
                  <Badge variant={c.boarding ? "orange" : "blue"}>{c.boarding ? "Boarder" : "Day Student"}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-surface px-3 py-2">
                  <span className="text-text-muted block">Admission</span>
                  <span className="text-text-dark font-medium">{c.admission}</span>
                </div>
                <div className="rounded-lg bg-surface px-3 py-2">
                  <span className="text-text-muted block">Hostel</span>
                  <span className="text-text-dark font-medium">{c.hostel ?? "Day Student"}</span>
                </div>
                <div className="rounded-lg bg-surface px-3 py-2">
                  <span className="text-text-muted block">Status</span>
                  <span className="text-green font-medium">{c.status}</span>
                </div>
                <div className="rounded-lg bg-surface px-3 py-2">
                  <span className="text-text-muted block">Attendance</span>
                  <span className="text-text-dark font-medium">{c.attendance}</span>
                </div>
              </div>
              <p className="text-xs text-text-muted mt-3">{c.summary}</p>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? selected.name : ""}
        subtitle={selected ? `${selected.id} · ${selected.className}` : ""}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>
            <Link href="/student" target="_blank">
              <Button variant="secondary" onClick={() => setSelected(null)}>Open Student Portal</Button>
            </Link>
            <Link href={`/teacher/students/${selected?.id ?? ""}`}>
              <Button onClick={() => setSelected(null)}>View Full Profile</Button>
            </Link>
          </>
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-surface px-3 py-2">
                <span className="block text-xs text-text-muted mb-0.5">Full Name</span>
                <span className="text-sm font-medium text-text-dark">{selected.name}</span>
              </div>
              <div className="rounded-lg bg-surface px-3 py-2">
                <span className="block text-xs text-text-muted mb-0.5">Admission No.</span>
                <span className="text-sm font-medium text-text-dark">{selected.id}</span>
              </div>
              <div className="rounded-lg bg-surface px-3 py-2">
                <span className="block text-xs text-text-muted mb-0.5">Class</span>
                <span className="text-sm font-medium text-text-dark">{selected.className}</span>
              </div>
              <div className="rounded-lg bg-surface px-3 py-2">
                <span className="block text-xs text-text-muted mb-0.5">Date of Birth</span>
                <span className="text-sm font-medium text-text-dark">{selected.dob}</span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-text-dark mb-1.5">Guardian Information</span>
              <div className="rounded-lg bg-surface px-3 py-2">
                <p className="text-sm text-text-dark">Mr. Eze (Father / Guardian)</p>
                <p className="text-xs text-text-muted">+234 801 234 5678 · mr.eze@greenfield.edu</p>
              </div>
            </div>

            {selected.boarding && (
              <div>
                <span className="block text-xs font-medium text-text-dark mb-1.5">Hostel Details</span>
                <div className="rounded-lg border border-border-light p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-dark">{selected.hostel}</span>
                    <Badge variant="orange">Boarding</Badge>
                  </div>
                  <p className="text-xs text-text-muted">Warden: {selected.warden} · {selected.wardenPhone}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-surface px-3 py-2">
                <span className="block text-xs text-text-muted mb-0.5">Attendance</span>
                <span className="text-sm font-medium text-text-dark">{selected.attendance}</span>
              </div>
              <div className="rounded-lg bg-surface px-3 py-2">
                <span className="block text-xs text-text-muted mb-0.5">Latest Average</span>
                <span className="text-sm font-medium text-text-dark">{selected.average}</span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-text-dark mb-1.5">Latest Result Summary</span>
              <p className="text-sm text-text-dark">{selected.summary}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
