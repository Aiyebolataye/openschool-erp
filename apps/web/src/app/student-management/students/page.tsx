"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Modal } from "@/components/ui/modal";
import { SelectField } from "@/components/ui/form";
import type { TableRow } from "@/types";

interface PortfolioItem {
  type: string;
  title: string;
}

interface Student {
  id: string;
  name: string;
  klass: string;
  guardian: string;
  completeness: number;
  lastUpdated: string;
  items: PortfolioItem[];
}

const initialStudents: Student[] = [
  { id: "STU-22001", name: "Ngozi Okonkwo", klass: "SS3 Art", guardian: "Mrs. Okonkwo", completeness: 94, lastUpdated: "2h ago", items: [
    { type: "Certificate", title: "WAEC SSCE Certificate" },
    { type: "Academic", title: "Term 3 Report Card" },
    { type: "Achievement", title: "Best Graduating Artist" },
    { type: "Skill", title: "Public Speaking" },
  ]},
  { id: "STU-22002", name: "Tobi Adeyemi", klass: "SS2 Science", guardian: "Mr. Adeyemi", completeness: 88, lastUpdated: "4h ago", items: [
    { type: "Academic", title: "Term 3 Report Card" },
    { type: "Certificate", title: "Science Olympiad Participation" },
    { type: "Skill", title: "Robotics & Coding" },
  ]},
  { id: "STU-22003", name: "Zainab Abubakar", klass: "SS1 Science", guardian: "Mr. Abubakar", completeness: 76, lastUpdated: "1d ago", items: [
    { type: "Academic", title: "Term 2 Report Card" },
    { type: "Achievement", title: "National Maths Challenge Finalist" },
  ]},
  { id: "STU-22004", name: "Emeka Okafor", klass: "JSS3 B", guardian: "Mrs. Okafor", completeness: 52, lastUpdated: "3d ago", items: [
    { type: "Academic", title: "Term 2 Report Card" },
  ]},
  { id: "STU-22005", name: "Blessing Eze", klass: "JSS2 A", guardian: "Mr. Eze", completeness: 81, lastUpdated: "1d ago", items: [
    { type: "Academic", title: "Term 3 Report Card" },
    { type: "Achievement", title: "Inter-House Athletics 100m Gold" },
    { type: "Certificate", title: "Swimming Proficiency Level 2" },
  ]},
  { id: "STU-22006", name: "Femi Balogun", klass: "SS3 Science", guardian: "Mrs. Balogun", completeness: 90, lastUpdated: "1d ago", items: [
    { type: "Academic", title: "Term 3 Report Card" },
    { type: "Achievement", title: "State Debate Championship Winner" },
    { type: "Certificate", title: "First Aid & Safety Training" },
  ]},
  { id: "STU-22007", name: "Chiamaka Nwankwo", klass: "SS1 Art", guardian: "Mr. Nwankwo", completeness: 67, lastUpdated: "2d ago", items: [
    { type: "Academic", title: "Term 2 Report Card" },
    { type: "Certificate", title: "National Art Exhibition Certificate" },
  ]},
  { id: "STU-22008", name: "Ibrahim Lawal", klass: "SS2 Science", guardian: "Mrs. Lawal", completeness: 45, lastUpdated: "5d ago", items: [
    { type: "Academic", title: "Term 1 Report Card" },
  ]},
  { id: "STU-22009", name: "Yemi Osho", klass: "JSS3 A", guardian: "Mr. Osho", completeness: 34, lastUpdated: "1w ago", items: []},
  { id: "STU-22010", name: "Adaobi Nwachukwu", klass: "SS2 Art", guardian: "Mrs. Nwachukwu", completeness: 83, lastUpdated: "3d ago", items: [
    { type: "Academic", title: "Term 3 Report Card" },
    { type: "Achievement", title: "Choir Lead Soprano" },
    { type: "Skill", title: "Creative Writing" },
  ]},
];

const classOptions = ["All Classes", "SS3 Art", "SS3 Science", "SS2 Science", "SS2 Art", "SS1 Science", "SS1 Art", "JSS3 A", "JSS3 B", "JSS2 A"];

const columns = [
  { key: "student", label: "STUDENT" },
  { key: "klass", label: "CLASS" },
  { key: "completeness", label: "COMPLETENESS" },
  { key: "lastUpdated", label: "LAST UPDATED" },
  { key: "status", label: "STATUS" },
];

export default function PortfolioOfficerStudentsPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Student | null>(null);

  const q = search.trim().toLowerCase();
  const filtered = students.filter((s) => {
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.klass.toLowerCase().includes(q) ||
      s.guardian.toLowerCase().includes(q);
    const matchesClass = !classFilter || classFilter === "All Classes" || s.klass === classFilter;
    return matchesSearch && matchesClass;
  });

  const rows: TableRow[] = filtered.map((s) => ({
    student: (
      <div>
        <p className="text-sm font-medium text-text-dark">{s.name}</p>
        <p className="text-xs text-text-muted">{s.id}</p>
      </div>
    ),
    klass: s.klass,
    completeness: (
      <div className="flex items-center gap-2">
        <div className="w-20 h-1.5 rounded-full bg-border-light overflow-hidden">
          <div
            className="h-full rounded-full bg-green"
            style={{ width: `${s.completeness}%` }}
          />
        </div>
        <span className="text-xs text-text-muted">{s.completeness}%</span>
      </div>
    ),
    lastUpdated: s.lastUpdated,
    status:
      s.completeness >= 70
        ? { text: "Complete", variant: "green" as const }
        : { text: "Incomplete", variant: "orange" as const },
  }));

  const openDetail = (row: TableRow, i: number) => {
    setSelected(filtered[i]);
    setDetailOpen(true);
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Students"
        subtitle="Portfolios of all students at Demo Academy"
      />

      <Card className="p-4 mb-6 flex items-end gap-4">
        <SearchInput
          placeholder="Search by name, ID, class or guardian..."
          value={search}
          onChange={setSearch}
          className="max-w-md"
        />
        <div className="w-48">
          <SelectField
            label="Class"
            options={classOptions}
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          />
        </div>
      </Card>

      <DataTable columns={columns} data={rows} onRowClick={openDetail} />

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.name ?? ""}
        subtitle={selected ? `${selected.id} · ${selected.klass}` : undefined}
        footer={
          selected && (
            <div className="flex items-center gap-2">
              <Link href="/student" target="_blank">
                <Button variant="secondary" onClick={() => setDetailOpen(false)}>Student Portal</Button>
              </Link>
              <Link href="/parent" target="_blank">
                <Button variant="secondary" onClick={() => setDetailOpen(false)}>Parent Portal</Button>
              </Link>
              <Link href={`/teacher/students/${selected.id}`}>
                <Button onClick={() => setDetailOpen(false)}>Open Student Profile</Button>
              </Link>
            </div>
          )
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border-light p-4">
                <p className="text-xs text-text-muted">Guardian</p>
                <p className="text-sm font-medium text-text-dark">{selected.guardian}</p>
              </div>
              <div className="rounded-lg border border-border-light p-4">
                <p className="text-xs text-text-muted">Portfolio Completeness</p>
                <p className="text-sm font-medium text-text-dark flex items-center gap-2">
                  {selected.completeness}%
                  <Badge variant={selected.completeness >= 70 ? "green" : "orange"}>
                    {selected.completeness >= 70 ? "Complete" : "Incomplete"}
                  </Badge>
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-2">Portfolio Items · {selected.items.length}</p>
              {selected.items.length === 0 ? (
                <p className="text-sm text-text-muted rounded-lg border border-dashed border-border-light p-4 text-center">
                  No portfolio items yet. Add certificates and achievements to get started.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border-light px-4 py-2.5">
                      <p className="text-sm font-medium text-text-dark">{item.title}</p>
                      <Badge variant="blue">{item.type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}