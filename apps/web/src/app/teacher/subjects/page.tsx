"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";

const subjects = [
  { id: "biology", name: "Biology", dept: "Sciences", curriculum: "82% covered", lessons: "24", assessments: "6", results: "Published", status: { text: "Teaching", variant: "green" as const } },
  { id: "integrated-science", name: "Integrated Science", dept: "Sciences", curriculum: "65% covered", lessons: "18", assessments: "4", results: "Moderation", status: { text: "Teaching", variant: "green" as const } },
];

export default function MySubjectsPage() {
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const filtered = subjects.filter(
    (s) => !q || s.name.toLowerCase().includes(q) || s.dept.toLowerCase().includes(q)
  );

  return (
    <div className="max-w-[900px] mx-auto">
      <PageHeader title="My Subjects" subtitle="Select a subject to manage content, assignments, assessments, and results" />

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <SearchInput placeholder="Search by name or department..." className="flex-1" value={search} onChange={setSearch} />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map((s) => (
          <Card key={s.id} className="p-5 hover:border-primary/40 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-text-dark">{s.name}</h3>
              <Badge variant={s.status.variant as "green"}>{s.status.text}</Badge>
            </div>
            <p className="text-xs text-text-muted mb-3">{s.dept} Department</p>
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div className="rounded-lg bg-surface p-2">
                <p className="text-[11px] text-text-muted">Lessons</p>
                <p className="font-semibold text-text-dark">{s.lessons}</p>
              </div>
              <div className="rounded-lg bg-surface p-2">
                <p className="text-[11px] text-text-muted">Curriculum</p>
                <p className="font-semibold text-green">{s.curriculum}</p>
              </div>
              <div className="rounded-lg bg-surface p-2">
                <p className="text-[11px] text-text-muted">Assessments</p>
                <p className="font-semibold text-text-dark">{s.assessments}</p>
              </div>
              <div className="rounded-lg bg-surface p-2">
                <p className="text-[11px] text-text-muted">Results</p>
                <p className="font-semibold text-orange">{s.results}</p>
              </div>
            </div>
            <Link href={`/teacher/subjects/${s.id}`} className="block">
              <Button variant="secondary" size="sm" className="w-full">Open Subject</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
