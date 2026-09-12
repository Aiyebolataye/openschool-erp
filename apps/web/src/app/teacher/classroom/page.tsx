"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";

const classrooms = [
  {
    id: "ss1-science",
    name: "SS1 Science",
    students: "42",
    attendance: "92%",
    disciplines: "1 open",
    academics: "82.4%",
    status: { text: "Attendance Needed", variant: "orange" as const },
  },
  {
    id: "ss2-science",
    name: "SS2 Science",
    students: "40",
    attendance: "88%",
    disciplines: "0 open",
    academics: "85.1%",
    status: { text: "Marked Today", variant: "green" as const },
  },
];

export default function ClassroomPage() {
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const filtered = classrooms.filter((c) => !q || c.name.toLowerCase().includes(q));

  return (
    <div className="max-w-[1100px] mx-auto">
      <PageHeader
        title="My Classroom"
        subtitle="Rooms you are the class teacher for — monitor students, take attendance, communicate with parents"
      />

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <SearchInput placeholder="Search by class or subject..." className="flex-1" value={search} onChange={setSearch} />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map((c) => (
          <Card key={c.id} className="p-5 hover:border-primary/40 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-text-dark">{c.name}</h3>
              <Badge variant={c.status.variant as "orange"}>{c.status.text}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-surface p-3">
                <p className="text-[11px] text-text-muted">Students</p>
                <p className="text-lg font-bold text-text-dark">{c.students}</p>
              </div>
              <div className="rounded-lg bg-surface p-3">
                <p className="text-[11px] text-text-muted">Attendance</p>
                <p className="text-lg font-bold text-green">{c.attendance}</p>
              </div>
              <div className="rounded-lg bg-surface p-3">
                <p className="text-[11px] text-text-muted">Discipline Cases</p>
                <p className="text-lg font-bold text-orange">{c.disciplines}</p>
              </div>
              <div className="rounded-lg bg-surface p-3">
                <p className="text-[11px] text-text-muted">Academics</p>
                <p className="text-lg font-bold text-primary">{c.academics}</p>
              </div>
            </div>
            <Link href={`/teacher/classroom/${c.id}`} className="block">
              <Button variant="secondary" size="sm" className="w-full">Open Classroom</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
