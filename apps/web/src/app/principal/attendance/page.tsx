"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { useState } from "react";

type Status = "present" | "absent" | "late";

const kpis = [
  { label: "Today's Rate", value: "88.7%", detail: "-0.8% vs avg", detailColor: "red" as const },
  { label: "Present", value: "11,040", detail: "", detailColor: "green" as const },
  { label: "Absent", value: "1,410", detail: "", detailColor: "red" as const },
  { label: "Pending Corrections", value: "8", detail: "", detailColor: "orange" as const },
];

const overviewData = [
  { class: { text: "SS1 Science", variant: "muted" as const }, rate: "92%", present: "38", absent: "4", trend: { text: "Good", variant: "green" as const }, actions: "View" },
  { class: { text: "JSS2 B", variant: "muted" as const }, rate: "85%", present: "38", absent: "7", trend: { text: "Monitor", variant: "orange" as const }, actions: "View" },
  { class: { text: "SS3 Art", variant: "muted" as const }, rate: "76%", present: "32", absent: "10", trend: { text: "Low", variant: "red" as const }, actions: "View" },
];

const overviewColumns = [
  { key: "class", label: "CLASS", width: "140px" },
  { key: "rate", label: "ATTENDANCE RATE", width: "130px" },
  { key: "present", label: "PRESENT", width: "90px" },
  { key: "absent", label: "ABSENT", width: "90px" },
  { key: "trend", label: "TREND", width: "90px" },
  { key: "actions", label: "ACTIONS", width: "70px", align: "right" as const },
];

const classOptions = [
  { label: "SS1 Science", value: "ss1-science" },
  { label: "JSS2 B", value: "jss2-b" },
  { label: "SS3 Art", value: "ss3-art" },
  { label: "JSS1 A", value: "jss1-a" },
];

const studentsByClass: Record<string, { id: string; name: string }[]> = {
  "ss1-science": [
    { id: "SS1/2026/001", name: "Adewale Tunde" },
    { id: "SS1/2026/002", name: "Blessing Okoro" },
    { id: "SS1/2026/003", name: "Chidi Nwosu" },
    { id: "SS1/2026/004", name: "Fatima Bello" },
    { id: "SS1/2026/005", name: "Emeka Okafor" },
    { id: "SS1/2026/006", name: "Hauwa Suleiman" },
    { id: "SS1/2026/007", name: "Ibrahim Musa" },
    { id: "SS1/2026/008", name: "Jumoke Afolabi" },
    { id: "SS1/2026/009", name: "Kemi Adeyemi" },
    { id: "SS1/2026/010", name: "Lekan Balogun" },
  ],
  "jss2-b": [
    { id: "JSS2/2026/001", name: "Amara Eze" },
    { id: "JSS2/2026/002", name: "Bashir Yusuf" },
    { id: "JSS2/2026/003", name: "Chidera Obi" },
    { id: "JSS2/2026/004", name: "Daniel Akpan" },
    { id: "JSS2/2026/005", name: "Esther Okonkwo" },
    { id: "JSS2/2026/006", name: "Felix Adekunle" },
    { id: "JSS2/2026/007", name: "Grace Onyeka" },
    { id: "JSS2/2026/008", name: "Hassan Aliyu" },
    { id: "JSS2/2026/009", name: "Ifeoma Chukwu" },
    { id: "JSS2/2026/010", name: "James Nwachukwu" },
  ],
  "ss3-art": [
    { id: "SS3/2026/001", name: "Amina Dikko" },
    { id: "SS3/2026/002", name: "Bolaji Atanda" },
    { id: "SS3/2026/003", name: "Chioma Uche" },
    { id: "SS3/2026/004", name: "Damilola Ojo" },
    { id: "SS3/2026/005", name: "Ebunoluwa Alabi" },
    { id: "SS3/2026/006", name: "Folashade Lawal" },
    { id: "SS3/2026/007", name: "Gideon Tanko" },
    { id: "SS3/2026/008", name: "Halima Barau" },
    { id: "SS3/2026/009", name: "Uche Onwueme" },
    { id: "SS3/2026/010", name: "Yemi Alabi" },
  ],
  "jss1-a": [
    { id: "JSS1/2026/001", name: "Abel Ogundimu" },
    { id: "JSS1/2026/002", name: "Bukola Fashola" },
    { id: "JSS1/2026/003", name: "Chinedu Igwe" },
    { id: "JSS1/2026/004", name: "Doris Amadi" },
    { id: "JSS1/2026/005", name: "Emmanuel Babalola" },
    { id: "JSS1/2026/006", name: "Funmilayo Adesanya" },
    { id: "JSS1/2026/007", name: "George Omotayo" },
    { id: "JSS1/2026/008", name: "Ifeanyi Okolie" },
    { id: "JSS1/2026/009", name: "Janet Ilori" },
    { id: "JSS1/2026/010", name: "Kenneth Obioha" },
  ],
};

const statusBadge: Record<Status, { text: string; variant: "green" | "red" | "orange" }> = {
  present: { text: "Present", variant: "green" },
  absent: { text: "Absent", variant: "red" },
  late: { text: "Late", variant: "orange" },
};

function AttendanceForm({ classKey, students }: { classKey: string; students: { id: string; name: string }[] }) {
  const [records, setRecords] = useState<Record<string, Status>>(() =>
    Object.fromEntries(students.map((s) => [s.id, "present" as Status]))
  );

  const setStatus = (id: string, status: Status) =>
    setRecords((prev) => ({ ...prev, [id]: status }));

  const setAll = (status: Status) =>
    setRecords(Object.fromEntries(students.map((s) => [s.id, status])));

  const presentCount = Object.values(records).filter((v) => v === "present").length;
  const absentCount = Object.values(records).filter((v) => v === "absent").length;
  const lateCount = Object.values(records).filter((v) => v === "late").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => setAll("present")}>Mark All Present</Button>
          <Button variant="secondary" size="sm" onClick={() => setAll("absent")}>Mark All Absent</Button>
        </div>
        <div className="flex items-center gap-3 text-sm text-text-muted">
          <span><span className="font-medium text-green">{presentCount}</span> present</span>
          <span><span className="font-medium text-red">{absentCount}</span> absent</span>
          <span><span className="font-medium text-orange">{lateCount}</span> late</span>
        </div>
      </div>

      <Card className="divide-y divide-border-light">
        {students.map((student) => {
          const current = records[student.id];
          return (
            <div key={student.id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm font-medium text-text-dark">{student.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{student.id}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {(["present", "absent", "late"] as Status[]).map((s) => (
                  <Button
                    key={s}
                    variant={current === s ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setStatus(student.id, s)}
                  >
                    {statusBadge[s].text}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => {}}>Save Attendance</Button>
      </div>
    </div>
  );
}

export default function PrincipalAttendancePage() {
  const [selectedClass, setSelectedClass] = useState("");
  const students = selectedClass ? studentsByClass[selectedClass] ?? [] : [];

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Attendance"
        subtitle="Monitor attendance compliance across the institution"
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select
            options={classOptions}
            value={selectedClass}
            onChange={setSelectedClass}
            placeholder="Select class to mark"
          />
          <Select options={[{ label: "Today", value: "today" }]} placeholder="Today" />
          <SearchInput placeholder="Search class..." className="flex-1" />
        </div>
      </Card>

      {selectedClass && students.length > 0 && (
        <Card className="p-5 mb-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-text-dark">Mark Attendance — {classOptions.find((c) => c.value === selectedClass)?.label}</h2>
            <p className="text-xs text-text-muted mt-0.5">Toggle status for each student, then save</p>
          </div>
          <AttendanceForm classKey={selectedClass} students={students} />
        </Card>
      )}

      <DataTable columns={overviewColumns} data={overviewData} />
    </div>
  );
}
