"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import type { TableRow } from "@/types";

type Category = "Academic" | "Sports" | "Arts" | "Community";

interface Achievement {
  id: string;
  student: string;
  klass: string;
  achievement: string;
  category: Category;
  date: string;
}

const initialAchievements: Achievement[] = [
  { id: "ACH-1121", student: "Ngozi Okonkwo", klass: "SS3 Art", achievement: "Best Graduating Artist of the Year", category: "Arts", date: "2026-08-22" },
  { id: "ACH-1120", student: "Femi Balogun", klass: "SS3 Science", achievement: "State Debate Championship Winner", category: "Academic", date: "2026-08-18" },
  { id: "ACH-1119", student: "Blessing Eze", klass: "JSS2 A", achievement: "Inter-House Athletics 100m Gold", category: "Sports", date: "2026-08-14" },
  { id: "ACH-1118", student: "Zainab Abubakar", klass: "SS1 Science", achievement: "National Maths Challenge Finalist", category: "Academic", date: "2026-08-08" },
  { id: "ACH-1117", student: "Adaobi Nwachukwu", klass: "SS2 Art", achievement: "Choir Lead Soprano", category: "Arts", date: "2026-08-05" },
  { id: "ACH-1116", student: "Emeka Okafor", klass: "JSS3 B", achievement: "School Food Drive Volunteer", category: "Community", date: "2026-07-30" },
  { id: "ACH-1115", student: "Tobi Adeyemi", klass: "SS2 Science", achievement: "Inter-House Football Best Player", category: "Sports", date: "2026-07-25" },
  { id: "ACH-1114", student: "Chiamaka Nwankwo", klass: "SS1 Art", achievement: "Junior Art Club President", category: "Arts", date: "2026-07-19" },
];

const categories: Category[] = ["Academic", "Sports", "Arts", "Community"];

const categoryBadge = (c: Category) =>
  c === "Academic"
    ? { text: "Academic", variant: "blue" as const }
    : c === "Sports"
      ? { text: "Sports", variant: "green" as const }
      : c === "Arts"
        ? { text: "Arts", variant: "purple" as const }
        : { text: "Community", variant: "orange" as const };

const studentOptions = [
  "Ngozi Okonkwo",
  "Tobi Adeyemi",
  "Zainab Abubakar",
  "Emeka Okafor",
  "Blessing Eze",
  "Femi Balogun",
  "Chiamaka Nwankwo",
  "Ibrahim Lawal",
  "Yemi Osho",
  "Adaobi Nwachukwu",
];

const columns = [
  { key: "student", label: "STUDENT" },
  { key: "achievement", label: "ACHIEVEMENT" },
  { key: "category", label: "CATEGORY" },
  { key: "date", label: "DATE" },
];

export default function PortfolioOfficerAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [newStudent, setNewStudent] = useState("");
  const [newAchievement, setNewAchievement] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newDate, setNewDate] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const q = search.trim().toLowerCase();
  const filtered = achievements.filter(
    (a) =>
      !q ||
      a.student.toLowerCase().includes(q) ||
      a.achievement.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q)
  );

  const rows: TableRow[] = filtered.map((a) => ({
    student: (
      <div>
        <p className="text-sm font-medium text-text-dark">{a.student}</p>
        <p className="text-xs text-text-muted">{a.id}</p>
      </div>
    ),
    achievement: a.achievement,
    category: categoryBadge(a.category),
    date: a.date,
  }));

  const addAchievement = () => {
    if (!newStudent || !newAchievement || !newCategory || !newDate) return;
    const maxNum = Math.max(...achievements.map((a) => parseInt(a.id.slice(4), 10)));
    setAchievements((prev) => [
      ...prev,
      {
        id: `ACH-${maxNum + 1}`,
        student: newStudent,
        klass: "—",
        achievement: newAchievement.trim(),
        category: newCategory as Category,
        date: newDate,
      },
    ]);
    setNewStudent("");
    setNewAchievement("");
    setNewCategory("");
    setNewDate("");
    setAddOpen(false);
    showToast(`Achievement added for ${newStudent}`);
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Achievements"
        subtitle="Achievements recorded across student portfolios"
        actions={<Button onClick={() => setAddOpen(true)}>+ Add Achievement</Button>}
      />

      <Card className="p-4 mb-6">
        <SearchInput
          placeholder="Search by student, achievement, category or ID..."
          value={search}
          onChange={setSearch}
          className="max-w-md"
        />
      </Card>

      <DataTable columns={columns} data={rows} />

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Achievement"
        subtitle="Record a new achievement in a student's portfolio"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addAchievement}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Student"
            required
            placeholder="Select student"
            options={studentOptions}
            value={newStudent}
            onChange={(e) => setNewStudent(e.target.value)}
          />
          <Field label="Achievement" required>
            <TextInput
              placeholder="e.g. 1st Place, Inter-House Athletics"
              value={newAchievement}
              onChange={(e) => setNewAchievement(e.target.value)}
            />
          </Field>
          <SelectField
            label="Category"
            required
            placeholder="Select category"
            options={categories}
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <Field label="Date" required>
            <TextInput type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
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